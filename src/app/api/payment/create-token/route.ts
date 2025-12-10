import { NextRequest, NextResponse } from 'next/server';
import { createTransactionToken } from '@/lib/midtrans';

/**
 * POST /api/payment/create-token
 * Create Midtrans transaction token for payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, grossAmount, customerDetails, itemDetails, enabledPayments } = body;

    if (!orderId || !grossAmount) {
      return NextResponse.json(
        { success: false, error: 'Order ID and gross amount are required' },
        { status: 400 }
      );
    }

    const result = await createTransactionToken({
      orderId,
      grossAmount,
      customerDetails,
      itemDetails,
      enabledPayments,
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
    console.error('Create token API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment token',
      },
      { status: 500 }
    );
  }
}
