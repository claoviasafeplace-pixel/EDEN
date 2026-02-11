'use client';

import { LayoutDashboard, Film, Bell, Settings, Plus, Sparkles } from 'lucide-react';

interface SidebarProps {
  onCreateClick: () => void;
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200
        ${active
          ? 'bg-vm-primary text-white shadow-[0_4px_12px_rgba(193,134,107,0.25)]'
          : 'text-vm-text-secondary hover:bg-vm-primary-light hover:text-vm-text'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function Sidebar({ onCreateClick }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-vm-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-vm-primary rounded-2xl flex items-center justify-center shadow-[0_2px_8px_rgba(193,134,107,0.25)]">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-[22px] font-extrabold text-vm-text tracking-tight leading-none">
              VIMMO
            </h1>
            <span className="text-vm-muted text-[10px] font-semibold tracking-[0.15em] uppercase">
              Reels immobiliers
            </span>
          </div>
        </div>
      </div>

      {/* Create button */}
      <div className="px-5 mb-6">
        <button
          onClick={onCreateClick}
          className="w-full bg-vm-primary text-white font-semibold py-3.5 rounded-2xl text-sm
                     hover:bg-vm-primary-hover shadow-[0_4px_16px_rgba(193,134,107,0.3)]
                     hover:shadow-[0_6px_24px_rgba(193,134,107,0.4)]
                     transition-all duration-300 flex items-center justify-center gap-2
                     active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Nouveau Reel
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-4 flex-1 flex flex-col gap-1">
        <NavItem icon={<LayoutDashboard className="w-[18px] h-[18px]" />} label="Dashboard" active />
        <NavItem icon={<Film className="w-[18px] h-[18px]" />} label="Mes Reels" />
        <NavItem icon={<Bell className="w-[18px] h-[18px]" />} label="Notifications" />
        <NavItem icon={<Settings className="w-[18px] h-[18px]" />} label="Parametres" />
      </nav>

      {/* Pro card */}
      <div className="px-5 pb-6">
        <div className="bg-gradient-to-br from-vm-primary/[0.07] to-vm-primary/[0.02] border border-vm-primary/15
                        rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-vm-primary" />
            <span className="text-vm-primary font-bold text-xs uppercase tracking-wider">Pro</span>
          </div>
          <p className="text-vm-text text-[13px] font-semibold leading-snug mb-1">
            Passez a la vitesse superieure
          </p>
          <p className="text-vm-muted text-[11px] leading-relaxed">
            Reels illimites, templates premium, publication auto
          </p>
        </div>
      </div>
    </aside>
  );
}
