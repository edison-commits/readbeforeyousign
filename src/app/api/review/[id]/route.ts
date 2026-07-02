import { NextRequest, NextResponse } from 'next/server'
import { getReview } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const review = await getReview(id)
    
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
