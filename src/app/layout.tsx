import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Arc Agent Marketplace',
  description: 'Decentralized marketplace for AI agents on Arc Network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-arc-bg">
        <Providers>
          <Navbar />
          <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
