// Type definitions for SealedML

export interface FeatureInput {
  name: string;
  value: number;
  min: number;
  max: number;
  decimals: number;
  description: string;
}

export interface EncryptedFeature {
  name: string;
  ciphertext: string;
}

export interface InferenceResult {
  requestId: string;
  riskClass: 0 | 1 | 2; // 0=low, 1=medium, 2=high
  riskLabel: string;
  encryptedScore?: string;
  encryptedScoreHandle?: bigint;
  encryptedRiskClassHandle?: bigint;
  decryptedScore?: number;
  timestamp: number;
  txHash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ModelInfo {
  id: number;
  name: string;
  version: string;
  description: string;
  featureCount: number;
  outputType: number;
  isActive: boolean;
  createdAt: number;
}

export interface UserResult {
  requestId: string;
  riskClass: number;
  riskLabel: string;
  timestamp: number;
  status: string;
  canShare: boolean;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string | null;
}

export interface ContractAddresses {
  modelRegistry: string;
  sealedMLInference: string;
  resultManager: string;
  accessControl: string;
}

export type RiskClass = 'low' | 'medium' | 'high';

export interface RiskLevel {
  class: RiskClass;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

export const RISK_LEVELS: Record<RiskClass, RiskLevel> = {
  low: {
    class: 'low',
    label: 'Low Risk',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    description: 'Strong financial profile with good creditworthiness',
  },
  medium: {
    class: 'medium',
    label: 'Medium Risk',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    description: 'Moderate financial profile with some concerns',
  },
  high: {
    class: 'high',
    label: 'High Risk',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    description: 'Elevated risk indicators requiring attention',
  },
};

// FHE Encryption types for CoFHE SDK integration
export interface EncryptedInput {
  ctHash: bigint;
  utype: number;
  signature: string;
}

export interface DecryptionResult {
  unsealedValue: bigint;
  type: string;
}
