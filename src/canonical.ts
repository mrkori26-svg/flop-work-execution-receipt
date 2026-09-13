import{createHash}from"node:crypto";
import type{ReceiptBody,WorkExecutionReceipt}from"./types.js";
export const RECEIPT_DOMAIN="FLOP_TOOLS::WORK_EXECUTION_RECEIPT::V0.1";
export function canonicalJson(value:unknown):string{if(value===null||typeof value!=="object"){if(typeof value==="number"&&(!Number.isSafeInteger(value)||!Number.isFinite(value)))throw new Error("UNSAFE_JSON_NUMBER");if(typeof value==="bigint"||value===undefined||typeof value==="function"||typeof value==="symbol")throw new Error("UNSUPPORTED_CANONICAL_VALUE");return JSON.stringify(value);}if(Array.isArray(value))return`[${value.map(canonicalJson).join(",")}]`;const record=value as Record<string,unknown>;return`{${Object.keys(record).sort().filter(key=>record[key]!==undefined).map(key=>`${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;}
export function receiptId(body:ReceiptBody):string{return"sha256:"+createHash("sha256").update(`${RECEIPT_DOMAIN}|${canonicalJson(body)}`).digest("hex");}
export function receiptDigest(receipt:WorkExecutionReceipt):string{return"sha256:"+createHash("sha256").update(canonicalJson(receipt)).digest("hex");}
