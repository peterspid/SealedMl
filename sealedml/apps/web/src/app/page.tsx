'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { NetworkStatus } from '@/components/NetworkStatus';
import { useAppStore } from '@/lib/store';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  Database,
  KeyRound,
  Lock,
  Shield,
  Sparkles,
} from 'lucide-react';

const flow = [
  { title: 'Encrypt locally', text: 'Financial signals are converted to CoFHE encrypted inputs in the browser.', icon: Lock },
  { title: 'Compute on-chain', text: 'The deployed model scores encrypted values without exposing plaintext.', icon: Database },
  { title: 'Decrypt privately', text: 'A wallet permit lets only the result owner view the score.', icon: KeyRound },
];

const productStats = [
  { label: 'Inputs protected', value: '6' },
  { label: 'Model version', value: '1.1' },
  { label: 'Testnet', value: 'Sepolia' },
];

export default function Home() {
  const { isConnected } = useAccount();
  const { currentResult, resultHistory } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid min-h-[calc(100vh-7rem)] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <NetworkStatus />
              <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
                CoFHE encrypted inference
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              SealedML private credit scoring
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Run a financial risk model on encrypted data, record the result on-chain, and reveal the score only inside your wallet session.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-950/50 transition hover:bg-cyan-400"
              >
                <BarChart3 className="h-4 w-4" />
                {isConnected ? 'Open Assessment' : 'Start Private Check'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/lenders"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
              >
                <Building2 className="h-4 w-4" />
                Lender Verify
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {productStats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 shadow-2xl shadow-black/30">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-sm text-slate-400">Production flow</p>
                <h2 className="text-xl font-semibold">Encrypted assessment pipeline</h2>
              </div>
              <Sparkles className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="space-y-3">
              {flow.map((item, index) => (
                <div key={item.title} className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-300">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">0{index + 1}</span>
                      <h3 className="font-medium text-slate-100">{item.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-slate-400">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <CheckCircle className="h-4 w-4" />
                  Latest on-chain record
                </div>
                {currentResult ? (
                  <p className="text-sm text-emerald-100/90">
                    {currentResult.score === null
                      ? `Encrypted handles saved, ${currentResult.decryptionStatus} decryption`
                    : `${currentResult.score.toFixed(0)} decrypted score`}
                  </p>
                ) : (
                  <p className="text-sm text-emerald-100/70">No assessment in this browser yet.</p>
                )}
              </div>
              <div className="rounded-lg border border-indigo-400/20 bg-indigo-400/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-100">
                  <Shield className="h-4 w-4" />
                  Saved history
                </div>
                <p className="text-sm text-indigo-100/80">{resultHistory.length} encrypted assessment records</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-10 md:grid-cols-3">
          {[
            'No plaintext financial data is sent to the contract.',
            'Encrypted score and risk handles are stored for selective sharing.',
            'Lenders verify permissioned results without seeing source inputs.',
          ].map((text) => (
            <div key={text} className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 text-sm leading-6 text-slate-300">
              {text}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
