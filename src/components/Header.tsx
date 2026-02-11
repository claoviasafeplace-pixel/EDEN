'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-eden-bg border-b border-eden-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="font-heading text-[28px] font-bold text-eden-gold tracking-[4px]">
            EDEN
          </span>
          <span className="text-eden-muted text-[11px] -mt-1">Reels Immobiliers</span>
        </Link>
        <Link
          href="/nouveau"
          className="bg-eden-gold text-eden-bg font-semibold px-7 py-3 rounded-xl text-sm
                     hover:bg-eden-gold-hover hover:shadow-[0_4px_15px_rgba(200,169,81,0.3)]
                     transition-all duration-200"
        >
          + Nouveau Reel
        </Link>
      </div>
    </header>
  );
}
