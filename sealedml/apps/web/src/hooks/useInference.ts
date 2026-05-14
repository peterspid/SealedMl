'use client';

import { useCallback, useState } from 'react';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
  useWriteContract,
} from 'wagmi';
import type { EncryptedUint8Input } from '@cofhe/sdk';
import { bytesToHex, isHex } from 'viem';
import type { Hex } from 'viem';
import { generateRequestId } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getContractAddresses, hasConfiguredDeployment } from '@/lib/contracts';
import { formatCofheError, getCofheClient } from '@/lib/cofhe';

const ENCRYPTED_INPUT_COMPONENTS = [
  { name: 'ctHash', type: 'uint256' },
  { name: 'securityZone', type: 'uint8' },
  { name: 'utype', type: 'uint8' },
  { name: 'signature', type: 'bytes' },
] as const;

const SEALED_ML_INFERENCE_ABI = [
  {
    inputs: [
      {
        name: 'encryptedFeatures',
        type: 'tuple[]',
        components: ENCRYPTED_INPUT_COMPONENTS,
      },
      { name: 'requestId', type: 'bytes32' },
    ],
    name: 'runInference',
    outputs: [
      { name: 'encryptedScoreRef', type: 'uint256' },
      { name: 'encryptedRiskClassRef', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'requestId', type: 'bytes32' }],
    name: 'getEncryptedScore',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'requestId', type: 'bytes32' }],
    name: 'getEncryptedRiskClass',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

type ContractEncryptedInput = {
  ctHash: bigint;
  securityZone: number;
  utype: number;
  signature: Hex;
};

function normalizeSignature(signature: EncryptedUint8Input['signature']): Hex {
  if (typeof signature === 'string') {
    return isHex(signature) ? signature : `0x${signature}` as Hex;
  }

  return bytesToHex(signature);
}

function toContractInput(input: EncryptedUint8Input): ContractEncryptedInput {
  return {
    ctHash: BigInt(input.ctHash),
    securityZone: Number(input.securityZone),
    utype: Number(input.utype),
    signature: normalizeSignature(input.signature),
  };
}

export function useInference() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { setIsProcessing, setCurrentResult, addToHistory } = useAppStore();

  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [encryptionStep, setEncryptionStep] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);

  const submitInference = useCallback(async (featureValues: number[]) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first.');
      return null;
    }

    if (!publicClient || !walletClient) {
      setError('Wallet client is not ready yet. Please try again.');
      return null;
    }

    const addresses = getContractAddresses(chainId);
    if (!hasConfiguredDeployment(addresses)) {
      setError('SealedML is not deployed on this network. Please switch to Ethereum Sepolia.');
      return null;
    }

    setError(null);
    setIsProcessing(true);
    setIsBusy(true);
    setTxHash(null);
    setEncryptionStep('Preparing private assessment');

    const clampedValues = featureValues.map((value) => Math.round(Math.min(100, Math.max(0, value))));
    const requestId = generateRequestId(address);

    try {
      setEncryptionStep('Connecting to CoFHE network');
      const cofheClient = await getCofheClient(publicClient, walletClient);
      const { Encryptable, FheTypes } = await import('@cofhe/sdk');

      setEncryptionStep('Encrypting inputs in your browser');
      const encryptedFeatures = await cofheClient
        .encryptInputs(clampedValues.map((value) => Encryptable.uint8(BigInt(value))))
        .execute() as EncryptedUint8Input[];

      const contractInputs = encryptedFeatures.map((item) =>
        toContractInput(item)
      );

      setEncryptionStep('Submitting encrypted inference on-chain');
      const hash = await writeContractAsync({
        address: addresses.sealedMLInference as `0x${string}`,
        abi: SEALED_ML_INFERENCE_ABI,
        functionName: 'runInference',
        args: [contractInputs, requestId as `0x${string}`],
      });

      setTxHash(hash);
      setEncryptionStep('Waiting for testnet confirmation');
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      setEncryptionStep('Reading encrypted result handles');
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

      let score: number | null = null;
      let riskClass: 0 | 1 | 2 | null = null;
      let decryptionStatus: 'decrypted' | 'failed' = 'decrypted';

      try {
        setEncryptionStep('Creating or loading your decryption permit');
        await cofheClient.permits.getOrCreateSelfPermit();

        setEncryptionStep('Decrypting the score locally');
        const decryptedScore = await cofheClient
          .decryptForView(encryptedScoreHandle, FheTypes.Uint128)
          .execute();

        const decryptedRiskClass = await cofheClient
          .decryptForView(encryptedRiskClassHandle, FheTypes.Uint128)
          .execute();

        score = Number(decryptedScore);
        riskClass = Math.min(2, Math.max(0, Number(decryptedRiskClass))) as 0 | 1 | 2;
      } catch (decryptError) {
        decryptionStatus = 'failed';
        setError(`Transaction confirmed on-chain, but wallet-side CoFHE decryption did not complete: ${formatCofheError(decryptError)}`);
      }

      const result = {
        requestId,
        riskClass,
        score,
        timestamp: Math.floor(Date.now() / 1000),
        txHash: hash,
        chainId,
        encryptedScoreHandle: encryptedScoreHandle.toString(),
        encryptedRiskClassHandle: encryptedRiskClassHandle.toString(),
        decryptionStatus,
      };

      setCurrentResult(result);
      addToHistory(result);
      setEncryptionStep('');
      setIsProcessing(false);
      setIsBusy(false);

      return {
        ...result,
        blockNumber: receipt.blockNumber,
      };
    } catch (err) {
      setError(formatCofheError(err));
      setEncryptionStep('');
      setIsProcessing(false);
      setIsBusy(false);
      return null;
    }
  }, [
    addToHistory,
    address,
    chainId,
    isConnected,
    publicClient,
    setCurrentResult,
    setIsProcessing,
    walletClient,
    writeContractAsync,
  ]);

  return {
    submitInference,
    isProcessing: isBusy || isWritePending,
    isEncrypting: encryptionStep.toLowerCase().includes('encrypt'),
    isDecrypting: encryptionStep.toLowerCase().includes('decrypt'),
    txHash,
    error,
    encryptionStep,
    clearError: () => setError(null),
  };
}
