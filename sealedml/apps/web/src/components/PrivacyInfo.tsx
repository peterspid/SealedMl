'use client';

import { Lock, Shield, Eye, Database } from 'lucide-react';

const privacyFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'Your financial data is encrypted in your browser before submission.',
  },
  {
    icon: Eye,
    title: 'Zero Knowledge',
    description: 'The smart contract computes on encrypted values.',
  },
  {
    icon: Shield,
    title: 'On-Chain Verification',
    description: 'Results are verifiable on-chain while remaining confidential.',
  },
  {
    icon: Database,
    title: 'No Data Storage',
    description: 'We never store your raw financial data.',
  },
];

export function PrivacyInfo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {privacyFeatures.map((feature, i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-dark-900/50 border border-sky-500/10 card-hover"
        >
          <feature.icon className="w-5 h-5 text-sky-400 mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
          <p className="text-xs text-dark-400">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
