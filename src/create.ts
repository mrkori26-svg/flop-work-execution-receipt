import{receiptId}from"./canonical.js";import type{ReceiptBody,WorkExecutionReceipt}from"./types.js";import{validateReceipt}from"./validate.js";
export function createReceipt(body:ReceiptBody):WorkExecutionReceipt{const receipt={...body,receipt_id:receiptId(body)};return validateReceipt(receipt);}
