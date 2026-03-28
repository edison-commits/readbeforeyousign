'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Shield, Clock, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const router = useRouter()
  const { session } = useAuth()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && (dropped.type === 'application/pdf' || dropped.name.endsWith('.pdf'))) {
      setFile(dropped)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    setProgress('Extracting text from contract...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      setProgress('Preparing your contract for review...')
      const headers: Record<string, string> = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to start checkout')
      }

      const data = await res.json()
      setProgress('Redirecting to payment...')

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.')
      setUploading(false)
      setProgress('')
    }
  }

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Understand any contract before you sign it
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Upload a contract, get a plain-English breakdown with risk scores and
          suggested changes — in minutes, not days.
        </p>
      </div>

      {/* Upload area */}
      <div className="max-w-xl mx-auto mb-12">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
            ${dragging ? 'border-brand-400 bg-brand-50' : 'border-gray-300 bg-white hover:border-gray-400'}
            ${file ? 'border-green-400 bg-green-50' : ''}
          `}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div>
              <FileText className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / 1024).toFixed(0)} KB — Ready to review
              </p>
            </div>
          ) : (
            <div>
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="font-medium text-gray-700">
                Drop your contract here or click to upload
              </p>
              <p className="text-sm text-gray-400 mt-1">
                PDF files up to 10MB
              </p>
            </div>
          )}
        </div>

        {file && (
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className={`
              w-full mt-4 py-3 px-6 rounded-lg font-medium text-white transition-colors
              ${uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700'
              }
            `}
          >
            {uploading ? progress : 'Review this contract — $9.99'}
          </button>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">{progress}</p>
          </div>
        )}
      </div>

      {/* Value props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Clock className="w-6 h-6 text-brand-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Results in minutes</h3>
          <p className="text-sm text-gray-500">
            Not days. Not weeks. Upload and get your review before your next meeting.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Shield className="w-6 h-6 text-brand-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">No jargon</h3>
          <p className="text-sm text-gray-500">
            Every risk explained in plain English. If your landlord could sue you, we say that.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <DollarSign className="w-6 h-6 text-brand-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">$9.99, not $500/hr</h3>
          <p className="text-sm text-gray-500">
            A lawyer charges $500/hour. We charge less than lunch. Same contract, clearer answers.
          </p>
        </div>
      </div>

      {/* Example output preview */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
          Here's what you get
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Real output from a commercial lease review
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">3 risks</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">2 watch items</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">8 standard</span>
            </div>
          </div>

          <div className="risk-red pl-4 py-3">
            <p className="font-medium text-red-700 text-sm">Personal guarantee — unlimited</p>
            <p className="text-sm text-gray-500 mt-1">
              You are personally on the hook for the entire 5-year lease — even if your business closes.
            </p>
          </div>

          <div className="risk-yellow pl-4 py-3">
            <p className="font-medium text-yellow-700 text-sm">No CAM cap on annual increases</p>
            <p className="text-sm text-gray-500 mt-1">
              Building expenses can increase every year with no limit. We've seen them double.
            </p>
          </div>

          <div className="risk-green pl-4 py-3">
            <p className="font-medium text-green-700 text-sm">Standard insurance requirements</p>
            <p className="text-sm text-gray-500 mt-1">
              $1M general liability is typical for this type of space. No concerns here.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Suggested change (copy-paste ready)</p>
            <p className="text-sm text-gray-700 font-mono">
              Limit the Personal Guarantee to twelve (12) months of Base Rent, decreasing by 25% on each anniversary...
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-xl mx-auto mb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Common questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Is this legal advice?</h3>
            <p className="text-sm text-gray-500 mt-1">
              No. Read Before You Sign is not a law firm. We help you understand contracts in plain English and flag potential risks. For complex deals, we recommend also consulting an attorney — but now you'll know which questions to ask.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">What types of contracts do you review?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Commercial leases, vendor agreements, service contracts, equipment financing, and employment agreements. We're adding more every month.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Is my contract data secure?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Yes. Your contract is processed and never stored permanently. We don't share your data with anyone. All processing happens over encrypted connections.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">How accurate is the AI?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Our AI is trained on thousands of real contracts and uses industry-specific benchmarks for each contract type. We intentionally over-flag rather than under-flag — better safe than sorry.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 pb-8">
        <p>Read Before You Sign is not a law firm and does not provide legal advice.</p>
        <p className="mt-1">© 2026 ReadBeforeYouSign.com</p>
      </footer>
    </div>
  )
}
