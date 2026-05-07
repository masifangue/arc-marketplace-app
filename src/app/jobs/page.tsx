'use client'

import { useState, useEffect } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import { CONTRACTS, JOB_STATUS_LABELS } from '@/lib/contracts'
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

function isJob(value: unknown): value is Job {
  if (!value || typeof value !== 'object') return false

  const job = value as Record<string, unknown>
  return (
    typeof job.jobId === 'bigint' &&
    typeof job.agentId === 'bigint' &&
    typeof job.client === 'string' &&
    typeof job.budget === 'bigint' &&
    typeof job.deadline === 'bigint' &&
    typeof job.description === 'string' &&
    typeof job.status === 'number' &&
    typeof job.deliverableHash === 'string' &&
    typeof job.disputeReason === 'string' &&
    typeof job.createdAt === 'bigint' &&
    typeof job.completedAt === 'bigint' &&
    typeof job.paymentToken === 'string'
  )
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

  const {
    data: totalJobs,
    isPending: isTotalJobsPending,
    error: totalJobsError,
  } = useReadContract({
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

  const {
    data: jobResults,
    isPending: isJobsPending,
    error: jobsError,
  } = useReadContracts({
    contracts: jobCalls,
    query: { enabled: jobCount > 0 },
  })

  useEffect(() => {
    if (jobResults) {
      const parsed: Job[] = []
      for (const result of jobResults) {
        if (result.status === 'success' && isJob(result.result)) {
          parsed.push(result.result)
        }
      }
      setJobs(parsed)
    }
  }, [jobResults])

  const filteredJobs = filter !== null ? jobs.filter(j => j.status === filter) : jobs
  const isLoading = isTotalJobsPending || (jobCount > 0 && isJobsPending)
  const errorMessage = totalJobsError?.message || jobsError?.message

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
              ? 'bg-[#6C9EA9]/20 text-[#6C9EA9] border border-[#6C9EA9]/30'
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
                  ? 'bg-[#6C9EA9]/20 text-[#6C9EA9] border border-[#6C9EA9]/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Job Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="glass-card p-5 animate-pulse">
              <div className="h-3 bg-white/10 rounded w-1/3 mb-3" />
              <div className="h-4 bg-white/10 rounded w-full mb-2" />
              <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <div className="glass-card p-12 text-center border-red-500/30">
          <p className="text-red-400 text-lg">Failed to load jobs.</p>
          <p className="text-gray-500 text-sm mt-2">{errorMessage.slice(0, 180)}</p>
        </div>
      ) : jobCount === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-400 text-lg">No jobs created yet.</p>
          <Link href="/create-job" className="text-[#6C9EA9] hover:underline mt-2 inline-block">
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
                  <span className="text-[#6C9EA9] font-semibold">
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
