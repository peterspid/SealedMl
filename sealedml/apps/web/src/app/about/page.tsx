'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';
import {
  Shield,
  Lock,
  Zap,
  Brain,
  Users,
  Globe,
  Code,
  Database,
  Key,
  Eye,
  Server,
  CheckCircle,
  ArrowRight,
  Heart,
} from 'lucide-react';

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const techStack = [
    { name: 'Fhenix FHE', desc: 'Fully Homomorphic Encryption', icon: Lock },
    { name: 'Solidity', desc: 'Smart Contracts', icon: Code },
    { name: 'Next.js', desc: 'Frontend Framework', icon: Globe },
    { name: 'wagmi', desc: 'Web3 Integration', icon: Users },
    { name: 'TypeScript', desc: 'Type Safety', icon: Database },
    { name: 'Tailwind', desc: 'Styling', icon: Eye },
  ];

  const team = [
    {
      role: 'Built for',
      name: 'WaveHack',
      desc: 'Privacy-by-Design Buildathon',
      icon: Globe,
    },
    {
      role: 'Ecosystem',
      name: 'Fhenix',
      desc: 'Encrypted Compute Layer',
      icon: Server,
    },
    {
      role: 'Powered by',
      name: 'CoFHE',
      desc: 'Client-side FHE SDK',
      icon: Key,
    },
  ];

  const howItWorks = [
    {
      step: '1',
      icon: Database,
      title: 'Enter Data',
      desc: 'User enters financial information like income, repayment history, and liabilities.',
    },
    {
      step: '2',
      icon: Lock,
      title: 'Browser Encrypts',
      desc: 'Data is encrypted locally in the browser using FHE before transmission.',
    },
    {
      step: '3',
      icon: Brain,
      title: 'AI Computes',
      desc: 'Smart contract runs the AI model on encrypted data. AI works but cannot see.',
    },
    {
      step: '4',
      icon: Zap,
      title: 'Encrypted Result',
      desc: 'Result is returned in encrypted form. No one can read it.',
    },
    {
      step: '5',
      icon: Key,
      title: 'User Decrypts',
      desc: 'Only the user can decrypt and view their score.',
    },
    {
      step: '6',
      icon: CheckCircle,
      title: 'Share Optionally',
      desc: 'User can selectively share results with third parties.',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-16">
          <h1 className={cn(
            "text-4xl sm:text-5xl font-bold mb-4",
            mounted ? "animate-fade-in-up" : "opacity-0"
          )}>
            <span className="text-white">About </span>
            <span className="gradient-text">SealedML</span>
          </h1>
          <p className={cn(
            "text-xl text-dark-400 max-w-2xl mx-auto",
            mounted ? "animate-fade-in-up delay-100" : "opacity-0"
          )}>
            Privacy-First AI Inference on the Blockchain
          </p>
        </div>

        <section className="mb-20">
          <div className={cn(
            "p-8 rounded-2xl border border-sky-500/20 bg-dark-900/50",
            mounted ? "animate-fade-in-up" : "opacity-0"
          )}>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">What is SealedML?</h2>
                <p className="text-dark-300 mb-4">
                  <strong className="text-sky-400">SealedML = "AI that works on your data without seeing your data"</strong>
                </p>
                <p className="text-dark-400 mb-4">
                  SealedML is a privacy-preserving on-chain AI inference protocol that enables users to receive credit scores and risk assessments <strong className="text-white">without revealing their sensitive financial data to anyone</strong>.
                </p>
                <p className="text-dark-400">
                  Using Fully Homomorphic Encryption (FHE), SealedML allows AI models to process encrypted data directly on the blockchain, returning results that only the user can decrypt.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className={cn(
            "text-3xl font-bold text-white mb-8 text-center",
            mounted ? "animate-fade-in-up" : "opacity-0"
          )}>
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "p-6 rounded-xl border border-sky-500/10 bg-dark-900/30",
                  mounted ? "animate-fade-in-up" : "opacity-0"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
                    {item.step}
                  </div>
                  <item.icon className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-dark-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className={cn(
            "text-3xl font-bold text-white mb-8 text-center",
            mounted ? "animate-fade-in-up" : "opacity-0"
          )}>
            Why SealedML?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className={cn(
              "p-6 rounded-xl bg-red-500/5 border border-red-500/20",
              mounted ? "animate-fade-in-up delay-100" : "opacity-0"
            )}>
              <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                <span className="text-xl">X</span> Traditional AI
              </h3>
              <ul className="space-y-3 text-dark-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">-</span>
                  <span>Requires raw financial data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">-</span>
                  <span>Centralized servers see everything</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">-</span>
                  <span>Data breaches expose sensitive info</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">-</span>
                  <span>Users must trust the company</span>
                </li>
              </ul>
            </div>

            <div className={cn(
              "p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20",
              mounted ? "animate-fade-in-up delay-200" : "opacity-0"
            )}>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> SealedML
              </h3>
              <ul className="space-y-3 text-dark-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                  <span>Works on encrypted data only</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                  <span>On-chain computation is verifiable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                  <span>No data stored anywhere</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                  <span>User controls their own data</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className={cn(
            "text-3xl font-bold text-white mb-8 text-center",
            mounted ? "animate-fade-in-up" : "opacity-0"
          )}>
            Built With
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, i) => (
              <div
                key={i}
                className={cn(
                  "p-4 rounded-xl border border-sky-500/10 bg-dark-900/30 text-center",
                  mounted ? "animate-fade-in-up" : "opacity-0"
                )}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <tech.icon className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                <div className="font-semibold text-white text-sm">{tech.name}</div>
                <div className="text-xs text-dark-500">{tech.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className={cn(
            "text-3xl font-bold text-white mb-8 text-center",
            mounted ? "animate-fade-in-up" : "opacity-0"
          )}>
            Credits
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div
                key={i}
                className={cn(
                  "p-6 rounded-xl border border-sky-500/20 bg-dark-900/50 text-center",
                  mounted ? "animate-fade-in-up" : "opacity-0"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <member.icon className="w-12 h-12 text-sky-400 mx-auto mb-4" />
                <div className="text-xs text-sky-400 mb-1">{member.role}</div>
                <div className="text-xl font-bold text-white mb-1">{member.name}</div>
                <div className="text-sm text-dark-400">{member.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className={cn(
            "text-center p-8 rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 to-transparent",
            mounted ? "animate-fade-in-up" : "opacity-0"
          )}>
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Try?</h2>
            <p className="text-dark-400 mb-6 max-w-md mx-auto">
              Start using SealedML to get your private credit assessment.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-sky-500 transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        <footer className="text-center py-8 border-t border-dark-800">
          <div className="flex items-center justify-center gap-2 text-dark-500 mb-4">
            <Heart className="w-4 h-4 text-sky-400" />
            <span className="text-sm">Built with passion for privacy</span>
          </div>
          <p className="text-xs text-dark-600">
            SealedML - Privacy-First AI Inference | WaveHack 2024
          </p>
        </footer>
      </main>
    </div>
  );
}
