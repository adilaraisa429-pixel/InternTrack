import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, JournalEntry, DocumentationAttachment } from '../../types';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  X,
  Edit,
  Trash2,
  Eye,
  Check,
  Search,
  Filter,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';

interface JournalViewProps {
  initialOpenCreate?: boolean;
  initialFilter?: string;
}

export const JournalView: React.FC<JournalViewProps> = ({ initialOpenCreate = false, initialFilter }) => {
  const { currentUser, journals, createJournal, updateJournal, deleteJournal, companies, showToast } = useApp();
  const student = currentUser as Student;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'All');
  const [showModal, setShowModal] = useState(initialOpenCreate);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [viewingJournal, setViewingJournal] = useState<JournalEntry | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:30');
  const [location, setLocation] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>(['React.js', 'Tailwind CSS']);
  const [obstacles, setObstacles] = useState('');
  const [solution, setSolution] = useState('');
  const [attachments, setAttachments] = useState<DocumentationAttachment[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!student || student.role !== 'siswa') return null;

  const company = companies.find((c) => c.id === student.companyId);
  const studentJournals = journals.filter((j) => j.studentId === student.id);

  const filteredJournals = studentJournals
    .filter((j) => {
      if (statusFilter !== 'All' && j.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.skillsLearned.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleOpenCreate = () => {
    setEditingJournal(null);
    setDate(new Date().toISOString().split('T')[0]);
    setTitle('');
    setDescription('');
    setStartTime('08:00');
    setEndTime('16:30');
    setLocation(company?.name || 'Kantor Magang');
    setSkillsList(['Problem Solving', 'Team Collaboration']);
    setObstacles('');
    setSolution('');
    setAttachments([
      {
        id: 'att-mock-' + Date.now(),
        name: 'dokumentasi-kegiatan.jpg',
        url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        sizeKb: 420,
        uploadedAt: new Date().toISOString(),
      }
    ]);
    setShowModal(true);
  };

  const handleOpenEdit = (journal: JournalEntry) => {
    setEditingJournal(journal);
    setDate(journal.date);
    setTitle(journal.title);
    setDescription(journal.description);
    setStartTime(journal.startTime);
    setEndTime(journal.endTime);
    setLocation(journal.location);
    setSkillsList(journal.skillsLearned || []);
    setObstacles(journal.obstacles || '');
    setSolution(journal.solution || '');
    setAttachments(journal.attachments || []);
    setShowModal(true);
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
      setSkillsList([...skillsList, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result as string;
        const newAttachment: DocumentationAttachment = {
          id: 'doc-' + Date.now(),
          name: file.name,
          url: fileUrl,
          type: file.type.includes('image') ? 'image' : 'document',
          sizeKb: Math.round(file.size / 1024),
          uploadedAt: new Date().toISOString(),
        };
        setAttachments([...attachments, newAttachment]);
        setPreviewImage(fileUrl);
        showToast('success', `File ${file.name} berhasil diunggah dengan preview!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('error', 'Judul dan deskripsi kegiatan wajib diisi!');
      return;
    }

    if (editingJournal) {
      updateJournal(editingJournal.id, {
        date,
        title,
        description,
        startTime,
        endTime,
        location,
        skillsLearned: skillsList,
        obstacles,
        solution,
        attachments,
      });
    } else {
      createJournal({
        studentId: student.id,
        date,
        title,
        description,
        startTime,
        endTime,
        location,
        skillsLearned: skillsList,
        obstacles,
        solution,
        attachments,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Jurnal Kegiatan Harian</h2>
          <p className="text-xs text-slate-500">
            Dokumentasikan setiap aktivitas, keahlian yang dipelajari, kendala, dan bukti magangmu.
          </p>
        </div>
        <button
          id="btn-add-journal"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tulis Jurnal Baru
        </button>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            id="search-journal"
            type="text"
            placeholder="Cari judul kegiatan, skill, atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Disetujui', 'Menunggu Validasi', 'Perlu Revisi'].map((status) => (
              <button
                key={status}
                id={`filter-journal-${status.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'All' ? 'Semua Status' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Journal Cards List */}
      <div className="space-y-4">
        {filteredJournals.map((journal) => (
          <div
            key={journal.id}
            className={`bg-white rounded-2xl p-6 border transition-all shadow-xs ${
              journal.status === 'Perlu Revisi'
                ? 'border-rose-300 ring-2 ring-rose-100'
                : 'border-slate-200 hover:border-blue-200'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {/* Meta header */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {journal.date}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {journal.startTime} - {journal.endTime} WIB
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {journal.location}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">{journal.title}</h3>

                {/* Description */}
                <p className="text-xs text-slate-700 leading-relaxed">{journal.description}</p>

                {/* Skills Learned Badges */}
                {journal.skillsLearned && journal.skillsLearned.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Skill:
                    </span>
                    {journal.skillsLearned.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Obstacles & Solution summary */}
                {(journal.obstacles || journal.solution) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                    {journal.obstacles && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="font-bold text-slate-700 block mb-0.5">Kendala yang Ditemukan:</span>
                        <span className="text-slate-600">{journal.obstacles}</span>
                      </div>
                    )}
                    {journal.solution && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="font-bold text-emerald-800 block mb-0.5">Solusi yang Dilakukan:</span>
                        <span className="text-slate-600">{journal.solution}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments preview thumbnail strip */}
                {journal.attachments && journal.attachments.length > 0 && (
                  <div className="pt-2 flex items-center gap-2 overflow-x-auto">
                    {journal.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 shrink-0"
                      >
                        {att.type === 'image' ? (
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-6 h-6 rounded object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="max-w-[140px] truncate text-[11px] font-medium">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Badge and Action Buttons */}
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingJournal(journal)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Lihat Detail Lengkap"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* If status is "Perlu Revisi" or "Menunggu Validasi", allow editing */}
                  {journal.status !== 'Disetujui' && (
                    <button
                      id={`btn-edit-journal-${journal.id}`}
                      onClick={() => handleOpenEdit(journal)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors"
                      title="Edit Jurnal"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{journal.status === 'Perlu Revisi' ? 'Revisi & Kirim Ulang' : 'Edit'}</span>
                    </button>
                  )}

                  {journal.status === 'Menunggu Validasi' && (
                    <button
                      onClick={() => {
                        if (confirm('Yakin ingin menghapus draf jurnal ini?')) {
                          deleteJournal(journal.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Jurnal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* If Supervisor Left Revision Notes */}
            {journal.status === 'Perlu Revisi' && journal.supervisorNotes && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 flex items-start gap-3 text-xs text-rose-950">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-rose-900 flex items-center justify-between">
                    <span>Catatan Revisi dari Pembimbing ({journal.validatedBy || 'Pembimbing'}):</span>
                    <span className="text-[11px] font-normal text-rose-700">
                      {journal.validatedAt ? new Date(journal.validatedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="mt-1 text-rose-800 leading-relaxed font-medium">{journal.supervisorNotes}</p>
                  <p className="mt-2 text-[11px] text-rose-700 font-semibold">
                    &rarr; Klik tombol <strong>"Revisi & Kirim Ulang"</strong> di atas untuk memperbaiki dan melengkapi berkas ini.
                  </p>
                </div>
              </div>
            )}

            {/* If Approved with Praises */}
            {journal.status === 'Disetujui' && journal.supervisorNotes && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900">
                    Catatan Apresiasi Pembimbing ({journal.validatedBy}):
                  </span>
                  <p className="mt-0.5 text-emerald-800">{journal.supervisorNotes}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredJournals.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">Belum Ada Jurnal Ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada jurnal yang sesuai dengan kata kunci atau filter status saat ini.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
            >
              Tambah Jurnal Sekarang
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT JOURNAL MODAL */}
      {showModal && (
        <div
          id="modal-journal-form"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingJournal
                    ? editingJournal.status === 'Perlu Revisi'
                      ? 'Revisi & Kirim Ulang Jurnal'
                      : 'Edit Jurnal Kegiatan'
                    : 'Catat Jurnal Magang Baru'}
                </h3>
                <p className="text-xs text-slate-500">Isi form kegiatan harian dengan data yang sebenarnya</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Revision banner if editing a revision */}
            {editingJournal && editingJournal.status === 'Perlu Revisi' && editingJournal.supervisorNotes && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                <strong className="font-bold block text-rose-950 mb-1">Catatan Revisi dari Pembimbing:</strong>
                <p>{editingJournal.supervisorNotes}</p>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tanggal Kegiatan *</label>
                  <input
                    id="form-journal-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Jam Mulai *</label>
                  <input
                    id="form-journal-start"
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Jam Selesai *</label>
                  <input
                    id="form-journal-end"
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lokasi Magang *</label>
                <input
                  id="form-journal-location"
                  type="text"
                  required
                  placeholder="Misal: Divisi TI Lantai 3, Kantor Telkom Bandung"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Judul Kegiatan *</label>
                <input
                  id="form-journal-title"
                  type="text"
                  required
                  placeholder="Ringkasan tugas utama hari ini (cth: Slicing UI dan Integrasi API Auth)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Deskripsi Kegiatan Lengkap *</label>
                <textarea
                  id="form-journal-desc"
                  required
                  rows={4}
                  placeholder="Jelaskan alur kerja, apa saja yang dikerjakan, alat/software yang digunakan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Skills/Competencies Badges Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Skill / Kompetensi yang Dipelajari
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Ketik skill lalu tekan Enter (misal: Docker, REST API, Figma)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl"
                  >
                    Tambah
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-500 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Obstacles & Solutions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kendala yang Ditemukan</label>
                  <textarea
                    rows={2}
                    placeholder="Masalah atau error teknis..."
                    value={obstacles}
                    onChange={(e) => setObstacles(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Solusi yang Dilakukan</label>
                  <textarea
                    rows={2}
                    placeholder="Langkah penyelesaian..."
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Upload Documentation Attachment with Preview */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dokumentasi Foto / Bukti Pendukung
                </label>
                <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 transition-colors bg-slate-50">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-600 font-medium">Unggah foto kegiatan atau tangkapan layar</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Mendukung JPG, PNG, PDF (Maks 5MB)</p>
                    <input
                      id="file-upload-input"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleSimulateFileUpload}
                      className="mt-2 text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                {/* Previews */}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500">Lampiran Terlampir:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {attachments.map((att, aIdx) => (
                        <div
                          key={aIdx}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-1 flex items-center gap-2"
                        >
                          {att.type === 'image' ? (
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-12 h-12 rounded-lg object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <FileText className="w-8 h-8 text-blue-600 shrink-0 mx-2" />
                          )}
                          <div className="overflow-hidden pr-6">
                            <p className="text-[11px] font-medium text-slate-800 truncate">{att.name}</p>
                            <p className="text-[10px] text-slate-500">{att.sizeKb ? `${att.sizeKb} KB` : 'Foto'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAttachments(attachments.filter((_, i) => i !== aIdx))}
                            className="absolute right-1 top-1 p-1 bg-white/80 hover:bg-white rounded-full text-slate-500 hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-journal-form"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  {editingJournal ? 'Simpan Perubahan Jurnal' : 'Kirim Jurnal ke Pembimbing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (Read-Only Complete View) */}
      {viewingJournal && (
        <div
          id="modal-view-journal-detail"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  viewingJournal.status === 'Disetujui'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : viewingJournal.status === 'Perlu Revisi'
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                {viewingJournal.status}
              </span>
              <button
                onClick={() => setViewingJournal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">
                  {viewingJournal.date} &bull; {viewingJournal.startTime} - {viewingJournal.endTime} WIB
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{viewingJournal.title}</h3>
                <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {viewingJournal.location}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Deskripsi Kegiatan:</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{viewingJournal.description}</p>
              </div>

              {viewingJournal.skillsLearned && viewingJournal.skillsLearned.length > 0 && (
                <div>
                  <span className="font-bold text-slate-800 block mb-1.5">Skill / Kompetensi:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingJournal.skillsLearned.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingJournal.obstacles && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Kendala yang Ditemukan:</span>
                  <p className="text-slate-600">{viewingJournal.obstacles}</p>
                </div>
              )}

              {viewingJournal.solution && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-emerald-800 block mb-1">Solusi yang Dilakukan:</span>
                  <p className="text-slate-600">{viewingJournal.solution}</p>
                </div>
              )}

              {viewingJournal.attachments && viewingJournal.attachments.length > 0 && (
                <div>
                  <span className="font-bold text-slate-800 block mb-2">Dokumentasi Terlampir:</span>
                  <div className="grid grid-cols-2 gap-3">
                    {viewingJournal.attachments.map((att) => (
                      <div key={att.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <img
                          src={att.url}
                          alt={att.name}
                          className="w-full h-32 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="p-2 bg-white text-[11px] truncate font-medium">{att.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingJournal.supervisorNotes && (
                <div
                  className={`p-3 rounded-xl border ${
                    viewingJournal.status === 'Disetujui'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <span className="font-bold block">
                    Catatan Pembimbing ({viewingJournal.validatedBy || 'Pembimbing'}):
                  </span>
                  <p className="mt-1 leading-relaxed">{viewingJournal.supervisorNotes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingJournal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
