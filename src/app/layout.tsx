import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { NavBar } from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Read Before You Sign — AI Contract Review for Small Business',
  description: 'Upload any contract, get a plain-English breakdown with risk scores and suggested changes in minutes. No legal jargon. No $500/hour lawyers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <NavBar />
          <main className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
