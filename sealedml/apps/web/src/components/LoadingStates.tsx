'use client';

import { cn } from '@/lib/utils';
import { Lock, Shield, Zap } from 'lucide-react';

interface EncryptingLoaderProps {
  message?: string;
}

export function EncryptingLoader({ message = 'Encrypting your data...' }: EncryptingLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-sky-500/10 flex items-center justify-center">
          <Lock className="w-10 h-10 text-sky-400 animate-pulse" />
        </div>
        <div className="absolute inset-0 border-2 border-sky-500/30 rounded-2xl animate-ping" />
      </div>
      <p className="mt-6 text-sm text-sky-400 animate-pulse">{message}</p>
      <div className="flex items-center gap-2 mt-4">
        <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

interface ProcessingLoaderProps {
  step?: string;
}

export function ProcessingLoader({ step = 'Processing on-chain...' }: ProcessingLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-sky-500/10 flex items-center justify-center">
          <Zap className="w-10 h-10 text-sky-400" />
        </div>
        <div className="absolute -inset-2 border-2 border-dashed border-sky-500/30 rounded-2xl animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <p className="mt-6 text-sm text-sky-400">{step}</p>
      <p className="text-xs text-dark-500 mt-2">This may take a few seconds...</p>
    </div>
  );
}

interface SuccessLoaderProps {
  message?: string;
}

export function SuccessLoader({ message = 'Success!' }: SuccessLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center animate-fade-in">
          <Shield className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl animate-ping" />
      </div>
      <p className="mt-6 text-lg font-semibold text-emerald-400 animate-fade-in">{message}</p>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'animate-pulse rounded-lg bg-dark-800',
      className
    )} />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-sky-500/20 bg-dark-900/50 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <Skeleton className="w-full h-32 rounded-lg" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  );
}
