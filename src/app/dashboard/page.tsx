'use client'

import { useMemo } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { CONTRACTS, JOB_STATUS_LABELS } from '@/lib/contracts'
import { formatUnits } from 'viem'
import Link from 'next/link'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

type AgentTuple = readonly [string, string, bigint, bigint]

type JobSummary = {
  jobId: bigint
  agentId: bigint
  client: string
  budget: bigint
  description: string
  status: number
  paymentToken: string
}

function isAgentTuple(value: unknown): value is AgentTuple {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    typeof value[0] === 'string' &&
    typeof value[1] === 'string' &&
    typeof value[2] === 'bigint' &&
    typeof value[3] === 'bigint'
  )
}

function isJobSummary(value: unknown): value is JobSummary {
  if (!value || typeof value !== 'object') return false

  const job = value as Record<string, unknown>
  return (
    typeof job.jobId === 'bigint' &&
    typeof job.agentId === 'bigint' &&
    typeof job.client === 'string' &&
    typeof job.budget === 'bigint' &&
    typeof job.description === 'string' &&
    typeof job.status === 'number' &&
    typeof job.paymentToken === 'string'
  )
}

function AgentCard({ agentId }: { agentId: bigint }) {
  const { data, isPending, error } = useReadContract({
    address: CONTRACTS.AgentRegistry.address,
    abi: CONTRACTS.AgentRegistry.abi,
    functionName: 'getAgent',
    args: [agentId],
  })

  if (isPending) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/2 mb-3" />
        <div className="h-3 bg-white/10 rounded w-full mb-2" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-4 border-red-500/30">
        <p className="text-red-400 text-xs">Failed to load agent #{Number(agentId)}.</p>
      </div>
    )
  }

  if (!isAgentTuple(data)) return null
  const [, metadataURI, registeredAt, reputationScore] = data

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#6C9EA9] font-heading font-semibold">Agent #{Number(agentId)}</span>
        <span className="text-sm text-gray-400">
          Rep: <span className="text-white font-medium">{Number(reputationScore)}</span>
        </span>
      </div>
      <p className="text-xs text-gray-500 truncate mb-1">{metadataURI}</p>
      <p className="text-xs text-gray-600">
        Registered: {new Date(Number(registeredAt) * 1000).toLocaleDateString()}
      </p>
    </div>
  )
}

