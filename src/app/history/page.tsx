'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle, FileText, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface ReviewSummary {
  id: string
  risk_score: number
  summary: string
  red_count: number
  yellow_count: number
  green_count: number
  created_at: string
  contracts: {
    file_name: string
    contract_type_display: string
    parties: Record<string, string>
    property_address: string
  }
}

export default function HistoryPage() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([])
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, authLoading])

  if (loading || authLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Loading your reviews...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-700 font-medium mb-2">Sign in to see your review history</p>
        <p className="text-sm text-gray-500 mb-4">Create an account to save and access all your past contract reviews.</p>
        <a href="/login" className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 inline-block">
          Sign in
        </a>
      </div>
    )
  }

  return (
    <div>
      <a href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> New review
      </a>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your reviews</h1>

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No reviews yet</p>
          <a href="/" className="text-brand-600 text-sm hover:underline">
            Upload your first contract
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const scoreColor = review.risk_score >= 70 ? 'text-red-600'
              : review.risk_score >= 40 ? 'text-yellow-600' : 'text-green-600'

            return (
              <a
                key={review.id}
                href={`/review/${review.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {review.contracts?.contract_type_display || 'Contract'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 truncate">
                      {review.contracts?.property_address
                        || Object.values(review.contracts?.parties || {}).join(' & ')
                        || review.contracts?.file_name
                        || 'Contract review'}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{review.summary}</p>
                  </div>

                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    <div className="flex items-center gap-2">
                      {review.red_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="w-3.5 h-3.5" /> {review.red_count}
                        </span>
                      )}
                      {review.yellow_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-yellow-600">
                          <AlertCircle className="w-3.5 h-3.5" /> {review.yellow_count}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3.5 h-3.5" /> {review.green_count}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${scoreColor}`}>{review.risk_score}</p>
                      <p className="text-[10px] text-gray-400">risk</p>
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
