import { createReceipt } from "./create.js";
import { RECEIPT_VERSION, type WorkExecutionReceipt } from "./types.js";

export interface EmpiresJourneyEvidenceLike {
  schema: "flop-empires-journey-evidence/v1";
  journey_id: string;
  capability: string;
  actor_did: string;
  request_id: string;
  native_receipt_digest: string;
  transition: {
    event_seq: number;
    state_before_hash: string;
    state_after_hash: string;
  };
  verification: {
    native_signature: boolean;
    router_request_binding: boolean;
    runtime_binding: boolean;
    replay: boolean;
  };
  semantic_digest: string;
}

const asSha256 = (value: string) => value.startsWith("sha256:") ? value : `sha256:${value}`;

export function fromEmpiresJourney(source: EmpiresJourneyEvidenceLike): WorkExecutionReceipt {
  if (source.schema !== "flop-empires-journey-evidence/v1") {
    throw new Error("UNSUPPORTED_EMPIRES_JOURNEY");
  }
  const verified = Object.values(source.verification).every(Boolean);
  return createReceipt({
    receipt_version: RECEIPT_VERSION,
    work_id: source.journey_id,
    participants: [{
      identifier: source.actor_did,
      identifier_type: "did",
      role: "empire-actor",
    }],
    agreement_ref: `empires-request:${source.request_id}`,
    execution_evidence: [{
      evidence_type: "empires-native-receipt",
      artifact_digest: asSha256(source.native_receipt_digest),
      verification_state: verified ? "VERIFIED" : "UNVERIFIED",
      source_ref: `empires:event:${source.transition.event_seq}`,
    }],
    coverage: {
      state: verified ? "COMPLETE" : "PARTIAL",
      gaps: verified ? undefined : ["one or more journey bindings are not independently verified"],
    },
    observation_time: new Date().toISOString(),
    assurance_class: "CROSS_REFERENCED",
    evidence_refs: [
      `empires-journey:${source.journey_id}`,
      `sha256:${source.semantic_digest}`,
    ],
    extensions: {
      "flop.empires/capability": source.capability,
      "flop.empires/transition": source.transition,
      "flop.empires/verification": source.verification,
    },
  });
}
