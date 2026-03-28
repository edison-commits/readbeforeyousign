import { NextRequest, NextResponse } from 'next/server'
import { storeFile } from '@/lib/storage'
import { createCheckoutSession } from '@/lib/stripe'
import { createServerAuthClient } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })
    }

    // Check if user is logged in (optional - anonymous reviews are fine)
    let userId: string | undefined
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const supabase = createServerAuthClient(token)
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id
    }

    // Store the file temporarily so it survives the Stripe redirect
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileId = await storeFile(buffer)

    // Create Stripe Checkout Session
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const checkoutUrl = await createCheckoutSession(fileId, origin, file.name, userId)

    return NextResponse.json({ checkoutUrl, fileId })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create payment session.' },
      { status: 500 }
    )
  }
}
