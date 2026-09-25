import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, Supervisor, Admin } from '../../types';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Lock,
  Save,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, companies, supervisors, students, updateStudent, updateSupervisor, showToast } = useApp();

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'siswa';
  const isSupervisor = currentUser.role === 'pembimbing';
  const isAdmin = currentUser.role === 'admin';

  const student = isStudent ? (currentUser as Student) : null;
  const supervisor = isSupervisor ? (currentUser as Supervisor) : null;
  const admin = isAdmin ? (currentUser as Admin) : null;

  const company = isStudent ? companies.find((c) => c.id === student?.companyId) : null;
  const mySupervisor = isStudent ? supervisors.find((s) => s.id === student?.supervisorId) : null;
  const supervisedStudents = isSupervisor
    ? students.filter((s) => s.supervisorId === supervisor?.id)
    : [];

  // Edit states
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStudent && student) {
      updateStudent(student.id, { phone });
    } else if (isSupervisor && supervisor) {
      updateSupervisor(supervisor.id, { phone });
    }
    showToast('success', 'Informasi profil berhasil diperbarui!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('error', 'Password baru minimal 6 karakter!');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Konfirmasi password tidak cocok!');
      return;
    }
    showToast('success', 'Kata sandi berhasil diganti!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-50 shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{currentUser.name}</h1>
            <span
              className={`inline-block text-xs font-bold px-3 py-0.5 rounded-full capitalize self-center sm:self-auto ${
                currentUser.role === 'siswa'
                  ? 'bg-blue-100 text-blue-800'
                  : currentUser.role === 'pembimbing'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {currentUser.role}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            {isStudent && `${student?.className} &bull; NISN: ${student?.nisn}`}
            {isSupervisor && `${supervisor?.position} &bull; ${supervisor?.department}`}
            {isAdmin && 'Administrator Hubungan Industri & BKK SMK'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              {currentUser.email}
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <Phone className="w-4 h-4 text-slate-400" />
              {currentUser.phone || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Internship Dossier for Student */}
      {isStudent && student && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Informasi Penempatan Magang
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-1">Perusahaan Mitra:</span>
              <div className="font-bold text-slate-900 text-sm">{company?.name || 'Belum Ditempatkan'}</div>
              <p className="text-slate-600 mt-1">{company?.address}, {company?.city}</p>
              <div className="mt-2 pt-2 border-t border-slate-200 text-slate-500">
                <span>PIC: <strong>{company?.contactPerson}</strong> ({company?.contactPhone})</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-1">Guru / Mentor Pembimbing:</span>
              <div className="font-bold text-slate-900 text-sm">{mySupervisor?.name || 'Belum Ditugaskan'}</div>
              <p className="text-slate-600 mt-1">{mySupervisor?.position} &bull; {mySupervisor?.department}</p>
              <div className="mt-2 pt-2 border-t border-slate-200 text-slate-500">
                <span>Kontak: <strong>{mySupervisor?.phone}</strong> ({mySupervisor?.email})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supervised Student List for Supervisor */}
      {isSupervisor && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-600" />
            Daftar Siswa di Bawah Bimbingan ({supervisedStudents.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {supervisedStudents.map((std) => {
              const comp = companies.find((c) => c.id === std.companyId);
              return (
                <div key={std.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <img
                    src={std.avatar}
                    alt={std.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-slate-900 truncate">{std.name}</h4>
                    <p className="text-slate-500 text-[11px]">{std.className} &bull; {comp?.name || 'Magang'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Column Layout: Update Contact & Change Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Perbarui Kontak</h3>
          <p className="text-xs text-slate-500 mb-4">Pastikan nomor telepon aktif untuk koordinasi darurat.</p>

          <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Akun</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">No. WhatsApp / Telepon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Nomor Kontak
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Ganti Kata Sandi</h3>
          <p className="text-xs text-slate-500 mb-4">Gunakan password yang kuat dengan minimal 6 karakter.</p>

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kata Sandi Baru</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Konfirmasi Kata Sandi</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Perbarui Kata Sandi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
