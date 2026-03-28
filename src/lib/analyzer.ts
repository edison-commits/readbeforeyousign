import Anthropic from '@anthropic-ai/sdk'
import { playbooks, classificationPrompt } from './playbooks'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ContractClassification {
  contract_type: string
  confidence: number
  parties: { party_a: string; party_b: string }
  jurisdiction: string
  effective_date: string
  brief_description: string
}

export interface ClauseAnalysis {
  name: string
  risk_level: 'red' | 'yellow' | 'green'
  original_text: string
  explanation: string
  market_comparison: string
  suggested_change: string | null
  negotiation_tip: string | null
}

export interface ContractReview {
  id: string
  contract_type: string
  contract_type_display: string
  parties: { landlord?: string; tenant?: string; party_a?: string; party_b?: string }
  property_address?: string
  key_terms: Record<string, string>
  risk_score: number
  summary: string
  clauses: ClauseAnalysis[]
  red_count: number
  yellow_count: number
  green_count: number
  classification: ContractClassification
  created_at: string
}

// Step 1: Classify the contract
export async function classifyContract(text: string): Promise<ContractClassification> {
  const preview = text.slice(0, 3000)
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Classify this contract:\n\n${preview}`
    }],
    system: classificationPrompt,
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  
  try {
    return JSON.parse(content.text.replace(/```json\n?|```/g, '').trim())
  } catch {
    throw new Error('Failed to classify contract')
  }
}

// Step 2: Deep analysis using contract-type-specific playbook
export async function analyzeContract(
  text: string,
  classification: ContractClassification
): Promise<ContractReview> {
  const playbook = playbooks[classification.contract_type] || playbooks.commercial_lease
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Review this ${playbook.display_name}:\n\n${text}`
    }],
    system: playbook.analysis_prompt,
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  
  let analysis: any
  try {
    analysis = JSON.parse(content.text.replace(/```json\n?|```/g, '').trim())
  } catch {
    throw new Error('Failed to analyze contract')
  }

  const clauses: ClauseAnalysis[] = analysis.clauses || []
  const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  return {
    id,
    contract_type: classification.contract_type,
    contract_type_display: playbook.display_name,
    parties: analysis.parties || classification.parties,
    property_address: analysis.property_address,
    key_terms: analysis.key_terms || {},
    risk_score: analysis.risk_score || 50,
    summary: analysis.summary || '',
    clauses,
    red_count: clauses.filter(c => c.risk_level === 'red').length,
    yellow_count: clauses.filter(c => c.risk_level === 'yellow').length,
    green_count: clauses.filter(c => c.risk_level === 'green').length,
    classification,
    created_at: new Date().toISOString(),
  }
}

// Follow-up chat about the contract
export async function chatAboutContract(
  contractText: string,
  reviewSummary: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: `You are a friendly contract expert helping a small business owner understand their contract. You've already reviewed it and here's your analysis summary:

${reviewSummary}

Rules:
- Always explain in plain English, no legal jargon
- Reference specific dollar amounts and dates from the contract
- If they ask about negotiating, give practical, actionable advice
- If something is beyond your scope (tax implications, litigation strategy), recommend they consult a professional
- Keep answers concise — 2-3 paragraphs max
- You are NOT a lawyer and don't provide legal advice. You help people understand contracts.`,
    messages: [
      { role: 'user', content: `Here is my contract for reference:\n\n${contractText.slice(0, 8000)}` },
      { role: 'assistant', content: 'Got it — I\'ve reviewed your contract. What questions do you have?' },
      ...messages,
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return content.text
}
