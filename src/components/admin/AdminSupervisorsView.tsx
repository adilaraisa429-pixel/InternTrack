import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supervisor } from '../../types';
import {
  UserCheck,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Users,
  Edit,
  Trash2,
  X,
  Briefcase,
} from 'lucide-react';

export const AdminSupervisorsView: React.FC = () => {
  const { supervisors, students, companies, addSupervisor, updateSupervisor, deleteSupervisor, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [isIndustryMentor, setIsIndustryMentor] = useState(false);
  const [companyId, setCompanyId] = useState('');

  const filteredSupervisors = supervisors.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.position.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingSupervisor(null);
    setName('');
    setEmail('');
    setPhone('');
    setPosition('Guru Pembimbing PKL');
    setDepartment('Rekayasa Perangkat Lunak');
    setIsIndustryMentor(false);
    setCompanyId('');
    setShowModal(true);
  };

  const handleOpenEdit = (s: Supervisor) => {
    setEditingSupervisor(s);
    setName(s.name);
    setEmail(s.email);
    setPhone(s.phone || '');
    setPosition(s.position);
    setDepartment(s.department);
    setIsIndustryMentor(s.isIndustryMentor || false);
    setCompanyId(s.companyId || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !position.trim()) {
      showToast('error', 'Nama dan jabatan pembimbing wajib diisi!');
      return;
    }

    if (editingSupervisor) {
      updateSupervisor(editingSupervisor.id, {
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@smk.id`,
        phone,
        position,
        department,
        isIndustryMentor,
        companyId: isIndustryMentor ? companyId : undefined,
      });
    } else {
      addSupervisor({
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@smk.id`,
        avatar: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80`,
        phone,
        position,
        department,
        isIndustryMentor,
        companyId: isIndustryMentor ? companyId : undefined,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Data Pembimbing</h2>
          <p className="text-xs text-slate-500">
            Kelola data guru pembimbing internal sekolah dan mentor profesional dari industri.
          </p>
        </div>
        <button
          id="btn-add-supervisor"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Pembimbing Baru
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            id="search-supervisors"
            type="text"
            placeholder="Cari nama pembimbing, jabatan, atau prodi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          Total {supervisors.length} Pembimbing
        </span>
      </div>

      {/* Grid of Supervisor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSupervisors.map((s) => {
          const supervisedList = students.filter((std) => std.supervisorId === s.id);
          const comp = companies.find((c) => c.id === s.companyId);

          return (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{s.name}</h3>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 ${
                          s.isIndustryMentor
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {s.isIndustryMentor ? 'Mentor Industri' : 'Guru Pembimbing Sekolah'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Pembimbing"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus pembimbing ${s.name}?`)) {
                          deleteSupervisor(s.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Pembimbing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{s.position} &bull; {s.department}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.email}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{s.phone || '-'}</span>
                  </p>
                  {s.isIndustryMentor && comp && (
                    <p className="flex items-center gap-1.5 text-blue-700 font-medium">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{comp.name}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Siswa Dibimbing:
                </span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                  {supervisedList.length} Siswa
                </span>
              </div>
            </div>
          );
        })}

        {filteredSupervisors.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Tidak ada pembimbing yang sesuai pencarian.</p>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingSupervisor ? 'Edit Data Pembimbing' : 'Tambah Pembimbing Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Hendra Wijaya, S.Kom."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Resmi *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pembimbing@smk.id"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jabatan *</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Guru Pembimbing / Senior Eng"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Departemen / Program Keahlian</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Rekayasa Perangkat Lunak"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isIndustryMentor}
                    onChange={(e) => setIsIndustryMentor(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-800">
                    Merupakan Mentor dari Mitra Industri (Bukan Guru Sekolah)
                  </span>
                </label>

                {isIndustryMentor && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pilih Perusahaan Mitra</label>
                    <select
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none text-xs"
                    >
                      <option value="">-- Pilih Mitra --</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  {editingSupervisor ? 'Simpan Perubahan' : 'Simpan Pembimbing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
