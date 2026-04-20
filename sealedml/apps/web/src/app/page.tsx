'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { FeatureForm } from '@/components/FeatureForm';
import { ResultCard } from '@/components/ResultCard';
import { PrivacyInfo } from '@/components/PrivacyInfo';
import { ShareModal } from '@/components/ShareModal';
import { useInference } from '@/hooks/useInference';
import { useModelInfo } from '@/hooks/useModelInfo';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Shield,
  Zap,
  Lock,
  ArrowRight,
  Brain,
  Database,
  CheckCircle,
  Wallet,
  AlertCircle,
  ChevronDown,
  Hexagon,
  Layers,
  BarChart3,
  Users,
  Globe,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();
  const { modelInfo, features, isLoading } = useModelInfo();
  const { submitInference, isProcessing, error, clearError } = useInference();
  const { currentResult, resultHistory } = useAppStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (values: number[]) => {
    await submitInference(values);
  };

  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center mb-20">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl animate-pulse-slow delay-300" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/5 rounded-full blur-3xl" />

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-sky-400/50 rounded-full"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animation: `float ${4 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-500/30 mb-8",
              "bg-sky-500/10 backdrop-blur-sm transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <Hexagon className="w-4 h-4 text-sky-400" />
              <span className="text-sm text-sky-300 font-medium">Powered by FHE on Fhenix</span>
            </div>

            {/* Main heading */}
            <h1 className={cn(
              "text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: '200ms' }}
            >
              <span className="text-white">Private Credit Scoring with</span>
              <br />
              <span className="gradient-text">Fully Homomorphic Encryption</span>
            </h1>

            {/* Subtitle */}
            <p className={cn(
              "text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-10",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: '400ms' }}
            >
              Get your credit score without revealing your financial data.
              AI that works on your data <strong className="text-sky-400">without seeing your data</strong>.
            </p>

            {/* CTA */}
            <div className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-4 mb-16",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: '600ms' }}
            >
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-sky-500 transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Go to Dashboard</span>
              </Link>
              {!isConnected && (
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300">
                  <Wallet className="w-5 h-5" />
                  <span className="font-medium">Connect wallet to start</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className={cn(
              "grid grid-cols-3 gap-8 max-w-2xl mx-auto",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: '800ms' }}
            >
              {[
                { label: 'Data Encrypted', value: '100%' },
                { label: 'On-Chain', value: 'Verified' },
                { label: 'Privacy', value: 'Zero-Knowledge' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-dark-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-6 h-6 text-dark-500" />
            </div>
          </div>
        </section>

        {/* What is SealedML */}
        <section className="mb-20 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What is SealedML?</h2>
            <p className="text-xl text-sky-400 font-semibold mb-4">AI that works on your data without seeing your data</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                <Database className="w-8 h-8 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Your Data Stays Private</h3>
              <p className="text-dark-400">Enter financial data. It's encrypted in your browser. No one sees it.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Runs on Encrypted Data</h3>
              <p className="text-dark-400">Smart contract processes encrypted values. AI works but can't see.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Only You See Results</h3>
              <p className="text-dark-400">Decrypt the result locally. Share only if you want.</p>
            </div>
          </div>
        </section>

        {/* Privacy Features */}
        <section className="mb-20 scroll-mt-20">
          <div className={cn(
            "text-center mb-12",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why SealedML?</h2>
            <p className="text-dark-400 max-w-xl mx-auto">Traditional AI needs your data. SealedML doesn't.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: 'End-to-End Encryption',
                description: 'Your financial data is encrypted in your browser before transmission.',
              },
              {
                icon: Zap,
                title: 'On-Chain FHE Computation',
                description: 'Smart contracts compute on encrypted data without decryption.',
              },
              {
                icon: Shield,
                title: 'On-Chain Verification',
                description: 'Results are verifiable on-chain while remaining confidential.',
              },
              {
                icon: CheckCircle,
                title: 'No Data Storage',
                description: 'We never store your raw financial data.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={cn(
                  "p-6 rounded-2xl border border-sky-500/20",
                  "bg-dark-900/50 backdrop-blur-sm",
                  "card-hover",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-dark-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-20">
          <div className={cn(
            "text-center mb-12",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Real Use Cases</h2>
            <p className="text-dark-400">Where SealedML makes a difference</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Loan Approval', desc: 'Get approved without sharing bank statements' },
              { icon: BarChart3, title: 'DeFi Lending', desc: 'Prove creditworthiness without exposing finances' },
              { icon: Shield, title: 'Fraud Detection', desc: 'Detect fraud without revealing transaction history' },
              { icon: Globe, title: 'Insurance Risk', desc: 'Assess risk without sharing personal details' },
              { icon: Sparkles, title: 'Financial Reputation', desc: 'Build a private financial identity' },
              { icon: Layers, title: 'Compliance', desc: 'Meet regulations without data exposure' },
            ].map((useCase, i) => (
              <div
                key={i}
                className={cn(
                  "p-6 rounded-xl border border-sky-500/10 bg-dark-900/30",
                  "card-hover",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <useCase.icon className="w-8 h-8 text-sky-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
                <p className="text-sm text-dark-400">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <div className={cn(
            "text-center mb-12",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-dark-400 max-w-xl mx-auto">Simple flow, powerful privacy</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Enter Data', desc: 'Input financial info' },
              { step: '2', title: 'Encrypt', desc: 'Browser encrypts locally' },
              { step: '3', title: 'AI Inference', desc: 'Smart contract computes' },
              { step: '4', title: 'Decrypt', desc: 'Only you see result' },
            ].map((item, i) => (
              <div
                key={i}
                className={cn(
                  "text-center p-6 rounded-xl border border-sky-500/20 bg-dark-900/50",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-dark-500">{item.desc}</p>
                {i < 3 && <ArrowRight className="w-5 h-5 text-sky-500/50 mx-auto mt-4 hidden md:block" />}
              </div>
            ))}
          </div>
        </section>

        {/* Try It */}
        <section className="mb-20">
          <div className={cn(
            "text-center mb-12",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Try SealedML Now</h2>
            <p className="text-dark-400">Go to dashboard for full experience</p>
          </div>

          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-sky-500 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Open Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-20">
          <div className={cn(
            "text-center mb-12",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built With</h2>
            <p className="text-dark-400">Production-ready privacy infrastructure</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: 'Fhenix FHE', desc: 'Encrypted Compute' },
              { name: 'Solidity', desc: 'Smart Contracts' },
              { name: 'Next.js', desc: 'Frontend' },
              { name: 'wagmi', desc: 'Web3 Integration' },
            ].map((tech, i) => (
              <div
                key={i}
                className={cn(
                  "px-6 py-4 rounded-xl border border-sky-500/20 bg-dark-900/50 backdrop-blur-sm",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-lg font-semibold text-white">{tech.name}</div>
                <div className="text-sm text-dark-500">{tech.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-dark-800 pt-8 mt-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-dark-400">SealedML - Privacy-First AI Inference</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-dark-500">
              <a href="https://docs.fhenix.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Fhenix Docs
              </a>
              <a href="https://github.com/FhenixProtocol" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                GitHub
              </a>
              <a href="https://fhenix.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Fhenix
              </a>
            </div>
          </div>
          <div className="text-center mt-6 text-xs text-dark-600">
            Built for WaveHack - Privacy-by-Design Buildathon
          </div>
        </footer>
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        requestId={currentResult?.requestId || ''}
        riskClass={currentResult?.riskClass || 0}
      />
    </div>
  );
}
