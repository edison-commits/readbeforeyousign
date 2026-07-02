import { createServerClient } from './supabase'
import type { ContractReview, ContractClassification } from './analyzer'

function getSupabase() {
  return createServerClient()
}

// Save a contract and its review to the database
export async function saveReview(
  review: ContractReview,
  contractText: string,
  stripeSessionId: string,
  fileName: string,
  fileSize: number,
  userId?: string
) {
  // 1. Insert the contract record
  const { data: contract, error: contractError } = await getSupabase()
    .from('contracts')
    .insert({
      user_id: userId || null,
      file_name: fileName,
      file_size: fileSize,
      contract_type: review.contract_type,
      contract_type_display: review.contract_type_display,
      jurisdiction: review.classification.jurisdiction,
      parties: review.parties,
      property_address: review.property_address,
      effective_date: review.classification.effective_date,
      status: 'complete',
      stripe_session_id: stripeSessionId,
    })
    .select('id')
    .single()

  if (contractError) {
    console.error('Error saving contract:', contractError)
    throw new Error('Failed to save contract')
  }

  // 2. Insert the review record
  const { data: savedReview, error: reviewError } = await getSupabase()
    .from('reviews')
    .insert({
      contract_id: contract.id,
      user_id: userId || null,
      risk_score: review.risk_score,
      summary: review.summary,
      key_terms: review.key_terms,
      clauses: review.clauses,
      red_count: review.red_count,
      yellow_count: review.yellow_count,
      green_count: review.green_count,
      contract_text: contractText.slice(0, 50000), // Store for chat context
      classification: review.classification,
      ai_model: 'claude-sonnet-4-20250514',
    })
    .select('id')
    .single()

  if (reviewError) {
    console.error('Error saving review:', reviewError)
    throw new Error('Failed to save review')
  }

  return {
    contractId: contract.id,
    reviewId: savedReview.id,
  }
}

// Fetch a review by ID
export async function getReview(reviewId: string) {
  const { data, error } = await getSupabase()
    .from('reviews')
    .select(`
      *,
      contracts (
        file_name,
        contract_type_display,
        parties,
        property_address,
        jurisdiction,
        stripe_session_id
      )
    `)
    .eq('id', reviewId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    contract_type: data.contracts?.contract_type_display || 'Contract',
    contract_type_display: data.contracts?.contract_type_display || 'Contract',
    parties: data.contracts?.parties || {},
    property_address: data.contracts?.property_address,
    key_terms: data.key_terms,
    risk_score: data.risk_score,
    summary: data.summary,
    clauses: data.clauses,
    red_count: data.red_count,
    yellow_count: data.yellow_count,
    green_count: data.green_count,
    classification: data.classification,
    created_at: data.created_at,
    _contractText: data.contract_text,
  }
}

// Fetch all reviews for a user
export async function getUserReviews(userId: string) {
  const { data, error } = await getSupabase()
    .from('reviews')
    .select(`
      id,
      risk_score,
      summary,
      red_count,
      yellow_count,
      green_count,
      created_at,
      contracts (
        file_name,
        contract_type_display,
        parties,
        property_address
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

// Save a chat message
export async function saveChatMessage(
  reviewId: string,
  role: 'user' | 'assistant',
  content: string,
  userId?: string
) {
  await getSupabase()
    .from('chat_messages')
    .insert({
      review_id: reviewId,
      user_id: userId || null,
      role,
      content,
    })
}

// Get chat messages for a review
export async function getChatMessages(reviewId: string) {
  const { data } = await getSupabase()
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true })

  return data || []
}
