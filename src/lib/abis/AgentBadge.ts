export const AgentBadgeABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'agentOwner', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'jobId', type: 'uint256' },
    ],
    name: 'BadgeMinted',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'address', name: 'agentOwner', type: 'address' }],
    name: 'badgeCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'getBadgeMetadata',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'jobId', type: 'uint256' },
          { internalType: 'uint256', name: 'completionTimestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'paymentAmount', type: 'uint256' },
          { internalType: 'address', name: 'tokenUsed', type: 'address' },
        ],
        internalType: 'struct AgentBadge.BadgeMetadata',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalBadges',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
