import test from"node:test";import assert from"node:assert/strict";import{createReceipt,fromEvidenceRecord,fromRouterDecision,fromTclkTranscript,fromTechnocoreExport,receiptDigest,RECEIPT_VERSION,validateReceipt,type ReceiptBody}from"../src/index.js";
const body:ReceiptBody={receipt_version:RECEIPT_VERSION,work_id:"work-1",participants:[{identifier:"did:key:zExample",identifier_type:"did:key",role:"requester"}],coordination:[{system:"tclk/1",frame_type:"offer",digest:"sha256:"+"11".repeat(32),signed_by:"did:key:zExample",verification_state:"VERIFIED",source_ref:"transcript:1"}],execution_evidence:[{evidence_type:"artifact",artifact_digest:"sha256:"+"22".repeat(32),verifier_ref:"verifier:test",verification_state:"VERIFIED",source_ref:"artifact:1"}],coverage:{state:"PARTIAL",gaps:["settlement unavailable"]},observation_time:"2026-09-09T00:00:00.000Z",assurance_class:"CROSS_REFERENCED"};
test("golden receipt id and whole-document digest are deterministic",()=>{const a=createReceipt(body),b=createReceipt({...body,participants:[...body.participants]});assert.equal(a.receipt_id,b.receipt_id);assert.equal(a.receipt_id,"sha256:83fa62de178a898a8fb770d30344c184bc133f9ad78b792711f6e8fd917fecf2");assert.equal(receiptDigest(a),"sha256:da64b6e7a8b6e340236c97adffe2de8c3ccbfcab2486de38254f16042a118b64");assert.deepEqual(validateReceipt(JSON.parse(JSON.stringify(a))),a);});
test("signed does not imply executed or settled",()=>{const signed=createReceipt({...body,execution_evidence:undefined,assurance_class:"SIGNATURE_VERIFIED"});assert.equal(signed.execution_evidence,undefined);assert.equal(signed.settlement,undefined);assert.throws(()=>createReceipt({...body,settlement:undefined,assurance_class:"SETTLEMENT_VERIFIED"}),/ASSURANCE_NOT_SUPPORTED/);});
test("unknown remains explicit and coverage gaps cannot claim complete",()=>{const unknown=createReceipt({...body,coordination:undefined,execution_evidence:undefined,coverage:{state:"UNKNOWN"},assurance_class:"SELF_ASSERTED"});assert.equal(unknown.coverage.state,"UNKNOWN");assert.throws(()=>createReceipt({...body,coverage:{state:"COMPLETE",gaps:["missing"]}}),/CONTRADICTORY_COVERAGE/);});
test("unsafe integers, unknown claims and tampering fail closed",()=>{assert.throws(()=>createReceipt({...body,extensions:{"test/value":Number.MAX_SAFE_INTEGER+1}}),/UNSAFE_JSON_NUMBER/);const receipt=createReceipt(body)as any;receipt.paid=true;assert.throws(()=>validateReceipt(receipt),/UNKNOWN_RECEIPT_FIELD/);delete receipt.paid;receipt.work_id="tampered";assert.throws(()=>validateReceipt(receipt),/RECEIPT_ID_MISMATCH/);});
test("initial adapters preserve source boundaries without trust promotion",()=>{assert.equal(fromRouterDecision({decisionId:"d",decisionDigest:"sha256:"+"33".repeat(32)}).verification_state,"UNVERIFIED");assert.equal(fromTclkTranscript(["tclk1 {}"],"tclk:1").verification_state,"UNVERIFIED");assert.equal(fromTechnocoreExport("{}\n","room:1").frame_type,"venue-export");assert.equal(fromEvidenceRecord({id:"e",artifact_digest:"sha256:"+"44".repeat(32)}).verification_state,"UNKNOWN");});


test("E.49 keeps settlement distinct from independent demand and allocation",()=>{
  const receipt=createReceipt({...body,settlement:{rail_id:"test",rail_ref:"rail:1",verification_state:"VERIFIED",source_ref:"rail:1"},assurance_class:"SETTLEMENT_VERIFIED",demand_independence:"UNVERIFIED",operator_count_evidence:"UNVERIFIED",agents_allocation_credit:"NOT_DERIVED"});
  assert.equal(receipt.settlement?.verification_state,"VERIFIED");
  assert.equal(receipt.demand_independence,"UNVERIFIED");
  assert.equal(receipt.operator_count_evidence,"UNVERIFIED");
  assert.equal(receipt.agents_allocation_credit,"NOT_DERIVED");
  const bad={...receipt,demand_independence:"VERIFIED"} as any;
  bad.receipt_id=receipt.receipt_id;
  assert.throws(()=>validateReceipt(bad),/DEMAND_INDEPENDENCE_NOT_DERIVABLE/);
});


test("created receipt is detached from mutable caller input",()=>{
  const mutable:ReceiptBody=structuredClone(body);
  const receipt=createReceipt(mutable);
  mutable.participants[0]!.identifier="did:key:mutated";
  mutable.coverage.gaps?.push("later mutation");
  assert.equal(receipt.participants[0]?.identifier,"did:key:zExample");
  assert.deepEqual(receipt.coverage.gaps,["settlement unavailable"]);
  assert.equal(receipt.receipt_id,"sha256:83fa62de178a898a8fb770d30344c184bc133f9ad78b792711f6e8fd917fecf2");
});

test("optional references and evidence refs are bounded",()=>{
  assert.throws(()=>createReceipt({...body,work_id:""}),/INVALID_WORK_ID/);
  assert.throws(()=>createReceipt({...body,deal_id:""}),/INVALID_DEAL_ID/);
  assert.throws(()=>createReceipt({...body,evidence_refs:[""]}),/INVALID_EVIDENCE_REFS/);
  assert.throws(()=>createReceipt({...body,participants:[{identifier:"did:key:zExample",identifier_type:"did:key",role:""}]}),/INVALID_PARTICIPANT_ROLE/);
});


test("validated receipt is detached from mutable caller object",()=>{
  const receipt=createReceipt(body);
  const external=structuredClone(receipt);
  const validated=validateReceipt(external);
  external.participants[0]!.identifier="did:key:mutated-after-validation";
  assert.equal(validated.participants[0]?.identifier,"did:key:zExample");
  assert.notEqual(validated,external);
});
