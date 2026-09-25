import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, JournalEntry, Supervisor } from '../../types';
import { SupervisorValidationModal } from './SupervisorValidationModal';
import {
  Users,
  Search,
  Building2,
  CalendarCheck,
  BookOpen,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

interface SupervisorStudentsViewProps {
  initialStudentId?: string;
  onOpenMessageWithUser: (userId: string) => void;
}

export const SupervisorStudentsView: React.FC<SupervisorStudentsViewProps> = ({
  initialStudentId,
  onOpenMessageWithUser,
}) => {
  const { currentUser, students, companies, attendances, journals } = useApp();
  const supervisor = currentUser as Supervisor;

  const supervisedStudents = students.filter(
    (s) => s.supervisorId === supervisor?.id || supervisor?.isIndustryMentor === false
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (supervisedStudents[0]?.id || '')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournalToValidate, setSelectedJournalToValidate] = useState<JournalEntry | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const studentCompany = companies.find((c) => c.id === selectedStudent?.companyId);

  // Student specific records
  const studentAttendances = attendances
    .filter((a) => a.studentId === selectedStudentId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const studentJournals = journals
    .filter((j) => j.studentId === selectedStudentId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const presentCount = studentAttendances.filter((a) => a.status === 'Hadir' || a.status === 'Terlambat').length;

  const filteredStudents = supervisedStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pemantauan Siswa Bimbingan</h2>
          <p className="text-xs text-slate-500">
            Daftar lengkap peserta magang di bawah bimbingan Anda beserta evaluasi kemajuan kerja.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Student Selector on Left, Detail Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Cards List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative mb-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            {filteredStudents.map((std) => {
              const comp = companies.find((c) => c.id === std.companyId);
              const isSelected = std.id === selectedStudentId;
              const pendingCount = journals.filter(
                (j) => j.studentId === std.id && j.status === 'Menunggu Validasi'
              ).length;

              return (
                <button
                  key={std.id}
                  onClick={() => setSelectedStudentId(std.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={std.avatar}
                    alt={std.name}
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{std.name}</h4>
                      {pendingCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                          {pendingCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{std.className}</p>
                    <p className="text-[11px] text-slate-700 font-medium truncate mt-1">
                      {comp?.name || 'Belum Ditempatkan'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-dive Student Detail View (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedStudent ? (
            <>
              {/* Header Dossier */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                      <p className="text-xs text-slate-500">
                        Kelas: <strong className="text-slate-700">{selectedStudent.className}</strong> &bull; NISN:{' '}
                        <strong className="text-slate-700">{selectedStudent.nisn}</strong>
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedStudent.email}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedStudent.phone || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenMessageWithUser(selectedStudent.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Kirim Pesan
                  </button>
                </div>

                {/* Placement & Progress metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Tempat Magang:</span>
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{studentCompany?.name}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{studentCompany?.address}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Periode Magang:</span>
                    <p className="font-semibold text-slate-800">
                      {selectedStudent.internshipStartDate} s.d. {selectedStudent.internshipEndDate}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Target: {selectedStudent.totalRequiredDays} hari</p>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Capaian Kehadiran:</span>
                    <div className="font-bold text-emerald-700 text-base">
                      {presentCount} / {selectedStudent.totalRequiredDays} Hari
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((presentCount / selectedStudent.totalRequiredDays) * 100)
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Journals for Validation */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    Riwayat Jurnal Kegiatan ({studentJournals.length})
                  </h4>
                </div>

                <div className="space-y-3">
                  {studentJournals.map((journal) => (
                    <div
                      key={journal.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <span className="font-semibold text-slate-800">{journal.date}</span>
                            <span>&bull;</span>
                            <span>{journal.startTime} - {journal.endTime} WIB</span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm">{journal.title}</h5>
                          <p className="text-slate-600 mt-1 line-clamp-2">{journal.description}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                              journal.status === 'Disetujui'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : journal.status === 'Perlu Revisi'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            {journal.status}
                          </span>

                          <button
                            onClick={() => setSelectedJournalToValidate(journal)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Periksa / Validasi
                          </button>
                        </div>
                      </div>

                      {journal.supervisorNotes && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                          <strong className="text-slate-900">Catatan Pembimbing:</strong> {journal.supervisorNotes}
                        </div>
                      )}
                    </div>
                  ))}

                  {studentJournals.length === 0 && (
                    <p className="text-center py-6 text-slate-400 text-xs">Siswa belum memiliki jurnal kegiatan.</p>
                  )}
                </div>
              </div>

              {/* Attendance Log Table for this student */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  Rekap Presensi Siswa ({studentAttendances.length} Hari)
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">Jam Masuk</th>
                        <th className="py-2.5 px-3">Jam Pulang</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentAttendances.slice(0, 7).map((att) => (
                        <tr key={att.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{att.date}</td>
                          <td className="py-2.5 px-3 font-mono">{att.checkInTime}</td>
                          <td className="py-2.5 px-3 font-mono">{att.checkOutTime || '-'}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                att.status === 'Hadir'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : att.status === 'Terlambat'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {att.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs">{att.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Pilih siswa di sebelah kiri untuk melihat detail bimbingan.</p>
            </div>
          )}
        </div>
      </div>

      {selectedJournalToValidate && (
        <SupervisorValidationModal
          journal={selectedJournalToValidate}
          onClose={() => setSelectedJournalToValidate(null)}
        />
      )}
    </div>
  );
};
