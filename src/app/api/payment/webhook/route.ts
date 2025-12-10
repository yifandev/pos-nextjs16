import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

/**
 * POST /api/payment/webhook
 * Handle Midtrans payment notification webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const signatureKey = body.signature_key;
    const orderId = body.order_id;
    const statusCode = body.status_code;
    const grossAmount = body.gross_amount;

    const hash = crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    if (hash !== signatureKey) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 403 }
      );
    }

    // Get transaction status
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    // Extract sale ID from order ID (format: SALE-{saleId}-{timestamp})
    const saleId = orderId.split("-")[1];

    // Update payment status based on Midtrans notification
    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        // Payment success
        await updatePaymentStatus(
          saleId,
          "completed",
          body.payment_type,
          orderId
        );
      }
    } else if (transactionStatus === "settlement") {
      // Payment success
      await updatePaymentStatus(
        saleId,
        "completed",
        body.payment_type,
        orderId
      );
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      // Payment failed/cancelled
      await updatePaymentStatus(saleId, "failed", body.payment_type, orderId);
    } else if (transactionStatus === "pending") {
      // Payment pending
      await updatePaymentStatus(saleId, "pending", body.payment_type, orderId);
    }

    return NextResponse.json({
      success: true,
      message: "Notification processed",
    });
  } catch (error) {
    console.error("Webhook API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}

async function updatePaymentStatus(
  saleId: string,
  status: string,
  paymentType: string,
  reference: string
) {
  try {
    // Update payment record
    await prisma.payment.updateMany({
      where: {
        saleId,
        reference,
      },
      data: {
        method: paymentType,
      },
    });

    // You can add additional logic here, such as:
    // - Sending email notification
    // - Updating inventory
    // - Logging the transaction

    console.log(`Payment updated: ${saleId} - ${status}`);
  } catch (error) {
    console.error("Failed to update payment status:", error);
  }
}
