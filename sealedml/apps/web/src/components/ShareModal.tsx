'use client';

import { useMemo, useState } from 'react';
import { useChainId, usePublicClient, useWriteContract } from 'wagmi';
import { isAddress } from 'viem';
import { cn } from '@/lib/utils';
import { getContractAddresses, getExplorerTxUrl, hasConfiguredDeployment } from '@/lib/contracts';
import { Check, Clock, Link2, Shield, User, X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

const SEALED_ML_INFERENCE_ABI = [
  {
    inputs: [
      { name: 'requestId', type: 'bytes32' },
      { name: 'recipient', type: 'address' },
      { name: 'duration', type: 'uint256' },
    ],
    name: 'grantResultAccess',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const durationOptions = [
  { value: 3600, label: '1 hour' },
  { value: 86400, label: '24 hours' },
  { value: 604800, label: '7 days' },
];

export function ShareModal({ isOpen, onClose, requestId }: ShareModalProps) {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [duration, setDuration] = useState(durationOptions[1].value);
  const [isSharing, setIsSharing] = useState(false);
  const [shareTxHash, setShareTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recipientIsValid = useMemo(() => isAddress(recipientAddress), [recipientAddress]);
  const txUrl = getExplorerTxUrl(chainId, shareTxHash ?? undefined);

  const handleShare = async () => {
    if (!recipientIsValid || !publicClient) return;

    const addresses = getContractAddresses(chainId);
    if (!hasConfiguredDeployment(addresses)) {
      setError('SealedML sharing is not deployed on this network. Please switch to Ethereum Sepolia.');
      return;
    }

    setIsSharing(true);
    setError(null);
    setShareTxHash(null);

    try {
      const hash = await writeContractAsync({
        address: addresses.sealedMLInference as `0x${string}`,
        abi: SEALED_ML_INFERENCE_ABI,
        functionName: 'grantResultAccess',
        args: [requestId as `0x${string}`, recipientAddress as `0x${string}`, BigInt(duration)],
      });

      setShareTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to grant access.');
    } finally {
      setIsSharing(false);
    }
  };

  const close = () => {
    setRecipientAddress('');
    setShareTxHash(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      <div className="relative w-full max-w-md rounded-lg border border-slate-700 bg-slate-950 shadow-2xl shadow-black">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Share Result Access</h2>
            <p className="text-sm text-slate-400">Grant on-chain permission for this encrypted result.</p>
          </div>
          <button type="button" onClick={close} className="rounded-md p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {shareTxHash ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                <Check className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Access granted</h3>
              <p className="mb-4 text-sm text-slate-400">
                The recipient can verify and decrypt this result from the lender dashboard.
              </p>
              {txUrl && (
                <a href={txUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200">
                  View share transaction
                  <Link2 className="h-4 w-4" />
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-4">
                <div className="flex gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                  <p className="text-sm text-slate-300">
                    Sharing grants the recipient wallet decrypt access to the encrypted score and risk handles. It never reveals your raw financial inputs.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Recipient address</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(event) => setRecipientAddress(event.target.value)}
                    placeholder="0x..."
                    className={cn(
                      'w-full rounded-lg border bg-slate-900 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600',
                      recipientAddress && !recipientIsValid ? 'border-red-400/50' : 'border-slate-700 focus:border-cyan-400'
                    )}
                  />
                </div>
                {recipientAddress && !recipientIsValid && (
                  <p className="mt-2 text-xs text-red-300">Enter a valid EVM address.</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Verification window</label>
                <div className="grid grid-cols-3 gap-2">
                  {durationOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDuration(option.value)}
                      className={cn(
                        'flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition',
                        duration === option.value
                          ? 'bg-cyan-500 text-white'
                          : 'border border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                      )}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-400">
                Request ID: <span className="break-all font-mono text-slate-300">{requestId}</span>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                The on-chain verification window can expire or be revoked in SealedML metadata. The CoFHE decrypt grant itself is wallet-scoped and persistent.
              </p>

              {error && (
                <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {!shareTxHash && (
          <div className="flex gap-3 border-t border-slate-800 p-5">
            <button
              type="button"
              onClick={close}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 py-3 font-medium text-slate-300 transition hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={!recipientIsValid || isSharing}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSharing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sharing
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Grant Access
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
