'use client';

import {
  Video, Plus, LayoutDashboard, Camera, FileText, Settings, Bell, Sparkles, Layers, ChevronRight
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
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group relative ${
        active
          ? 'bg-white/10 text-white'
          : 'text-white/40 hover:bg-white/5 hover:text-white/70'
      }`}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      <span className={`text-[13px] hidden lg:block ${active ? 'font-semibold' : 'font-normal'}`}>{label}</span>
      {badge && (
        <span className="ml-auto bg-vm-primary text-white text-[10px] w-5 h-5 rounded-full font-bold hidden lg:flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ activeTab, onTabChange, onCreateClick, processingCount = 0 }: SidebarProps) {
  return (
    <aside className="w-16 lg:w-64 h-screen bg-[#141418] flex flex-col z-20 shrink-0">
      {/* Logo */}
      <div className="p-4 lg:px-5 lg:py-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-vm-primary rounded-lg flex items-center justify-center shrink-0">
          <Video className="text-white w-4 h-4" />
        </div>
        <div className="hidden lg:block leading-none">
          <span className="text-lg font-black tracking-tight text-white">VIMMO</span>
          <p className="text-[9px] text-white/30 font-medium tracking-[0.15em] mt-0.5 uppercase">Immo Intelligence</p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-3 lg:px-4 mb-5">
        <button
          onClick={onCreateClick}
          className="w-full bg-vm-primary hover:bg-vm-primary-dark text-white py-2.5 rounded-lg font-semibold text-[13px]
                     flex items-center justify-center gap-2
                     transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Nouveau Reel</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 lg:px-3 space-y-0.5 overflow-y-auto min-h-0">
        <NavItem icon={LayoutDashboard} label="Tableau de bord" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
        <NavItem icon={Layers} label="Mes Reels" active={false} onClick={() => onTabChange('dashboard')} />
        <NavItem icon={Camera} label="Photos IA" active={activeTab === 'photos'} onClick={() => onTabChange('photos')} />
        <NavItem icon={FileText} label="Bio & Textes" active={activeTab === 'bio'} onClick={() => onTabChange('bio')} />
        <NavItem icon={Bell} label="Notifications" badge={processingCount > 0 ? String(processingCount) : undefined} />
        <div className="pt-3 mt-3 border-t border-white/5">
          <NavItem icon={Settings} label="Parametres" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
        </div>
      </nav>

      {/* Pro card */}
      <div className="p-3 lg:p-4 shrink-0">
        <div className="bg-gradient-to-br from-vm-primary/20 to-vm-primary/5 rounded-xl p-3.5 lg:p-4 relative overflow-hidden hidden lg:block border border-vm-primary/10">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-vm-primary" />
            <p className="text-vm-primary text-[10px] font-bold uppercase tracking-wider">ERA Pro</p>
          </div>
          <p className="text-white/50 text-xs leading-snug mb-3">
            Videos illimitees en 4K
          </p>
          <button className="w-full bg-vm-primary hover:bg-vm-primary-dark text-white text-[11px] font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1">
            Upgrade <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {/* Mobile CTA */}
        <button
          onClick={onCreateClick}
          className="lg:hidden w-10 h-10 bg-vm-primary rounded-lg flex items-center justify-center text-white mx-auto"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
