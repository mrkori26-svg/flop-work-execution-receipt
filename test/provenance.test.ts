import test from"node:test";
import assert from"node:assert/strict";
import{provenanceExtension,validateTransportProvenance}from"../src/provenance.js";

test("transport provenance preserves availability without overclaiming",()=>{
  const value={room:"d-flop-infra",generation:3,seq:42,availability:"RETAINED_RING" as const,digest:"sha256:"+"ab".repeat(32)};
  const validated=validateTransportProvenance(value);
  assert.equal(validated.availability,"RETAINED_RING");
  assert.deepEqual(provenanceExtension(value),{"technocore/provenance":validated});
});

test("bounded scan uncertainty remains explicit",()=>{
  const value=validateTransportProvenance({room:"d-flop-infra",generation:3,seq:42,availability:"UNKNOWN_BOUNDED_SCAN"});
  assert.equal(value.availability,"UNKNOWN_BOUNDED_SCAN");
});

test("invalid transport coordinates fail closed",()=>{
  assert.throws(()=>validateTransportProvenance({room:"Bad Room",availability:"UNAVAILABLE"}),/INVALID_PROVENANCE_ROOM/);
  assert.throws(()=>validateTransportProvenance({generation:-1,availability:"UNAVAILABLE"}),/INVALID_PROVENANCE_GENERATION/);
  assert.throws(()=>validateTransportProvenance({seq:0,availability:"UNAVAILABLE"}),/INVALID_PROVENANCE_SEQ/);
});
