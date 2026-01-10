import PaymentPending from "@/models/paymentPending";
import Payment from "@/models/payment";
import mongoose from "mongoose";

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_PAYMENT_URL = "https://api.nowpayments.io/v1/payment";

interface PaymentStatusResponse {
  payment_id: number;
  invoice_id: string | null;
  payment_status: string;
  pay_address?: string;
  payin_extra_id?: string | null;
  price_amount: number;
  price_currency: string;
  pay_amount?: number;
  actually_paid?: number;
  pay_currency?: string;
  order_id: string | null;
  order_description: string | null;
  purchase_id?: number;
  outcome_amount?: number;
  outcome_currency?: string;
  payout_hash?: string;
  payin_hash?: string;
  created_at: string;
  updated_at: string;
  burning_percent?: string | null;
  type?: string;
  payment_extra_ids?: number[];
}

export const checkPaymentStatuses = async (): Promise<void> => {
  if (!NOWPAYMENTS_API_KEY) {
    console.log("Skipping payment status check: NOWPAYMENTS_API_KEY not set.");
    return;
  }

  try {
    // Find all pending payments in PaymentPending collection
    const pendingPayments = await PaymentPending.find({});

    if (pendingPayments.length === 0) {
      return; // No pending payments to check
    }

    console.log(`Checking status for ${pendingPayments.length} pending payment(s)...`);

    for (const pendingPayment of pendingPayments) {
      try {
        // Get payment_id from database
        const paymentId = pendingPayment.paymentId;

        if (!paymentId) {
          console.log(`Skipping payment ${pendingPayment._id}: No payment ID found`);
          continue;
        }

        // Make GET request to NOWPayments API to check payment status
        const response = await fetch(`${NOWPAYMENTS_PAYMENT_URL}/${paymentId}`, {
          method: "GET",
          headers: {
            "x-api-key": NOWPAYMENTS_API_KEY,
          },
        });

        if (!response.ok) {
          console.error(`Failed to check payment ${paymentId}: ${response.statusText}`);
          continue;
        }

        const statusData: PaymentStatusResponse = await response.json();
        const paymentStatus = statusData.payment_status?.toLowerCase();

        // Handle terminal statuses
        if (paymentStatus === "finished" || paymentStatus === "partially_paid") {
          // Save to Payment collection and delete from PaymentPending
          const session = await mongoose.startSession();
          session.startTransaction();

          try {
            // Create payment record in Payment collection (with session for transaction)
            const paymentData = {
              userId: pendingPayment.userId,
              orderId: statusData.order_id || pendingPayment.orderId || `ORDER-${Date.now()}-${pendingPayment.userId}`,
              priceAmount: statusData.price_amount?.toString() || pendingPayment.priceAmount.toString(),
              priceCurrency: statusData.price_currency || pendingPayment.priceCurrency,
              orderDescription: statusData.order_description || pendingPayment.orderDescription || "Top-up payment",
              paymentId: statusData.payment_id?.toString(),
              payCurrency: statusData.pay_currency || pendingPayment.payCurrency,
              status: paymentStatus === "finished" ? "finished" : "paid",
              nowPaymentsResponse: statusData,
            };
            const payment = new Payment(paymentData);
            await payment.save({ session });

            // Delete from PaymentPending
            await PaymentPending.findByIdAndDelete(pendingPayment._id, { session });

            await session.commitTransaction();
            console.log(`Payment ${paymentId} completed with status "${paymentStatus}". Moved to Payment collection and removed from PaymentPending.`);
          } catch (error: any) {
            await session.abortTransaction();
            console.error(`Error processing completed payment ${paymentId}:`, error.message);
            throw error;
          } finally {
            session.endSession();
          }
        } else if (
          paymentStatus === "failed" ||
          paymentStatus === "refunded" ||
          paymentStatus === "expired"
        ) {
          // Delete from PaymentPending, don't save to Payment
          try {
            await PaymentPending.findByIdAndDelete(pendingPayment._id);
            console.log(`Payment ${paymentId} failed with status "${paymentStatus}". Removed from PaymentPending.`);
          } catch (error: any) {
            console.error(`Error deleting failed payment ${paymentId}:`, error.message);
          }
        } else {
          // Update status in PaymentPending and continue checking
          // Status is "waiting", "confirming", "sending", etc.
          await PaymentPending.findByIdAndUpdate(pendingPayment._id, {
            $set: {
              paymentStatus: statusData.payment_status,
              payAddress: statusData.pay_address,
              payAmount: statusData.pay_amount,
              payCurrency: statusData.pay_currency,
              amount_received: statusData.actually_paid,
              payin_extra_id: statusData.payin_extra_id,
              purchase_id: statusData.purchase_id,
              updated_at: statusData.updated_at,
              raw: statusData, // Update with latest response
            },
          });
          console.log(`Payment ${paymentId} status updated to "${paymentStatus}". Continuing to monitor...`);
        }
      } catch (error: any) {
        console.error(`Error checking payment ${pendingPayment._id}:`, error.message);
        continue;
      }
    }
  } catch (error: any) {
    console.error("Error in checkPaymentStatuses:", error.message);
  }
};
