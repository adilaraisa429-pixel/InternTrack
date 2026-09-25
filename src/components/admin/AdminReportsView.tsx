import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Filter,
} from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const { students, companies, attendances, journals, supervisors, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'attendance' | 'journals' | 'companies' | 'final'>('attendance');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedCompanyId, setSelectedCompanyId] = useState('All');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedClass !== 'All' && s.className !== selectedClass) return false;
    if (selectedCompanyId !== 'All' && s.companyId !== selectedCompanyId) return false;
    return true;
  });

  // Calculate stats for each student
  const studentStats = filteredStudents.map((std) => {
    const studentAtts = attendances.filter(
      (a) => a.studentId === std.id && a.date >= startDate && a.date <= endDate
    );
    const hadir = studentAtts.filter((a) => a.status === 'Hadir').length;
    const terlambat = studentAtts.filter((a) => a.status === 'Terlambat').length;
    const izin = studentAtts.filter((a) => a.status === 'Izin').length;
    const sakit = studentAtts.filter((a) => a.status === 'Sakit').length;
    const alpa = studentAtts.filter((a) => a.status === 'Alpa').length;

    const totalDays = studentAtts.length || 1;
    const attendanceRate = Math.round(((hadir + terlambat) / totalDays) * 100);

    const studentJournals = journals.filter(
      (j) => j.studentId === std.id && j.date >= startDate && j.date <= endDate
    );
    const approvedJrn = studentJournals.filter((j) => j.status === 'Disetujui').length;
    const pendingJrn = studentJournals.filter((j) => j.status === 'Menunggu Validasi').length;
    const revisionJrn = studentJournals.filter((j) => j.status === 'Perlu Revisi').length;

    const comp = companies.find((c) => c.id === std.companyId);
    const sup = supervisors.find((s) => s.id === std.supervisorId);

    return {
      student: std,
      company: comp,
      supervisor: sup,
      attendance: { hadir, terlambat, izin, sakit, alpa, total: studentAtts.length, rate: attendanceRate },
      journals: { total: studentJournals.length, approved: approvedJrn, pending: pendingJrn, revision: revisionJrn },
    };
  });

  // Export to CSV Function
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'attendance') {
      csvContent += 'NISN,Nama Siswa,Kelas,Perusahaan,Hadir,Terlambat,Izin,Sakit,Alpa,Persentase Kehadiran\n';
      studentStats.forEach((row) => {
        csvContent += `"${row.student.nisn}","${row.student.name}","${row.student.className}","${row.company?.name || '-'}","${row.attendance.hadir}","${row.attendance.terlambat}","${row.attendance.izin}","${row.attendance.sakit}","${row.attendance.alpa}","${row.attendance.rate}%"\n`;
      });
    } else {
      csvContent += 'NISN,Nama Siswa,Kelas,Perusahaan,Total Jurnal,Disetujui,Menunggu Validasi,Perlu Revisi\n';
      studentStats.forEach((row) => {
        csvContent += `"${row.student.nisn}","${row.student.name}","${row.student.className}","${row.company?.name || '-'}","${row.journals.total}","${row.journals.approved}","${row.journals.pending}","${row.journals.revision}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Magang_InternTrack_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'File Excel/CSV berhasil diunduh!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Rekapitulasi & Laporan Magang</h2>
          <p className="text-xs text-slate-500">
            Laporan kehadiran siswa, verifikasi jurnal kegiatan, dan data evaluasi berkala.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-excel"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel (CSV)
          </button>

          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Rekap Kehadiran Presensi
        </button>
        <button
          onClick={() => setActiveTab('journals')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'journals'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Rekap Kegiatan Jurnal
        </button>
        <button
          onClick={() => setActiveTab('final')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'final'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan Akhir Magang Siswa
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-medium text-slate-600 mb-1">Filter Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 font-medium"
          >
            <option value="All">Semua Kelas</option>
            <option value="XII RPL 1">XII RPL 1</option>
            <option value="XII RPL 2">XII RPL 2</option>
            <option value="XII TKJ 2">XII TKJ 2</option>
            <option value="XII Desain Grafis">XII Desain Grafis</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-1">Filter Perusahaan Mitra</label>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 font-medium"
          >
            <option value="All">Semua Mitra</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-1">Mulai Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-1">Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800"
          />
        </div>
      </div>

      {/* Main Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-xs text-slate-800">
            Hasil Laporan: {studentStats.length} Siswa Terpilih ({startDate} s.d {endDate})
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            SMK Pusat Keunggulan - Hubungan Industri (BKK)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              {activeTab === 'attendance' && (
                <tr>
                  <th className="py-3 px-4">Nama Siswa & NISN</th>
                  <th className="py-3 px-4">Perusahaan Mitra</th>
                  <th className="py-3 px-3 text-center text-emerald-700">Hadir</th>
                  <th className="py-3 px-3 text-center text-amber-700">Terlambat</th>
                  <th className="py-3 px-3 text-center text-blue-700">Izin</th>
                  <th className="py-3 px-3 text-center text-indigo-700">Sakit</th>
                  <th className="py-3 px-3 text-center text-rose-700">Alpa</th>
                  <th className="py-3 px-4 text-right">Persentase</th>
                </tr>
              )}

              {activeTab === 'journals' && (
                <tr>
                  <th className="py-3 px-4">Nama Siswa & NISN</th>
                  <th className="py-3 px-4">Perusahaan</th>
                  <th className="py-3 px-3 text-center">Total Jurnal</th>
                  <th className="py-3 px-3 text-center text-emerald-700">Disetujui</th>
                  <th className="py-3 px-3 text-center text-amber-700">Menunggu</th>
                  <th className="py-3 px-3 text-center text-rose-700">Perlu Revisi</th>
                  <th className="py-3 px-4 text-right">Tingkat Validasi</th>
                </tr>
              )}

              {activeTab === 'final' && (
                <tr>
                  <th className="py-3 px-4">Nama Siswa & Kelas</th>
                  <th className="py-3 px-4">Mitra Magang</th>
                  <th className="py-3 px-4">Pembimbing</th>
                  <th className="py-3 px-3 text-center">Kehadiran</th>
                  <th className="py-3 px-3 text-center">Jurnal Valid</th>
                  <th className="py-3 px-4 text-right">Status Akhir</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentStats.map((row) => (
                <tr key={row.student.id} className="hover:bg-slate-50/50">
                  {/* Common Student Name */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{row.student.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {row.student.className} &bull; {row.student.nisn}
                    </div>
                  </td>

                  {/* Company */}
                  <td className="py-3 px-4 text-slate-700">
                    <div className="font-medium text-slate-900">{row.company?.name || 'Belum Ditempatkan'}</div>
                    <div className="text-[11px] text-slate-400">{row.company?.city}</div>
                  </td>

                  {/* Attendance Columns */}
                  {activeTab === 'attendance' && (
                    <>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">{row.attendance.hadir}</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-700">{row.attendance.terlambat}</td>
                      <td className="py-3 px-3 text-center font-bold text-blue-700">{row.attendance.izin}</td>
                      <td className="py-3 px-3 text-center font-bold text-indigo-700">{row.attendance.sakit}</td>
                      <td className="py-3 px-3 text-center font-bold text-rose-700">{row.attendance.alpa}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold text-xs px-2.5 py-0.5 rounded-full ${
                            row.attendance.rate >= 85
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.attendance.rate >= 75
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {row.attendance.rate}%
                        </span>
                      </td>
                    </>
                  )}

                  {/* Journal Columns */}
                  {activeTab === 'journals' && (
                    <>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">{row.journals.total}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">{row.journals.approved}</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-700">{row.journals.pending}</td>
                      <td className="py-3 px-3 text-center font-bold text-rose-700">{row.journals.revision}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-xs text-blue-700">
                          {row.journals.total > 0
                            ? Math.round((row.journals.approved / row.journals.total) * 100)
                            : 0}
                          % Selesai
                        </span>
                      </td>
                    </>
                  )}

                  {/* Final Report Summary */}
                  {activeTab === 'final' && (
                    <>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium text-slate-900">{row.supervisor?.name || '-'}</div>
                        <div className="text-[11px] text-slate-400">{row.supervisor?.position}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">
                        {row.attendance.hadir + row.attendance.terlambat} Hari ({row.attendance.rate}%)
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-emerald-700">
                        {row.journals.approved} Jurnal
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            row.student.status === 'Aktif'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {row.student.status}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
