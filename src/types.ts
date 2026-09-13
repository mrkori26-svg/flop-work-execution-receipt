export const RECEIPT_VERSION="work-execution-receipt/0.1"as const;
export type VerificationState="VERIFIED"|"INVALID"|"UNVERIFIED"|"NOT_APPLICABLE"|"UNKNOWN";
export type CoverageState="COMPLETE"|"PARTIAL"|"TRUNCATED"|"RETENTION_GAP"|"UNKNOWN";
export type AssuranceClass="SELF_ASSERTED"|"SIGNATURE_VERIFIED"|"CROSS_REFERENCED"|"EXTERNALLY_ATTESTED"|"SETTLEMENT_VERIFIED";
export type DemandIndependenceState="UNVERIFIED";
export type OperatorCountEvidenceState="UNVERIFIED";
export type AgentsAllocationCreditState="NOT_DERIVED";
export interface Participant{identifier:string;identifier_type:string;role?:string}
export interface CoordinationEvidence{system:string;frame_type:string;digest:string;signed_by?:string;verification_state:VerificationState;source_ref:string}
export interface ExecutionEvidence{evidence_type:string;artifact_digest:string;verifier_ref?:string;verification_state:VerificationState;event_time?:string;source_ref:string}
export interface SettlementEvidence{rail_id:string;rail_ref:string;verification_state:VerificationState;source_ref:string}
export interface ReceiptCoverage{state:CoverageState;gaps?:string[]}
export interface WorkExecutionReceipt{receipt_version:typeof RECEIPT_VERSION;receipt_id:string;work_id?:string;deal_id?:string;participants:Participant[];agreement_ref?:string;agreement_digest?:string;coordination?:CoordinationEvidence[];execution_evidence?:ExecutionEvidence[];settlement?:SettlementEvidence;coverage:ReceiptCoverage;event_time?:string;observation_time:string;assurance_class:AssuranceClass;adjudication_policy_ref?:string;evidence_refs?:string[];demand_independence?:DemandIndependenceState;operator_count_evidence?:OperatorCountEvidenceState;agents_allocation_credit?:AgentsAllocationCreditState;extensions?:Record<string,unknown>}
export type ReceiptBody=Omit<WorkExecutionReceipt,"receipt_id">;