'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectWallet } from './ConnectWallet';
import { cn } from '@/lib/utils';
import { BarChart3, Building2, Info, Shield } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Assess', icon: BarChart3 },
  { href: '/models', label: 'Models', icon: Shield },
  { href: '/lenders', label: 'Lenders', icon: Building2 },
  { href: '/about', label: 'About', icon: Info },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 text-white shadow-lg shadow-cyan-950/50">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">SealedML</h1>
              <p className="hidden text-xs text-cyan-300 sm:block">Private AI inference</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                  pathname === item.href
                    ? 'bg-cyan-400/10 text-cyan-200'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <ConnectWallet />
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-slate-900 py-2 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                pathname === item.href
                  ? 'bg-cyan-400/10 text-cyan-200'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
