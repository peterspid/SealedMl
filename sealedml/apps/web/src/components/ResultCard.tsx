'use client';

import { cn } from '@/lib/utils';
import { formatTimestamp } from '@/lib/utils';
import { getRiskColor, getRiskLabel } from '@/lib/utils';
import { Lock, Shield, AlertTriangle, CheckCircle, Share2, Copy, ExternalLink } from 'lucide-react';

interface ResultCardProps {
  requestId: string;
  riskClass: number;
  score: number;
  timestamp: number;
  onShare?: () => void;
}

export function ResultCard({ requestId, riskClass, score, timestamp, onShare }: ResultCardProps) {
  const colors = getRiskColor(riskClass);
  const label = getRiskLabel(riskClass);

  const RiskIcon = riskClass === 0 ? CheckCircle : AlertTriangle;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(requestId);
  };

  return (
    <div className={cn(
      'rounded-2xl border p-6 bg-dark-900/80 backdrop-blur-sm',
      'border-sky-500/20',
      'animate-fade-in-up'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            colors.bg
          )}>
            <RiskIcon className={cn('w-6 h-6', colors.text)} />
          </div>
          <div>
            <h3 className={cn('text-xl font-bold', colors.text)}>{label}</h3>
            <p className="text-sm text-dark-500">Risk Classification</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sky-400">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-medium">Encrypted</span>
        </div>
      </div>

      {/* Score */}
      <div className="text-center py-8 mb-6 rounded-xl bg-dark-800/50">
        <p className="text-sm text-dark-400 mb-2">Your Credit Score</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className={cn('text-6xl font-bold font-mono', colors.text)}>
            {score.toFixed(1)}
          </span>
          <span className="text-2xl text-dark-500">/100</span>
        </div>

        {/* Score bar */}
        <div className="mt-4 mx-auto max-w-xs">
          <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-1000', colors.bg.replace('/20', ''))}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-dark-500">
            <span>0</span>
            <span>70</span>
            <span>85</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Request ID */}
      <div className="mb-6">
        <p className="text-xs text-dark-500 mb-1">Request ID</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs text-dark-400 bg-dark-800 px-3 py-2 rounded-lg truncate">
            {requestId.slice(0, 20)}...{requestId.slice(-8)}
          </code>
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            <Copy className="w-4 h-4 text-dark-400" />
          </button>
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center justify-between text-sm text-dark-400 mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Verified on-chain</span>
        </div>
        <span>{formatTimestamp(timestamp)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onShare}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl',
            'bg-dark-800 hover:bg-dark-700',
            'border border-sky-500/30',
            'transition-all duration-200',
            'text-sm font-medium text-dark-200'
          )}
        >
          <Share2 className="w-4 h-4" />
          <span>Share Result</span>
        </button>
        <a
          href={`https://sepolia.etherscan.io/tx/${requestId}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'bg-dark-800 hover:bg-dark-700',
            'border border-sky-500/30',
            'transition-all duration-200',
            'text-sm font-medium text-dark-200'
          )}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
