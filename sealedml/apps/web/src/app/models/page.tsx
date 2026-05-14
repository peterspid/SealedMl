import Link from 'next/link';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';
import {
  Shield,
  Brain,
  BarChart3,
  CheckCircle,
  Database,
} from 'lucide-react';

export default function ModelsPage() {
  const models = [
    {
      id: 1,
      name: 'Credit Risk Scoring',
      version: '1.0.0',
      description: 'Private credit risk assessment using encrypted financial data. Evaluates user creditworthiness without exposing sensitive information.',
      features: ['Income Level', 'Repayment History', 'Liabilities', 'Savings Behavior', 'Transaction Consistency', 'Wallet Activity'],
      riskLevels: [
        { level: 'Low', threshold: '≤70', color: 'emerald' },
        { level: 'Medium', threshold: '71-85', color: 'amber' },
        { level: 'High', threshold: '>85', color: 'red' },
      ],
      status: 'Active',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">AI Models</h1>
          <p className="text-dark-400">
            Privacy-preserving AI models running on encrypted data
          </p>
        </div>

        {/* Model Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model, i) => (
            <div
              key={model.id}
              className={cn(
                "rounded-2xl border p-6 transition-all duration-300",
                "border-sky-500/20 bg-dark-900/50 card-hover",
                "animate-fade-in-up"
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                "bg-sky-500/20"
              )}>
                <model.icon className="w-7 h-7 text-sky-400" />
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  "bg-emerald-500/20 text-emerald-400"
                )}>
                  {model.status}
                </span>
                <span className="text-xs text-dark-500">v{model.version}</span>
              </div>

              {/* Title */}
              <h3 className={cn(
                "text-xl font-bold mb-2",
                "text-white"
              )}>
                {model.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-dark-400 mb-4">
                {model.description}
              </p>

              {/* Features */}
              <div className="mb-4">
                <p className="text-xs text-dark-500 mb-2">Features Used:</p>
                <div className="flex flex-wrap gap-2">
                  {model.features.map((feature) => (
                    <span
                      key={feature}
                      className={cn(
                        "px-2 py-1 rounded text-xs",
                        "bg-sky-500/10 text-sky-400"
                      )}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Risk Levels */}
              {model.riskLevels.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-dark-800/50">
                  <p className="text-xs text-dark-500 mb-2">Risk Classification:</p>
                  <div className="space-y-1">
                    {model.riskLevels.map((risk) => (
                      <div key={risk.level} className="flex items-center justify-between">
                        <span className={cn(
                          "text-sm",
                          risk.color === 'emerald' ? 'text-emerald-400' :
                          risk.color === 'amber' ? 'text-amber-400' : 'text-red-400'
                        )}>
                          {risk.level}
                        </span>
                        <span className="text-xs text-dark-500">{risk.threshold}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action */}
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-sky-500 transition-all"
              >
                <Brain className="w-4 h-4" />
                <span>Use Model</span>
              </Link>
            </div>
          ))}
        </div>

        {/* How Models Work */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">How Models Work</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-sky-500/10 bg-dark-900/30">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center mb-4">
                <Database className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Data Collection</h3>
              <p className="text-sm text-dark-400">
                User enters financial features. Data is encrypted in the browser using FHE before transmission.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-sky-500/10 bg-dark-900/30">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center mb-4">
                <Brain className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">2. Encrypted Inference</h3>
              <p className="text-sm text-dark-400">
                Smart contract runs weighted scoring on encrypted data. AI processes without seeing values.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-sky-500/10 bg-dark-900/30">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Private Result</h3>
              <p className="text-sm text-dark-400">
                Encrypted result is returned. Only the user can decrypt and view their score.
              </p>
            </div>
          </div>
        </section>

        {/* Model Transparency */}
        <section className="mt-16 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Model Transparency</h2>

          <div className="bg-dark-900/50 rounded-xl border border-sky-500/10 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Verified & Transparent</h3>
                <p className="text-dark-400 mb-4">
                  All models deployed on SealedML are:
                </p>
                <ul className="space-y-2">
                  {[
                    'Deployed on-chain - anyone can verify the logic',
                    'Version controlled - changes are tracked',
                    'Openly documented - features and weights disclosed',
                    'Deterministic - same input always produces same output',
                    'Non-custodial - we never access your data',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-dark-300">
                      <CheckCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
