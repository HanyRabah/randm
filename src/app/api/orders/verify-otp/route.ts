import { NextRequest, NextResponse } from 'next/server'
import { verifyOrderOTP } from '@/server/actions/orders'

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, otp } = await request.json()

    if (!orderNumber || !otp) {
      return NextResponse.json(
        { success: false, error: 'Order number and OTP are required' },
        { status: 400 }
      )
    }

    const result = await verifyOrderOTP(orderNumber, otp)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('OTP verification API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
