'use client';

import { useState } from 'react';
import { cn, formatTimestamp, getRiskColor, getRiskLabel } from '@/lib/utils';
import { getExplorerTxUrl } from '@/lib/contracts';
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Copy,
  ExternalLink,
  Lock,
  Share2,
  Shield,
} from 'lucide-react';

interface ResultCardProps {
  requestId: string;
  riskClass: number | null;
  score: number | null;
  timestamp: number;
  txHash?: `0x${string}`;
  chainId?: number;
  encryptedScoreHandle?: string;
  encryptedRiskClassHandle?: string;
  decryptionStatus?: 'decrypted' | 'pending' | 'failed';
  onShare?: () => void;
}

export function ResultCard({
  requestId,
  riskClass,
  score,
  timestamp,
  txHash,
  chainId,
  encryptedScoreHandle,
  encryptedRiskClassHandle,
  decryptionStatus = 'decrypted',
  onShare,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const hasDecryptedScore = decryptionStatus === 'decrypted' && score !== null && riskClass !== null;
  const colors = hasDecryptedScore ? getRiskColor(riskClass) : {
    bg: 'bg-cyan-400/10',
    text: 'text-cyan-200',
    border: 'border-cyan-400/30',
  };
  const label = hasDecryptedScore ? getRiskLabel(riskClass) : 'Encrypted result confirmed';
  const RiskIcon = hasDecryptedScore ? (riskClass === 0 ? CheckCircle : AlertTriangle) : Lock;
  const txUrl = getExplorerTxUrl(chainId, txHash);

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-950/85 p-5 shadow-2xl shadow-black/30">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', colors.bg)}>
            <RiskIcon className={cn('h-5 w-5', colors.text)} />
          </div>
          <div>
            <h3 className={cn('text-lg font-semibold', colors.text)}>{label}</h3>
            <p className="text-xs text-slate-400">
              {hasDecryptedScore ? 'Private risk classification' : 'Awaiting wallet-side decryption'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-cyan-200">
          <Lock className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {decryptionStatus === 'decrypted' ? 'Decrypted locally' : 'Encrypted handle saved'}
          </span>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-slate-800 bg-slate-900/70 px-5 py-6 text-center">
        {hasDecryptedScore ? (
          <>
            <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-500">Credit risk score</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className={cn('font-mono text-5xl font-bold', colors.text)}>
                {score.toFixed(0)}
              </span>
              <span className="text-xl text-slate-500">/100</span>
            </div>
            <div className="mx-auto mt-4 max-w-xs">
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    riskClass === 0 ? 'bg-emerald-400' : riskClass === 1 ? 'bg-amber-400' : 'bg-red-400'
                  )}
                  style={{ width: `${Math.max(3, Math.min(100, score))}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>0</span>
                <span>40</span>
                <span>70</span>
                <span>100</span>
              </div>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-sm py-2">
            <Lock className="mx-auto mb-3 h-8 w-8 text-cyan-300" />
            <p className="text-lg font-semibold text-white">No plaintext score displayed</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The transaction is confirmed and encrypted handles are stored on-chain. Reconnect your wallet permit to decrypt the score.
            </p>
          </div>
        )}
      </div>

      {decryptionStatus === 'failed' && (
        <div className="mb-5 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
          The testnet transaction is confirmed, but no fallback score is shown. Only decrypted on-chain output is displayed as a score.
        </div>
      )}

      <div className="mb-5 space-y-3">
        <div>
          <p className="mb-1 text-xs text-slate-500">Request ID</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md bg-slate-900 px-3 py-2 text-xs text-slate-300">
              {requestId}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(requestId)}
              className="rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-300 transition hover:border-cyan-400/50 hover:text-white"
              aria-label="Copy request ID"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {(encryptedScoreHandle || encryptedRiskClassHandle) && (
          <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
            <div className="rounded-md border border-slate-800 bg-slate-900/70 p-2">
              <span className="block text-slate-400">Score handle</span>
              <span className="block truncate">{encryptedScoreHandle}</span>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-900/70 p-2">
              <span className="block text-slate-400">Risk handle</span>
              <span className="block truncate">{encryptedRiskClassHandle}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-5 flex items-center justify-between text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-cyan-300" />
          <span>Recorded on-chain</span>
        </div>
        <span>{formatTimestamp(timestamp)}</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Access</span>
        </button>
        {txUrl && (
          <a
            href={txUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-300 transition hover:border-cyan-400/50 hover:text-white"
            aria-label="View transaction"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
