// lib/payment.ts - Midtrans Payment Integration (Sandbox Ready)
import crypto from 'crypto'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!
const NEXT_PUBLIC_MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
const MIDTRANS_API_URL = process.env.MIDTRANS_API_URL || 'https://app.sandbox.midtrans.com/snap/v1/transactions'

// Export client key untuk frontend Snap.js
export const getMidtransClientKey = () => NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

/**
 * Create Midtrans Snap transaction
 */
export async function createMidtransTransaction(
  orderId: string,
  amount: number,
  customerEmail: string,
  customerName: string,
  courseTitle: string
): Promise<{ transactionToken: string; orderId: string }> {
  if (!MIDTRANS_SERVER_KEY) {
    throw new Error('MIDTRANS_SERVER_KEY not configured in .env.local')
  }

  // Validate email
  if (!customerEmail || !customerEmail.includes('@')) {
    throw new Error('Invalid customer email: ' + customerEmail)
  }

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: customerName.split(' ')[0] || customerName,
      last_name: customerName.split(' ').slice(1).join(' ') || '',
      email: customerEmail,
    },
    item_details: [
      {
        id: orderId,
        name: `Kursus: ${courseTitle}`,
        price: amount,
        quantity: 1,
      },
    ],
    // Callback URLs (update sesuai domain Anda)
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      error: `${process.env.NEXT_PUBLIC_APP_URL}/courses`,
    },
  }

  try {
    console.log('🧾 Creating Midtrans transaction:', { orderId, amount, customerEmail })

    // Basic Auth: Base64("SERVER_KEY:")
    const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')

    const response = await fetch(MIDTRANS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    
    if (!response.ok) {
      console.error('❌ Midtrans API Error:', response.status, responseText)
      throw new Error(`Midtrans API ${response.status}: ${responseText}`)
    }

    const result = JSON.parse(responseText)
    
    if (!result.token) {
      throw new Error('No transaction token in response: ' + JSON.stringify(result))
    }

    console.log('✅ Transaction created:', result.token.slice(0, 20) + '...')
    
    return {
      transactionToken: result.token,
      orderId,
    }
  } catch (error: any) {
    console.error('💥 createMidtransTransaction error:', error)
    throw new Error(`Payment failed: ${error.message}`)
  }
}

/**
 * Verify Midtrans webhook signature
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  if (!MIDTRANS_SERVER_KEY) {
    console.error('❌ MIDTRANS_SERVER_KEY missing')
    return false
  }

  // Midtrans signature: SHA512(order_id + status_code + gross_amount + server_key)
  const rawSignature = `${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`
  const expectedSignature = crypto
    .createHash('sha512')
    .update(rawSignature)
    .digest('hex')

  const isValid = expectedSignature === signatureKey
  console.log('🔐 Webhook signature:', { isValid, received: signatureKey.slice(0, 16) + '...' })

  return isValid
}

/**
 * Parse Midtrans status to app status
 */
export function parsePaymentStatus(
  transactionStatus: string,
  fraudStatus?: string
): 'pending' | 'settlement' | 'capture' | 'deny' | 'cancel' | 'expire' {
  switch (transactionStatus) {
    case 'settlement':
      return 'settlement'
    case 'capture':
      return fraudStatus === 'accept' ? 'settlement' : 'pending'
    case 'pending':
      return 'pending'
    case 'deny':
    case 'failed':
      return 'deny'
    case 'cancel':
      return 'cancel'
    case 'expire':
      return 'expire'
    default:
      return 'pending'
  }
}

/**
 * Get Midtrans transaction status (optional)
 */
export async function getMidtransStatus(orderId: string): Promise<any> {
  if (!MIDTRANS_SERVER_KEY) {
    throw new Error('MIDTRANS_SERVER_KEY not configured')
  }

  const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')
  const url = `https://api.sandbox.midtrans.com/v2/${orderId}/status`

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Status check error:', error)
    throw error
  }
}

/**
 * Format Rupiah untuk display
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
