import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromPDF } from '@/lib/pdf'
import { classifyContract, analyzeContract } from '@/lib/analyzer'

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

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const text = await extractTextFromPDF(buffer)

    if (text.length < 200) {
      return NextResponse.json({
        error: 'This document doesn\'t appear to contain enough text for a contract review.'
      }, { status: 400 })
    }

    // Step 1: Classify
    const classification = await classifyContract(text)

    // Step 2: Analyze with the right playbook
    const review = await analyzeContract(text, classification)

    // Store the contract text in the review for chat follow-ups
    // In production, this would go to a database
    const responseData = {
      ...review,
      _contractText: text.slice(0, 15000), // Keep first 15k chars for chat context
    }

    return NextResponse.json(responseData)
  } catch (err: any) {
    console.error('Review error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to review contract. Please try again.' },
      { status: 500 }
    )
  }
}
