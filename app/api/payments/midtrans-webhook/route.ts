import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyMidtransSignature, parsePaymentStatus } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🔔 Midtrans webhook:', body)

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body

    // Verify signature
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    )

    if (!isValid) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
    }

    // Cari payment
    const payment = await prisma.payment.findFirst({
      where: { midtransOrderId: order_id },
      include: { enrollment: true },
    })

    if (!payment) {
      console.error('❌ Payment not found:', order_id)
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
    }

    const newStatus = parsePaymentStatus(transaction_status, fraud_status)

    // Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        settledAt: newStatus === 'settlement' ? new Date() : null,
      },
    })

    // Jika sukses, aktifkan enrollment
    if (newStatus === 'settlement') {
      await prisma.enrollment.update({
        where: { id: payment.enrollmentId },
        data: { status: 'active' },
      })
      console.log('✅ Enrollment activated:', payment.enrollmentId)
    }

    console.log('✅ Webhook processed:', newStatus)
    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error('💥 Webhook error:', error)
    return NextResponse.json({ message: 'Internal error' }, { status: 500 })
  }
}
