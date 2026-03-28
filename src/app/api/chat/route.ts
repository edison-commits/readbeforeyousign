import { NextRequest, NextResponse } from 'next/server'
import { chatAboutContract } from '@/lib/analyzer'
import { saveChatMessage } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractText, reviewSummary, messages, reviewId } = body

    if (!contractText || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (messages.length > 20) {
      return NextResponse.json({
        error: 'Chat limit reached. Please start a new review for additional questions.'
      }, { status: 400 })
    }

    const reply = await chatAboutContract(contractText, reviewSummary, messages)

    // Save messages to Supabase if we have a review ID
    if (reviewId) {
      const lastUserMsg = messages[messages.length - 1]
      if (lastUserMsg) {
        await saveChatMessage(reviewId, 'user', lastUserMsg.content).catch(() => {})
      }
      await saveChatMessage(reviewId, 'assistant', reply).catch(() => {})
    }

    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error('Chat error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to process your question.' },
      { status: 500 }
    )
  }
}
