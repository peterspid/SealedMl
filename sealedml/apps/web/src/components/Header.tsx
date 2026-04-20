'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectWallet } from './ConnectWallet';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/models', label: 'Models' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-sky-500/10 bg-dark-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">SealedML</h1>
              <p className="text-xs text-sky-400 hidden sm:block">Privacy-First AI</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === item.href
                    ? 'bg-sky-500/10 text-sky-400'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Wallet */}
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
