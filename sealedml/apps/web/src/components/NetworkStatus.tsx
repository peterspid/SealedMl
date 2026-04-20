'use client';

import { useAccount } from 'wagmi';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function NetworkStatus() {
  const { isConnected, chain } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700">
        <AlertCircle className="w-4 h-4 text-amber-400" />
        <span className="text-xs text-amber-400">Not Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
      <CheckCircle className="w-4 h-4 text-emerald-400" />
      <span className="text-xs text-emerald-400">{chain?.name || 'Connected'}</span>
    </div>
  );
}
