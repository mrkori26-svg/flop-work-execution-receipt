import assert from "node:assert/strict";
import test from "node:test";
import { fromEmpiresJourney } from "../src/empires.js";

test("Empires journey maps to a portable execution receipt without upgrading claims", () => {
  const receipt = fromEmpiresJourney({
    schema:"flop-empires-journey-evidence/v1",
    journey_id:"empires_demo",
    capability:"empire.recon",
    actor_did:"did:key:z6MkDemo",
    request_id:"req-1",
    native_receipt_digest:"a".repeat(64),
    transition:{event_seq:1,state_before_hash:"b".repeat(64),state_after_hash:"c".repeat(64)},
    verification:{native_signature:true,router_request_binding:true,runtime_binding:true,replay:true},
    semantic_digest:"d".repeat(64),
  });
  assert.equal(receipt.work_id,"empires_demo");
  assert.equal(receipt.coverage.state,"COMPLETE");
  assert.equal(receipt.assurance_class,"CROSS_REFERENCED");
  assert.ok(receipt.execution_evidence);
  assert.equal(receipt.execution_evidence[0]?.verification_state,"VERIFIED");
});
