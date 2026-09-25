import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { GraduationCap, Shield, User, Briefcase, ArrowRight, Lock, Cloud, Sparkles } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, switchUser, students, supervisors, admin, signInWithGoogle, firebaseUser, isFirebaseConnected } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('siswa');
  const [email, setEmail] = useState('budi.santoso@siswa.smk.id');
  const [password, setPassword] = useState('password123');
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'siswa') {
      setEmail('budi.santoso@siswa.smk.id');
    } else if (role === 'pembimbing') {
      setEmail('hendra.wijaya@guru.smk.id');
    } else {
      setEmail('ratna.sari@smk-negeri.sch.id');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole, email);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const quickLogin = (userId: string) => {
    switchUser(userId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-md mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Intern<span className="text-blue-600">Track</span>
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sistem Manajemen & Monitoring Kegiatan Magang PKL Siswa
        </p>

        {/* Cloud Connection Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Cloud className="w-3.5 h-3.5 text-emerald-600" />
          <span>Firebase Cloud Firestore Terhubung</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {/* Google Sign In Button */}
          <div className="mb-6">
            <button
              type="button"
              id="btn-google-signin"
              onClick={handleGoogleSignIn}
              disabled={isSigningInGoogle}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningInGoogle ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
            </button>
            <div className="mt-4 flex items-center justify-between">
              <span className="w-full border-t border-slate-200"></span>
              <span className="px-3 text-xs text-slate-400 uppercase tracking-wider whitespace-nowrap">
                atau simulasi akun
              </span>
              <span className="w-full border-t border-slate-200"></span>
            </div>
          </div>

          {/* Role selector tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Pilih Role Masuk
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                id="role-tab-siswa"
                onClick={() => handleRoleChange('siswa')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  selectedRole === 'siswa'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Siswa
              </button>
              <button
                type="button"
                id="role-tab-pembimbing"
                onClick={() => handleRoleChange('pembimbing')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  selectedRole === 'pembimbing'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Pembimbing
              </button>
              <button
                type="button"
                id="role-tab-admin"
                onClick={() => handleRoleChange('admin')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email / Username</label>
              <input
                id="input-login-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">Kata Sandi</label>
                <span className="text-[11px] text-slate-400">Default: password123</span>
              </div>
              <div className="relative">
                <input
                  id="input-login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-xs transition-colors cursor-pointer"
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
              Akses Cepat Akun Demo (1-Click Login)
            </p>
            <div className="space-y-2">
              {/* Siswa 1 */}
              <button
                type="button"
                id="quick-login-siswa"
                onClick={() => quickLogin(students[0]?.id || 'std-1')}
                className="w-full flex items-center justify-between p-2.5 text-xs text-left bg-blue-50 hover:bg-blue-100/80 rounded-xl border border-blue-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    S
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{students[0]?.name || 'Budi Santoso'}</span>
                    <span className="text-slate-500 block text-[11px]">Siswa (XII RPL 1 - Telkom)</span>
                  </div>
                </div>
                <span className="text-blue-600 text-[11px] font-semibold">Masuk &rarr;</span>
              </button>

              {/* Pembimbing 1 */}
              <button
                type="button"
                id="quick-login-pembimbing"
                onClick={() => quickLogin(supervisors[0]?.id || 'sup-1')}
                className="w-full flex items-center justify-between p-2.5 text-xs text-left bg-amber-50 hover:bg-amber-100/80 rounded-xl border border-amber-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                    P
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{supervisors[0]?.name || 'Hendra Wijaya, S.Kom.'}</span>
                    <span className="text-slate-500 block text-[11px]">Pembimbing Sekolah</span>
                  </div>
                </div>
                <span className="text-amber-800 text-[11px] font-semibold">Masuk &rarr;</span>
              </button>

              {/* Admin */}
              <button
                type="button"
                id="quick-login-admin"
                onClick={() => quickLogin(admin.id)}
                className="w-full flex items-center justify-between p-2.5 text-xs text-left bg-purple-50 hover:bg-purple-100/80 rounded-xl border border-purple-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    A
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{admin.name}</span>
                    <span className="text-slate-500 block text-[11px]">Admin Sekolah / Koordinator BKK</span>
                  </div>
                </div>
                <span className="text-purple-700 text-[11px] font-semibold">Masuk &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
