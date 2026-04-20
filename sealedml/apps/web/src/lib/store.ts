import { create } from 'zustand';

interface AppState {
  // Connection state
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // Inference state
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;

  // Current result
  currentResult: {
    requestId: string;
    riskClass: number;
    score: number;
    timestamp: number;
  } | null;
  setCurrentResult: (result: AppState['currentResult']) => void;

  // User history
  resultHistory: Array<{
    requestId: string;
    riskClass: number;
    timestamp: number;
  }>;
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

export const useAppStore = create<AppState>((set) => ({
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
      resultHistory: [result, ...state.resultHistory].slice(0, 50),
    })),
  clearHistory: () => set({ resultHistory: [] }),

  // Model
  modelInfo: null,
  setModelInfo: (info) => set({ modelInfo: info }),
}));
