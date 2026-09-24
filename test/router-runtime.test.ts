import test from "node:test";
import assert from "node:assert/strict";
import { fromRouterRuntimeExecution, validateReceipt } from "../src/index.js";

test("router runtime receipt converts to canonical WorkExecutionReceipt without trust promotion", () => {
  const receipt = fromRouterRuntimeExecution({
    schema: "flop.router-runtime-execution/v1",
    receiptId: "runtime_receipt_abc",
    observedAt: "2026-09-24T12:00:03.000Z",
    router: {
      decisionId: "decision-1",
      requestId: "request-1",
      selectedMinerId: "did:key:zExample",
      snapshotHash: "11".repeat(32),
      configHash: "22".repeat(32),
    },
    runtime: {
      targetId: "external-runtime",
      fingerprint: { version: "1.0.0" },
      capabilities: ["execute"],
    },
    testCaseId: "case-1",
    execution: {
      startedAt: "2026-09-24T12:00:01.000Z",
      finishedAt: "2026-09-24T12:00:02.000Z",
      status: "completed",
      outputDigest: "33".repeat(32),
    },
    evidenceRefs: ["urn:evidence:1"],
    semanticDigest: "44".repeat(32),
  });
  assert.equal(receipt.deal_id, "decision-1");
  assert.equal(receipt.assurance_class, "CROSS_REFERENCED");
  assert.equal(receipt.execution_evidence?.[0]?.verification_state, "UNVERIFIED");
  assert.deepEqual(validateReceipt(receipt), receipt);
});
