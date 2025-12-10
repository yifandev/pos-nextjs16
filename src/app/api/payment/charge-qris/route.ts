import { NextRequest, NextResponse } from "next/server";
import { chargeQRIS } from "@/lib/midtrans";

/**
 * POST /api/payment/charge-qris
 * Create QRIS payment charge
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, grossAmount, itemDetails } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (
      !itemDetails ||
      !Array.isArray(itemDetails) ||
      itemDetails.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Item details are required" },
        { status: 400 }
      );
    }

    // Validasi itemDetails
    for (const item of itemDetails) {
      if (
        !item.id ||
        !item.name ||
        item.price === undefined ||
        item.quantity === undefined
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Each item must have id, name, price, and quantity",
          },
          { status: 400 }
        );
      }
    }

    const result = await chargeQRIS({
      orderId,
      grossAmount, // Bisa undefined
      itemDetails,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("QRIS charge API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to charge QRIS",
      },
      { status: 500 }
    );
  }
}
