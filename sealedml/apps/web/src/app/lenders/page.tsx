'use client';

import { useState } from 'react';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { Header } from '@/components/Header';
import { NetworkStatus } from '@/components/NetworkStatus';
import { getContractAddresses, hasConfiguredDeployment } from '@/lib/contracts';
import { formatAddress, formatTimestamp, getRiskLabel } from '@/lib/utils';
import { formatCofheError, getCofheClient } from '@/lib/cofhe';
import { AlertCircle, Building2, CheckCircle, KeyRound, Search, Shield } from 'lucide-react';

const RESULT_MANAGER_ABI = [
  {
    inputs: [
      { name: 'requestId', type: 'bytes32' },
      { name: 'requester', type: 'address' },
    ],
    name: 'getResultWithAccess',
    outputs: [
      {
        name: 'result',
        type: 'tuple',
        components: [
          { name: 'requestId', type: 'bytes32' },
          { name: 'owner', type: 'address' },
          { name: 'scoreReference', type: 'uint256' },
          { name: 'riskClassReference', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'expiresAt', type: 'uint256' },
          { name: 'metadata', type: 'string' },
        ],
      },
      { name: 'hasAccess', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

type VerificationResult = {
  owner: string;
  scoreReference: string;
  riskClassReference: string;
  status: number;
  createdAt: number;
  expiresAt: number;
  metadata: string;
  hasAccess: boolean;
  score: number | null;
  riskClass: 0 | 1 | 2 | null;
  decryptionStatus: 'not-requested' | 'decrypted' | 'failed';
};

export default function LendersPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [requestId, setRequestId] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const verify = async () => {
    if (!publicClient || !address) return;
    if (!requestId.startsWith('0x') || requestId.length !== 66) {
      setError('Enter a valid bytes32 request ID.');
      return;
    }

    const addresses = getContractAddresses(chainId);
    if (!hasConfiguredDeployment(addresses)) {
      setError('SealedML is not deployed on this network. Please switch to Ethereum Sepolia.');
      return;
    }

    setIsChecking(true);
    setError(null);
    setResult(null);

    try {
      const [record, hasAccess] = await publicClient.readContract({
        address: addresses.resultManager as `0x${string}`,
        abi: RESULT_MANAGER_ABI,
        functionName: 'getResultWithAccess',
        args: [requestId as `0x${string}`, address],
      });

      if (record.owner === '0x0000000000000000000000000000000000000000') {
        setError('No result found for this request ID.');
        return;
      }

      let score: number | null = null;
      let riskClass: 0 | 1 | 2 | null = null;
      let decryptionStatus: VerificationResult['decryptionStatus'] = 'not-requested';

      if (hasAccess) {
        if (!walletClient) {
          decryptionStatus = 'failed';
          setError('Wallet client is not ready yet. Please try again.');
        } else {
          try {
            const cofheClient = await getCofheClient(publicClient, walletClient);
            const { FheTypes } = await import('@cofhe/sdk');
            await cofheClient.permits.getOrCreateSelfPermit();

            const decryptedScore = await cofheClient
              .decryptForView(record.scoreReference, FheTypes.Uint128)
              .execute();
            const decryptedRiskClass = await cofheClient
              .decryptForView(record.riskClassReference, FheTypes.Uint128)
              .execute();

            score = Number(decryptedScore);
            riskClass = Math.min(2, Math.max(0, Number(decryptedRiskClass))) as 0 | 1 | 2;
            decryptionStatus = 'decrypted';
          } catch (decryptError) {
            decryptionStatus = 'failed';
            setError(`Access metadata is active, but CoFHE decryption failed: ${formatCofheError(decryptError)}`);
          }
        }
      }

      setResult({
        owner: record.owner,
        scoreReference: record.scoreReference.toString(),
        riskClassReference: record.riskClassReference.toString(),
        status: Number(record.status),
        createdAt: Number(record.createdAt),
        expiresAt: Number(record.expiresAt),
        metadata: record.metadata,
        hasAccess,
        score,
        riskClass,
        decryptionStatus,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <NetworkStatus />
              <span className="rounded-md border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-medium text-indigo-100">
                Permissioned verification
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Lender Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Verify a shared SealedML result using the on-chain ResultManager. A user must grant your address access first.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
            {isConnected && address ? `Verifier ${formatAddress(address)}` : 'Connect wallet to verify'}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-200">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Verify request</h2>
                <p className="text-sm text-slate-400">Paste the request ID shared by a borrower.</p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-medium text-slate-200">Request ID</label>
            <textarea
              value={requestId}
              onChange={(event) => setRequestId(event.target.value.trim())}
              rows={4}
              placeholder="0x..."
              className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={verify}
              disabled={!isConnected || isChecking}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isChecking ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Verify Access
            </button>

            {error && (
              <div className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Verification issue
                </div>
                {error}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Verification result</h2>
                <p className="text-sm text-slate-400">Access status and encrypted handles are shown here.</p>
              </div>
            </div>

            {!result ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-500">
                <KeyRound className="mb-4 h-9 w-9 text-slate-600" />
                Waiting for a request ID.
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`rounded-lg border p-4 ${result.hasAccess ? 'border-emerald-400/30 bg-emerald-400/10' : 'border-amber-400/30 bg-amber-400/10'}`}>
                  <div className="mb-1 flex items-center gap-2 font-semibold">
                    {result.hasAccess ? <CheckCircle className="h-4 w-4 text-emerald-200" /> : <AlertCircle className="h-4 w-4 text-amber-100" />}
                    {result.hasAccess ? 'Access active' : 'No active access'}
                  </div>
                  <p className="text-sm text-slate-300">
                    {result.hasAccess
                      ? 'This verifier address is permissioned to view and decrypt the shared result.'
                      : 'Ask the user to grant access from their dashboard.'}
                  </p>
                </div>

                {result.hasAccess && (
                  <div className={`rounded-lg border p-4 ${
                    result.decryptionStatus === 'decrypted'
                      ? 'border-cyan-400/30 bg-cyan-400/10'
                      : 'border-amber-400/30 bg-amber-400/10'
                  }`}>
                    <div className="mb-2 text-sm font-semibold text-white">Decrypted assessment</div>
                    {result.decryptionStatus === 'decrypted' && result.score !== null && result.riskClass !== null ? (
                      <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Risk score</div>
                          <div className="font-mono text-4xl font-bold text-cyan-100">{result.score.toFixed(0)}</div>
                        </div>
                        <div className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-100">
                          {getRiskLabel(result.riskClass)}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-300">
                        The permission record is active, but this wallet could not decrypt the CoFHE handles.
                      </p>
                    )}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoTile label="Owner" value={formatAddress(result.owner)} />
                  <InfoTile label="Status" value={getStatusLabel(result.status)} />
                  <InfoTile label="Created" value={formatTimestamp(result.createdAt)} />
                  <InfoTile label="Expires" value={formatTimestamp(result.expiresAt)} />
                </div>

                <InfoTile label="Encrypted score handle" value={result.scoreReference} mono />
                <InfoTile label="Encrypted risk handle" value={result.riskClassReference} mono />
                <InfoTile label="Metadata" value={result.metadata || 'No metadata'} />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoTile({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="mb-1 text-xs text-slate-500">{label}</div>
      <div className={`break-all text-sm text-slate-200 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

function getStatusLabel(status: number) {
  return ['Pending', 'Available', 'Retrieved', 'Expired', 'Revoked'][status] ?? `Unknown (${status})`;
}
