import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateRequestId(address: string, nonce: number): string {
  const timestamp = Date.now();
  const data = `${address}-${nonce}-${timestamp}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRiskLabel(riskClass: number): string {
  switch (riskClass) {
    case 0:
      return 'Low Risk';
    case 1:
      return 'Medium Risk';
    case 2:
      return 'High Risk';
    default:
      return 'Unknown';
  }
}

export function getRiskColor(riskClass: number): {
  text: string;
  bg: string;
  border: string;
} {
  switch (riskClass) {
    case 0:
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
      };
    case 1:
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/30',
      };
    case 2:
      return {
        text: 'text-red-400',
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
      };
    default:
      return {
        text: 'text-dark-400',
        bg: 'bg-dark-500/20',
        border: 'border-dark-500/30',
      };
  }
}
