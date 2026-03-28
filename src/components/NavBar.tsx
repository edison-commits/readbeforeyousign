'use client'

import { useAuth } from './AuthProvider'
import { User } from 'lucide-react'

export function NavBar() {
  const { user, loading } = useAuth()

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="text-lg font-semibold text-gray-900">
          Read Before You Sign
        </a>
        <div className="flex items-center gap-4">
          <a href="/history" className="text-sm text-gray-500 hover:text-gray-700">
            My reviews
          </a>
          {!loading && (
            user ? (
              <a
                href="/account"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
              </a>
            ) : (
              <a
                href="/login"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Sign in
              </a>
            )
          )}
          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-md font-medium">
            Beta
          </span>
        </div>
      </div>
    </nav>
  )
}
