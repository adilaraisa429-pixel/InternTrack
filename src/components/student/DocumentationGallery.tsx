import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, DocumentationAttachment } from '../../types';
import {
  Image as ImageIcon,
  Upload,
  Calendar,
  Eye,
  Download,
  Filter,
  Search,
  Plus,
  X,
  FileText,
  ExternalLink,
} from 'lucide-react';

export const DocumentationGallery: React.FC = () => {
  const { currentUser, journals, updateJournal, showToast } = useApp();
  const student = currentUser as Student;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    name: string;
    date: string;
    title: string;
  } | null>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState<string>('');
  const [newFilePreview, setNewFilePreview] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  if (!student || student.role !== 'siswa') return null;

  const studentJournals = journals.filter((j) => j.studentId === student.id);

  // Extract all documentation attachments grouped with journal metadata
  const allDocs = useMemo(() => {
    const list: Array<{
      id: string;
      journalId: string;
      journalTitle: string;
      date: string;
      attachment: DocumentationAttachment;
    }> = [];

    studentJournals.forEach((j) => {
      if (j.attachments && j.attachments.length > 0) {
        j.attachments.forEach((att) => {
          list.push({
            id: att.id,
            journalId: j.id,
            journalTitle: j.title,
            date: j.date,
            attachment: att,
          });
        });
      }
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [studentJournals]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: typeof allDocs } = {};
    allDocs.forEach((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !item.journalTitle.toLowerCase().includes(q) &&
          !item.attachment.name.toLowerCase().includes(q)
        ) {
          return;
        }
      }
      if (!groups[item.date]) {
        groups[item.date] = [];
      }
      groups[item.date].push(item);
    });
    return groups;
  }, [allDocs, searchQuery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePreview || !selectedJournalId) {
      showToast('error', 'Pilih kegiatan jurnal dan file bukti dokumentasi!');
      return;
    }

    const journal = studentJournals.find((j) => j.id === selectedJournalId);
    if (journal) {
      const newAttachment: DocumentationAttachment = {
        id: 'doc-' + Date.now(),
        name: newFileName || 'dokumentasi-tambahan.jpg',
        url: newFilePreview,
        type: 'image',
        sizeKb: 550,
        uploadedAt: new Date().toISOString(),
      };

      const updatedAttachments = [...(journal.attachments || []), newAttachment];
      updateJournal(journal.id, { attachments: updatedAttachments });
      showToast('success', 'Dokumentasi berhasil ditambahkan ke galeri!');
      setShowUploadModal(false);
      setNewFilePreview(null);
      setNewFileName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Galeri Dokumentasi Kegiatan</h2>
          <p className="text-xs text-slate-500">
            Kumpulan arsip foto kerja, coding, instalasi, dan sertifikat kegiatan magang harian.
          </p>
        </div>
        <button
          id="btn-upload-new-doc"
          onClick={() => {
            if (studentJournals.length === 0) {
              showToast('error', 'Buat minimal 1 jurnal sebelum menambah dokumentasi!');
              return;
            }
            setSelectedJournalId(studentJournals[0].id);
            setShowUploadModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          Upload Bukti Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            id="search-docs"
            type="text"
            placeholder="Cari dokumentasi berdasarkan judul atau nama file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          Total {allDocs.length} Berkas Dokumentasi
        </span>
      </div>

      {/* Gallery Grouped By Date */}
      <div className="space-y-6">
        {Object.keys(groupedByDate).map((dateKey) => {
          const items = groupedByDate[dateKey];
          return (
            <div key={dateKey} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Tanggal Kegiatan: <span className="text-blue-700">{dateKey}</span>
                </h3>
                <span className="text-xs text-slate-400">({items.length} Foto/Berkas)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-200">
                      {item.attachment.type === 'image' ? (
                        <img
                          src={item.attachment.url}
                          alt={item.attachment.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <FileText className="w-12 h-12 text-blue-600 mb-2" />
                          <span className="text-xs font-semibold uppercase">{item.attachment.name.split('.').pop()}</span>
                        </div>
                      )}

                      {/* Overlay action on hover */}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <button
                          onClick={() =>
                            setSelectedPhoto({
                              url: item.attachment.url,
                              name: item.attachment.name,
                              date: item.date,
                              title: item.journalTitle,
                            })
                          }
                          className="p-2 bg-white text-slate-800 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
                          title="Perbesar / Lihat Bukti"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="p-3 bg-white">
                      <p className="text-xs font-bold text-slate-900 truncate" title={item.journalTitle}>
                        {item.journalTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5" title={item.attachment.name}>
                        {item.attachment.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {Object.keys(groupedByDate).length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">Belum Ada Dokumentasi</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Foto kegiatan yang kamu lampirkan saat mengisi jurnal akan otomatis tersusun rapi di galeri ini.
            </p>
          </div>
        )}
      </div>

      {/* LIGHTBOX / PHOTO PREVIEW MODAL */}
      {selectedPhoto && (
        <div
          id="modal-lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold truncate">{selectedPhoto.title}</h4>
                <p className="text-xs text-slate-400">
                  {selectedPhoto.date} &bull; {selectedPhoto.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 bg-white flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Bukti terverifikasi di sistem magang</span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div
          id="modal-upload-doc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Upload Bukti Dokumentasi</h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih kegiatan yang ingin ditambahkan foto dokumentasi pendukung.
            </p>

            <form onSubmit={handleUploadNewDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pilih Kegiatan Jurnal</label>
                <select
                  value={selectedJournalId}
                  onChange={(e) => setSelectedJournalId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {studentJournals.map((j) => (
                    <option key={j.id} value={j.id}>
                      [{j.date}] {j.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pilih File Foto (Preview)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-xl p-2 bg-slate-50"
                />
              </div>

              {newFilePreview && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1">Preview Foto:</span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 h-40 bg-slate-100">
                    <img
                      src={newFilePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Simpan ke Galeri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
