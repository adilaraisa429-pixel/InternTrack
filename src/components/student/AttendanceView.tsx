import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, AttendanceStatus, AttendanceRecord } from '../../types';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  FileText,
  MapPin,
  Check,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { currentUser, attendances, checkIn, checkOut, companies } = useApp();
  const student = currentUser as Student;

  const [notes, setNotes] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showPermitModal, setShowPermitModal] = useState(false);
  const [permitStatus, setPermitStatus] = useState<AttendanceStatus>('Izin');
  const [permitDate, setPermitDate] = useState(new Date().toISOString().split('T')[0]);
  const [permitNotes, setPermitNotes] = useState('');

  if (!student || student.role !== 'siswa') return null;

  const company = companies.find((c) => c.id === student.companyId);
  const studentAttendances = attendances.filter((a) => a.studentId === student.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = studentAttendances.find((a) => a.date === todayStr);

  // Filtered History
  const filteredRecords = useMemo(() => {
    return studentAttendances
      .filter((rec) => {
        if (statusFilter !== 'All' && rec.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [studentAttendances, statusFilter]);

  // Calendar logic
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sun

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDirectCheckIn = () => {
    checkIn(student.id, notes);
    setNotes('');
  };

  const handleDirectCheckOut = () => {
    checkOut(student.id, notes);
    setNotes('');
  };

  const handleSubmitPermit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitNotes.trim()) return;
    checkIn(student.id, permitNotes, permitStatus, 'Rumah/Dokter');
    setShowPermitModal(false);
    setPermitNotes('');
  };

  const getStatusBadgeColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'Hadir':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Terlambat':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Izin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sakit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Tidak hadir':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Presensi & Kehadiran Magang</h2>
          <p className="text-xs text-slate-500">
            Catat absensi masuk, pulang, serta pantau rekap kehadiran bulananmu secara akurat.
          </p>
        </div>
        <button
          id="btn-open-permit-modal"
          onClick={() => setShowPermitModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          Ajukan Izin / Sakit
        </button>
      </div>

      {/* Main Check-in / Check-out Interactive Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Clock and Live Status */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Hari Ini &bull; {todayStr}
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {todayRecord ? (
                  <span className="flex items-center gap-2">
                    Status: <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getStatusBadgeColor(todayRecord.status)}`}>{todayRecord.status}</span>
                  </span>
                ) : (
                  'Belum Melakukan Presensi'
                )}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                <span>
                  Masuk: <strong className="text-slate-800">{todayRecord?.checkInTime || '-'}</strong>
                </span>
                <span>
                  Pulang: <strong className="text-slate-800">{todayRecord?.checkOutTime || '-'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              id="input-attendance-note"
              placeholder="Catatan aktivitas singkat (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />

            {!todayRecord ? (
              <button
                id="btn-submit-checkin"
                onClick={handleDirectCheckIn}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap"
              >
                <CalendarCheck className="w-4 h-4" />
                Check-in Masuk
              </button>
            ) : !todayRecord.checkOutTime ? (
              <button
                id="btn-submit-checkout"
                onClick={handleDirectCheckOut}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap"
              >
                <Clock className="w-4 h-4" />
                Check-out Pulang
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                <Check className="w-4 h-4 text-emerald-600" />
                Presensi Hari Ini Selesai
              </div>
            )}
          </div>
        </div>

        {/* Location indication */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Lokasi Presensi: <strong>{company?.name || 'Kantor / Lokasi Magang'}</strong> ({company?.address || 'Bandung'})</span>
        </div>
      </div>

      {/* Calendar and Attendance Statistics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Widget */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Kalender Kehadiran &bull; {monthNames[selectedMonth]} {selectedYear}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="font-bold text-slate-400 py-1">
                {day}
              </div>
            ))}

            {/* Empty offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-10 sm:h-12 rounded-xl bg-slate-50/50"></div>
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const att = studentAttendances.find((a) => a.date === dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  className={`h-11 sm:h-14 p-1 rounded-xl border transition-all flex flex-col justify-between items-center ${
                    att
                      ? att.status === 'Hadir'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-bold'
                        : att.status === 'Terlambat'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950 font-bold'
                        : att.status === 'Izin'
                        ? 'bg-blue-50/80 border-blue-200 text-blue-950 font-bold'
                        : 'bg-purple-50/80 border-purple-200 text-purple-950 font-bold'
                      : isToday
                      ? 'bg-blue-50/50 border-blue-400 font-bold text-blue-700'
                      : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                  }`}
                  title={att ? `${dateStr}: ${att.status} (${att.checkInTime || '-'})` : dateStr}
                >
                  <span className="text-[11px] sm:text-xs">{dayNum}</span>
                  {att && (
                    <span
                      className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded-md font-bold uppercase tracking-tight ${
                        att.status === 'Hadir'
                          ? 'bg-emerald-200 text-emerald-900'
                          : att.status === 'Terlambat'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-blue-200 text-blue-900'
                      }`}
                    >
                      {att.status.slice(0, 3)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Hadir
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span> Terlambat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span> Izin
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span> Sakit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span> Alpa/Tidak Hadir
            </span>
          </div>
        </div>

        {/* Attendance Summary Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Statistik Kehadiran</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-900">Total Hadir Tepat Waktu</span>
                <span className="text-lg font-bold text-emerald-700">
                  {studentAttendances.filter((a) => a.status === 'Hadir').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-xs font-semibold text-amber-900">Total Terlambat</span>
                <span className="text-lg font-bold text-amber-700">
                  {studentAttendances.filter((a) => a.status === 'Terlambat').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-xs font-semibold text-blue-900">Total Izin / Sakit</span>
                <span className="text-lg font-bold text-blue-700">
                  {studentAttendances.filter((a) => a.status === 'Izin' || a.status === 'Sakit').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Persentase Kehadiran</span>
                <span className="text-lg font-bold text-blue-600">
                  {studentAttendances.length > 0
                    ? `${Math.round(
                        (studentAttendances.filter((a) => a.status === 'Hadir' || a.status === 'Terlambat').length /
                          studentAttendances.length) *
                          100
                      )}%`
                    : '100%'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900">
            <h4 className="font-bold flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Ketentuan Jam Kerja PKL
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Jam Masuk: Maksimal pukul <strong>08.00 WIB</strong></li>
              <li>Jam Pulang: Minimal pukul <strong>16.30 WIB</strong></li>
              <li>Presensi terlambat otomatis tercatat dan dapat dilihat oleh pembimbing industri & sekolah.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Riwayat Presensi Lengkap</h3>
            <p className="text-xs text-slate-500">Daftar rekaman waktu datang dan pulang</p>
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="filter-attendance-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="All">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Tidak hadir">Tidak hadir</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Jam Masuk</th>
                <th className="py-3.5 px-4">Jam Pulang</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Lokasi & Keterangan</th>
                <th className="py-3.5 px-4 text-center">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{item.date}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{item.checkInTime}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{item.checkOutTime || '-'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadgeColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                    <div className="truncate font-medium text-slate-800">{item.location || company?.name}</div>
                    <div className="truncate text-slate-500 text-[11px]">{item.notes || '-'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.verifiedBySupervisor ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Menunggu</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada data presensi yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ajukan Izin/Sakit Modal */}
      {showPermitModal && (
        <div
          id="modal-permit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Pengajuan Izin / Sakit</h3>
            <p className="text-xs text-slate-500 mb-4">
              Lengkapi informasi alasan ketidakhadiran magang untuk diteruskan ke pembimbing.
            </p>

            <form onSubmit={handleSubmitPermit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Jenis Keterangan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPermitStatus('Izin')}
                    className={`py-2 text-xs font-semibold rounded-xl border ${
                      permitStatus === 'Izin'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Izin Khusus
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermitStatus('Sakit')}
                    className={`py-2 text-xs font-semibold rounded-xl border ${
                      permitStatus === 'Sakit'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Sakit (Dengan Surat)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={permitDate}
                  onChange={(e) => setPermitDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Alasan / Keterangan Lengkap</label>
                <textarea
                  required
                  rows={3}
                  value={permitNotes}
                  onChange={(e) => setPermitNotes(e.target.value)}
                  placeholder="Jelaskan alasan izin atau kondisi sakit..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPermitModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
