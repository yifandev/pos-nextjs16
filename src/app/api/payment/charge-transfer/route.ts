import { NextRequest, NextResponse } from 'next/server';
import { chargeBankTransfer } from '@/lib/midtrans';

/**
 * POST /api/payment/charge-transfer
 * Create Bank Transfer payment charge
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, grossAmount, bank, itemDetails } = body;

    if (!orderId || !grossAmount || !bank) {
      return NextResponse.json(
        { success: false, error: 'Order ID, gross amount, and bank are required' },
        { status: 400 }
      );
    }

    if (!['bca', 'bni', 'bri', 'permata'].includes(bank)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bank code' },
        { status: 400 }
      );
    }

    const result = await chargeBankTransfer({
      orderId,
      grossAmount,
      bank: bank as 'bca' | 'bni' | 'bri' | 'permata',
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
    console.error('Bank transfer charge API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to charge bank transfer',
      },
      { status: 500 }
    );
  }
}
