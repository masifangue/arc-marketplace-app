'use client'

import Link from 'next/link'
import { ConnectButton } from './ConnectButton'
import { useState } from 'react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/register', label: 'Register Agent' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/create-job', label: 'Create Job' },
    { href: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#091E39]/95 backdrop-blur border-b border-[#1E3A5F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-heading font-bold text-[#6C9EA9]">Arc</span>
            <span className="text-xl font-heading font-bold text-white">Marketplace</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#ABB9C4] hover:text-[#6C9EA9] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <ConnectButton />
          </div>

          <button
            className="md:hidden text-gray-400"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div id="mobile-menu" className="md:hidden pb-4 space-y-2 bg-[#050D1A] px-4 rounded-b-xl border border-[#1E3A5F] border-t-0 -mx-4 shadow-lg shadow-[#050D1A]/50">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm text-[#ABB9C4] hover:text-[#6C9EA9] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 pb-2">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
