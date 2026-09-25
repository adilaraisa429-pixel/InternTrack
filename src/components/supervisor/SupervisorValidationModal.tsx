import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JournalEntry, Student } from '../../types';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Tag,
  FileText,
  User,
  Building2,
} from 'lucide-react';

interface SupervisorValidationModalProps {
  journal: JournalEntry;
  onClose: () => void;
}

export const SupervisorValidationModal: React.FC<SupervisorValidationModalProps> = ({
  journal,
  onClose,
}) => {
  const { students, companies, currentUser, validateJournal, showToast } = useApp();

  const student = students.find((s) => s.id === journal.studentId);
  const company = companies.find((c) => c.id === student?.companyId);

  const [notes, setNotes] = useState(journal.supervisorNotes || '');
  const [activeAction, setActiveAction] = useState<'approve' | 'revise'>('approve');

  const handleApprove = () => {
    validateJournal(
      journal.id,
      'Disetujui',
      notes.trim() || 'Jurnal telah diperiksa dan disetujui.',
      currentUser?.name || 'Pembimbing'
    );
    onClose();
  };

  const handleRequestRevision = () => {
    if (!notes.trim()) {
      showToast('error', 'Wajib menuliskan catatan revisi agar siswa mengetahui bagian yang perlu diperbaiki!');
      return;
    }
    validateJournal(
      journal.id,
      'Perlu Revisi',
      notes.trim(),
      currentUser?.name || 'Pembimbing'
    );
    onClose();
  };

  return (
    <div
      id="modal-validate-journal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                Validasi Jurnal Magang
              </span>
              <span className="text-xs text-slate-500">{journal.date}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">{journal.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student & Placement Banner */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-4 text-xs">
          <img
            src={student?.avatar}
            alt={student?.name}
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1">
            <h4 className="font-bold text-slate-900">{student?.name}</h4>
            <p className="text-slate-500">
              {student?.className} &bull; NISN: {student?.nisn}
            </p>
          </div>
          <div className="text-right text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1 justify-end">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              {company?.name}
            </div>
            <span className="text-[11px] text-slate-400">{journal.location}</span>
          </div>
        </div>

        {/* Journal Content Breakdown */}
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {journal.startTime} - {journal.endTime} WIB
            </span>
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {journal.location}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="block text-slate-800 mb-1">Deskripsi Kegiatan Siswa:</strong>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{journal.description}</p>
          </div>

          {/* Skills */}
          {journal.skillsLearned && journal.skillsLearned.length > 0 && (
            <div>
              <strong className="block text-slate-800 mb-1.5">Skill & Kompetensi yang Dipelajari:</strong>
              <div className="flex flex-wrap gap-1.5">
                {journal.skillsLearned.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Obstacles & Solutions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="block text-slate-800 mb-1">Kendala yang Ditemukan:</strong>
              <p className="text-slate-600">{journal.obstacles || 'Tidak ada kendala yang dilaporkan.'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="block text-emerald-800 mb-1">Solusi yang Dilakukan:</strong>
              <p className="text-slate-600">{journal.solution || 'Mandiri / Bimbingan tim.'}</p>
            </div>
          </div>

          {/* Attachments */}
          {journal.attachments && journal.attachments.length > 0 && (
            <div>
              <strong className="block text-slate-800 mb-2">Dokumentasi / Bukti Terlampir:</strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {journal.attachments.map((att) => (
                  <div key={att.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <img
                      src={att.url}
                      alt={att.name}
                      className="w-full h-28 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-2 text-[11px] font-medium text-slate-700 truncate">{att.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Form */}
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Beri Catatan / Umpan Balik Pembimbing
            </label>
            <textarea
              id="input-supervisor-notes"
              rows={3}
              placeholder="Berikan masukan, evaluasi, atau catatan perbaikan jika meminta revisi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Status saat ini: <strong className="text-slate-800">{journal.status}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-action-revise"
              type="button"
              onClick={handleRequestRevision}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Minta Revisi
            </button>

            <button
              id="btn-action-approve"
              type="button"
              onClick={handleApprove}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Setujui Jurnal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
