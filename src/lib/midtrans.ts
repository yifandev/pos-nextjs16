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

/**
 * Create Midtrans transaction token
 * @param orderId - Unique order ID
 * @param grossAmount - Total amount
 * @param customerDetails - Customer information
 * @param itemDetails - Items detail
 * @returns Transaction token
 */
export async function createTransactionToken(params: {
  orderId: string;
  grossAmount?: number; // Jadikan optional
  customerDetails?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  itemDetails: Array<{
    // Wajibkan itemDetails
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  enabledPayments?: string[];
}) {
  try {
    // Hitung total dari itemDetails
    const calculatedAmount = params.itemDetails.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Gunakan grossAmount dari parameter atau hitung dari itemDetails
    const grossAmount = params.grossAmount || calculatedAmount;

    // Validasi konsistensi
    if (
      params.grossAmount &&
      Math.abs(params.grossAmount - calculatedAmount) > 100
    ) {
      console.warn(`Warning: grossAmount mismatch for order ${params.orderId}`);
    }

    const parameter = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: calculatedAmount, // Gunakan calculatedAmount
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
 * Charge with QRIS
 * @param orderId - Unique order ID
 * @param grossAmount - Total amount
 * @returns QRIS string and actions
 */
// Update fungsi chargeQRIS untuk menghitung gross_amount secara otomatis jika tidak sesuai
export async function chargeQRIS(params: {
  orderId: string;
  grossAmount?: number; // Jadikan optional
  itemDetails: Array<{
    // Wajibkan itemDetails
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}) {
  try {
    // Hitung total dari itemDetails
    const calculatedAmount = params.itemDetails.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Gunakan grossAmount dari parameter atau hitung dari itemDetails
    const grossAmount = params.grossAmount || calculatedAmount;

    // Validasi jika grossAmount diberikan manual harus sama dengan perhitungan
    if (
      params.grossAmount &&
      Math.abs(params.grossAmount - calculatedAmount) > 100
    ) {
      // Toleransi 100
      console.warn(
        `Warning: grossAmount (${params.grossAmount}) tidak sama dengan total itemDetails (${calculatedAmount})`
      );
      // Anda bisa memutuskan untuk menggunakan yang mana
      // Saat ini akan menggunakan calculatedAmount untuk menghindari error
    }

    const parameter = {
      payment_type: "qris",
      transaction_details: {
        order_id: params.orderId,
        gross_amount: calculatedAmount, // Gunakan calculatedAmount
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
 * Charge with Bank Transfer
 * @param orderId - Unique order ID
 * @param grossAmount - Total amount
 * @param bank - Bank code (bca, bni, bri, permata)
 * @returns VA number and bank details
 */
export async function chargeBankTransfer(params: {
  orderId: string;
  grossAmount?: number; // Jadikan optional
  bank: "bca" | "bni" | "bri" | "permata";
  itemDetails: Array<{
    // Wajibkan itemDetails
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}) {
  try {
    // Hitung total dari itemDetails
    const calculatedAmount = params.itemDetails.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Validasi
    if (
      params.grossAmount &&
      Math.abs(params.grossAmount - calculatedAmount) > 100
    ) {
      console.warn(
        `Warning: grossAmount mismatch for bank transfer order ${params.orderId}`
      );
    }

    const parameter = {
      payment_type: "bank_transfer",
      transaction_details: {
        order_id: params.orderId,
        gross_amount: calculatedAmount, // Gunakan calculatedAmount
      },
      item_details: params.itemDetails,
      bank_transfer: {
        bank: params.bank,
      },
    };

    const charge = await core.charge(parameter);

    // Get VA number based on bank
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
 * Check transaction status
 * @param orderId - Order ID to check
 * @returns Transaction status
 */
export async function checkTransactionStatus(orderId: string) {
  try {
    const status = await core.transaction.status(orderId);

    return {
      success: true,
      data: {
        orderId: status.order_id,
        transactionStatus: status.transaction_status,
        fraudStatus: status.fraud_status,
        grossAmount: status.gross_amount,
        paymentType: status.payment_type,
        transactionTime: status.transaction_time,
      },
    };
  } catch (error) {
    console.error("Midtrans check status error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check transaction status",
    };
  }
}

/**
 * Cancel transaction
 * @param orderId - Order ID to cancel
 * @returns Cancellation result
 */
export async function cancelTransaction(orderId: string) {
  try {
    const result = await core.transaction.cancel(orderId);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Midtrans cancel transaction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to cancel transaction",
    };
  }
}

// Dummy BRI ATM for cash payment
export const DUMMY_BRI_ATM = "1234567890123456"; // 16 digit dummy ATM number
export const DUMMY_BRI_BANK_NAME = "BRI (Bank Rakyat Indonesia)";
