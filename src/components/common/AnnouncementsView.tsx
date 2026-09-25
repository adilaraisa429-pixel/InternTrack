import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import {
  Megaphone,
  Plus,
  Pin,
  Calendar,
  User,
  Trash2,
  X,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { currentUser, announcements, addAnnouncement, deleteAnnouncement, showToast } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'siswa' | 'pembimbing'>('all');
  const [isPinned, setIsPinned] = useState(false);

  // Filter based on role
  const visibleAnnouncements = announcements.filter((a) => {
    if (!currentUser) return true;
    if (currentUser.role === 'admin') return true;
    return a.targetAudience === 'all' || a.targetAudience === currentUser.role;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('error', 'Judul dan isi pengumuman wajib diisi!');
      return;
    }

    addAnnouncement({
      title,
      content,
      authorName: currentUser?.name || 'Admin BKK SMK',
      targetAudience,
      isPinned,
    });

    showToast('success', 'Pengumuman resmi berhasil diterbitkan!');
    setShowModal(false);
    setTitle('');
    setContent('');
    setIsPinned(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Papan Pengumuman Resmi</h2>
          <p className="text-xs text-slate-500">
            Informasi penting dari pihak sekolah, jadwal monitoring pembimbing, dan instruksi penulisan laporan PKL.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            id="btn-add-announcement"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Terbitkan Pengumuman
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {visibleAnnouncements.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-6 border transition-all ${
              item.isPinned
                ? 'border-amber-300 ring-2 ring-amber-100 shadow-xs'
                : 'border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {item.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-amber-100 text-amber-900 border border-amber-200">
                      <Pin className="w-3 h-3 text-amber-700" />
                      Disematkan
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                      item.targetAudience === 'all'
                        ? 'bg-blue-100 text-blue-800'
                        : item.targetAudience === 'siswa'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    Target: {item.targetAudience === 'all' ? 'Semua Pengguna' : item.targetAudience === 'siswa' ? 'Khusus Siswa' : 'Khusus Pembimbing'}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {item.authorName}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{item.content}</p>
              </div>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    if (confirm('Hapus pengumuman ini?')) {
                      deleteAnnouncement(item.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Hapus Pengumuman"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {visibleAnnouncements.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Belum ada pengumuman untuk ditampilkan saat ini.</p>
          </div>
        )}
      </div>

      {/* Modal Add Announcement (Admin Only) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Buat Pengumuman Baru</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jadwal Monitoring Lapangan Periode Oktober"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Sasaran Penerima</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="all">Semua Pengguna (Siswa & Pembimbing)</option>
                  <option value="siswa">Hanya Siswa Magang</option>
                  <option value="pembimbing">Hanya Guru & Pembimbing</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Isi Pengumuman Lengkap *</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan instruksi, jadwal, atau informasi detail..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  id="checkbox-pin"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="checkbox-pin" className="text-xs font-semibold text-amber-900 cursor-pointer">
                  Sematkan di baris paling atas (Pinned Announcement)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Terbitkan Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
