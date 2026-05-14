'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { FeatureForm } from '@/components/FeatureForm';
import { ResultCard } from '@/components/ResultCard';
import { ShareModal } from '@/components/ShareModal';
import { NetworkStatus } from '@/components/NetworkStatus';
import { useInference } from '@/hooks/useInference';
import { useModelInfo } from '@/hooks/useModelInfo';
import { useAppStore } from '@/lib/store';
import { formatAddress } from '@/lib/utils';
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  History,
  Lock,
  Shield,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { modelInfo, features, isLoading } = useModelInfo();
  const { submitInference, isProcessing, encryptionStep, error, clearError } = useInference();
  const { currentResult, resultHistory, clearHistory } = useAppStore();
  const [showShareModal, setShowShareModal] = useState(false);

  const totalInferences = resultHistory.length;
  const decryptedCount = resultHistory.filter((result) => result.decryptionStatus === 'decrypted').length;
  const sharedReadyCount = resultHistory.filter((result) => result.txHash).length;
  const highRiskCount = resultHistory.filter((result) => result.decryptionStatus === 'decrypted' && result.riskClass === 2).length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <main className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
            <Wallet className="h-8 w-8" />
          </div>
          <h1 className="mb-3 text-3xl font-semibold">Connect your wallet</h1>
          <p className="mb-8 max-w-md text-slate-400">
            SealedML needs your wallet to encrypt inputs for your account and decrypt results with your permit.
          </p>
          <Link
            href="/"
            className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-white transition hover:bg-cyan-400"
          >
            Back to app
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <NetworkStatus />
              <span className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-400">
                {address ? formatAddress(address) : 'No wallet'}
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Private Credit Assessment</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Encrypt your financial signals locally, run the model on-chain, then decrypt the result in your browser.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
            Model: <span className="font-semibold text-cyan-200">{modelInfo?.name ?? 'Credit Risk Scoring v1.1'}</span>
            <span className="ml-2 text-slate-500">v{modelInfo?.version ?? '1.1.0'}</span>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Assessments', value: totalInferences, icon: BarChart3, tone: 'text-cyan-300' },
            { label: 'Decrypted locally', value: decryptedCount, icon: CheckCircle, tone: 'text-emerald-300' },
            { label: 'On-chain records', value: sharedReadyCount, icon: Shield, tone: 'text-indigo-300' },
            { label: 'High risk flags', value: highRiskCount, icon: TrendingUp, tone: 'text-red-300' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                <stat.icon className={`h-4 w-4 ${stat.tone}`} />
                {stat.label}
              </div>
              <div className="text-2xl font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Encrypted Inputs</h2>
                <p className="mt-1 text-sm text-slate-400">All six values are encrypted before the transaction is sent.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-8 text-center text-slate-400">
                Loading model metadata...
              </div>
            ) : (
              <FeatureForm features={features} onSubmit={submitInference} isProcessing={isProcessing} />
            )}

            {encryptionStep && (
              <div className="mt-4 rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-200/30 border-t-cyan-100" />
                  {encryptionStep}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-100">
                  <AlertCircle className="h-4 w-4" />
                  Action needed
                </div>
                <p className="text-sm text-red-100/90">{error}</p>
                <button type="button" onClick={clearError} className="mt-3 text-xs font-medium text-red-100 underline">
                  Dismiss
                </button>
              </div>
            )}
          </section>

          <section>
            {currentResult ? (
              <ResultCard
                requestId={currentResult.requestId}
                riskClass={currentResult.riskClass}
                score={currentResult.score}
                timestamp={currentResult.timestamp}
                txHash={currentResult.txHash}
                chainId={currentResult.chainId}
                encryptedScoreHandle={currentResult.encryptedScoreHandle}
                encryptedRiskClassHandle={currentResult.encryptedRiskClassHandle}
                decryptionStatus={currentResult.decryptionStatus}
                onShare={() => setShowShareModal(true)}
              />
            ) : (
              <div className="flex min-h-[520px] flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 p-8 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                  <Clock className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">Result appears here</h2>
                <p className="max-w-sm text-sm leading-6 text-slate-400">
                  After confirmation, SealedML reads the encrypted handles and decrypts your score locally.
                </p>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <div className="flex flex-col gap-3 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-cyan-300" />
              <h2 className="text-lg font-semibold">Assessment History</h2>
            </div>
            {resultHistory.length > 0 && (
              <button type="button" onClick={clearHistory} className="text-sm text-slate-400 transition hover:text-white">
                Clear local history
              </button>
            )}
          </div>

          {resultHistory.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No assessments saved in this browser yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Risk</th>
                    <th className="px-5 py-3 font-medium">Request</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resultHistory.slice(0, 10).map((result) => (
                    <tr key={result.requestId} className="border-t border-slate-800 text-slate-300">
                      <td className="px-5 py-3">{new Date(result.timestamp * 1000).toLocaleString()}</td>
                      <td className="px-5 py-3 font-mono">
                        {result.score === null ? 'Encrypted' : result.score.toFixed(0)}
                      </td>
                      <td className="px-5 py-3">
                        {result.riskClass === null
                          ? 'Locked'
                          : result.riskClass === 0 ? 'Low' : result.riskClass === 1 ? 'Medium' : 'High'}
                      </td>
                      <td className="px-5 py-3">
                        <code className="text-xs text-slate-500">{result.requestId.slice(0, 18)}...</code>
                      </td>
                      <td className="px-5 py-3 capitalize">{result.decryptionStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        requestId={currentResult?.requestId ?? ''}
      />
    </div>
  );
}
