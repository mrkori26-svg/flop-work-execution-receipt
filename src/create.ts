import { receiptId } from "./canonical.js";
import type { ReceiptBody, WorkExecutionReceipt } from "./types.js";
import { validateReceipt } from "./validate.js";

export function createReceipt(body: ReceiptBody): WorkExecutionReceipt {
  const detached = structuredClone(body);
  const receipt = { ...detached, receipt_id: receiptId(detached) };
  return validateReceipt(receipt);
}
