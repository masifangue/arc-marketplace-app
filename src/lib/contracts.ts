import { AgentRegistryABI } from './abis/AgentRegistry'
import { AgentJobMarketplaceABI } from './abis/AgentJobMarketplace'
import { AgentBadgeABI } from './abis/AgentBadge'
import { ERC20ABI } from './abis/ERC20'

export const CONTRACTS = {
  AgentRegistry: {
    address: '0xdaB0D268c776B558E7fd086876eAf6Af52Ca8879' as const,
    abi: AgentRegistryABI,
  },
  AgentJobMarketplace: {
    address: '0x35c9fee61f88533e31d81d3f4A3dBF2F9DB46A53' as const,
    abi: AgentJobMarketplaceABI,
  },
  AgentBadge: {
    address: '0x31A488668C4E50D691073692A0ef00Bb3160E9E8' as const,
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
