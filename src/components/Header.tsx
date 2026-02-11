'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-vm-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* Logo icon */}
          <div className="w-10 h-10 bg-vm-primary rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold text-vm-primary tracking-wide leading-none">
              VIMMO
            </span>
            <span className="text-vm-muted text-[10px] font-medium tracking-wider uppercase mt-0.5">
              Reels Immobiliers
            </span>
          </div>
        </Link>
        <Link
          href="/nouveau"
          className="bg-vm-accent text-white font-semibold px-6 py-2.5 rounded-xl text-sm
                     hover:bg-vm-accent-hover shadow-sm hover:shadow-md
                     transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Reel
        </Link>
      </div>
    </header>
  );
}
