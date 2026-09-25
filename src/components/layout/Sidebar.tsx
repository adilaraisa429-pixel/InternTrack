import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Megaphone,
  User,
  Users,
  Building2,
  GitPullRequest,
  FileSpreadsheet,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { currentUser, journals, getUnreadCountForUser, announcements } = useApp();

  if (!currentUser) return null;

  const role = currentUser.role;
  const unreadMsgCount = getUnreadCountForUser(currentUser.id);
  const pendingJournalsCount = journals.filter((j) => j.status === 'Menunggu Validasi').length;
  const activeAnnouncementsCount = announcements.filter((a) => a.isActive).length;

  // Nav definitions per role
  const getNavItems = () => {
    switch (role) {
      case 'siswa':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'absensi', label: 'Absensi', icon: CalendarCheck },
          { id: 'jurnal', label: 'Jurnal Kegiatan', icon: BookOpen },
          { id: 'dokumentasi', label: 'Dokumentasi', icon: ImageIcon },
          { id: 'pesan', label: 'Pesan', icon: MessageSquare, badge: unreadMsgCount },
          { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone, badge: activeAnnouncementsCount },
          { id: 'profil', label: 'Profil Saya', icon: User },
        ];
      case 'pembimbing':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'siswa-bimbingan', label: 'Siswa Bimbingan', icon: Users },
          { id: 'absensi', label: 'Absensi Siswa', icon: CalendarCheck },
          { id: 'jurnal', label: 'Validasi Jurnal', icon: BookOpen, badge: pendingJournalsCount },
          { id: 'pesan', label: 'Pesan', icon: MessageSquare, badge: unreadMsgCount },
          { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone },
          { id: 'profil', label: 'Profil Saya', icon: User },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
          { id: 'data-siswa', label: 'Data Siswa', icon: Users },
          { id: 'data-pembimbing', label: 'Pembimbing', icon: User },
          { id: 'perusahaan', label: 'Perusahaan / DUDI', icon: Building2 },
          { id: 'penempatan', label: 'Penempatan Magang', icon: GitPullRequest },
          { id: 'absensi', label: 'Rekap Absensi', icon: CalendarCheck },
          { id: 'jurnal', label: 'Seluruh Jurnal', icon: BookOpen },
          { id: 'pengumuman', label: 'Kelola Pengumuman', icon: Megaphone },
          { id: 'laporan', label: 'Laporan & Ekspor', icon: FileSpreadsheet },
          { id: 'profil', label: 'Profil Admin', icon: User },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="sidebar-navigation"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white">InternTrack</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User context card inside sidebar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate">{currentUser.name}</h4>
              <p className="text-[11px] text-slate-400 capitalize flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400">
            Menu Utama
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[11px] font-bold rounded-full ${
                      isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 m-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>InternTrack v2.4</span>
          </div>
          <p className="text-[10px] leading-tight text-slate-400">
            Portal PKL & BKK Terintegrasi
          </p>
        </div>
      </aside>
    </>
  );
};
