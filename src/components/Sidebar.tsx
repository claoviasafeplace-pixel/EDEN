'use client';

import {
  Video, Plus, LayoutDashboard, Camera, FileText, Settings, Bell, Sparkles, Layers
} from 'lucide-react';

type TabId = 'dashboard' | 'photos' | 'bio' | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onCreateClick: () => void;
  processingCount?: number;
}

function NavItem({
  icon: Icon, label, active, onClick, badge,
}: {
  icon: React.ElementType; label: string; active?: boolean; onClick?: () => void; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all group relative ${
        active
          ? 'bg-vm-primary/10 text-vm-primary'
          : 'text-slate-400 hover:bg-slate-50 hover:text-vm-text'
      }`}
    >
      {active && <div className="absolute left-0 w-1 h-5 bg-vm-primary rounded-r-full" />}
      <Icon className={`w-[18px] h-[18px] ${active ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'} transition-opacity`} />
      <span className={`text-sm hidden lg:block ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
      {badge && (
        <span className="ml-auto bg-vm-primary text-white text-[10px] px-2 py-0.5 rounded-full font-black hidden lg:block
                         shadow-[0_2px_8px_rgba(193,134,107,0.25)]">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ activeTab, onTabChange, onCreateClick, processingCount = 0 }: SidebarProps) {
  return (
    <aside className="w-20 lg:w-72 h-screen bg-white border-r border-slate-100 flex flex-col z-20 shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="p-4 lg:px-6 lg:py-5 flex items-center gap-3">
        <div className="bg-vm-primary p-2 rounded-xl shadow-[0_4px_12px_rgba(193,134,107,0.25)]">
          <Video className="text-white w-5 h-5" />
        </div>
        <div className="hidden lg:block leading-none">
          <span className="text-xl font-black tracking-tighter text-vm-text">VIMMO</span>
          <p className="text-[9px] text-slate-400 font-medium tracking-[0.15em] mt-0.5 uppercase">Immo Intelligence</p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-3 lg:px-5 mb-4">
        <button
          onClick={onCreateClick}
          className="w-full bg-vm-primary hover:bg-vm-primary-dark text-white py-2.5 lg:py-3 rounded-xl font-bold text-sm
                     flex items-center justify-center gap-2
                     shadow-[0_4px_16px_rgba(193,134,107,0.2)]
                     transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Nouveau Reel</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 lg:px-4 space-y-1 overflow-y-auto min-h-0">
        <NavItem icon={LayoutDashboard} label="Tableau de bord" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
        <NavItem icon={Layers} label="Mes Reels" active={false} onClick={() => onTabChange('dashboard')} />
        <NavItem icon={Camera} label="Photos IA" active={activeTab === 'photos'} onClick={() => onTabChange('photos')} />
        <NavItem icon={FileText} label="Bio & Textes" active={activeTab === 'bio'} onClick={() => onTabChange('bio')} />
        <NavItem icon={Bell} label="Notifications" badge={processingCount > 0 ? String(processingCount) : undefined} />
        <div className="pt-4 mt-4 border-t border-slate-50">
          <NavItem icon={Settings} label="Parametres" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
        </div>
      </nav>

      {/* Pro card */}
      <div className="p-3 lg:p-4 shrink-0">
        <div className="bg-vm-text rounded-xl lg:rounded-2xl p-3 lg:p-4 relative overflow-hidden group hidden lg:block">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-vm-primary/20 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 mb-1.5 relative z-10">
            <Sparkles className="w-3 h-3 text-vm-primary" />
            <p className="text-vm-primary text-[9px] font-bold uppercase tracking-widest">ERA Pro</p>
          </div>
          <p className="text-white/80 text-xs font-medium mb-3 relative z-10 leading-snug">
            Videos illimitees en 4K
          </p>
          <button className="w-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold py-2 rounded-lg transition-all border border-white/10">
            Upgrade
          </button>
        </div>
        {/* Mobile CTA */}
        <button
          onClick={onCreateClick}
          className="lg:hidden w-10 h-10 bg-vm-primary rounded-xl flex items-center justify-center text-white
                     shadow-sm mx-auto"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
