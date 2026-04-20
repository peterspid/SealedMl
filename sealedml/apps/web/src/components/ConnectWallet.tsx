'use client';

import { useAccount, useConnect, useDisconnect, useChainId, useBalance } from 'wagmi';
import { formatAddress } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function ConnectWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });

  useEffect(() => {
    const event = new CustomEvent('walletConnectionChange', {
      detail: { isConnected, address, chainId }
    });
    window.dispatchEvent(event);
  }, [isConnected, address, chainId]);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {balance && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-900/50 border border-sky-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-dark-200">
              {Number(balance.formatted).toFixed(4)} {balance.symbol}
            </span>
          </div>
        )}

        <button
          onClick={() => disconnect()}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-gradient-to-r from-sky-500 to-sky-600',
            'hover:from-sky-400 hover:to-sky-500',
            'transition-all duration-200 font-medium text-white text-sm shadow-lg shadow-sky-500/20'
          )}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{formatAddress(address)}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending || isConnecting}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-gradient-to-r from-sky-500 to-sky-600',
            'hover:from-sky-400 hover:to-sky-500',
            'transition-all duration-200 font-medium text-white text-sm',
            'shadow-lg shadow-sky-500/20',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isPending || isConnecting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Connecting...</span>
            </>
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>
      ))}
    </div>
  );
}
