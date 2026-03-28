import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function createCheckoutSession(
  fileId: string,
  origin: string,
  fileName?: string,
  userId?: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: 999, // $9.99
          product_data: {
            name: 'Contract Review',
            description: 'AI-powered plain-English contract review with risk scoring and suggested changes',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      file_id: fileId,
      file_name: fileName || 'contract.pdf',
      user_id: userId || 'anonymous',
    },
    success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?cancelled=true`,
  })

  return session.url!
}

export async function verifyCheckoutSession(sessionId: string): Promise<{
  paid: boolean
  fileId: string | null
  fileName: string | null
  userId: string | null
}> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return {
      paid: session.payment_status === 'paid',
      fileId: (session.metadata?.file_id) || null,
      fileName: (session.metadata?.file_name) || null,
      userId: session.metadata?.user_id === 'anonymous' ? null : (session.metadata?.user_id || null),
    }
  } catch {
    return { paid: false, fileId: null, fileName: null, userId: null }
  }
}
