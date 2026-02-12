'use client';

import { Video, LayoutDashboard, Camera, FileText, Settings, Bell, Layers } from 'lucide-react';

type TabId = 'dashboard' | 'create' | 'photos' | 'bio' | 'settings';

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
  { icon: Settings, label: 'Parametres', tab: 'settings', id: 'settings' },
];

export default function Sidebar({ activeTab, onTabChange, onCreateClick, processingCount = 0 }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
          <Video className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight">VIMMO</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = item.tab === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.tab) onTabChange(item.tab);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {item.id === 'notif' && processingCount > 0 && (
                <span className={`ml-auto text-[10px] min-w-[18px] h-[18px] rounded-full font-bold flex items-center justify-center ${
                  isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  {processingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile card */}
      <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs">E</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Eden ERA</p>
            <p className="text-[10px] text-slate-500">Directrice Marketing</p>
          </div>
        </div>
        <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
          Deconnexion
        </button>
      </div>
    </aside>
  );
}
