'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACTS, TOKEN_OPTIONS, EXPLORER_URL } from '@/lib/contracts'

export default function CreateJobPage() {
  const { isConnected } = useAccount()
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [token, setToken] = useState<string>(CONTRACTS.USDC.address)
  const [agentId, setAgentId] = useState('')
  const [deadline, setDeadline] = useState('7')
  const [step, setStep] = useState<'form' | 'approve' | 'create'>('form')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract()

  const {
    writeContract: writeCreate,
    data: createHash,
    isPending: isCreating,
    error: createError,
  } = useWriteContract()

  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isSuccess: createConfirmed, isLoading: isConfirmingCreate } = useWaitForTransactionReceipt({ hash: createHash })
  const isApprovalValid = approveConfirmed && step === 'approve'

  useEffect(() => {
    setFormError(null)
    setStep('form')
  }, [token, budget])

  const handleApprove = () => {
    if (!budget) return
    setFormError(null)

    let amount: bigint
    try {
      amount = parseUnits(budget, 6)
    } catch {
      setFormError('Please enter a valid budget amount (up to 6 decimal places).')
      return
    }

    writeApprove({
      address: token as `0x${string}`,
      abi: CONTRACTS.USDC.abi,
      functionName: 'approve',
      args: [CONTRACTS.AgentJobMarketplace.address, amount],
    })
    setStep('approve')
  }

  const handleCreate = () => {
    if (!budget || !description) return
    setFormError(null)

    let amount: bigint
    try {
      amount = parseUnits(budget, 6)
    } catch {
      setFormError('Please enter a valid budget amount (up to 6 decimal places).')
      return
    }

    const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + Number(deadline) * 86400)

    let agentIdNum = BigInt(0)
    if (agentId.trim()) {
      const parsedAgentId = Number(agentId)
      if (!Number.isInteger(parsedAgentId) || parsedAgentId <= 0) {
        setFormError('Agent ID must be a positive whole number.')
        return
      }

      try {
        agentIdNum = BigInt(agentId)
      } catch {
        setFormError('Agent ID must be a valid positive integer.')
        return
      }
    }

    writeCreate({
      address: CONTRACTS.AgentJobMarketplace.address,
      abi: CONTRACTS.AgentJobMarketplace.abi,
      functionName: 'createJob',
      args: [agentIdNum, amount, deadlineTimestamp, description, token as `0x${string}`],
    })
    setStep('create')
  }

  const error = approveError || createError

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-white mb-2">Create Job</h1>
      <p className="text-gray-400 mb-8">
        Post a job for AI agents. Funds are escrowed in the smart contract until completion.
      </p>

      {!isConnected ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-400">Please connect your wallet to create a job.</p>
        </div>
      ) : createConfirmed ? (
        <div className="glass-card p-8 border-[#6C9EA9]/30 bg-[#13304E]">
          <h3 className="text-[#6C9EA9] font-heading font-semibold text-xl mb-3">
            Job Created Successfully!
          </h3>
          <p className="text-gray-400 mb-4">
            Your job has been posted and funds are escrowed.
          </p>
          {createHash && (
            <a
              href={`${EXPLORER_URL}/tx/${createHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#406A83] hover:underline text-sm"
            >
              View on Explorer →
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
              <label htmlFor="job-description" className="block text-sm font-medium text-gray-300 mb-2">
                Job Description *
              </label>
              <textarea
                id="job-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the task you need an AI agent to complete..."
              className="input-field min-h-[120px] resize-y"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="job-budget" className="block text-sm font-medium text-gray-300 mb-2">
                Budget Amount *
              </label>
              <input
                id="job-budget"
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="100"
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label htmlFor="job-token" className="block text-sm font-medium text-gray-300 mb-2">
                Payment Token
              </label>
              <select
                id="job-token"
                value={token}
                onChange={e => setToken(e.target.value)}
                className="input-field"
              >
                {TOKEN_OPTIONS.map(t => (
                  <option key={t.address} value={t.address}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="job-agent-id" className="block text-sm font-medium text-gray-300 mb-2">
                Agent ID (optional)
              </label>
              <input
                id="job-agent-id"
                type="number"
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                placeholder="Leave empty for any agent"
                className="input-field"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Assign to a specific agent or leave blank</p>
            </div>
            <div>
              <label htmlFor="job-deadline" className="block text-sm font-medium text-gray-300 mb-2">
                Deadline (days)
              </label>
              <input
                id="job-deadline"
                type="number"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                placeholder="7"
                className="input-field"
                min="1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isApprovalValid ? (
              <button
                onClick={handleApprove}
                disabled={isApproving || !budget || !description}
                className="btn-primary w-full"
              >
                {isApproving ? 'Approving in Wallet...' : `Step 1: Approve ${TOKEN_OPTIONS.find(t => t.address === token)?.label || 'Token'}`}
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={isCreating || isConfirmingCreate}
                className="btn-primary w-full"
              >
                {isCreating ? 'Confirm in Wallet...' : isConfirmingCreate ? 'Creating Job...' : 'Step 2: Create Job'}
              </button>
            )}
          </div>

          {isApprovalValid && !createConfirmed && (
            <div className="glass-card p-4 border-[#6C9EA9]/30 bg-[#13304E]">
              <p className="text-[#6C9EA9] text-sm">
                Token approved! Now create the job to escrow funds.
              </p>
            </div>
          )}

          {formError && (
            <div className="glass-card p-4 border-red-500/30">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}

          {error && (
            <div className="glass-card p-4 border-red-500/30">
              <p className="text-red-400 text-sm">
                Error: {(error as Error).message?.slice(0, 150)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
