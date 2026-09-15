import test from "node:test";
import assert from "node:assert/strict";
import { verifiedTaskReceiptEvidence } from "../src/index.js";

const receipt = {
  type: "technocore-task-receipt" as const,
  version: 1 as const,
  task: { id: "task-1" },
  claimant: "did:test:agent",
  artifacts: [{ sha256: "a".repeat(64) }],
  created_at: "2026-09-15T00:00:00Z",
};

test("verified task receipt becomes execution evidence only", () => {
  const result = verifiedTaskReceiptEvidence(receipt, { cryptographic: "verified", artifacts: "verified" });
  assert.equal(result.verification_state, "VERIFIED");
  assert.equal(result.evidence_type, "tcr-1-task-completion");
  assert.match(result.artifact_digest, /^sha256:[0-9a-f]{64}$/);
});

test("unverified receipt fails closed", () => {
  assert.throws(() => verifiedTaskReceiptEvidence(receipt, { cryptographic: "unverified", artifacts: "verified" }));
  assert.throws(() => verifiedTaskReceiptEvidence(receipt, { cryptographic: "verified", artifacts: "not_checked" }));
});
