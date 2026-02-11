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
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group relative ${
        active
          ? 'bg-vm-primary-light text-vm-primary'
          : 'text-slate-400 hover:bg-slate-50 hover:text-vm-text'
      }`}
    >
      {active && <div className="absolute left-0 w-1.5 h-6 bg-vm-primary rounded-r-full" />}
      <Icon className={`w-5 h-5 ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} transition-opacity`} />
      <span className={`text-[15px] hidden lg:block ${active ? 'font-black' : 'font-bold'}`}>{label}</span>
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
    <aside className="w-20 lg:w-72 bg-white border-r border-slate-100 flex flex-col z-20 shrink-0">
      {/* Logo */}
      <div className="p-6 lg:p-8 flex items-center gap-3">
        <div className="bg-vm-primary p-2.5 rounded-2xl shadow-[0_8px_24px_rgba(193,134,107,0.25)] rotate-3 hover:rotate-0 transition-transform">
          <Video className="text-white w-6 h-6" />
        </div>
        <div className="hidden lg:block leading-none">
          <span className="text-2xl font-black tracking-tighter text-vm-text">VIMMO</span>
          <p className="text-[10px] text-vm-primary font-bold tracking-[0.2em] mt-1 uppercase">Immo Intelligence</p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-4 lg:px-6 mb-6">
        <button
          onClick={onCreateClick}
          className="w-full bg-vm-primary hover:bg-vm-primary-dark text-white py-3 lg:py-4 rounded-2xl font-bold
                     flex items-center justify-center gap-3
                     shadow-[0_8px_32px_rgba(193,134,107,0.3)]
                     transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden lg:inline">Nouveau Reel</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 lg:px-4 space-y-1">
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
      <div className="p-4 lg:p-6">
        <div className="bg-vm-text rounded-[1.5rem] lg:rounded-[2rem] p-4 lg:p-6 relative overflow-hidden group hidden lg:block">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-vm-primary/20 rounded-full blur-2xl group-hover:bg-vm-primary/40 transition-colors duration-500" />
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <Sparkles className="w-3.5 h-3.5 text-vm-primary" />
            <p className="text-vm-primary text-[10px] font-black uppercase tracking-widest">Compte ERA Pro</p>
          </div>
          <p className="text-white text-sm font-medium mb-4 relative z-10 leading-snug">
            Generez des videos illimitees en 4K.
          </p>
          <button className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 rounded-xl transition-all border border-white/10 backdrop-blur-sm">
            Upgrade
          </button>
        </div>
        {/* Mobile CTA */}
        <button
          onClick={onCreateClick}
          className="lg:hidden w-12 h-12 bg-vm-primary rounded-full flex items-center justify-center text-white
                     shadow-[0_4px_16px_rgba(193,134,107,0.3)] mx-auto"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
