import { createReceipt } from "./create.js";
import { RECEIPT_VERSION, type WorkExecutionReceipt } from "./types.js";

export interface RouterRuntimeExecutionReceiptLike {
  schema: "flop.router-runtime-execution/v1";
  receiptId: string;
  observedAt: string;
  router: {
    decisionId: string;
    requestId: string;
    selectedMinerId: string;
    snapshotHash: string;
    configHash: string;
  };
  runtime: {
    targetId: string;
    fingerprint: Record<string, string | number | boolean | null>;
    capabilities: string[];
  };
  testCaseId: string;
  execution: {
    startedAt: string;
    finishedAt: string;
    status: "completed" | "failed";
    outputDigest: string;
    transcriptDigest?: string;
    railEvidenceDigest?: string;
    reason?: string;
  };
  evidenceRefs: string[];
  semanticDigest: string;
}

const asSha256 = (value: string) => value.startsWith("sha256:") ? value : `sha256:${value}`;

export function fromRouterRuntimeExecution(
  source: RouterRuntimeExecutionReceiptLike,
  participantIdentifier = source.router.selectedMinerId,
): WorkExecutionReceipt {
  if (source.schema !== "flop.router-runtime-execution/v1") throw new Error("UNSUPPORTED_ROUTER_RUNTIME_RECEIPT");
  return createReceipt({
    receipt_version: RECEIPT_VERSION,
    work_id: source.testCaseId,
    deal_id: source.router.decisionId,
    participants: [{
      identifier: participantIdentifier,
      identifier_type: participantIdentifier.startsWith("did:") ? "did" : "router-candidate",
      role: "runtime-executor",
    }],
    agreement_ref: `router:${source.router.decisionId}`,
    agreement_digest: asSha256(source.router.snapshotHash),
    execution_evidence: [{
      evidence_type: "runtime-output",
      artifact_digest: asSha256(source.execution.outputDigest),
      verification_state: source.execution.status === "completed" ? "UNVERIFIED" : "INVALID",
      event_time: source.execution.finishedAt,
      source_ref: `runtime:${source.runtime.targetId}#${source.receiptId}`,
    }],
    coverage: {
      state: source.execution.status === "completed" ? "PARTIAL" : "UNKNOWN",
      gaps: source.execution.status === "completed"
        ? ["independent runtime verification is carried by the EvidenceBundle"]
        : ["runtime execution failed"],
    },
    event_time: source.execution.finishedAt,
    observation_time: source.observedAt,
    assurance_class: "CROSS_REFERENCED",
    evidence_refs: [...source.evidenceRefs, `router-runtime-receipt:${source.receiptId}`],
    extensions: {
      "flop.router/runtime-execution": source,
    },
  });
}
