'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS, EXPLORER_URL } from '@/lib/contracts'

export default function RegisterPage() {
  const { isConnected } = useAccount()
  const [name, setName] = useState('')
  const [metadataURI, setMetadataURI] = useState('')
  const [capabilities, setCapabilities] = useState('')

  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!metadataURI.trim()) return

    // Build metadata URI - if user provides a full URL use it, otherwise construct a simple JSON URI
    const uri = metadataURI.trim()

    writeContract({
      address: CONTRACTS.AgentRegistry.address,
      abi: CONTRACTS.AgentRegistry.abi,
      functionName: 'registerAgent',
      args: [uri],
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-white mb-2">Register Agent</h1>
      <p className="text-gray-400 mb-8">
        Register your AI agent on the Arc Network. Provide a metadata URI that describes your agent&apos;s capabilities.
      </p>

      {!isConnected ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-400">Please connect your wallet to register an agent.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="agent-name" className="block text-sm font-medium text-gray-300 mb-2">
              Agent Name
            </label>
            <input
              id="agent-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My AI Agent"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">For your reference only (not stored on-chain)</p>
          </div>

          <div>
            <label htmlFor="agent-metadata-uri" className="block text-sm font-medium text-gray-300 mb-2">
              Metadata URI *
            </label>
            <input
              id="agent-metadata-uri"
              type="text"
              value={metadataURI}
              onChange={e => setMetadataURI(e.target.value)}
              placeholder="ipfs://... or https://..."
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              IPFS link or URL pointing to your agent&apos;s metadata JSON
            </p>
          </div>

          <div>
            <label htmlFor="agent-capabilities" className="block text-sm font-medium text-gray-300 mb-2">
              Capabilities Description
            </label>
            <textarea
              id="agent-capabilities"
              value={capabilities}
              onChange={e => setCapabilities(e.target.value)}
              placeholder="Describe what your agent can do..."
              className="input-field min-h-[100px] resize-y"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">For your reference (include in metadata JSON)</p>
          </div>

          <button
            type="submit"
            disabled={isPending || isConfirming || !metadataURI.trim()}
            className="btn-primary w-full"
          >
            {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Registering...' : 'Register Agent'}
          </button>

          {error && (
            <div className="glass-card p-4 border-red-500/30">
              <p className="text-red-400 text-sm">
                Error: {(error as Error).message?.slice(0, 100)}
              </p>
            </div>
          )}

          {isSuccess && hash && (
            <div className="glass-card p-6 border-[#6C9EA9]/30 bg-[#13304E]">
              <h3 className="text-[#6C9EA9] font-heading font-semibold mb-2">
                Agent Registered Successfully!
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Your agent has been registered on Arc Network.
              </p>
              <a
                href={`${EXPLORER_URL}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#406A83] text-sm hover:underline"
              >
                View on Explorer →
              </a>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
