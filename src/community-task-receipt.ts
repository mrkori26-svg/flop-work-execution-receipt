import { createHash } from "node:crypto";
import type { ExecutionEvidence } from "./types.js";

export interface CommunityTaskReceipt {
  type: "technocore-task-receipt";
  version: 1;
  task: { id: string };
  claimant: string;
  artifacts: Array<{ sha256: string }>;
  created_at: string;
}

export interface CommunityReceiptVerification {
  cryptographic: "verified" | "unverified" | "error";
  artifacts: "verified" | "not_checked" | "unverified" | "error";
}

const digest = (values: string[]) =>
  "sha256:" + createHash("sha256").update(values.join("\n")).digest("hex");

export function verifiedTaskReceiptEvidence(
  receipt: CommunityTaskReceipt,
  verification: CommunityReceiptVerification,
): ExecutionEvidence {
  if (receipt.type !== "technocore-task-receipt" || receipt.version !== 1) throw new Error("TCR1_UNSUPPORTED");
  if (verification.cryptographic !== "verified") throw new Error("RECEIPT_CRYPTOGRAPHICALLY_UNVERIFIED");
  if (verification.artifacts !== "verified") throw new Error("RECEIPT_ARTIFACTS_UNVERIFIED");
  if (receipt.artifacts.length === 0) throw new Error("RECEIPT_ARTIFACTS_EMPTY");
  for (const artifact of receipt.artifacts) {
    if (!/^[0-9a-f]{64}$/.test(artifact.sha256)) throw new Error("RECEIPT_ARTIFACT_HASH_INVALID");
  }
  return {
    evidence_type: "tcr-1-task-completion",
    artifact_digest: digest(receipt.artifacts.map((artifact) => artifact.sha256)),
    verifier_ref: "TCR-1/verified",
    verification_state: "VERIFIED",
    event_time: receipt.created_at,
    source_ref: `task-receipt:${receipt.task.id}:${receipt.claimant}`,
  };
}
