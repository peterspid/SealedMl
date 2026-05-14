'use client';

import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { formatUnits } from 'viem';
import { useHydrated } from '@/hooks/useHydrated';
import { formatAddress } from '@/lib/utils';
import { LogOut, Plug, Wallet } from 'lucide-react';

export function ConnectWallet() {
  const hydrated = useHydrated();
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const primaryConnector = connectors[0];

  if (!hydrated) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-950/50 opacity-60"
      >
        <Plug className="h-4 w-4" />
        Connect
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {balance && (
          <div className="hidden rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 sm:block">
            {Number(formatUnits(balance.value, balance.decimals)).toFixed(3)} {balance.symbol}
          </div>
        )}
        <button
          type="button"
          onClick={() => disconnect()}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
          title="Disconnect wallet"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{formatAddress(address)}</span>
          <LogOut className="hidden h-4 w-4 text-slate-400 sm:block" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => primaryConnector && connect({ connector: primaryConnector })}
      disabled={!primaryConnector || isPending || isConnecting}
      className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-950/50 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending || isConnecting ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Connecting
        </>
      ) : (
        <>
          {primaryConnector ? <Wallet className="h-4 w-4" /> : <Plug className="h-4 w-4" />}
          Connect
        </>
      )}
    </button>
  );
}
