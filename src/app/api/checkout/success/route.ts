import { NextRequest, NextResponse } from 'next/server'
import { verifyCheckoutSession } from '@/lib/stripe'
import { retrieveFile, deleteFile } from '@/lib/storage'
import { extractTextFromPDF } from '@/lib/pdf'
import { classifyContract, analyzeContract } from '@/lib/analyzer'
import { saveReview } from '@/lib/db'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.redirect(new URL('/?error=missing_session', request.url))
  }

  try {
    // 1. Verify payment with Stripe
    const { paid, fileId, fileName, userId } = await verifyCheckoutSession(sessionId)

    if (!paid || !fileId) {
      return NextResponse.redirect(new URL('/?error=payment_failed', request.url))
    }

    // 2. Retrieve the stored PDF
    const buffer = await retrieveFile(fileId)

    // 3. Extract text
    const text = await extractTextFromPDF(buffer)

    // 4. Classify
    const classification = await classifyContract(text)

    // 5. Analyze
    const review = await analyzeContract(text, classification)

    // 6. Save to Supabase
    const { reviewId } = await saveReview(
      review,
      text,
      sessionId,
      fileName || 'contract.pdf',
      buffer.length,
      userId || undefined
    )

    // 7. Clean up temp file
    await deleteFile(fileId)

    // 8. Redirect to results page
    return NextResponse.redirect(new URL(`/review/${reviewId}`, request.url))
  } catch (err: any) {
    console.error('Success callback error:', err)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(err.message || 'review_failed')}`, request.url)
    )
  }
}
