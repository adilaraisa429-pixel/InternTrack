import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  Briefcase,
  Building2,
  UserCheck,
  Check,
  Search,
  ArrowRight,
  Filter,
  Save,
} from 'lucide-react';

export const AdminPlacementView: React.FC = () => {
  const { students, companies, supervisors, updateStudent, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlacement, setFilterPlacement] = useState<'All' | 'Unplaced' | 'Placed'>('All');

  // Local placement changes map
  const [placements, setPlacements] = useState<{
    [studentId: string]: { companyId: string; supervisorId: string };
  }>({});

  const handleCompanyChange = (studentId: string, companyId: string) => {
    setPlacements((prev) => ({
      ...prev,
      [studentId]: {
        companyId,
        supervisorId: prev[studentId]?.supervisorId || students.find((s) => s.id === studentId)?.supervisorId || '',
      },
    }));
  };

  const handleSupervisorChange = (studentId: string, supervisorId: string) => {
    setPlacements((prev) => ({
      ...prev,
      [studentId]: {
        companyId: prev[studentId]?.companyId || students.find((s) => s.id === studentId)?.companyId || '',
        supervisorId,
      },
    }));
  };

  const handleSavePlacement = (student: Student) => {
    const changes = placements[student.id];
    if (!changes) return;

    updateStudent(student.id, {
      companyId: changes.companyId,
      supervisorId: changes.supervisorId,
      status: changes.companyId ? 'Aktif' : 'Menunggu Penempatan',
    });

    showToast('success', `Penempatan magang untuk ${student.name} berhasil disimpan!`);
  };

  const filteredStudents = students.filter((s) => {
    const isPlaced = !!s.companyId;
    if (filterPlacement === 'Unplaced' && isPlaced) return false;
    if (filterPlacement === 'Placed' && !isPlaced) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q) || s.nisn.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Manajemen Penempatan Magang</h2>
        <p className="text-xs text-slate-500">
          Alokasikan siswa peserta PKL ke mitra perusahaan yang sesuai dan tentukan guru/mentor pembimbingnya.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari siswa atau kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['All', 'Placed', 'Unplaced'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterPlacement(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterPlacement === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter === 'All' ? 'Semua Siswa' : filter === 'Placed' ? 'Sudah Ditempatkan' : 'Belum Ditempatkan'}
            </button>
          ))}
        </div>
      </div>

      {/* Placement Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Siswa</th>
                <th className="py-3.5 px-4">Kelas & NISN</th>
                <th className="py-3.5 px-4">Perusahaan Mitra (DUDI)</th>
                <th className="py-3.5 px-4">Pembimbing</th>
                <th className="py-3.5 px-4 text-right">Simpan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const currentCompanyId =
                  placements[student.id]?.companyId !== undefined
                    ? placements[student.id].companyId
                    : student.companyId;

                const currentSupervisorId =
                  placements[student.id]?.supervisorId !== undefined
                    ? placements[student.id].supervisorId
                    : student.supervisorId;

                const hasChanged =
                  (placements[student.id]?.companyId !== undefined &&
                    placements[student.id].companyId !== student.companyId) ||
                  (placements[student.id]?.supervisorId !== undefined &&
                    placements[student.id].supervisorId !== student.supervisorId);

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
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded-full mt-0.5 ${
                              student.companyId
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {student.companyId ? 'Terdaftar' : 'Belum Ada Tempat'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-semibold block">{student.className}</span>
                      <span className="text-slate-400 text-[11px] font-mono">{student.nisn}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={currentCompanyId}
                        onChange={(e) => handleCompanyChange(student.id, e.target.value)}
                        className="w-full max-w-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Pilih Perusahaan --</option>
                        {companies.map((c) => {
                          const placed = students.filter((s) => s.companyId === c.id).length;
                          return (
                            <option key={c.id} value={c.id}>
                              {c.name} ({placed}/{c.maxQuota})
                            </option>
                          );
                        })}
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={currentSupervisorId}
                        onChange={(e) => handleSupervisorChange(student.id, e.target.value)}
                        className="w-full max-w-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Pilih Pembimbing --</option>
                        {supervisors.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.position})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleSavePlacement(student)}
                        disabled={!hasChanged}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          hasChanged
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        Simpan
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data siswa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
