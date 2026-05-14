import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoredResult {
  requestId: string;
  riskClass: number | null;
  score: number | null;
  timestamp: number;
  txHash?: `0x${string}`;
  chainId?: number;
  encryptedScoreHandle?: string;
  encryptedRiskClassHandle?: string;
  decryptionStatus: 'decrypted' | 'pending' | 'failed';
}

interface AppState {
  // Connection state
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // Inference state
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;

  // Current result
  currentResult: StoredResult | null;
  setCurrentResult: (result: AppState['currentResult']) => void;

  // User history
  resultHistory: StoredResult[];
  addToHistory: (result: AppState['resultHistory'][0]) => void;
  clearHistory: () => void;

  // Model info
  modelInfo: {
    name: string;
    version: string;
    featureCount: number;
  } | null;
  setModelInfo: (info: AppState['modelInfo']) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Connection
      isConnected: false,
      setIsConnected: (connected) => set({ isConnected: connected }),

      // Processing
      isProcessing: false,
      setIsProcessing: (processing) => set({ isProcessing: processing }),

      // Current result
      currentResult: null,
      setCurrentResult: (result) => set({ currentResult: result }),

      // History
      resultHistory: [],
      addToHistory: (result) =>
        set((state) => ({
          resultHistory: [
            result,
            ...state.resultHistory.filter((item) => item.requestId !== result.requestId),
          ].slice(0, 50),
        })),
      clearHistory: () => set({ resultHistory: [], currentResult: null }),

      // Model
      modelInfo: null,
      setModelInfo: (info) => set({ modelInfo: info }),
    }),
    {
      name: 'sealedml-app',
      partialize: (state) => ({
        currentResult: state.currentResult,
        resultHistory: state.resultHistory,
        modelInfo: state.modelInfo,
      }),
    }
  )
);
