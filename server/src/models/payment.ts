import { Model, model, ObjectId, Schema } from "mongoose";

export interface PaymentDoc {
  userId: ObjectId;
  orderId: string;
  priceAmount: string;
  priceCurrency: string;
  orderDescription: string;
  invoiceId?: string;
  invoiceUrl?: string;
  payCurrency?: string;
  paymentId?: string; // payment_id from NOWPayments API
  status: "pending" | "paid" | "expired" | "cancelled" | "finished";
  nowPaymentsResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentModel extends Model<PaymentDoc> {}

const paymentSchema = new Schema<PaymentDoc, PaymentModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    priceAmount: {
      type: String,
      required: true,
    },
    priceCurrency: {
      type: String,
      required: true,
      default: "usd",
    },
    orderDescription: {
      type: String,
      required: true,
    },
    invoiceId: {
      type: String,
      index: true,
    },
    invoiceUrl: {
      type: String,
    },
    payCurrency: {
      type: String,
    },
    paymentId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "expired", "cancelled", "finished"],
      default: "pending",
      index: true,
    },
    nowPaymentsResponse: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = model<PaymentDoc, PaymentModel>("Payment", paymentSchema);
export default Payment;

