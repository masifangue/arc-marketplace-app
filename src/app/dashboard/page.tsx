'use client'

import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { CONTRACTS, JOB_STATUS_LABELS, EXPLORER_URL } from '@/lib/contracts'
import { formatUnits } from 'viem'
import Link from 'next/link'

function AgentCard({ agentId }: { agentId: bigint }) {
  const { data } = useReadContract({
    address: CONTRACTS.AgentRegistry.address,
    abi: CONTRACTS.AgentRegistry.abi,
    functionName: 'getAgent',
    args: [agentId],
  })

  if (!data) return null
  const [owner, metadataURI, registeredAt, reputationScore] = data as [string, string, bigint, bigint]

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-arc-green font-heading font-semibold">Agent #{Number(agentId)}</span>
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
  const { data } = useReadContract({
    address: CONTRACTS.AgentJobMarketplace.address,
    abi: CONTRACTS.AgentJobMarketplace.abi,
    functionName: 'getJob',
    args: [jobId],
  })

  if (!data) return null
  const job = data as {
    jobId: bigint
    agentId: bigint
    client: string
    budget: bigint
    description: string
    status: number
    paymentToken: string
  }

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
        <span className="text-arc-green font-medium">{formatUnits(job.budget, 6)}</span> {tokenLabel}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()

  const { data: agentIds } = useReadContract({
    address: CONTRACTS.AgentRegistry.address,
    abi: CONTRACTS.AgentRegistry.abi,
    functionName: 'getAgentsByOwner',
    args: [address!],
    query: { enabled: !!address },
  })

  const { data: clientJobIds } = useReadContract({
    address: CONTRACTS.AgentJobMarketplace.address,
    abi: CONTRACTS.AgentJobMarketplace.abi,
    functionName: 'getJobsByClient',
    args: [address!],
    query: { enabled: !!address },
  })

  const { data: badgeCount } = useReadContract({
    address: CONTRACTS.AgentBadge.address,
    abi: CONTRACTS.AgentBadge.abi,
    functionName: 'badgeCount',
    args: [address!],
    query: { enabled: !!address },
  })

  // Get jobs by agent for each agent the user owns
  const agentJobCalls = (agentIds || []).map(id => ({
    address: CONTRACTS.AgentJobMarketplace.address,
    abi: CONTRACTS.AgentJobMarketplace.abi,
    functionName: 'getJobsByAgent' as const,
    args: [id] as const,
  }))

  const { data: agentJobResults } = useReadContracts({
    contracts: agentJobCalls,
    query: { enabled: (agentIds || []).length > 0 },
  })

  const agentJobIds: bigint[] = []
  if (agentJobResults) {
    for (const result of agentJobResults) {
      if (result.status === 'success' && result.result) {
        agentJobIds.push(...(result.result as bigint[]))
      }
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-heading font-bold text-white mb-8">My Dashboard</h1>
        <div className="glass-card p-12 text-center">
          <p className="text-gray-400 text-lg">Connect your wallet to view your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white mb-2">My Dashboard</h1>
        <p className="text-gray-400 text-sm font-mono">{address}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-heading font-bold text-arc-green">
            {agentIds ? agentIds.length : 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">My Agents</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-heading font-bold text-arc-cyan">
            {clientJobIds ? clientJobIds.length : 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">Jobs Created</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-heading font-bold text-purple-400">
            {badgeCount !== undefined ? Number(badgeCount) : 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">NFT Badges</p>
        </div>
      </div>

      {/* My Agents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-white">My Agents</h2>
          <Link href="/register" className="text-arc-green text-sm hover:underline">
            + Register New
          </Link>
        </div>
        {!agentIds || agentIds.length === 0 ? (
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
          <Link href="/create-job" className="text-arc-green text-sm hover:underline">
            + Create Job
          </Link>
        </div>
        {!clientJobIds || clientJobIds.length === 0 ? (
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
        {agentJobIds.length === 0 ? (
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
