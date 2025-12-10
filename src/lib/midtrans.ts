import midtransClient from "midtrans-client";

// Create Snap API instance
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

// Create Core API instance for direct charge
const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export { snap, core };

// BASE URL MIDTRANS (FIXED)
const MIDTRANS_BASE_URL =
  process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";

// Authorization header (FIXED)
const AUTH_HEADER = {
  Authorization:
    "Basic " +
    Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64"),
  Accept: "application/json",
  "Content-Type": "application/json",
};

/**
 * Create Midtrans transaction token
 */
export async function createTransactionToken(params: {
  orderId: string;
  grossAmount?: number;
  customerDetails?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  enabledPayments?: string[];
}) {
  try {
    const calculatedAmount = params.itemDetails.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const parameter = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: calculatedAmount,
      },
      customer_details: params.customerDetails,
      item_details: params.itemDetails,
      enabled_payments: params.enabledPayments || ["qris", "bank_transfer"],
    };

    const transaction = await snap.createTransaction(parameter);

    return {
      success: true,
      data: {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
        grossAmount: calculatedAmount,
      },
    };
  } catch (error) {
    console.error("Midtrans create transaction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create transaction",
    };
  }
}

/**
 * Charge QRIS
 */
export async function chargeQRIS(params: {
  orderId: string;
  grossAmount?: number;
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}) {
  try {
    const calculatedAmount = params.itemDetails.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const parameter = {
      payment_type: "qris",
      transaction_details: {
        order_id: params.orderId,
        gross_amount: calculatedAmount,
      },
      item_details: params.itemDetails,
      qris: {
        acquirer: "gopay",
      },
    };

    const charge = await core.charge(parameter);

    return {
      success: true,
      data: {
        orderId: charge.order_id,
        transactionStatus: charge.transaction_status,
        qrisUrl: charge.actions?.[0]?.url || "",
        qrisString: charge.qr_string || "",
        grossAmount: calculatedAmount,
      },
    };
  } catch (error) {
    console.error("Midtrans QRIS charge error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to charge QRIS",
    };
  }
}

/**
 * Charge Bank Transfer
 */
export async function chargeBankTransfer(params: {
  orderId: string;
  grossAmount?: number;
  bank: "bca" | "bni" | "bri" | "permata";
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}) {
  try {
    const calculatedAmount = params.itemDetails.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const parameter = {
      payment_type: "bank_transfer",
      transaction_details: {
        order_id: params.orderId,
        gross_amount: calculatedAmount,
      },
      item_details: params.itemDetails,
      bank_transfer: {
        bank: params.bank,
      },
    };

    const charge = await core.charge(parameter);

    let vaNumber = "";
    if (
      params.bank === "bca" ||
      params.bank === "bni" ||
      params.bank === "bri"
    ) {
      vaNumber = charge.va_numbers?.[0]?.va_number || "";
    } else if (params.bank === "permata") {
      vaNumber = charge.permata_va_number || "";
    }

    return {
      success: true,
      data: {
        orderId: charge.order_id,
        transactionStatus: charge.transaction_status,
        vaNumber,
        bank: params.bank.toUpperCase(),
        grossAmount: calculatedAmount,
      },
    };
  } catch (error) {
    console.error("Midtrans bank transfer charge error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to charge bank transfer",
    };
  }
}

/**
 * Check transaction status (FIXED – pakai HTTP request langsung)
 */
export async function checkTransactionStatus(orderId: string) {
  try {
    const res = await fetch(`${MIDTRANS_BASE_URL}/v2/${orderId}/status`, {
      method: "GET",
      headers: AUTH_HEADER,
    });

    const status = await res.json();

    return {
      success: true,
      data: status,
    };
  } catch (error) {
    console.error("Midtrans check status error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check status",
    };
  }
}

/**
 * Cancel transaction (FIXED – pakai HTTP request langsung)
 */
export async function cancelTransaction(orderId: string) {
  try {
    const res = await fetch(`${MIDTRANS_BASE_URL}/v2/${orderId}/cancel`, {
      method: "POST",
      headers: AUTH_HEADER,
    });

    const result = await res.json();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Midtrans cancel error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to cancel transaction",
    };
  }
}

// Dummy BRI ATM for cash payment
export const DUMMY_BRI_ATM = "1234567890123456";
export const DUMMY_BRI_BANK_NAME = "BRI (Bank Rakyat Indonesia)";
