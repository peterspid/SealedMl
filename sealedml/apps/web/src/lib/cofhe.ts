'use client';

type CofheClientInstance = {
  connect: (...args: unknown[]) => Promise<void>;
  encryptInputs: (...args: unknown[]) => {
    execute: () => Promise<unknown>;
  };
  decryptForView: (...args: unknown[]) => {
    execute: () => Promise<unknown>;
  };
  permits: {
    getOrCreateSelfPermit: () => Promise<unknown>;
  };
};

let client: CofheClientInstance | null = null;

export async function getCofheClient(publicClient: unknown, walletClient: unknown) {
  if (typeof window === 'undefined') {
    throw new Error('CoFHE client is only available in the browser.');
  }

  if (!client) {
    const [{ createCofheClient, createCofheConfig }, { chains }] = await Promise.all([
      import('@cofhe/sdk/web'),
      import('@cofhe/sdk/chains'),
    ]);

    const config = createCofheConfig({
      supportedChains: [chains.sepolia, chains.arbSepolia, chains.baseSepolia],
    });

    client = createCofheClient(config) as CofheClientInstance;
  }

  await client.connect(publicClient, walletClient);
  return client;
}

export function formatCofheError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'CoFHE operation failed';
}
