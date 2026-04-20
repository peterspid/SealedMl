'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Link2, Check, User, Clock, Shield } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  riskClass: number;
}

export function ShareModal({ isOpen, onClose, requestId, riskClass }: ShareModalProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [duration, setDuration] = useState('86400');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async () => {
    if (!recipientAddress) return;
    setIsSharing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setShareSuccess(true);
    setIsSharing(false);

    setTimeout(() => {
      onClose();
      setShareSuccess(false);
      setRecipientAddress('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-dark-900 rounded-2xl border border-sky-500/20 shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-dark-800">
          <div>
            <h2 className="text-lg font-bold text-white">Share Your Result</h2>
            <p className="text-sm text-dark-400">Grant selective access to your score</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-800 transition-colors">
            <X className="w-5 h-5 text-dark-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {shareSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Share Successful!</h3>
              <p className="text-sm text-dark-400">
                The recipient can now view your risk classification result.
              </p>
            </div>
          ) : (
            <>
              {/* Privacy Info */}
              <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 flex items-start gap-3">
                <Shield className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-dark-300">
                    <strong className="text-sky-400">Your privacy is protected.</strong> Only the risk classification is shared, not your raw financial data.
                  </p>
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Recipient Address
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="0x..."
                    className={cn(
                      'w-full pl-10 pr-4 py-3 rounded-xl',
                      'bg-dark-800 border border-dark-700',
                      'focus:border-sky-500 focus:ring-1 focus:ring-sky-500',
                      'text-white placeholder-dark-500',
                      'transition-all duration-200'
                    )}
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Access Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: '3600', label: '1 Hour' },
                    { value: '86400', label: '24 Hours' },
                    { value: '604800', label: '7 Days' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDuration(option.value)}
                      className={cn(
                        'py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1',
                        duration === option.value
                          ? 'bg-sky-500 text-white'
                          : 'bg-dark-800 text-dark-400 hover:text-white'
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* What gets shared */}
              <div className="p-4 rounded-xl bg-dark-800/50">
                <p className="text-xs text-dark-500 mb-2">What will be shared:</p>
                <ul className="space-y-1 text-sm text-dark-300">
                  <li>• Risk classification (Low/Medium/High)</li>
                  <li>• Credit score (0-100)</li>
                  <li>• Verification on Etherscan</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {!shareSuccess && (
          <div className="p-6 border-t border-dark-800 flex gap-3">
            <button
              onClick={onClose}
              className={cn(
                'flex-1 py-3 rounded-xl font-medium',
                'bg-dark-800 hover:bg-dark-700',
                'text-dark-300 transition-colors'
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={!recipientAddress || isSharing}
              className={cn(
                'flex-1 py-3 rounded-xl font-semibold',
                'bg-gradient-to-r from-sky-500 to-sky-600',
                'hover:from-sky-400 hover:to-sky-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'text-white transition-all shadow-lg shadow-sky-500/20',
                'flex items-center justify-center gap-2'
              )}
            >
              {isSharing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <Link2 className="w-5 h-5" />
                  <span>Grant Access</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
