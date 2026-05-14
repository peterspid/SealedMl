'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useHydrated } from '@/hooks/useHydrated';
import { getConfiguredChainIds } from '@/lib/contracts';
import { AlertCircle, CheckCircle, Wifi } from 'lucide-react';

const configuredChainIds = new Set(getConfiguredChainIds());

export function NetworkStatus() {
  const hydrated = useHydrated();
  const { isConnected, chain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!hydrated || !isConnected) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
        <Wifi className="h-3.5 w-3.5" />
        Wallet not connected
      </div>
    );
  }

  if (!chain || !configuredChainIds.has(chain.id)) {
    return (
      <button
        type="button"
        onClick={() => switchChain({ chainId: sepolia.id })}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-100 transition hover:bg-amber-400/15 disabled:opacity-60"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Switch to Sepolia
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
      <CheckCircle className="h-3.5 w-3.5" />
      {chain.name}
    </div>
  );
}
