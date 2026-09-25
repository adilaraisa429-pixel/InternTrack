import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supervisor, JournalEntry } from '../../types';
import { SupervisorValidationModal } from './SupervisorValidationModal';
import {
  BookOpen,
  Filter,
  Search,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Eye,
  User,
  Building2,
} from 'lucide-react';

interface SupervisorJournalsViewProps {
  initialFilter?: string;
}

export const SupervisorJournalsView: React.FC<SupervisorJournalsViewProps> = ({ initialFilter }) => {
  const { currentUser, students, companies, journals } = useApp();
  const supervisor = currentUser as Supervisor;

  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);

  if (!supervisor || supervisor.role !== 'pembimbing') return null;

  // Find students under this supervisor
  const supervisedStudents = students.filter(
    (s) => s.supervisorId === supervisor.id || supervisor.isIndustryMentor === false
  );
  const supervisedStudentIds = supervisedStudents.map((s) => s.id);

  const relevantJournals = journals.filter((j) => supervisedStudentIds.includes(j.studentId));

  const filteredJournals = relevantJournals
    .filter((j) => {
      if (statusFilter !== 'All' && j.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const std = students.find((s) => s.id === j.studentId);
        return (
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          std?.name.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Validasi Jurnal Kegiatan Siswa</h2>
          <p className="text-xs text-slate-500">
            Periksa laporan aktivitas harian siswa bimbingan, berikan evaluasi persetujuan, atau catatan revisi.
          </p>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            id="search-supervisor-journals"
            type="text"
            placeholder="Cari judul jurnal, nama siswa, atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Menunggu Validasi', 'Disetujui', 'Perlu Revisi'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'All' ? 'Semua Jurnal' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Journal Cards List */}
      <div className="space-y-4">
        {filteredJournals.map((journal) => {
          const student = students.find((s) => s.id === journal.studentId);
          const company = companies.find((c) => c.id === student?.companyId);

          return (
            <div
              key={journal.id}
              className={`bg-white rounded-2xl p-6 border transition-all shadow-xs ${
                journal.status === 'Menunggu Validasi'
                  ? 'border-amber-300 ring-2 ring-amber-50'
                  : journal.status === 'Perlu Revisi'
                  ? 'border-rose-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Student Tag Header */}
                  <div className="flex flex-wrap items-center gap-2 pb-1 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <img
                        src={student?.avatar}
                        alt={student?.name}
                        className="w-4 h-4 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span>{student?.name}</span>
                      <span className="text-slate-400 font-normal">({student?.className})</span>
                    </div>

                    <span className="text-slate-500 flex items-center gap-1 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      {company?.name || 'Mitra'}
                    </span>

                    <span className="text-slate-400">&bull;</span>

                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {journal.date}
                    </span>

                    <span className="text-slate-400">&bull;</span>

                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {journal.startTime} - {journal.endTime} WIB
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{journal.title}</h3>

                  {/* Description */}
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{journal.description}</p>

                  {/* Skills badges */}
                  {journal.skillsLearned && journal.skillsLearned.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {journal.skillsLearned.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Supervisor Notes if any */}
                  {journal.supervisorNotes && (
                    <div
                      className={`p-3 rounded-xl text-xs mt-2 border ${
                        journal.status === 'Disetujui'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <span className="font-bold block">
                        Catatan Evaluasi Anda ({journal.validatedBy || 'Pembimbing'}):
                      </span>
                      <p className="mt-0.5">{journal.supervisorNotes}</p>
                    </div>
                  )}
                </div>

                {/* Status Badge & Action */}
                <div className="flex md:flex-col items-end justify-between gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
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
                    onClick={() => setSelectedJournal(journal)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <FileCheck className="w-4 h-4" />
                    {journal.status === 'Menunggu Validasi' ? 'Periksa & Validasi' : 'Ubah Evaluasi'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJournals.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Tidak Ada Jurnal Ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1">
              Tidak ada laporan jurnal yang sesuai dengan status atau kata kunci pencarian.
            </p>
          </div>
        )}
      </div>

      {/* Validation Modal */}
      {selectedJournal && (
        <SupervisorValidationModal
          journal={selectedJournal}
          onClose={() => setSelectedJournal(null)}
        />
      )}
    </div>
  );
};
