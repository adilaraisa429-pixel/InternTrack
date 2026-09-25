import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  CalendarCheck,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  UserCheck,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  FileCheck,
  Megaphone,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (tab: string, extraData?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentUser, companies, supervisors, attendances, journals, announcements, checkIn, checkOut } = useApp();
  const student = currentUser as Student;

  const [checkInNotes, setCheckInNotes] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  if (!student || student.role !== 'siswa') return null;

  const company = companies.find((c) => c.id === student.companyId);
  const supervisor = supervisors.find((s) => s.id === student.supervisorId);

  // Student specific data
  const studentAttendances = attendances.filter((a) => a.studentId === student.id);
  const studentJournals = journals.filter((j) => j.studentId === student.id);

  // Today's attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = studentAttendances.find((a) => a.date === todayStr);

  // Journal stats
  const totalSent = studentJournals.length;
  const totalValidated = studentJournals.filter((j) => j.status === 'Disetujui').length;
  const totalPending = studentJournals.filter((j) => j.status === 'Menunggu Validasi').length;
  const totalRevision = studentJournals.filter((j) => j.status === 'Perlu Revisi').length;

  // Active days count (days attended)
  const attendedDaysCount = studentAttendances.filter(
    (a) => a.status === 'Hadir' || a.status === 'Terlambat'
  ).length;

  // Latest urgent announcement
  const activeAnnouncement = announcements.find((a) => a.isActive);

  const handleQuickCheckIn = () => {
    checkIn(student.id, checkInNotes);
    setShowCheckInModal(false);
    setCheckInNotes('');
  };

  const handleQuickCheckOut = () => {
    checkOut(student.id, 'Check out selesai tugas harian');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Announcements Alert */}
      {activeAnnouncement && (
        <div
          id="announcement-banner"
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-amber-900 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-200/80 text-amber-800 px-2 py-0.5 rounded-md">
                  {activeAnnouncement.priority}
                </span>
                <span className="text-xs text-amber-700">{activeAnnouncement.date}</span>
              </div>
              <h4 className="text-sm font-bold text-amber-950 mt-1">{activeAnnouncement.title}</h4>
              <p className="text-xs text-amber-800/90 mt-0.5 line-clamp-2">{activeAnnouncement.content}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('pengumuman')}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0 whitespace-nowrap self-center"
          >
            Lihat Semua
          </button>
        </div>
      )}

      {/* Hero Profile & Identity Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-blue-50 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{student.name}</h1>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Magang {student.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                NISN: <span className="font-semibold text-slate-700">{student.nisn}</span> &bull; Kelas:{' '}
                <span className="font-semibold text-slate-700">{student.className}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-medium text-slate-800">{company?.name || 'Belum Ditempatkan'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    Pembimbing: <strong className="text-slate-800">{supervisor?.name || 'Belum Ditugaskan'}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            {!todayAttendance ? (
              <button
                id="btn-quick-checkin"
                onClick={() => setShowCheckInModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Check-in Hari Ini</span>
              </button>
            ) : !todayAttendance.checkOutTime ? (
              <button
                id="btn-quick-checkout"
                onClick={handleQuickCheckOut}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Check-out Pulang</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Absensi Hari Ini Lengkap</span>
              </div>
            )}

            <button
              id="btn-quick-add-journal"
              onClick={() => onNavigate('jurnal', { openCreateModal: true })}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Jurnal</span>
            </button>
          </div>
        </div>

        {/* Action Link shortcuts */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={() => onNavigate('jurnal')}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors flex items-center gap-1"
          >
            Lihat Jurnal <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('absensi')}
            className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
          >
            Lihat Kehadiran <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('dokumentasi')}
            className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
          >
            Galeri Dokumentasi <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Needs Revision Warning Banner if any */}
      {totalRevision > 0 && (
        <div
          id="revision-alert-box"
          className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-rose-900 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950">Ada {totalRevision} Jurnal Perlu Direvisi!</h4>
              <p className="text-xs text-rose-800">
                Pembimbing telah memberikan catatan perbaikan. Klik untuk melihat dan mengirim ulang.
              </p>
            </div>
          </div>
          <button
            id="btn-fix-revisions"
            onClick={() => onNavigate('jurnal', { filter: 'Perlu Revisi' })}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
          >
            Buka Revisi
          </button>
        </div>
      )}

      {/* Grid of Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hari Magang */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Hari Magang</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{attendedDaysCount}</span>
            <span className="text-xs text-slate-500">/ {student.totalRequiredDays} hari target</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, Math.round((attendedDaysCount / student.totalRequiredDays) * 100))}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {Math.round((attendedDaysCount / student.totalRequiredDays) * 100)}% terselesaikan
          </p>
        </div>

        {/* Kehadiran Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Kehadiran Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            {todayAttendance ? (
              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    todayAttendance.status === 'Hadir'
                      ? 'bg-emerald-100 text-emerald-800'
                      : todayAttendance.status === 'Terlambat'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {todayAttendance.status}
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Masuk: <strong className="text-slate-800">{todayAttendance.checkInTime}</strong>
                  {todayAttendance.checkOutTime && (
                    <>
                      {' '}&bull; Pulang: <strong className="text-slate-800">{todayAttendance.checkOutTime}</strong>
                    </>
                  )}
                </p>
              </div>
            ) : (
              <div>
                <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
                  Belum Check-in
                </span>
                <p className="text-xs text-slate-400 mt-2">Silakan tekan tombol Check-in</p>
              </div>
            )}
          </div>
        </div>

        {/* Jurnal Disetujui */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Jurnal Divalidasi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{totalValidated}</span>
            <span className="text-xs text-slate-500">dari {totalSent} jurnal terkirim</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Telah diverifikasi oleh pembimbing</p>
        </div>

        {/* Menunggu Validasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Menunggu Validasi</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">{totalPending}</span>
            <span className="text-xs text-slate-500">jurnal dalam antrean</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Menunggu tinjauan pembimbing</p>
        </div>
      </div>

      {/* Recent Activity & Quick Jurnal Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Latest Journals */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Jurnal Kegiatan Terbaru</h3>
              <p className="text-xs text-slate-500">Catatan aktivitas magang yang baru kamu isi</p>
            </div>
            <button
              onClick={() => onNavigate('jurnal')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua ({studentJournals.length}) &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {studentJournals.slice(0, 3).map((journal) => (
              <div
                key={journal.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-slate-50/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-500">{journal.date}</span>
                      <span className="text-[11px] text-slate-400">&bull; {journal.startTime} - {journal.endTime} WIB</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{journal.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{journal.description}</p>
                  </div>

                  <span
                    className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      journal.status === 'Disetujui'
                        ? 'bg-emerald-100 text-emerald-800'
                        : journal.status === 'Perlu Revisi'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {journal.status}
                  </span>
                </div>

                {journal.status === 'Perlu Revisi' && journal.supervisorNotes && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <strong className="font-semibold">Catatan Pembimbing:</strong> {journal.supervisorNotes}
                  </div>
                )}
              </div>
            ))}

            {studentJournals.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Belum ada jurnal yang dicatat. Buat jurnal kegiatan pertamamu!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Info & Contact */}
        <div className="space-y-6">
          {/* Supervisor Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Informasi Pembimbing</h3>
            {supervisor ? (
              <div className="flex items-start gap-3">
                <img
                  src={supervisor.avatar}
                  alt={supervisor.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                  referrerPolicy="no-referrer"
                />
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{supervisor.name}</h4>
                  <p className="text-xs text-slate-500">{supervisor.position}</p>
                  <p className="text-xs text-slate-600 mt-1 font-mono">{supervisor.phone || '0812-xxxx-xxxx'}</p>
                  <button
                    onClick={() => onNavigate('pesan')}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors"
                  >
                    Kirim Pesan
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Pembimbing belum dialokasikan.</p>
            )}
          </div>

          {/* Company Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Tempat Magang</h3>
            {company ? (
              <div>
                <h4 className="text-sm font-bold text-slate-900">{company.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{company.sector}</p>
                <p className="text-xs text-slate-600 mt-2">{company.address}, {company.city}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>Kontak: {company.contactPerson} ({company.contactPhone})</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Belum ada data perusahaan.</p>
            )}
          </div>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div
          id="modal-checkin"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Check-in Kehadiran Harian</h3>
            <p className="text-xs text-slate-500 mb-4">
              Konfirmasi kehadiranmu untuk tanggal <strong>{todayStr}</strong> di {company?.name || 'Tempat Magang'}.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Keterangan / Catatan Kegiatan Hari Ini (Opsional)
                </label>
                <textarea
                  id="input-checkin-notes"
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="Contoh: Hadir di kantor tepat waktu, standby untuk sprint meeting."
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  id="btn-cancel-checkin"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="btn-confirm-checkin"
                  onClick={handleQuickCheckIn}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Konfirmasi Check-in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
