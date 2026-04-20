'use client';

import { useState, useEffect } from 'react';
import { useChainId, useReadContract } from 'wagmi';
import { getContractAddresses } from '@/lib/contracts';
import { useAppStore } from '@/lib/store';

const MODEL_REGISTRY_ABI = [
  {
    inputs: [{ name: 'modelId', type: 'uint256' }],
    name: 'getModel',
    outputs: [{
      components: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'createdAt', type: 'uint256' },
        { name: 'isActive', type: 'bool' },
        { name: 'featureCount', type: 'uint8' },
        { name: 'outputType', type: 'uint8' },
        { name: 'description', type: 'string' },
        { name: 'inferenceContract', type: 'address' }
      ],
      type: 'tuple'
    }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'activeModelId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Default features for the demo
export const DEFAULT_FEATURES = [
  {
    name: 'income_level',
    value: 50,
    min: 0,
    max: 100,
    decimals: 1,
    description: 'Your income stability and level (higher = better income)',
  },
  {
    name: 'repayment_history',
    value: 50,
    min: 0,
    max: 100,
    decimals: 1,
    description: 'History of on-time repayments (higher = better history)',
  },
  {
    name: 'current_liabilities',
    value: 50,
    min: 0,
    max: 100,
    decimals: 1,
    description: 'Current debt obligations (lower = better, less debt)',
  },
  {
    name: 'savings_behavior',
    value: 50,
    min: 0,
    max: 100,
    decimals: 1,
    description: 'Savings consistency and amount (higher = better)',
  },
  {
    name: 'transaction_consistency',
    value: 50,
    min: 0,
    max: 100,
    decimals: 1,
    description: 'Regularity of transactions (higher = more consistent)',
  },
  {
    name: 'wallet_activity',
    value: 50,
    min: 0,
    max: 100,
    decimals: 1,
    description: 'Overall wallet and financial activity (higher = more active)',
  },
];

export function useModelInfo() {
  const chainId = useChainId();
  const { setModelInfo } = useAppStore();
  const addresses = getContractAddresses(chainId);

  const { data: activeModelId, isLoading: isLoadingModelId } = useReadContract({
    address: addresses.modelRegistry as `0x${string}`,
    abi: MODEL_REGISTRY_ABI,
    functionName: 'activeModelId',
    query: {
      enabled: addresses.modelRegistry !== '0x0000000000000000000000000000000000000000',
    },
  });

  const { data: modelInfo, isLoading: isLoadingModel } = useReadContract({
    address: addresses.modelRegistry as `0x${string}`,
    abi: MODEL_REGISTRY_ABI,
    functionName: 'getModel',
    args: [BigInt(activeModelId || 0)],
    query: {
      enabled: addresses.modelRegistry !== '0x0000000000000000000000000000000000000000' && activeModelId !== undefined,
    },
  });

  useEffect(() => {
    if (modelInfo) {
      setModelInfo({
        name: modelInfo.name,
        version: modelInfo.version,
        featureCount: Number(modelInfo.featureCount),
      });
    }
  }, [modelInfo, setModelInfo]);

  return {
    modelInfo: modelInfo ? {
      id: Number(activeModelId || 0),
      name: modelInfo.name,
      version: modelInfo.version,
      description: modelInfo.description,
      featureCount: Number(modelInfo.featureCount),
      isActive: modelInfo.isActive,
      createdAt: Number(modelInfo.createdAt) * 1000,
    } : null,
    isLoading: isLoadingModelId || isLoadingModel,
    features: DEFAULT_FEATURES,
  };
}
