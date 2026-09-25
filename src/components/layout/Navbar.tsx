import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  MessageSquare,
  LogOut,
  ChevronDown,
  UserCheck,
  RotateCcw,
  Menu,
  Shield,
  Briefcase,
  User as UserIcon,
  Cloud,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigateToMessages: () => void;
  onNavigateToProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onNavigateToMessages,
  onNavigateToProfile,
}) => {
  const {
    currentUser,
    students,
    supervisors,
    admin,
    switchUser,
    logout,
    resetToDefaultData,
    getUnreadCountForUser,
    firebaseUser,
    signInWithGoogle,
    signOutGoogle,
  } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  if (!currentUser) return null;

  const unreadCount = getUnreadCountForUser(currentUser.id);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pembimbing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'siswa':
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin Sekolah';
      case 'pembimbing':
        return 'Pembimbing';
      case 'siswa':
      default:
        return 'Siswa Magang';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              id="btn-sidebar-toggle"
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Intern<span className="text-blue-600">Track</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Sistem Magang PKL
                </span>
              </div>
            </div>
          </div>

          {/* Right: Cloud status, Quick Switcher, Messages, & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Status Badge */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 shadow-2xs"
              title="Firebase Cloud Firestore Terhubung"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">Firebase Cloud</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Demo Quick Switcher Button */}
            <div className="relative">
              <button
                id="btn-quick-switch-role"
                onClick={() => setShowDemoSelector(!showDemoSelector)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Ganti Akun Demo untuk Pengujian"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Ganti Peran</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showDemoSelector && (
                <div
                  id="dropdown-demo-selector"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Pilih Akun Demo Cepat
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto py-1">
                    {/* Admin */}
                    <div className="px-3 py-1 text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Admin Sekolah
                    </div>
                    <button
                      id="switch-to-admin"
                      onClick={() => {
                        switchUser(admin.id);
                        setShowDemoSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        currentUser.id === admin.id ? 'bg-purple-50 font-semibold text-purple-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <div>{admin.name}</div>
                        <div className="text-[10px] text-slate-500">{admin.position}</div>
                      </div>
                      {currentUser.id === admin.id && <span className="text-[10px] text-purple-600 font-bold">Aktif</span>}
                    </button>

                    {/* Pembimbing */}
                    <div className="px-3 py-1 pt-2 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Pembimbing Magang
                    </div>
                    {supervisors.map((sup) => (
                      <button
                        key={sup.id}
                        id={`switch-to-${sup.id}`}
                        onClick={() => {
                          switchUser(sup.id);
                          setShowDemoSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          currentUser.id === sup.id ? 'bg-amber-50 font-semibold text-amber-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <div>{sup.name}</div>
                          <div className="text-[10px] text-slate-500">{sup.position}</div>
                        </div>
                        {currentUser.id === sup.id && <span className="text-[10px] text-amber-600 font-bold">Aktif</span>}
                      </button>
                    ))}

                    {/* Siswa */}
                    <div className="px-3 py-1 pt-2 text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                      <UserIcon className="w-3 h-3" /> Siswa Magang
                    </div>
                    {students.slice(0, 3).map((std) => (
                      <button
                        key={std.id}
                        id={`switch-to-${std.id}`}
                        onClick={() => {
                          switchUser(std.id);
                          setShowDemoSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          currentUser.id === std.id ? 'bg-blue-50 font-semibold text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <div>{std.name}</div>
                          <div className="text-[10px] text-slate-500">{std.className}</div>
                        </div>
                        {currentUser.id === std.id && <span className="text-[10px] text-blue-600 font-bold">Aktif</span>}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 px-3 pt-2">
                    <button
                      id="btn-reset-data-nav"
                      onClick={() => {
                        if (confirm('Reset seluruh data ke kondisi awal?')) {
                          resetToDefaultData();
                          setShowDemoSelector(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Data Demo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Messages Icon Button */}
            <button
              id="btn-nav-messages"
              onClick={onNavigateToMessages}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Pesan & Komunikasi"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                id="btn-user-profile-menu"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadge(
                        currentUser.role
                      )}`}
                    >
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div
                  id="dropdown-user-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    {firebaseUser && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <Cloud className="w-3 h-3 text-emerald-600" />
                        <span className="truncate">Google: {firebaseUser.email}</span>
                      </div>
                    )}
                  </div>

                  <button
                    id="btn-menu-profile"
                    onClick={() => {
                      onNavigateToProfile();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    Profil Pengguna
                  </button>

                  {!firebaseUser ? (
                    <button
                      id="btn-menu-google-signin"
                      onClick={() => {
                        signInWithGoogle();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Cloud className="w-4 h-4 text-blue-500" />
                      Hubungkan Akun Google
                    </button>
                  ) : (
                    <button
                      id="btn-menu-google-signout"
                      onClick={() => {
                        signOutGoogle();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Cloud className="w-4 h-4 text-slate-400" />
                      Putuskan Akun Google
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    id="btn-menu-logout"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Keluar (Logout)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
