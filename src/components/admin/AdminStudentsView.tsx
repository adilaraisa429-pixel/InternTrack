import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Building2,
  UserCheck,
  Filter,
} from 'lucide-react';

export const AdminStudentsView: React.FC = () => {
  const { students, companies, supervisors, addStudent, updateStudent, deleteStudent, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nisn, setNisn] = useState('');
  const [className, setClassName] = useState('XII RPL 1');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Selesai' | 'Menunggu Penempatan'>('Aktif');

  const classes = ['All', 'XII RPL 1', 'XII RPL 2', 'XII TKJ 2', 'XII Desain Grafis'];

  const filteredStudents = students.filter((s) => {
    if (classFilter !== 'All' && s.className !== classFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.nisn.includes(q) || s.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setName('');
    setEmail('');
    setNisn('');
    setClassName('XII RPL 1');
    setPhone('');
    setCompanyId(companies[0]?.id || '');
    setSupervisorId(supervisors[0]?.id || '');
    setStatus('Aktif');
    setShowModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setEmail(student.email);
    setNisn(student.nisn);
    setClassName(student.className);
    setPhone(student.phone || '');
    setCompanyId(student.companyId);
    setSupervisorId(student.supervisorId);
    setStatus(student.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nisn.trim()) {
      showToast('error', 'Nama dan NISN wajib diisi!');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@siswa.smk.id`,
        nisn,
        className,
        phone,
        companyId,
        supervisorId,
        status,
      });
    } else {
      addStudent({
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@siswa.smk.id`,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        nisn,
        className,
        phone,
        companyId: companyId || companies[0]?.id || '',
        supervisorId: supervisorId || supervisors[0]?.id || '',
        internshipStartDate: '2026-08-01',
        internshipEndDate: '2026-11-30',
        totalRequiredDays: 90,
        status,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Data Siswa Magang</h2>
          <p className="text-xs text-slate-500">
            Kelola data peserta PKL, status penempatan industri, dan pembimbing siswa.
          </p>
        </div>
        <button
          id="btn-add-student"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Siswa Baru
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            id="search-students"
            type="text"
            placeholder="Cari berdasarkan nama, NISN, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="filter-class"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'Semua Kelas' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">NISN & Kelas</th>
                <th className="py-3.5 px-4">Tempat Magang</th>
                <th className="py-3.5 px-4">Pembimbing</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const comp = companies.find((c) => c.id === student.companyId);
                const sup = supervisors.find((s) => s.id === student.supervisorId);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{student.name}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-semibold block text-slate-900">{student.nisn}</span>
                      <span className="text-[11px] text-slate-500">{student.className}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium text-slate-900 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate max-w-[170px]">{comp?.name || 'Belum Ditempatkan'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium text-slate-900 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate max-w-[150px]">{sup?.name || 'Belum Ditugaskan'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          student.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : student.status === 'Selesai'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          id={`btn-edit-std-${student.id}`}
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Edit Siswa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-std-${student.id}`}
                          onClick={() => {
                            if (confirm(`Hapus data siswa ${student.name}?`)) {
                              deleteStudent(student.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data siswa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Student */}
      {showModal && (
        <div
          id="modal-student-form"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Data Siswa' : 'Pendaftaran Siswa Magang'}
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
                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizky"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="006xxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kelas</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="XII RPL 1">XII RPL 1</option>
                    <option value="XII RPL 2">XII RPL 2</option>
                    <option value="XII TKJ 2">XII TKJ 2</option>
                    <option value="XII Desain Grafis">XII Desain Grafis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Siswa</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@siswa.smk.id"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">No. WhatsApp / Telepon</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Perusahaan / Tempat Magang</label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- Pilih Perusahaan --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Pembimbing Siswa</label>
                <select
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- Pilih Pembimbing --</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Status Magang</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Menunggu Penempatan">Menunggu Penempatan</option>
                </select>
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
                  {editingStudent ? 'Simpan Perubahan' : 'Daftarkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
