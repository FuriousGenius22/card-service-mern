import { RequestHandler } from "express";
import PaymentPending from "@/models/paymentPending";
import Payment from "@/models/payment";
import { sendErrorResponse } from "@/utils/helper";
import mongoose from "mongoose";

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_PAYMENT_URL = "https://api.nowpayments.io/v1/payment";

export const createPayment: RequestHandler = async (req, res) => {
  const { priceAmount, payCurrency } = req.body;
  // Get user ID and convert to ObjectId for database storage
  const userId = new mongoose.Types.ObjectId(req.user.id);

  if (!NOWPAYMENTS_API_KEY) {
    return sendErrorResponse({
      res,
      message: "Payment service not configured",
      status: 500,
    });
  }

  if (!priceAmount || !payCurrency) {
    return sendErrorResponse({
      res,
      message: "priceAmount and payCurrency are required",
      status: 400,
    });
  }

  try {
    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}-${userId.toString()}`;

    // Make POST request to NOWPayments API
    const response = await fetch(NOWPAYMENTS_PAYMENT_URL, {
      method: "POST",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: priceAmount,
        price_currency: "usd",
        pay_currency: payCurrency,
        ipn_callback_url: process.env.IPN_CALLBACK_URL || "https://nowpayments.io",
        order_id: orderId,
        order_description: `Top-up payment for user ${userId.toString()}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("NOWPayments API error:", errorData);
      const errorMessage = errorData.message || errorData.error || "Failed to create payment";
      return sendErrorResponse({
        res,
        message: errorMessage,
        status: response.status || 500,
      });
    }

    const paymentData = await response.json();

    // Save payment response to PaymentPending with userId at the top
    const paymentPending = await PaymentPending.create({
      userId, // User's _id stored as ObjectId
      paymentId: paymentData.payment_id?.toString() || "",
      paymentStatus: paymentData.payment_status || "pending",
      payAddress: paymentData.pay_address,
      priceAmount: parseFloat(priceAmount),
      priceCurrency: "usd",
      payAmount: paymentData.pay_amount,
      payCurrency: paymentData.pay_currency,
      orderId: paymentData.order_id || orderId,
      orderDescription: paymentData.order_description,
      ipnCallbackUrl: paymentData.ipn_callback_url,
      created_at: paymentData.created_at,
      updated_at: paymentData.updated_at,
      purchase_id: paymentData.purchase_id,
      amount_received: paymentData.amount_received,
      payin_extra_id: paymentData.payin_extra_id,
      smart_contract: paymentData.smart_contract,
      network: paymentData.network,
      network_precision: paymentData.network_precision,
      time_limit: paymentData.time_limit,
      burning_percent: paymentData.burning_percent,
      expiration_estimate_date: paymentData.expiration_estimate_date,
      raw: paymentData, // Store full raw response
    });

    res.json({
      paymentId: paymentPending.paymentId,
      payAddress: paymentPending.payAddress,
      payCurrency: paymentPending.payCurrency,
      payAmount: paymentPending.payAmount,
    });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return sendErrorResponse({
      res,
      message: error.message || "Internal server error",
      status: 500,
    });
  }
};

export const createInvoice: RequestHandler = async (req, res) => {
  // TODO: Implement invoice creation
  return sendErrorResponse({
    res,
    message: "Not implemented",
    status: 501,
  });
};

export const getPendingPayment: RequestHandler = async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.id;

  try {
    const payment = await PaymentPending.findOne({
      paymentId,
      userId,
    });

    if (!payment) {
      return sendErrorResponse({
        res,
        message: "Payment not found",
        status: 404,
      });
    }

    res.json({
      paymentId: payment.paymentId,
      paymentStatus: payment.paymentStatus,
      payAddress: payment.payAddress,
      payCurrency: payment.payCurrency,
      payAmount: payment.payAmount,
      priceAmount: payment.priceAmount,
      priceCurrency: payment.priceCurrency,
    });
  } catch (error: any) {
    console.error("Error getting pending payment:", error);
    return sendErrorResponse({
      res,
      message: "Internal server error",
      status: 500,
    });
  }
};

export const getBalance: RequestHandler = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  try {
    // Find all completed payments for this user (finished or paid status)
    const completedPayments = await Payment.find({
      userId,
      status: { $in: ["finished", "paid"] },
    });

    // Calculate balance by summing outcome_amount from nowPaymentsResponse
    // If outcome_amount is in USD, use it; otherwise use price_amount (which is in USD)
    let balance = 0;
    for (const payment of completedPayments) {
      const response = payment.nowPaymentsResponse;
      if (response?.outcome_amount && response?.outcome_currency?.toLowerCase() === "usd") {
        // Use outcome_amount if it's in USD
        balance += parseFloat(response.outcome_amount) || 0;
      } else if (response?.outcome_amount && response?.price_amount) {
        // If outcome is in crypto, use price_amount (USD equivalent) instead
        balance += parseFloat(response.price_amount) || 0;
      } else {
        // Fallback to price_amount if outcome_amount is not available
        balance += parseFloat(payment.priceAmount) || 0;
      }
    }

    res.json({
      balance: parseFloat(balance.toFixed(2)),
    });
  } catch (error: any) {
    console.error("Error getting balance:", error);
    return sendErrorResponse({
      res,
      message: "Internal server error",
      status: 500,
    });
  }
};
