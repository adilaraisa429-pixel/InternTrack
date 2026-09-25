import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Building2,
  UserCheck,
  CalendarCheck,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Megaphone,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { students, supervisors, companies, attendances, journals, announcements } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter((a) => a.date === todayStr);

  const hadirToday = todayAttendances.filter((a) => a.status === 'Hadir' || a.status === 'Terlambat').length;
  const pendingJournals = journals.filter((j) => j.status === 'Menunggu Validasi').length;
  const approvedJournals = journals.filter((j) => j.status === 'Disetujui').length;
  const revisionJournals = journals.filter((j) => j.status === 'Perlu Revisi').length;

  // Status Distribution
  const activeStudents = students.filter((s) => s.status === 'Aktif').length;
  const completedStudents = students.filter((s) => s.status === 'Selesai').length;
  const waitingPlacement = students.filter((s) => s.status === 'Menunggu Penempatan').length;

  // Attendance rate
  const totalAtt = attendances.length || 1;
  const attHadir = attendances.filter((a) => a.status === 'Hadir').length;
  const attTerlambat = attendances.filter((a) => a.status === 'Terlambat').length;
  const attIzin = attendances.filter((a) => a.status === 'Izin').length;
  const attSakit = attendances.filter((a) => a.status === 'Sakit').length;

  const pctHadir = Math.round((attHadir / totalAtt) * 100);
  const pctTerlambat = Math.round((attTerlambat / totalAtt) * 100);
  const pctIzinSakit = Math.round(((attIzin + attSakit) / totalAtt) * 100);

  // Weekly Journals simulated counts (Last 5 weeks)
  const weeklyData = [
    { week: 'Minggu 1', count: 18, heightPct: 45 },
    { week: 'Minggu 2', count: 26, heightPct: 65 },
    { week: 'Minggu 3', count: 32, heightPct: 80 },
    { week: 'Minggu 4', count: 40, heightPct: 100 },
    { week: 'Minggu 5', count: journals.length, heightPct: 70 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
              Admin Hubin & BKK
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Pusat Kendali Manajemen Magang Siswa
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau seluruh aktivitas presensi, verifikasi jurnal industri, data mitra perusahaan, dan laporan siswa.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => onNavigate('laporan')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Rekap & Cetak Laporan
          </button>
        </div>
      </div>

      {/* 7 Core Overview Statistics Cards (Section 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total Siswa */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Total Siswa</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{students.length}</div>
          <span className="text-[10px] text-slate-500">Peserta magang</span>
        </div>

        {/* Total Perusahaan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Perusahaan</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{companies.length}</div>
          <span className="text-[10px] text-slate-500">Mitra DUDI</span>
        </div>

        {/* Total Pembimbing */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Pembimbing</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{supervisors.length}</div>
          <span className="text-[10px] text-slate-500">Guru & Mentor</span>
        </div>

        {/* Hadir Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Hadir Hari Ini</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {hadirToday}
            <span className="text-xs font-normal text-slate-400">/{students.length}</span>
          </div>
          <span className="text-[10px] text-slate-500">Check-in hari ini</span>
        </div>

        {/* Menunggu Validasi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Antrean Jurnal</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{pendingJournals}</div>
          <span className="text-[10px] text-slate-500">Menunggu review</span>
        </div>

        {/* Jurnal Disetujui */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Disetujui</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{approvedJournals}</div>
          <span className="text-[10px] text-slate-500">Jurnal valid</span>
        </div>

        {/* Perlu Revisi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Perlu Revisi</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{revisionJournals}</div>
          <span className="text-[10px] text-slate-500">Menunggu revisi</span>
        </div>
      </div>

      {/* 3 Interactive Graphs / Visual Analytics (Section 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph 1: Statistik Kehadiran (Donut SVG + Breakdown) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-blue-600" />
                Statistik Kehadiran Siswa
              </h3>
              <p className="text-[11px] text-slate-500">Distribusi seluruh rekaman presensi</p>
            </div>
          </div>

          <div className="flex items-center justify-center my-4">
            {/* Donut graphic */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3.5" />
                {/* Hadir */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray={`${pctHadir} ${100 - pctHadir}`}
                  strokeDashoffset="0"
                />
                {/* Terlambat */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeDasharray={`${pctTerlambat} ${100 - pctTerlambat}`}
                  strokeDashoffset={`-${pctHadir}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-slate-900">{pctHadir}%</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Tepat Waktu</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Hadir Tepat Waktu
              </span>
              <span className="font-bold text-slate-800">{attHadir} log ({pctHadir}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Terlambat
              </span>
              <span className="font-bold text-slate-800">{attTerlambat} log ({pctTerlambat}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Izin / Sakit
              </span>
              <span className="font-bold text-slate-800">{attIzin + attSakit} log ({pctIzinSakit}%)</span>
            </div>
          </div>
        </div>

        {/* Graph 2: Jumlah Jurnal per Minggu (Bar Chart SVG) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Aktivitas Jurnal per Minggu
              </h3>
              <p className="text-[11px] text-slate-500">Tren pengiriman laporan magang</p>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
            {weeklyData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600">
                  {item.count}
                </div>
                <div className="w-full bg-slate-100 rounded-t-lg h-28 flex items-end overflow-hidden">
                  <div
                    className="w-full bg-blue-600 group-hover:bg-blue-700 transition-all rounded-t-lg"
                    style={{ height: `${item.heightPct}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  {item.week.replace('Minggu ', 'M-')}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata: <strong>28 jurnal/minggu</strong></span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14% keaktifan
            </span>
          </div>
        </div>

        {/* Graph 3: Distribusi Status Siswa */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Distribusi Status Siswa
              </h3>
              <p className="text-[11px] text-slate-500">Status kelangsungan penempatan magang</p>
            </div>
          </div>

          <div className="space-y-4 my-2">
            {/* Aktif */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Aktif Berjalan di Industri</span>
                <span className="font-bold text-slate-900">
                  {activeStudents} Siswa ({Math.round((activeStudents / (students.length || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.round((activeStudents / (students.length || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Selesai */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Telah Menyelesaikan Magang</span>
                <span className="font-bold text-slate-900">
                  {completedStudents} Siswa ({Math.round((completedStudents / (students.length || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.round((completedStudents / (students.length || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Menunggu */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Menunggu Penempatan Baru</span>
                <span className="font-bold text-slate-900">
                  {waitingPlacement} Siswa ({Math.round((waitingPlacement / (students.length || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${Math.round((waitingPlacement / (students.length || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('penempatan')}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              Kelola Penempatan Magang <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards to Admin Management Modules */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Modul Manajemen & Layanan BKK</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <button
            onClick={() => onNavigate('data-siswa')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all"
          >
            <Users className="w-5 h-5 text-blue-600 mb-1.5" />
            <div className="font-bold text-slate-900">Data Siswa</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Kelola {students.length} peserta PKL</p>
          </button>

          <button
            onClick={() => onNavigate('perusahaan')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all"
          >
            <Building2 className="w-5 h-5 text-indigo-600 mb-1.5" />
            <div className="font-bold text-slate-900">Mitra Perusahaan</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Kelola {companies.length} mitra industri</p>
          </button>

          <button
            onClick={() => onNavigate('data-pembimbing')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-left transition-all"
          >
            <UserCheck className="w-5 h-5 text-amber-600 mb-1.5" />
            <div className="font-bold text-slate-900">Data Pembimbing</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Guru & mentor industri</p>
          </button>

          <button
            onClick={() => onNavigate('pengumuman')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all"
          >
            <Megaphone className="w-5 h-5 text-purple-600 mb-1.5" />
            <div className="font-bold text-slate-900">Pengumuman</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Kirim info resmi sekolah</p>
          </button>
        </div>
      </div>
    </div>
  );
};