function JobMiniCard({ jobId }: { jobId: bigint }) {
  const { data, isPending, error } = useReadContract({
    address: CONTRACTS.AgentJobMarketplace.address,
    abi: CONTRACTS.AgentJobMarketplace.abi,
    functionName: 'getJob',
    args: [jobId],
  })

  if (isPending) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-3 bg-white/10 rounded w-1/3 mb-3" />
        <div className="h-4 bg-white/10 rounded w-full mb-2" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-4 border-red-500/30">
        <p className="text-red-400 text-xs">Failed to load job #{Number(jobId)}.</p>
      </div>
    )
  }

  if (!isJobSummary(data)) return null
  const job = data

  const tokenLabel = job.paymentToken.toLowerCase() === CONTRACTS.USDC.address.toLowerCase() ? 'USDC' : 'EURC'

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-mono text-gray-400">Job #{Number(job.jobId)}</span>
        <span className={`status-badge status-${JOB_STATUS_LABELS[job.status]?.toLowerCase().replace(' ', '-') || 'open'}`}>
          {JOB_STATUS_LABELS[job.status] || 'Unknown'}
        </span>
      </div>
      <p className="text-sm text-white truncate mb-2">{job.description || 'No description'}</p>
      <div className="text-xs text-gray-500">
        <span className="text-[#6C9EA9] font-medium">{formatUnits(job.budget, 6)}</span> {tokenLabel}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const account = address ?? ZERO_ADDRESS

  const {
    data: totalAgents,
    isPending: isTotalAgentsPending,
    error: totalAgentsError,
  } = useReadContract({
    address: CONTRACTS.AgentRegistry.address,
    abi: CONTRACTS.AgentRegistry.abi,
    functionName: 'totalAgents',
  })

  const {
    data: totalJobs,
    isPending: isTotalJobsPending,
    error: totalJobsError,
  } = useReadContract({
    address: CONTRACTS.AgentJobMarketplace.address,
    abi: CONTRACTS.AgentJobMarketplace.abi,
    functionName: 'totalJobs',
  })

  const {
    data: agentIds,
    isPending: isAgentIdsPending,
    error: agentIdsError,
  } = useReadContract({
    address: CONTRACTS.AgentRegistry.address,
    abi: CONTRACTS.AgentRegistry.abi,
    functionName: 'getAgentsByOwner',
    args: [account],
    query: { enabled: !!address },
  })

  const {
    data: clientJobIds,
    isPending: isClientJobsPending,
    error: clientJobsError,
  } = useReadContract({
    address: CONTRACTS.AgentJobMarketplace.address,
    abi: CONTRACTS.AgentJobMarketplace.abi,
    functionName: 'getJobsByClient',
    args: [account],
    query: { enabled: !!address },
  })

  const {
    data: badgeCount,
    isPending: isBadgePending,
    error: badgeError,
  } = useReadContract({
    address: CONTRACTS.AgentBadge.address,
    abi: CONTRACTS.AgentBadge.abi,
    functionName: 'badgeCount',
    args: [account],
    query: { enabled: !!address },
  })

  // Get jobs by agent for each agent the user owns
  const agentJobCalls = (agentIds || []).map(id => ({
    address: CONTRACTS.AgentJobMarketplace.address,
    abi: CONTRACTS.AgentJobMarketplace.abi,
    functionName: 'getJobsByAgent' as const,
    args: [id] as const,
  }))

  const {
    data: agentJobResults,
    isPending: isAgentJobsPending,
    error: agentJobsError,
  } = useReadContracts({
    contracts: agentJobCalls,
    query: { enabled: !!address && (agentIds || []).length > 0 },
  })

  const agentJobIds = useMemo(() => {
    const ids: bigint[] = []
    if (!agentJobResults) return ids

    for (const result of agentJobResults) {
      if (
        result.status === 'success' &&
        Array.isArray(result.result) &&
        result.result.every(id => typeof id === 'bigint')
      ) {
        ids.push(...result.result)
      }
    }

    return ids
  }, [agentJobResults])

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-heading font-bold text-white mb-8">My Dashboard</h1>
        <div className="glass-card p-12 text-center">
          <p className="text-gray-400 text-lg">Connect wallet to view dashboard.</p>
        </div>
      </div>
    )
  }

  const statsErrorMessage =
    totalAgentsError?.message ||
    totalJobsError?.message ||
    badgeError?.message ||
    clientJobsError?.message ||
    agentJobsError?.message

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white mb-2">My Dashboard</h1>
        <p className="text-gray-400 text-sm font-mono">{address}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-heading font-bold text-[#6C9EA9]">
            {isAgentIdsPending ? '...' : agentIds ? agentIds.length : 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            My Agents
            {isTotalAgentsPending ? '' : totalAgents !== undefined ? ` • Network: ${Number(totalAgents)}` : ''}
          </p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-heading font-bold text-[#406A83]">
            {isClientJobsPending ? '...' : clientJobIds ? clientJobIds.length : 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Jobs Created
            {isTotalJobsPending ? '' : totalJobs !== undefined ? ` • Network: ${Number(totalJobs)}` : ''}
          </p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-heading font-bold text-[#7db3bf]">
            {isBadgePending ? '...' : badgeCount !== undefined ? Number(badgeCount) : 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">NFT Badges</p>
        </div>
      </div>

      {statsErrorMessage && (
        <div className="glass-card p-4 border-red-500/30">
          <p className="text-red-400 text-sm">Some dashboard data failed to load.</p>
          <p className="text-gray-500 text-xs mt-1">{statsErrorMessage.slice(0, 180)}</p>
        </div>
      )}

      {/* My Agents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-white">My Agents</h2>
          <Link href="/register" className="text-[#6C9EA9] text-sm hover:underline">
            + Register New
          </Link>
        </div>
        {isAgentIdsPending ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-500">Loading your agents...</p>
          </div>
        ) : agentIdsError ? (
          <div className="glass-card p-6 text-center border-red-500/30">
            <p className="text-red-400">Failed to load your agents.</p>
          </div>
        ) : !agentIds || agentIds.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-500">No agents registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agentIds.map(id => (
              <AgentCard key={Number(id)} agentId={id} />
            ))}
          </div>
        )}
      </section>

      {/* My Created Jobs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-white">My Created Jobs</h2>
          <Link href="/create-job" className="text-[#6C9EA9] text-sm hover:underline">
            + Create Job
          </Link>
        </div>
        {isClientJobsPending ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-500">Loading your created jobs...</p>
          </div>
        ) : clientJobsError ? (
          <div className="glass-card p-6 text-center border-red-500/30">
            <p className="text-red-400">Failed to load your created jobs.</p>
          </div>
        ) : !clientJobIds || clientJobIds.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-500">No jobs created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clientJobIds.map(id => (
              <JobMiniCard key={Number(id)} jobId={id} />
            ))}
          </div>
        )}
      </section>

      {/* My Accepted Jobs (as agent) */}
      <section>
        <h2 className="text-xl font-heading font-semibold text-white mb-4">My Accepted Jobs (as Agent)</h2>
        {isAgentJobsPending ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-500">Loading accepted jobs...</p>
          </div>
        ) : agentJobsError ? (
          <div className="glass-card p-6 text-center border-red-500/30">
            <p className="text-red-400">Failed to load accepted jobs.</p>
          </div>
        ) : agentJobIds.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-500">No jobs accepted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agentJobIds.map(id => (
              <JobMiniCard key={Number(id)} jobId={id} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
