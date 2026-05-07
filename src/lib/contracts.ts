import { AgentRegistryABI } from './abis/AgentRegistry'
import { AgentJobMarketplaceABI } from './abis/AgentJobMarketplace'
import { AgentBadgeABI } from './abis/AgentBadge'
import { ERC20ABI } from './abis/ERC20'

export const CONTRACTS = {
  AgentRegistry: {
    address: '0xB50026a52d096ab998E1Ca01011fC8727C69052E' as const,
    abi: AgentRegistryABI,
  },
  AgentJobMarketplace: {
    address: '0x416A1A593E1B0702C7Fb632100568B60e74c097F' as const,
    abi: AgentJobMarketplaceABI,
  },
  AgentBadge: {
    address: '0xEb488eEB4dCcAD8ca0a46dE7420c34955Bd76dF3' as const,
    abi: AgentBadgeABI,
  },
  USDC: {
    address: '0x3600000000000000000000000000000000000000' as const,
    abi: ERC20ABI,
  },
  EURC: {
    address: '0x808456652FdB597867e3ee02ed93E6A5E1C3d90c' as const,
    abi: ERC20ABI,
  },
} as const

export const EXPLORER_URL = 'https://testnet.arcscan.app'

export const TOKEN_OPTIONS = [
  { label: 'USDC', address: CONTRACTS.USDC.address },
  { label: 'EURC', address: CONTRACTS.EURC.address },
] as const

export const JOB_STATUS_LABELS = ['Open', 'In Progress', 'Delivered', 'Completed', 'Disputed', 'Resolved'] as const
