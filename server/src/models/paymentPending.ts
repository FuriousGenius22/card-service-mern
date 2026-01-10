import { Model, Schema, model, ObjectId } from "mongoose";

export interface PaymentPendingDoc {
  userId: ObjectId;
  paymentId: string; // NOWPayments payment_id
  paymentStatus: string;
  payAddress?: string;
  priceAmount: number;
  priceCurrency: string;
  payAmount?: number;
  payCurrency?: string;
  orderId?: string | null;
  orderDescription?: string | null;
  ipnCallbackUrl?: string | null;
  created_at?: string;
  updated_at?: string;
  purchase_id?: string | number | null;
  amount_received?: number | null;
  payin_extra_id?: string | number | null;
  smart_contract?: string;
  network?: string;
  network_precision?: number;
  time_limit?: number | null;
  burning_percent?: string | null;
  expiration_estimate_date?: string | null;
  raw: any; // full raw response
}

interface PaymentPendingModel extends Model<PaymentPendingDoc> {}

const paymentPendingSchema = new Schema<PaymentPendingDoc, PaymentPendingModel>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  paymentId: { type: String, required: true, unique: true, index: true },
  paymentStatus: { type: String, required: true, index: true },
  payAddress: { type: String },
  priceAmount: { type: Number, required: true },
  priceCurrency: { type: String, required: true, default: "usd" },
  payAmount: { type: Number },
  payCurrency: { type: String },
  orderId: { type: String },
  orderDescription: { type: String },
  ipnCallbackUrl: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  purchase_id: { type: Schema.Types.Mixed },
  amount_received: { type: Number },
  payin_extra_id: { type: Schema.Types.Mixed },
  smart_contract: { type: String },
  network: { type: String },
  network_precision: { type: Number },
  time_limit: { type: Number },
  burning_percent: { type: String },
  expiration_estimate_date: { type: String },
  raw: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

paymentPendingSchema.index({ createdAt: -1 });

const PaymentPending = model<PaymentPendingDoc, PaymentPendingModel>("PaymentPending", paymentPendingSchema);
export default PaymentPending;
