'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import {
  AlertTriangle, AlertCircle, CheckCircle, ChevronDown, ChevronUp,
  Copy, Check, MessageCircle, Send, ArrowLeft
} from 'lucide-react'

interface Clause {
  name: string
  risk_level: 'red' | 'yellow' | 'green'
  original_text: string
  explanation: string
  market_comparison: string
  suggested_change: string | null
  negotiation_tip: string | null
}

interface Review {
  id: string
  contract_type_display: string
  parties: Record<string, string>
  property_address?: string
  key_terms: Record<string, string>
  risk_score: number
  summary: string
  clauses: Clause[]
  red_count: number
  yellow_count: number
  green_count: number
  created_at: string
  _contractText?: string
}

function RiskBadge({ level }: { level: string }) {
  if (level === 'red') return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">Risk</span>
  if (level === 'yellow') return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">Watch</span>
  return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Standard</span>
}

function RiskIcon({ level }: { level: string }) {
  if (level === 'red') return <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
  if (level === 'yellow') return <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
  return <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
}

function ClauseCard({ clause }: { clause: Clause }) {
  const [expanded, setExpanded] = useState(clause.risk_level === 'red')
  const [copied, setCopied] = useState(false)

  const borderColor = clause.risk_level === 'red' ? 'border-l-red-500'
    : clause.risk_level === 'yellow' ? 'border-l-yellow-500' : 'border-l-green-500'

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`border-l-[3px] ${borderColor} bg-white rounded-r-lg border border-l-0 border-gray-200 overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
      >
        <RiskIcon level={clause.risk_level} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">{clause.name}</span>
            <RiskBadge level={clause.risk_level} />
          </div>
          {!expanded && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{clause.explanation}</p>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">What this means</p>
            <p className="text-sm text-gray-700 leading-relaxed">{clause.explanation}</p>
          </div>

          {clause.market_comparison && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Market comparison</p>
              <p className="text-sm text-gray-500 leading-relaxed">{clause.market_comparison}</p>
            </div>
          )}

          {clause.original_text && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Contract language</p>
              <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg font-mono">
                {clause.original_text}
              </p>
            </div>
          )}

          {clause.suggested_change && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-blue-700">Suggested change (copy-paste ready)</p>
                <button
                  onClick={() => copyText(clause.suggested_change!)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-blue-900 font-mono leading-relaxed">
                {clause.suggested_change}
              </p>
              {clause.negotiation_tip && (
                <p className="text-xs text-blue-600 mt-2 italic">
                  Tip: {clause.negotiation_tip}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ChatPanel({ review }: { review: Review }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText: review._contractText || '',
          reviewSummary: review.summary,
          messages: newMessages,
          reviewId: review.id,
        }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }])
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-brand-700 transition-colors flex items-center gap-2 text-sm font-medium"
      >
        <MessageCircle className="w-5 h-5" />
        Ask about this contract
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col" style={{ height: '480px' }}>
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-sm text-gray-900">Ask about your contract</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-3">Ask anything about your contract</p>
            <div className="space-y-2">
              {[
                'What does the personal guarantee actually mean for me?',
                'Can I negotiate the CAM charges?',
                'What happens if I need to close my business early?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="block w-full text-left text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-lg transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
              m.role === 'user'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-lg text-sm">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question..."
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700 disabled:bg-gray-300 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReviewPage() {
  const params = useParams()
  const [review, setReview] = useState<Review | null>(null)
  const [filter, setFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all')

  useEffect(() => {
    const id = params.id as string
    // Try sessionStorage first (for direct API reviews during dev)
    const stored = sessionStorage.getItem(`review-${id}`)
    if (stored) {
      setReview(JSON.parse(stored))
      return
    }
    // Otherwise fetch from server (after Stripe checkout flow)
    fetch(`/api/review/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Not found'))
      .then(data => setReview(data))
      .catch(() => {})
  }, [params.id])

  if (!review) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Loading review...</p>
        <a href="/" className="text-brand-600 text-sm mt-2 inline-block hover:underline">
          ← Upload a new contract
        </a>
      </div>
    )
  }

  const filteredClauses = filter === 'all'
    ? review.clauses
    : review.clauses.filter(c => c.risk_level === filter)

  const scoreColor = review.risk_score >= 70 ? 'text-red-600'
    : review.risk_score >= 40 ? 'text-yellow-600' : 'text-green-600'

  return (
    <div className="pb-20">
      {/* Header */}
      <a href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> New review
      </a>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">{review.contract_type_display} review</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {review.property_address || Object.values(review.parties).join(' & ')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{review.summary}</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(review.key_terms).slice(0, 4).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Risk summary bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className={`text-3xl font-bold ${scoreColor}`}>{review.risk_score}</p>
            <p className="text-xs text-gray-500">Risk score</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="flex gap-3">
            <button
              onClick={() => setFilter(filter === 'red' ? 'all' : 'red')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === 'red' ? 'bg-red-100 text-red-700' : 'hover:bg-red-50 text-gray-600'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-medium">{review.red_count}</span>
              <span className="hidden sm:inline">risks</span>
            </button>
            <button
              onClick={() => setFilter(filter === 'yellow' ? 'all' : 'yellow')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'hover:bg-yellow-50 text-gray-600'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{review.yellow_count}</span>
              <span className="hidden sm:inline">watch</span>
            </button>
            <button
              onClick={() => setFilter(filter === 'green' ? 'all' : 'green')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === 'green' ? 'bg-green-100 text-green-700' : 'hover:bg-green-50 text-gray-600'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">{review.green_count}</span>
              <span className="hidden sm:inline">standard</span>
            </button>
          </div>
        </div>
        {filter !== 'all' && (
          <button onClick={() => setFilter('all')} className="text-xs text-brand-600 hover:underline">
            Show all
          </button>
        )}
      </div>

      {/* Clause list */}
      <div className="space-y-2">
        {filteredClauses.map((clause, i) => (
          <ClauseCard key={i} clause={clause} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-400">
          Read Before You Sign is not a law firm and does not provide legal advice. This review is for
          informational purposes only. For complex or high-value contracts, we recommend also consulting
          with a licensed attorney in your jurisdiction.
        </p>
      </div>

      {/* Chat panel */}
      <ChatPanel review={review} />
    </div>
  )
}
