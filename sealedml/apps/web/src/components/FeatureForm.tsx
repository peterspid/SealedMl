'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { calculateScore, classifyRisk, getModelExplanation } from '@/lib/model';
import { FeatureInput } from '@/types';
import { Activity, Banknote, Landmark, Lock, PiggyBank, Repeat2, Send, WalletCards } from 'lucide-react';

interface FeatureFormProps {
  features: FeatureInput[];
  onSubmit: (values: number[]) => Promise<unknown>;
  isProcessing: boolean;
}

const featureIcons = [Banknote, Repeat2, Landmark, PiggyBank, Activity, WalletCards];

export function FeatureForm({ features, onSubmit, isProcessing }: FeatureFormProps) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(features.map((feature) => [feature.name, feature.value ?? (feature.min + feature.max) / 2]))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const orderedValues = features.map((feature) => values[feature.name] ?? feature.value ?? 0);
  const estimatedScore = calculateScore(orderedValues);
  const estimate = {
    score: estimatedScore,
    riskClass: classifyRisk(estimatedScore),
    explanation: getModelExplanation(orderedValues).signals,
  };

  const handleValueChange = (name: string, value: number) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    features.forEach((feature) => {
      const value = values[feature.name];
      if (value < feature.min || value > feature.max) {
        nextErrors[feature.name] = `Use a value between ${feature.min} and ${feature.max}.`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit(orderedValues);
  };

  const riskTone =
    estimate.riskClass === 0
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
      : estimate.riskClass === 1
        ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
        : 'border-red-400/30 bg-red-400/10 text-red-100';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className={cn('rounded-lg border p-4', riskTone)}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] opacity-80">On-device estimate</p>
            <p className="text-2xl font-semibold">{estimate.score.toFixed(0)} / 100</p>
          </div>
          <div className="rounded-md bg-black/20 px-3 py-1 text-sm font-semibold">
            {estimate.riskClass === 0 ? 'Low' : estimate.riskClass === 1 ? 'Medium' : 'High'} risk
          </div>
        </div>
        <p className="mt-2 text-xs opacity-80">
          This estimate is never saved as a final result. The result panel only shows decrypted output from the confirmed on-chain inference.
        </p>
      </div>

      <div className="grid gap-4">
        {features.map((feature, index) => {
          const Icon = featureIcons[index] ?? Activity;
          const value = values[feature.name] ?? 0;
          const percentage = ((value - feature.min) / (feature.max - feature.min)) * 100;

          return (
            <div key={feature.name} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <label className="font-medium capitalize text-slate-100">
                      {feature.name.replace(/_/g, ' ')}
                    </label>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{feature.description}</p>
                  </div>
                </div>
                <input
                  type="number"
                  min={feature.min}
                  max={feature.max}
                  step={Math.pow(10, -feature.decimals)}
                  value={value}
                  onChange={(event) => handleValueChange(feature.name, Number(event.target.value))}
                  className="w-20 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-right font-mono text-sm text-cyan-100 outline-none transition focus:border-cyan-400"
                  aria-label={`${feature.name.replace(/_/g, ' ')} value`}
                />
              </div>

              <div className="relative">
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-300 to-amber-300 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={feature.min}
                  max={feature.max}
                  step={Math.pow(10, -feature.decimals)}
                  value={value}
                  onChange={(event) => handleValueChange(feature.name, Number(event.target.value))}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label={`${feature.name.replace(/_/g, ' ')} slider`}
                />
              </div>

              {errors[feature.name] && (
                <p className="mt-2 text-xs text-red-300">{errors[feature.name]}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
          <Lock className="h-4 w-4 text-cyan-300" />
          Model signals
        </div>
        <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
          {estimate.explanation.map((signal) => (
            <span key={signal} className="rounded-md bg-slate-950/70 px-3 py-2">
              {signal}
            </span>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 font-semibold text-white shadow-lg shadow-cyan-950/40 transition',
          'bg-cyan-500 hover:bg-cyan-400',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        {isProcessing ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Encrypting and submitting</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Run Private Assessment</span>
          </>
        )}
      </button>
    </form>
  );
}
