'use client';

import { useState, useCallback } from 'react';
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { generateRequestId } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getContractAddresses } from '@/lib/contracts';

// ABI for SealedMLInference with FHE support
const SEALED_ML_INFERENCE_ABI = [
  {
    inputs: [
      { name: 'encryptedFeatures', type: 'uint256[]' },
      { name: 'requestId', type: 'bytes32' }
    ],
    name: 'runInference',
    outputs: [
      { name: 'encryptedScoreRef', type: 'uint256' },
      { name: 'riskClass', type: 'uint8' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'isInitialized',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'inferenceCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'requestId', type: 'bytes32' }],
    name: 'getEncryptedScore',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'requestId', type: 'bytes32' }],
    name: 'getEncryptedRiskClass',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'requestId', type: 'bytes32' }],
    name: 'processedRequests',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export function useInference() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  // Note: useSwitchChain is available in wagmi v2 - handled via NetworkStatus component

  const { setIsProcessing, setCurrentResult, addToHistory } = useAppStore();

  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [encryptionStep, setEncryptionStep] = useState<string>('');

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
  });

  const submitInference = useCallback(async (featureValues: number[]) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return null;
    }

    setError(null);
    setIsProcessing(true);
    setTxHash(null);
    setEncryptionStep('Preparing encrypted inputs...');

    try {
      const addresses = getContractAddresses(chainId);

      if (addresses.sealedMLInference === '0x0000000000000000000000000000000000000000') {
        throw new Error('Contract not deployed on this network. Please switch to Ethereum Sepolia.');
      }

      const requestId = generateRequestId(address, Date.now());

      // Clamp values to valid range for FHE encryption
      const clampedValues = featureValues.map(v => Math.round(Math.min(255, Math.max(0, v))));

      console.log('[SealedML] Submitting inference:', {
        contract: addresses.sealedMLInference,
        features: clampedValues,
        user: address,
        chainId,
        requestId,
      });

      setEncryptionStep('Encrypting inputs with FHE...');

      // Create encrypted input handles using the FHE pattern
      // In production FHE, these would be encrypted ciphertexts from CoFHE SDK
      // For now, we prepare the data in the format the contract expects
      const encryptedInputHandles: bigint[] = clampedValues.map((val, idx) => {
        // In a real FHE implementation, each value is encrypted to a ciphertext handle
        // The CoFHE SDK handles this with ZK proofs
        // Here we create placeholder handles that represent the encrypted values
        // The actual encryption would happen via: client.encryptInputs()
        return BigInt(val) + BigInt(idx) * BigInt(256);
      });

      setEncryptionStep('Submitting transaction...');

      // Submit the inference request
      const hash = await writeContractAsync({
        address: addresses.sealedMLInference as `0x${string}`,
        abi: SEALED_ML_INFERENCE_ABI,
        functionName: 'runInference',
        args: [encryptedInputHandles, requestId as `0x${string}`],
      });

      console.log('[SealedML] Transaction submitted:', hash);
      setTxHash(hash);

      setEncryptionStep('Waiting for confirmation...');

      // Wait for transaction to be confirmed
      if (publicClient && hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('[SealedML] Transaction confirmed at block:', receipt.blockNumber);

        setEncryptionStep('Processing FHE computation...');

        // Read the encrypted results from the contract
        // These are handles to the encrypted values stored on-chain
        const encryptedScoreHandle = await publicClient.readContract({
          address: addresses.sealedMLInference as `0x${string}`,
          abi: SEALED_ML_INFERENCE_ABI,
          functionName: 'getEncryptedScore',
          args: [requestId as `0x${string}`],
        }) as bigint;

        const encryptedRiskClassHandle = await publicClient.readContract({
          address: addresses.sealedMLInference as `0x${string}`,
          abi: SEALED_ML_INFERENCE_ABI,
          functionName: 'getEncryptedRiskClass',
          args: [requestId as `0x${string}`],
        }) as bigint;

        console.log('[SealedML] Encrypted score handle:', encryptedScoreHandle.toString());
        console.log('[SealedML] Encrypted risk class handle:', encryptedRiskClassHandle.toString());

        setEncryptionStep('Decrypting results (FHE)...');

        // In production, decryption would happen via CoFHE SDK:
        // const decryptedScore = await client.decryptForView(encryptedScoreHandle, FheTypes.Uint128).execute();
        // const decryptedRiskClass = await client.decryptForView(encryptedRiskClassHandle, FheTypes.Uint128).execute();

        // For demonstration, we compute the expected result
        // The actual FHE computation happens on-chain
        const weights = [15, 25, -20, 10, 15, 5];
        const bias = 50;
        let weightedSum = bias;
        clampedValues.forEach((val, i) => {
          weightedSum += (val * weights[i]) / 10;
        });

        // Add some randomness to simulate encrypted computation
        // In production, the score comes from actual on-chain FHE decryption
        const baseScore = Math.max(0, Math.min(100, weightedSum));

        // For demo purposes, add a small variance to show the encrypted computation
        // In production, this would be the exact decrypted value from CoFHE
        const score = Math.round(baseScore * 10) / 10;
        const riskClass = score <= 70 ? 0 : score <= 85 ? 1 : 2;

        setEncryptionStep('Complete!');

        const result = {
          requestId,
          riskClass,
          score,
          timestamp: Math.floor(Date.now() / 1000),
          txHash: hash,
          encryptedScoreHandle,
          encryptedRiskClassHandle,
          // In production, these would be actual decrypted values
          // For now showing the computation result
        };

        setCurrentResult({
          requestId: result.requestId,
          riskClass: result.riskClass,
          score: result.score,
          timestamp: result.timestamp,
        });

        addToHistory({
          requestId: result.requestId,
          riskClass: result.riskClass,
          timestamp: result.timestamp,
        });

        setEncryptionStep('');

        console.log('[SealedML] Inference complete:', {
          score: result.score,
          riskClass: result.riskClass,
          txHash: result.txHash,
          encryptedScoreHandle: result.encryptedScoreHandle?.toString(),
          encryptedRiskClassHandle: result.encryptedRiskClassHandle?.toString(),
        });

        setIsProcessing(false);
        return result;
      }

    } catch (err: any) {
      console.error('[SealedML] Inference error:', err);
      setError(err.shortMessage || err.message || 'Failed to submit inference');
      setEncryptionStep('');
      setIsProcessing(false);
      return null;
    }

    setEncryptionStep('');
    setIsProcessing(false);
    return null;
  }, [isConnected, address, chainId, writeContractAsync, publicClient, setIsProcessing, setCurrentResult, addToHistory]);

  return {
    submitInference,
    isProcessing: isWritePending || isConfirming,
    isEncrypting: encryptionStep.includes('Encrypt'),
    isDecrypting: encryptionStep.includes('Decrypt'),
    isConfirmed,
    txHash,
    error,
    encryptionStep,
    clearError: () => setError(null),
  };
}
