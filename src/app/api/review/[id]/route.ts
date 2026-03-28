import { NextRequest, NextResponse } from 'next/server'
import { getReview } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await getReview(params.id)
    
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (err: any) {
    console.error('Fetch review error:', err)
    return NextResponse.json(
      { error: 'Failed to load review' },
      { status: 500 }
    )
  }
}
