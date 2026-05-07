'use client'

import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { arcTestnet } from '@/lib/wagmi'

export function ConnectButton() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const chainId = useChainId()
  const { connect, connectors, isPending: isConnectPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitchPending } = useSwitchChain()

  const isWrongNetwork = isConnected && chainId !== arcTestnet.id

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {isWrongNetwork && (
          <button
            onClick={() => switchChain({ chainId: arcTestnet.id })}
            disabled={isSwitchPending}
            className="btn-secondary text-sm !py-2 !px-4 border-[#6C9EA9]/40 text-[#6C9EA9]"
          >
            {isSwitchPending ? 'Switching...' : 'Switch to Arc Testnet'}
          </button>
        )}
        <span className="text-sm text-[#6C9EA9] font-mono px-3 py-1.5 bg-[#050D1A] rounded-full border border-[#6C9EA9]/30">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="btn-secondary text-sm !py-2 !px-4"
        >
          Disconnect
        </button>
      </div>
    )
  }

  const isConnectingState = isConnecting || isReconnecting || isConnectPending

  return (
    <button
      onClick={() => {
        const metamask = connectors.find(c => c.id === 'injected')
        if (metamask) connect({ connector: metamask })
      }}
      disabled={isConnectingState}
      className="btn-primary text-sm !py-2 !px-4"
    >
      {isConnectingState ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
