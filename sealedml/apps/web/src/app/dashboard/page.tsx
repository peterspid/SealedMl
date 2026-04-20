'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { FeatureForm } from '@/components/FeatureForm';
import { ResultCard } from '@/components/ResultCard';
import { ShareModal } from '@/components/ShareModal';
import { useInference } from '@/hooks/useInference';
import { useModelInfo } from '@/hooks/useModelInfo';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { formatAddress, formatTimestamp } from '@/lib/utils';
import {
  Shield,
  Lock,
  Wallet,
  AlertCircle,
  History,
  BarChart3,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  ExternalLink,
  Copy,
  Share2,
  Zap,
} from 'lucide-react';
import { EncryptingLoader, ProcessingLoader } from '@/components/LoadingStates';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { modelInfo, features, isLoading } = useModelInfo();
  const { submitInference, isProcessing, isEncrypting, isDecrypting, encryptionStep, error, clearError } = useInference();
  const { currentResult, resultHistory } = useAppStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (values: number[]) => {
    await submitInference(values);
  };

  // Stats
  const totalInferences = resultHistory.length;
  const lowRiskCount = resultHistory.filter(r => r.riskClass === 0).length;
  const mediumRiskCount = resultHistory.filter(r => r.riskClass === 1).length;
  const highRiskCount = resultHistory.filter(r => r.riskClass === 2).length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-sky-500/10 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-sky-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-dark-400 mb-8 max-w-md mx-auto">
              Connect your wallet to access the SealedML dashboard and get your private credit assessment.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-sky-500 transition-all"
            >
              <Wallet className="w-5 h-5" />
              <span>Go Back</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-dark-400 mt-1">
                {address && formatAddress(address)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-emerald-400">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={cn(
            "p-4 rounded-xl border border-sky-500/20 bg-dark-900/50",
            mounted ? "animate-fade-in-up" : "opacity-0"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              <span className="text-sm text-dark-400">Total Assessments</span>
            </div>
            <div className="text-2xl font-bold text-white">{totalInferences}</div>
          </div>

          <div className={cn(
            "p-4 rounded-xl border border-emerald-500/20 bg-dark-900/50",
            mounted ? "animate-fade-in-up delay-100" : "opacity-0"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-dark-400">Low Risk</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{lowRiskCount}</div>
          </div>

          <div className={cn(
            "p-4 rounded-xl border border-amber-500/20 bg-dark-900/50",
            mounted ? "animate-fade-in-up delay-200" : "opacity-0"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-dark-400">Medium Risk</span>
            </div>
            <div className="text-2xl font-bold text-amber-400">{mediumRiskCount}</div>
          </div>

          <div className={cn(
            "p-4 rounded-xl border border-red-500/20 bg-dark-900/50",
            mounted ? "animate-fade-in-up delay-300" : "opacity-0"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-red-400" />
              <span className="text-sm text-dark-400">High Risk</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{highRiskCount}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Assessment Form */}
          <div className={cn(
            "bg-dark-900/80 rounded-2xl border border-sky-500/20 p-6 backdrop-blur-sm",
            mounted ? "animate-slide-in-left" : "opacity-0"
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Private Assessment</h2>
                <p className="text-sm text-dark-400">
                  {modelInfo ? `${modelInfo.name}` : 'Credit Risk Model'}
                </p>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="mb-6 p-4 rounded-xl bg-sky-500/5 border border-sky-500/20">
              <div className="flex items-center gap-2 text-sky-400 mb-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Your Data is Encrypted</span>
              </div>
              <p className="text-xs text-dark-400">
                All financial data is encrypted in your browser before being sent to the blockchain.
                Only you can see the results.
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 mx-auto mb-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-dark-400">Loading model...</p>
              </div>
            ) : (
              <>
                {/* Show encryption/decryption progress */}
                {isEncrypting && (
                  <div className="mb-6 p-4 rounded-xl bg-sky-500/10 border border-sky-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                      <div>
                        <div className="flex items-center gap-2 text-sky-400">
                          <Lock className="w-4 h-4" />
                          <span className="text-sm font-medium">FHE Encryption in Progress</span>
                        </div>
                        <p className="text-xs text-dark-400 mt-1">{encryptionStep || 'Encrypting inputs...'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show decryption progress */}
                {isDecrypting && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                      <div>
                        <div className="flex items-center gap-2 text-emerald-400">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm font-medium">FHE Computation & Decryption</span>
                        </div>
                        <p className="text-xs text-dark-400 mt-1">{encryptionStep || 'Decrypting results...'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <FeatureForm
                  features={features}
                  onSubmit={handleSubmit}
                  isProcessing={isProcessing}
                />

                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Error</span>
                    </div>
                    <p className="text-sm text-dark-300">{error}</p>
                    <button onClick={clearError} className="mt-2 text-xs text-dark-400 hover:text-white">
                      Dismiss
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Results */}
          <div className={cn(
            mounted ? "animate-slide-in-right" : "opacity-0"
          )}>
            {currentResult ? (
              <ResultCard
                requestId={currentResult.requestId}
                riskClass={currentResult.riskClass}
                score={currentResult.score}
                timestamp={currentResult.timestamp}
                onShare={() => setShowShareModal(true)}
              />
            ) : (
              <div className="bg-dark-900/80 rounded-2xl border border-sky-500/20 p-8 h-full flex flex-col items-center justify-center text-center backdrop-blur-sm min-h-[400px]">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-sky-400" />
                  </div>
                  <div className="absolute -inset-2 border border-sky-500/30 rounded-2xl animate-pulse-ring" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">No Result Yet</h3>
                <p className="text-dark-400 max-w-xs mb-6">
                  Submit your encrypted financial features to receive your private risk assessment.
                </p>

                <div className="flex items-center gap-2 text-sky-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Results appear here</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        {resultHistory.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <History className="w-6 h-6 text-sky-400" />
                Assessment History
              </h2>
              <span className="text-sm text-dark-500">{resultHistory.length} total</span>
            </div>

            <div className="bg-dark-900/50 rounded-xl border border-sky-500/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-800">
                      <th className="text-left p-4 text-sm font-medium text-dark-400">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-dark-400">Risk Class</th>
                      <th className="text-left p-4 text-sm font-medium text-dark-400">Request ID</th>
                      <th className="text-left p-4 text-sm font-medium text-dark-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultHistory.slice(0, 10).map((result, i) => (
                      <tr key={result.requestId} className="border-b border-dark-800/50 hover:bg-dark-800/30">
                        <td className="p-4 text-sm text-dark-300">
                          {new Date(result.timestamp * 1000).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                            result.riskClass === 0 ? 'bg-emerald-500/20 text-emerald-400' :
                            result.riskClass === 1 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          )}>
                            {result.riskClass === 0 ? <CheckCircle className="w-3 h-3" /> :
                             result.riskClass === 1 ? <AlertTriangle className="w-3 h-3" /> :
                             <TrendingUp className="w-3 h-3" />}
                            {result.riskClass === 0 ? 'Low' : result.riskClass === 1 ? 'Medium' : 'High'}
                          </span>
                        </td>
                        <td className="p-4">
                          <code className="text-xs text-dark-500">{result.requestId.slice(0, 18)}...</code>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-dark-700 transition-colors" title="Copy">
                              <Copy className="w-4 h-4 text-dark-400" />
                            </button>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${result.requestId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
                              title="View on Etherscan"
                            >
                              <ExternalLink className="w-4 h-4 text-dark-400" />
                            </a>
                            <button className="p-2 rounded-lg hover:bg-dark-700 transition-colors" title="Share">
                              <Share2 className="w-4 h-4 text-dark-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Model Info */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-sky-400" />
            Model Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-dark-900/50 rounded-xl border border-sky-500/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Current Model</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-400">Name</span>
                  <span className="text-white">{modelInfo?.name || 'Credit Risk Model'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Version</span>
                  <span className="text-sky-400">{modelInfo?.version || '1.0.0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Features</span>
                  <span className="text-white">{modelInfo?.featureCount || 6}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Status</span>
                  <span className="text-emerald-400">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-900/50 rounded-xl border border-sky-500/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Features Used</h3>
              <div className="space-y-2">
                {features.map((f) => (
                  <div key={f.name} className="flex items-center justify-between py-2 border-b border-dark-800/50">
                    <span className="text-dark-300 capitalize">{f.name.replace(/_/g, ' ')}</span>
                    <span className="text-sky-400 text-sm">{f.min}-{f.max}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Info */}
        <section className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Your Privacy Rights</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-sky-500/10 bg-sky-500/5">
              <Lock className="w-6 h-6 text-sky-400 mb-2" />
              <h3 className="font-semibold text-white mb-1">Your Data is Yours</h3>
              <p className="text-sm text-dark-400">Raw financial data never touches our servers</p>
            </div>
            <div className="p-4 rounded-xl border border-sky-500/10 bg-sky-500/5">
              <Shield className="w-6 h-6 text-sky-400 mb-2" />
              <h3 className="font-semibold text-white mb-1">On-Chain Verified</h3>
              <p className="text-sm text-dark-400">Results are verifiable but confidential</p>
            </div>
            <div className="p-4 rounded-xl border border-sky-500/10 bg-sky-500/5">
              <Share2 className="w-6 h-6 text-sky-400 mb-2" />
              <h3 className="font-semibold text-white mb-1">You Control Sharing</h3>
              <p className="text-sm text-dark-400">Share results only with who you choose</p>
            </div>
          </div>
        </section>
      </main>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        requestId={currentResult?.requestId || ''}
        riskClass={currentResult?.riskClass || 0}
      />
    </div>
  );
}
