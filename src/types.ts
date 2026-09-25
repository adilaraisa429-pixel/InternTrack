export type UserRole = 'siswa' | 'pembimbing' | 'admin';

export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Tidak hadir';

export type JournalStatus = 'Menunggu Validasi' | 'Disetujui' | 'Perlu Revisi';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  phone?: string;
}

export interface Student extends User {
  role: 'siswa';
  nisn: string;
  className: string;
  companyId: string;
  supervisorId: string;
  internshipStartDate: string;
  internshipEndDate: string;
  totalRequiredDays: number;
  status: 'Aktif' | 'Selesai' | 'Menunggu Penempatan';
}

export interface Supervisor extends User {
  role: 'pembimbing';
  nip?: string;
  position: string; // e.g. "Senior Software Engineer" or "Guru Pembimbing"
  department: string;
  companyId?: string; // Optional if industry mentor or school coordinator
  isIndustryMentor?: boolean;
}

export interface AdminUser extends User {
  role: 'admin';
  position: string; // e.g. "Koordinator BKK & Hubin"
}

export type Admin = AdminUser;

export interface Company {
  id: string;
  name: string;
  sector: string;
  industrySector?: string;
  address: string;
  city: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  logo?: string;
  capacity: number;
  maxQuota?: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  status: AttendanceStatus;
  notes?: string;
  location?: string;
  verifiedBySupervisor?: boolean;
}

export interface DocumentationAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'document';
  sizeKb?: number;
  uploadedAt: string;
}

export interface JournalEntry {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  skillsLearned: string[];
  obstacles?: string;
  solution?: string;
  status: JournalStatus;
  supervisorNotes?: string;
  validatedAt?: string;
  validatedBy?: string;
  attachments: DocumentationAttachment[];
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string; // e.g. "studentId_supervisorId"
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  authorName: string;
  authorRole: string;
  isActive: boolean;
  priority: 'Biasa' | 'Penting' | 'Mendesak';
}
