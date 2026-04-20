'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FeatureInput } from '@/types';

interface FeatureFormProps {
  features: FeatureInput[];
  onSubmit: (values: number[]) => Promise<void>;
  isProcessing: boolean;
}

export function FeatureForm({ features, onSubmit, isProcessing }: FeatureFormProps) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(features.map((f) => [f.name, (f.min + f.max) / 2]))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSliderChange = (name: string, value: number) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let valid = true;

    features.forEach((feature) => {
      const value = values[feature.name];
      if (value < feature.min || value > feature.max) {
        newErrors[feature.name] = `Value must be between ${feature.min} and ${feature.max}`;
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const featureValues = features.map((f) => values[f.name]);
    await onSubmit(featureValues);
  };

  const getPercentage = (name: string) => {
    const feature = features.find((f) => f.name === name);
    if (!feature) return 0;
    return ((values[name] - feature.min) / (feature.max - feature.min)) * 100;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {features.map((feature, index) => (
        <div key={feature.name} className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-dark-200 capitalize">
              {feature.name.replace(/_/g, ' ')}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-bold text-sky-400">
                {values[feature.name].toFixed(feature.decimals)}
              </span>
              <span className="text-xs text-dark-500">/ 100</span>
            </div>
          </div>

          <div className="relative">
            <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-sky-600 to-sky-400"
                style={{ width: `${getPercentage(feature.name)}%` }}
              />
            </div>
            <input
              type="range"
              min={feature.min}
              max={feature.max}
              step={Math.pow(10, -feature.decimals)}
              value={values[feature.name]}
              onChange={(e) => handleSliderChange(feature.name, parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <p className="text-xs text-dark-500">{feature.description}</p>

          {errors[feature.name] && (
            <p className="text-xs text-red-400">{errors[feature.name]}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isProcessing}
        className={cn(
          'w-full py-3.5 rounded-xl font-semibold text-white',
          'bg-gradient-to-r from-sky-500 to-sky-600',
          'hover:from-sky-400 hover:to-sky-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-200 shadow-lg shadow-sky-500/20',
          'flex items-center justify-center gap-2 mt-6'
        )}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Encrypting & Submitting...</span>
          </>
        ) : (
          <span>Submit Encrypted Assessment</span>
        )}
      </button>
    </form>
  );
}
