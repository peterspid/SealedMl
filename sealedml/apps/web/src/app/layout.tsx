import type { Metadata } from 'next';
import { Providers } from '@/providers/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'SealedML - Privacy-First AI Inference',
  description: 'Get credit scores and financial assessments without revealing your data. AI that works on your data without seeing your data. Powered by FHE on Fhenix.',
  keywords: ['FHE', 'Fully Homomorphic Encryption', 'Privacy', 'AI', 'DeFi', 'Credit Scoring', 'Fhenix', 'Blockchain'],
  authors: [{ name: 'SealedML' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'SealedML - Privacy-First AI Inference',
    description: 'Get credit scores without revealing your financial data. Powered by FHE.',
    type: 'website',
    siteName: 'SealedML',
  },
  twitter: {
    card: 'summary',
    title: 'SealedML - Privacy-First AI Inference',
    description: 'Get credit scores without revealing your financial data.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
