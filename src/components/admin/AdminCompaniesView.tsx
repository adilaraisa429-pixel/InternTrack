import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Company } from '../../types';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Users,
  Edit,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';

export const AdminCompaniesView: React.FC = () => {
  const { companies, students, addCompany, updateCompany, deleteCompany, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [industrySector, setIndustrySector] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [maxQuota, setMaxQuota] = useState(5);

  const filteredCompanies = companies.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (c.sector && c.sector.toLowerCase().includes(q)) ||
      c.contactPerson.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setName('');
    setAddress('');
    setCity('Bandung');
    setIndustrySector('Software Engineering & Cloud');
    setContactPerson('');
    setContactPhone('');
    setContactEmail('');
    setMaxQuota(5);
    setShowModal(true);
  };

  const handleOpenEdit = (c: Company) => {
    setEditingCompany(c);
    setName(c.name);
    setAddress(c.address);
    setCity(c.city);
    setIndustrySector(c.sector || c.industrySector || '');
    setContactPerson(c.contactPerson);
    setContactPhone(c.contactPhone);
    setContactEmail(c.contactEmail);
    setMaxQuota(c.capacity || c.maxQuota || 5);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactPerson.trim()) {
      showToast('error', 'Nama perusahaan dan kontak PIC wajib diisi!');
      return;
    }

    if (editingCompany) {
      updateCompany(editingCompany.id, {
        name,
        address,
        city,
        sector: industrySector,
        contactPerson,
        contactPhone,
        contactEmail,
        capacity: Number(maxQuota),
      });
    } else {
      addCompany({
        name,
        address,
        city,
        sector: industrySector,
        contactPerson,
        contactPhone,
        contactEmail,
        capacity: Number(maxQuota),
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mitra Perusahaan & DUDI</h2>
          <p className="text-xs text-slate-500">
            Kelola data tempat magang siswa, PIC perusahaan, dan alokasi kuota penerimaan.
          </p>
        </div>
        <button
          id="btn-add-company"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Mitra Baru
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            id="search-companies"
            type="text"
            placeholder="Cari nama mitra, kota, atau PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          Total {companies.length} Mitra Terdaftar
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((c) => {
          const cap = c.capacity || c.maxQuota || 5;
          const placedCount = students.filter((s) => s.companyId === c.id).length;
          const quotaPercentage = Math.min(100, Math.round((placedCount / cap) * 100));

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Mitra"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus data mitra ${c.name}?`)) {
                          deleteCompany(c.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Mitra"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{c.name}</h3>
                <span className="inline-block text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mt-1 mb-2">
                  {c.sector || c.industrySector}
                </span>

                <div className="space-y-1.5 text-xs text-slate-600 mt-2">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">{c.address}, {c.city}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>PIC: <strong>{c.contactPerson}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{c.contactPhone}</span>
                  </p>
                </div>
              </div>

              {/* Quota bar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Siswa Terisi:</span>
                  <span className="font-bold text-slate-900">
                    {placedCount} / {cap} Kuota
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      quotaPercentage >= 100 ? 'bg-rose-500' : quotaPercentage >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${quotaPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCompanies.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Tidak ada mitra perusahaan yang sesuai pencarian.</p>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingCompany ? 'Edit Data Mitra Perusahaan' : 'Tambah Mitra Industri Baru'}
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
                <label className="block font-medium text-slate-700 mb-1">Nama Perusahaan / Instansi *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: PT Telkom Indonesia Tbk"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kota / Wilayah *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bandung"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Bidang Usaha</label>
                  <input
                    type="text"
                    value={industrySector}
                    onChange={(e) => setIndustrySector(e.target.value)}
                    placeholder="Telekomunikasi & IT"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Alamat Kantor Lengkap</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Japati No. 1, Sadang Serang, Coblong, Bandung"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Pembimbing / PIC Industri *</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Contoh: Dedi Suhendar, S.T."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">No. Kontak PIC</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kuota Maksimal Siswa</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={maxQuota}
                    onChange={(e) => setMaxQuota(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="pic@perusahaan.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  {editingCompany ? 'Simpan Perubahan' : 'Simpan Mitra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
