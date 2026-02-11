'use client';

import { Video, Plus, LayoutDashboard, Camera, FileText, Settings, Bell, Layers, Crown } from 'lucide-react';

type TabId = 'dashboard' | 'photos' | 'bio' | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onCreateClick: () => void;
  processingCount?: number;
}

const navItems: { icon: React.ElementType; label: string; tab?: TabId; id: string }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', tab: 'dashboard', id: 'dashboard' },
  { icon: Layers, label: 'Mes Reels', tab: 'dashboard', id: 'reels' },
  { icon: Camera, label: 'Photos IA', tab: 'photos', id: 'photos' },
  { icon: FileText, label: 'Bio & Textes', tab: 'bio', id: 'bio' },
  { icon: Bell, label: 'Notifications', id: 'notif' },
];

export default function Sidebar({ activeTab, onTabChange, onCreateClick, processingCount = 0 }: SidebarProps) {
  return (
    <aside className="w-[260px] h-screen bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center gap-2.5 border-b border-slate-100">
        <div className="w-8 h-8 bg-vm-primary rounded-lg flex items-center justify-center">
          <Video className="text-white w-4 h-4" />
        </div>
        <span className="text-lg font-bold tracking-tight text-vm-text">VIMMO</span>
      </div>

      {/* Create button */}
      <div className="px-4 pt-5 pb-2">
        <button
          onClick={onCreateClick}
          className="w-full bg-vm-primary hover:bg-vm-primary-dark text-white h-10 rounded-lg font-medium text-sm
                     flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nouveau Reel
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.tab === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => item.tab && onTabChange(item.tab)}
              className={`w-full flex items-center gap-3 h-9 px-3 rounded-lg text-[13px] transition-colors ${
                isActive
                  ? 'bg-vm-primary/8 text-vm-primary font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
              {item.id === 'notif' && processingCount > 0 && (
                <span className="ml-auto bg-vm-primary text-white text-[10px] min-w-[18px] h-[18px] rounded-full font-medium flex items-center justify-center">
                  {processingCount}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 mt-3 border-t border-slate-100">
          <button
            onClick={() => onTabChange('settings')}
            className={`w-full flex items-center gap-3 h-9 px-3 rounded-lg text-[13px] transition-colors ${
              activeTab === 'settings'
                ? 'bg-vm-primary/8 text-vm-primary font-medium'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" /> Parametres
          </button>
        </div>
      </nav>

      {/* Upgrade card */}
      <div className="p-4 shrink-0">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-vm-primary" />
            <span className="text-xs font-semibold text-vm-text">ERA Pro</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">Videos illimitees en 4K</p>
          <button className="w-full h-8 bg-vm-text hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
