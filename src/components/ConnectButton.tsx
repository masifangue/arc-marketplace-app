'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-arc-green font-mono">
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

  return (
    <button
      onClick={() => {
        const metamask = connectors.find(c => c.id === 'injected')
        if (metamask) connect({ connector: metamask })
      }}
      className="btn-primary text-sm !py-2 !px-4"
    >
      Connect Wallet
    </button>
  )
}
