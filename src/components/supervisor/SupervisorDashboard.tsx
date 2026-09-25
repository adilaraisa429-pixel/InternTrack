import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supervisor, JournalEntry, Student } from '../../types';
import { SupervisorValidationModal } from './SupervisorValidationModal';
import {
  Users,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Eye,
  MessageSquare,
  Building2,
  Check,
  FileText,
  Search,
} from 'lucide-react';

interface SupervisorDashboardProps {
  onNavigate: (tab: string, extraData?: any) => void;
  onOpenMessageWithUser: (userId: string) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  onNavigate,
  onOpenMessageWithUser,
}) => {
  const { currentUser, students, companies, attendances, journals } = useApp();
  const supervisor = currentUser as Supervisor;

  const [selectedJournalToValidate, setSelectedJournalToValidate] = useState<JournalEntry | null>(null);
  const [searchStudent, setSearchStudent] = useState('');

  if (!supervisor || supervisor.role !== 'pembimbing') return null;

  // Filter students under this supervisor (or all students if generic)
  const supervisedStudents = students.filter(
    (s) => s.supervisorId === supervisor.id || supervisor.isIndustryMentor === false
  );

  const supervisedStudentIds = supervisedStudents.map((s) => s.id);

  // Relevant journals for supervised students
  const relevantJournals = journals.filter((j) => supervisedStudentIds.includes(j.studentId));

  // Today's attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter(
    (a) => supervisedStudentIds.includes(a.studentId) && a.date === todayStr
  );

  const studentsPresentToday = todayAttendances.filter(
    (a) => a.status === 'Hadir' || a.status === 'Terlambat'
  ).length;

  const pendingJournalsCount = relevantJournals.filter((j) => j.status === 'Menunggu Validasi').length;
  const approvedJournalsCount = relevantJournals.filter((j) => j.status === 'Disetujui').length;
  const revisionJournalsCount = relevantJournals.filter((j) => j.status === 'Perlu Revisi').length;

  // Filtered student list
  const filteredStudents = supervisedStudents.filter((s) => {
    if (!searchStudent.trim()) return true;
    const q = searchStudent.toLowerCase();
    const comp = companies.find((c) => c.id === s.companyId);
    return s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q) || (comp?.name.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={supervisor.avatar}
            alt={supervisor.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-amber-50"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{supervisor.name}</h1>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                Pembimbing
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {supervisor.position} &bull; Departemen: <span className="font-semibold text-slate-700">{supervisor.department}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => onNavigate('jurnal')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            Tinjau Jurnal ({pendingJournalsCount})
          </button>
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Siswa Dibimbing */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Siswa Bimbingan</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{supervisedStudents.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Peserta PKL aktif</p>
        </div>

        {/* Hadir Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hadir Hari Ini</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {studentsPresentToday}
            <span className="text-xs font-normal text-slate-400">/{supervisedStudents.length}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Presensi tanggal {todayStr}</p>
        </div>

        {/* Menunggu Validasi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Menunggu Validasi</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{pendingJournalsCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Perlu ditinjau segera</p>
        </div>

        {/* Jurnal Disetujui */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Disetujui</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{approvedJournalsCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Terverifikasi lengkap</p>
        </div>

        {/* Perlu Revisi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Perlu Revisi</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{revisionJournalsCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Menunggu perbaikan siswa</p>
        </div>
      </div>

      {/* Main Supervised Students Table (Section 7) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Daftar Siswa Bimbingan & Pemantauan</h3>
            <p className="text-xs text-slate-500">
              Pantau status kehadiran harian, jurnal terbaru, serta berikan catatan bimbingan langsung.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama siswa atau kelas..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Tempat Magang</th>
                <th className="py-3.5 px-4">Kehadiran Hari Ini</th>
                <th className="py-3.5 px-4">Jurnal Terakhir</th>
                <th className="py-3.5 px-4">Status Jurnal</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((std) => {
                const comp = companies.find((c) => c.id === std.companyId);
                const attToday = attendances.find((a) => a.studentId === std.id && a.date === todayStr);
                const studentJrnls = journals
                  .filter((j) => j.studentId === std.id)
                  .sort((a, b) => b.date.localeCompare(a.date));
                const latestJrn = studentJrnls[0];

                return (
                  <tr key={std.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Nama Siswa */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={std.avatar}
                          alt={std.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{std.name}</div>
                          <div className="text-[11px] text-slate-500">{std.className} &bull; NISN: {std.nisn}</div>
                        </div>
                      </div>
                    </td>

                    {/* Tempat Magang */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium text-slate-900 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate max-w-[160px]">{comp?.name || 'Belum Ditempatkan'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{comp?.city || '-'}</div>
                    </td>

                    {/* Kehadiran */}
                    <td className="py-3.5 px-4">
                      {attToday ? (
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              attToday.status === 'Hadir'
                                ? 'bg-emerald-100 text-emerald-800'
                                : attToday.status === 'Terlambat'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {attToday.status}
                          </span>
                          <span className="block text-[11px] text-slate-500 mt-0.5">
                            Masuk: {attToday.checkInTime}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[11px]">
                          Belum Absen
                        </span>
                      )}
                    </td>

                    {/* Jurnal Terakhir */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {latestJrn ? (
                        <div>
                          <div className="font-medium text-slate-900 truncate max-w-[200px]" title={latestJrn.title}>
                            {latestJrn.title}
                          </div>
                          <div className="text-[11px] text-slate-500">{latestJrn.date}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum membuat jurnal</span>
                      )}
                    </td>

                    {/* Status Jurnal */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {latestJrn ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                            latestJrn.status === 'Disetujui'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : latestJrn.status === 'Perlu Revisi'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {latestJrn.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Aksi Buttons (Lihat Detail, Validasi Jurnal, Beri Catatan, Kirim Pesan) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Validasi Jurnal / Beri Catatan */}
                        {latestJrn && (
                          <button
                            id={`btn-validate-student-${std.id}`}
                            onClick={() => setSelectedJournalToValidate(latestJrn)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold text-[11px] transition-colors"
                            title="Validasi / Beri Catatan Jurnal"
                          >
                            Validasi Jurnal
                          </button>
                        )}

                        {/* Kirim Pesan */}
                        <button
                          id={`btn-message-student-${std.id}`}
                          onClick={() => onOpenMessageWithUser(std.id)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                          title="Kirim Pesan ke Siswa"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Lihat Detail */}
                        <button
                          id={`btn-detail-student-${std.id}`}
                          onClick={() => onNavigate('siswa-bimbingan', { selectedStudentId: std.id })}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Lihat Profil & Riwayat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ditemukan siswa yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Modal if opened */}
      {selectedJournalToValidate && (
        <SupervisorValidationModal
          journal={selectedJournalToValidate}
          onClose={() => setSelectedJournalToValidate(null)}
        />
      )}
    </div>
  );
};
