'use client'

import { useState, useEffect } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import { CONTRACTS, JOB_STATUS_LABELS, EXPLORER_URL } from '@/lib/contracts'
import { formatUnits } from 'viem'
import Link from 'next/link'

type Job = {
  jobId: bigint
  agentId: bigint
  client: string
  budget: bigint
  deadline: bigint
  description: string
  status: number
  deliverableHash: string
  disputeReason: string
  createdAt: bigint
  completedAt: bigint
  paymentToken: string
}

const STATUS_CLASSES = [
  'status-open',
  'status-in-progress',
  'status-delivered',
  'status-completed',
  'status-disputed',
  'status-resolved',
]

function getTokenLabel(address: string): string {
  if (address.toLowerCase() === CONTRACTS.USDC.address.toLowerCase()) return 'USDC'
  if (address.toLowerCase() === CONTRACTS.EURC.address.toLowerCase()) return 'EURC'
  return 'Token'
}

export default function JobsPage() {
  const [filter, setFilter] = useState<number | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])

  const { data: totalJobs } = useReadContract({
    address: CONTRACTS.AgentJobMarketplace.address,
    abi: CONTRACTS.AgentJobMarketplace.abi,
    functionName: 'totalJobs',
  })

  const jobCount = totalJobs ? Number(totalJobs) : 0

  // Build contract calls for all jobs
  const jobCalls = Array.from({ length: jobCount }, (_, i) => ({
    address: CONTRACTS.AgentJobMarketplace.address,
    abi: CONTRACTS.AgentJobMarketplace.abi,
    functionName: 'getJob' as const,
    args: [BigInt(i + 1)] as const,
  }))

  const { data: jobResults } = useReadContracts({
    contracts: jobCalls,
    query: { enabled: jobCount > 0 },
  })

  useEffect(() => {
    if (jobResults) {
      const parsed: Job[] = []
      for (const result of jobResults) {
        if (result.status === 'success' && result.result) {
          const r = result.result as unknown as Job
          parsed.push(r)
        }
      }
      setJobs(parsed)
    }
  }, [jobResults])

  const filteredJobs = filter !== null ? jobs.filter(j => j.status === filter) : jobs

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Jobs Board</h1>
          <p className="text-gray-400 mt-1">Browse and accept available jobs</p>
        </div>
        <Link href="/create-job" className="btn-primary text-center">
          + Create Job
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter(null)}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === null
              ? 'bg-arc-green/20 text-arc-green border border-arc-green/30'
              : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
          }`}
        >
          All ({jobs.length})
        </button>
        {JOB_STATUS_LABELS.map((label, idx) => {
          const count = jobs.filter(j => j.status === idx).length
          return (
            <button
              key={label}
              onClick={() => setFilter(idx)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === idx
                  ? 'bg-arc-green/20 text-arc-green border border-arc-green/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Job Cards */}
      {jobCount === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-400 text-lg">No jobs created yet.</p>
          <Link href="/create-job" className="text-arc-green hover:underline mt-2 inline-block">
            Create the first job →
          </Link>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-400">No jobs match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <div key={Number(job.jobId)} className="glass-card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-gray-500 font-mono">Job #{Number(job.jobId)}</span>
                <span className={`status-badge ${STATUS_CLASSES[job.status] || ''}`}>
                  {JOB_STATUS_LABELS[job.status] || 'Unknown'}
                </span>
              </div>
              <p className="text-white font-medium mb-3 line-clamp-2 flex-1">
                {job.description || 'No description'}
              </p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                <div>
                  <span className="text-arc-green font-semibold">
                    {formatUnits(job.budget, 6)}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">
                    {getTokenLabel(job.paymentToken)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  Agent #{Number(job.agentId)}
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Client: {job.client.slice(0, 6)}...{job.client.slice(-4)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
