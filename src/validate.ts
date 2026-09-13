import{receiptId}from"./canonical.js";
import{RECEIPT_VERSION,type ReceiptBody,type WorkExecutionReceipt}from"./types.js";
const DIGEST=/^(sha256:|0x)[0-9a-f]{64}$/;
const ISO=(value:unknown)=>typeof value==="string"&&Number.isFinite(Date.parse(value));
const TOP=new Set(["receipt_version","receipt_id","work_id","deal_id","participants","agreement_ref","agreement_digest","coordination","execution_evidence","settlement","coverage","event_time","observation_time","assurance_class","adjudication_policy_ref","evidence_refs","demand_independence","operator_count_evidence","agents_allocation_credit","extensions"]);
const states=new Set(["VERIFIED","INVALID","UNVERIFIED","NOT_APPLICABLE","UNKNOWN"]),coverage=new Set(["COMPLETE","PARTIAL","TRUNCATED","RETENTION_GAP","UNKNOWN"]),assurance=new Set(["SELF_ASSERTED","SIGNATURE_VERIFIED","CROSS_REFERENCED","EXTERNALLY_ATTESTED","SETTLEMENT_VERIFIED"]);
function object(value:unknown,name:string):asserts value is Record<string,unknown>{if(!value||typeof value!=="object"||Array.isArray(value))throw new Error(`INVALID_${name}`);}
function ref(value:unknown,name:string){if(typeof value!=="string"||!value||value.length>4096)throw new Error(`INVALID_${name}`);}
export function validateReceipt(value:unknown):WorkExecutionReceipt{
  object(value,"RECEIPT");for(const key of Object.keys(value))if(!TOP.has(key))throw new Error(`UNKNOWN_RECEIPT_FIELD:${key}`);const receipt=value as unknown as WorkExecutionReceipt;
  if(receipt.receipt_version!==RECEIPT_VERSION)throw new Error("UNSUPPORTED_RECEIPT_VERSION");
  if(!Array.isArray(receipt.participants)||receipt.participants.length===0)throw new Error("PARTICIPANTS_REQUIRED");
  for(const item of receipt.participants){object(item,"PARTICIPANT");ref(item.identifier,"PARTICIPANT_IDENTIFIER");ref(item.identifier_type,"PARTICIPANT_IDENTIFIER_TYPE");}
  object(receipt.coverage,"COVERAGE");if(!coverage.has(receipt.coverage.state))throw new Error("INVALID_COVERAGE_STATE");
  if(receipt.coverage.gaps!==undefined&&(!Array.isArray(receipt.coverage.gaps)||receipt.coverage.gaps.some(x=>typeof x!=="string"||!x)))throw new Error("INVALID_COVERAGE_GAPS");
  if(receipt.coverage.state==="COMPLETE"&&receipt.coverage.gaps?.length)throw new Error("CONTRADICTORY_COVERAGE");
  if(!ISO(receipt.observation_time)||(receipt.event_time!==undefined&&!ISO(receipt.event_time)))throw new Error("INVALID_TIME");
  if(!assurance.has(receipt.assurance_class))throw new Error("INVALID_ASSURANCE_CLASS");
  if(receipt.agreement_digest!==undefined&&!DIGEST.test(receipt.agreement_digest))throw new Error("INVALID_AGREEMENT_DIGEST");
  for(const item of receipt.coordination??[]){object(item,"COORDINATION");ref(item.system,"COORDINATION_SYSTEM");ref(item.frame_type,"COORDINATION_FRAME_TYPE");if(!DIGEST.test(item.digest))throw new Error("INVALID_COORDINATION_DIGEST");if(!states.has(item.verification_state))throw new Error("INVALID_VERIFICATION_STATE");ref(item.source_ref,"SOURCE_REF");}
  for(const item of receipt.execution_evidence??[]){object(item,"EXECUTION_EVIDENCE");ref(item.evidence_type,"EVIDENCE_TYPE");if(!DIGEST.test(item.artifact_digest))throw new Error("INVALID_ARTIFACT_DIGEST");if(!states.has(item.verification_state))throw new Error("INVALID_VERIFICATION_STATE");if(item.event_time!==undefined&&!ISO(item.event_time))throw new Error("INVALID_EVENT_TIME");ref(item.source_ref,"SOURCE_REF");}
  if(receipt.settlement!==undefined){object(receipt.settlement,"SETTLEMENT");ref(receipt.settlement.rail_id,"RAIL_ID");ref(receipt.settlement.rail_ref,"RAIL_REF");ref(receipt.settlement.source_ref,"SOURCE_REF");if(!states.has(receipt.settlement.verification_state))throw new Error("INVALID_VERIFICATION_STATE");}
  if(receipt.demand_independence!==undefined&&receipt.demand_independence!=="UNVERIFIED")throw new Error("DEMAND_INDEPENDENCE_NOT_DERIVABLE");
  if(receipt.operator_count_evidence!==undefined&&receipt.operator_count_evidence!=="UNVERIFIED")throw new Error("OPERATOR_COUNT_NOT_DERIVABLE");
  if(receipt.agents_allocation_credit!==undefined&&receipt.agents_allocation_credit!=="NOT_DERIVED")throw new Error("AGENTS_ALLOCATION_NOT_DERIVABLE");
  if(receipt.assurance_class==="SIGNATURE_VERIFIED"&&!(receipt.coordination??[]).some(x=>x.verification_state==="VERIFIED"&&x.signed_by))throw new Error("ASSURANCE_NOT_SUPPORTED_BY_EVIDENCE");
  if(receipt.assurance_class==="EXTERNALLY_ATTESTED"&&!(receipt.execution_evidence??[]).some(x=>x.verification_state==="VERIFIED"&&x.verifier_ref))throw new Error("ASSURANCE_NOT_SUPPORTED_BY_EVIDENCE");
  if(receipt.assurance_class==="SETTLEMENT_VERIFIED"&&receipt.settlement?.verification_state!=="VERIFIED")throw new Error("ASSURANCE_NOT_SUPPORTED_BY_EVIDENCE");
  if(receipt.extensions!==undefined){object(receipt.extensions,"EXTENSIONS");for(const key of Object.keys(receipt.extensions))if(!/^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i.test(key))throw new Error("EXTENSION_KEY_MUST_BE_NAMESPACED");}
  const{receipt_id,...body}=receipt;if(!DIGEST.test(receipt_id)||receipt_id!==receiptId(body as ReceiptBody))throw new Error("RECEIPT_ID_MISMATCH");return receipt;
}