import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  db,
  auth,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  handleFirestoreError,
  OperationType,
  BOOTSTRAP_ADMIN_EMAIL,
  testConnection,
} from '../firebase';
import {
  User,
  Student,
  Supervisor,
  AdminUser,
  Company,
  AttendanceRecord,
  JournalEntry,
  Message,
  Announcement,
  UserRole,
  AttendanceStatus,
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_SUPERVISORS,
  INITIAL_ADMIN,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_JOURNALS,
  INITIAL_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
} from '../data/mockData';

interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User | Student | Supervisor | AdminUser | null;
  firebaseUser: FirebaseUser | null;
  isFirebaseConnected: boolean;
  isFirebaseLoading: boolean;
  students: Student[];
  supervisors: Supervisor[];
  admin: AdminUser;
  companies: Company[];
  attendances: AttendanceRecord[];
  journals: JournalEntry[];
  messages: Message[];
  announcements: Announcement[];
  toast: ToastInfo | null;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  clearToast: () => void;

  // Auth
  login: (role: UserRole, email: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  signInWithGoogle: () => Promise<boolean>;
  signOutGoogle: () => Promise<void>;

  // Attendance
  checkIn: (studentId: string, notes?: string, status?: AttendanceStatus, location?: string) => Promise<{ success: boolean; message: string }>;
  checkOut: (studentId: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  getTodayAttendance: (studentId: string) => AttendanceRecord | undefined;
  getStudentAttendanceHistory: (studentId: string) => AttendanceRecord[];

  // Journals
  createJournal: (journalData: Omit<JournalEntry, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateJournal: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  validateJournal: (id: string, status: 'Disetujui' | 'Perlu Revisi', supervisorNotes: string, supervisorName: string) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;

  // Messages
  sendMessage: (senderId: string, receiverId: string, text: string) => Promise<void>;
  markConversationAsRead: (otherUserId: string) => Promise<void>;
  getUnreadCountForUser: (userId: string) => number;

  // Announcements
  createAnnouncement: (ann: Omit<Announcement, 'id'>) => Promise<void>;
  toggleAnnouncement: (id: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // Management (Admin)
  addStudent: (student: Omit<Student, 'id' | 'role'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  addSupervisor: (supervisor: Omit<Supervisor, 'id' | 'role'>) => Promise<void>;
  updateSupervisor: (id: string, supervisor: Partial<Supervisor>) => Promise<void>;
  deleteSupervisor: (id: string) => Promise<void>;

  addCompany: (company: Omit<Company, 'id'>) => Promise<void>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;

  assignInternship: (studentId: string, companyId: string, supervisorId: string) => Promise<void>;
  resetToDefaultData: () => Promise<void>;
  seedFirebaseDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'interntrack_current_user_id',
  STUDENTS: 'interntrack_students',
  SUPERVISORS: 'interntrack_supervisors',
  COMPANIES: 'interntrack_companies',
  ATTENDANCE: 'interntrack_attendance',
  JOURNALS: 'interntrack_journals',
  MESSAGES: 'interntrack_messages',
  ANNOUNCEMENTS: 'interntrack_announcements',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);
  const isSeedingRef = useRef<boolean>(false);

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToast({ id, type, message });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  // Initialize State from LocalStorage or Defaults
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [supervisors, setSupervisors] = useState<Supervisor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPERVISORS);
    return saved ? JSON.parse(saved) : INITIAL_SUPERVISORS;
  });

  const [admin, setAdmin] = useState<AdminUser>(INITIAL_ADMIN);

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    return saved ? JSON.parse(saved) : INITIAL_JOURNALS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  // Current User
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'std-1';
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPERVISORS, JSON.stringify(supervisors));
  }, [supervisors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  // Derived current user object
  const currentUser = React.useMemo(() => {
    if (!currentUserId) return null;
    if (currentUserId === admin.id) return admin;
    const std = students.find((s) => s.id === currentUserId);
    if (std) return std;
    const sup = supervisors.find((s) => s.id === currentUserId);
    if (sup) return sup;
    return null;
  }, [currentUserId, students, supervisors, admin]);

  // Seed default data to Firestore if collections are empty
  const seedFirebaseDatabase = useCallback(async () => {
    if (isSeedingRef.current) return;
    isSeedingRef.current = true;
    try {
      console.log('Checking and seeding Firebase Firestore initial records...');
      // 1. Seed Companies
      for (const comp of INITIAL_COMPANIES) {
        await setDoc(doc(db, 'companies', comp.id), comp);
      }
      // 2. Seed Supervisors
      for (const sup of INITIAL_SUPERVISORS) {
        await setDoc(doc(db, 'supervisors', sup.id), sup);
      }
      // 3. Seed Students
      for (const std of INITIAL_STUDENTS) {
        await setDoc(doc(db, 'students', std.id), std);
      }
      // 4. Seed Attendances
      for (const att of INITIAL_ATTENDANCE) {
        await setDoc(doc(db, 'attendances', att.id), att);
      }
      // 5. Seed Journals
      for (const jrn of INITIAL_JOURNALS) {
        await setDoc(doc(db, 'journals', jrn.id), jrn);
      }
      // 6. Seed Messages
      for (const msg of INITIAL_MESSAGES) {
        await setDoc(doc(db, 'messages', msg.id), msg);
      }
      // 7. Seed Announcements
      for (const ann of INITIAL_ANNOUNCEMENTS) {
        await setDoc(doc(db, 'announcements', ann.id), ann);
      }
      // 8. Seed Admins
      await setDoc(doc(db, 'admins', 'admin-default'), {
        uid: 'admin-1',
        email: BOOTSTRAP_ADMIN_EMAIL,
        name: 'Dra. Hj. Ratna Sari, M.Pd.',
        addedAt: new Date().toISOString(),
      });
      console.log('Firebase Firestore seeding complete.');
    } catch (err) {
      console.warn('Firebase seeding skipped or error (might already exist or permission boundary):', err);
    } finally {
      isSeedingRef.current = false;
    }
  }, []);

  // Setup Firebase Auth State Listener & Firestore Real-Time Listeners
  useEffect(() => {
    let unsubs: Unsubscribe[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsFirebaseLoading(false);

      if (user) {
        setIsFirebaseConnected(true);
        const emailLower = (user.email || '').toLowerCase();
        const isBootstrapAdmin = emailLower === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

        if (isBootstrapAdmin) {
          const adminObj: AdminUser = {
            id: user.uid,
            email: user.email || BOOTSTRAP_ADMIN_EMAIL,
            name: user.displayName || 'Administrator BKK',
            role: 'admin',
            avatar: user.photoURL || INITIAL_ADMIN.avatar,
            position: 'Koordinator Utama BKK & Hubin',
          };
          setAdmin(adminObj);
          setCurrentUserId(user.uid);
          showToast('success', `Terhubung ke Firebase sebagai Admin (${user.email})`);
        } else {
          // Check if user email matches an existing student or supervisor
          const matchedStudent = students.find((s) => s.email.toLowerCase() === emailLower);
          const matchedSupervisor = supervisors.find((s) => s.email.toLowerCase() === emailLower);

          if (matchedStudent) {
            setCurrentUserId(matchedStudent.id);
            showToast('success', `Terhubung sebagai Siswa: ${matchedStudent.name}`);
          } else if (matchedSupervisor) {
            setCurrentUserId(matchedSupervisor.id);
            showToast('success', `Terhubung sebagai Pembimbing: ${matchedSupervisor.name}`);
          } else {
            // Default to student or admin profile
            showToast('info', `Login Google berhasil (${user.email}). Memuat data cloud.`);
          }
        }

        // Attach Realtime Firestore Listeners
        unsubs.forEach((u) => u());
        unsubs = [];

        try {
          // Companies
          const compPath = 'companies';
          const unsubComp = onSnapshot(
            collection(db, compPath),
            (snapshot) => {
              if (!snapshot.empty) {
                const list = snapshot.docs.map((d) => d.data() as Company);
                setCompanies(list);
              }
            },
            (error) => {
              console.warn('Firestore snapshot error on companies:', error);
            }
          );
          unsubs.push(unsubComp);

          // Students
          const stdPath = 'students';
          const unsubStd = onSnapshot(
            collection(db, stdPath),
            (snapshot) => {
              if (!snapshot.empty) {
                const list = snapshot.docs.map((d) => d.data() as Student);
                setStudents(list);
              }
            },
            (error) => {
              console.warn('Firestore snapshot error on students:', error);
            }
          );
          unsubs.push(unsubStd);

          // Supervisors
          const supPath = 'supervisors';
          const unsubSup = onSnapshot(
            collection(db, supPath),
            (snapshot) => {
              if (!snapshot.empty) {
                const list = snapshot.docs.map((d) => d.data() as Supervisor);
                setSupervisors(list);
              }
            },
            (error) => {
              console.warn('Firestore snapshot error on supervisors:', error);
            }
          );
          unsubs.push(unsubSup);

          // Attendances
          const attPath = 'attendances';
          const unsubAtt = onSnapshot(
            collection(db, attPath),
            (snapshot) => {
              if (!snapshot.empty) {
                const list = snapshot.docs.map((d) => d.data() as AttendanceRecord);
                setAttendances(list);
              }
            },
            (error) => {
              console.warn('Firestore snapshot error on attendances:', error);
            }
          );
          unsubs.push(unsubAtt);

          // Journals
          const jrnPath = 'journals';
          const unsubJrn = onSnapshot(
            collection(db, jrnPath),
            (snapshot) => {
              if (!snapshot.empty) {
                const list = snapshot.docs.map((d) => d.data() as JournalEntry);
                setJournals(list);
              }
            },
            (error) => {
              console.warn('Firestore snapshot error on journals:', error);
            }
          );
          unsubs.push(unsubJrn);

          // Messages
          const msgPath = 'messages';
          const unsubMsg = onSnapshot(
            collection(db, msgPath),
            (snapshot) => {
              if (!snapshot.empty) {
                const list = snapshot.docs.map((d) => d.data() as Message);
                setMessages(list);
              }
            },
            (error) => {
              console.warn('Firestore snapshot error on messages:', error);
            }
          );
          unsubs.push(unsubMsg);

          // Announcements
          const annPath = 'announcements';
          const unsubAnn = onSnapshot(
            collection(db, annPath),
            (snapshot) => {
              if (!snapshot.empty) {
                const list = snapshot.docs.map((d) => d.data() as Announcement);
                setAnnouncements(list);
              }
            },
            (error) => {
              console.warn('Firestore snapshot error on announcements:', error);
            }
          );
          unsubs.push(unsubAnn);

          // Check if we need to seed the cloud database
          getDocs(collection(db, 'students'))
            .then((snap) => {
              if (snap.empty) {
                seedFirebaseDatabase();
              }
            })
            .catch((err) => {
              console.debug('Cloud database query check:', err);
            });
        } catch (err) {
          console.warn('Could not establish real-time listeners:', err);
        }
      } else {
        setIsFirebaseConnected(false);
      }
    });

    // Test connection once
    testConnection().then((connected) => {
      if (connected) {
        setIsFirebaseConnected(true);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubs.forEach((u) => u());
    };
  }, [showToast, seedFirebaseDatabase]);

  // Google Sign-In with Firebase Auth
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setFirebaseUser(user);
      setIsFirebaseConnected(true);

      const emailLower = (user.email || '').toLowerCase();
      if (emailLower === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
        const adminObj: AdminUser = {
          id: user.uid,
          email: user.email || BOOTSTRAP_ADMIN_EMAIL,
          name: user.displayName || 'Administrator BKK',
          role: 'admin',
          avatar: user.photoURL || INITIAL_ADMIN.avatar,
          position: 'Koordinator Utama BKK & Hubin',
        };
        setAdmin(adminObj);
        setCurrentUserId(user.uid);
        showToast('success', `Selamat datang Admin! Masuk sebagai ${user.displayName || user.email}`);
      } else {
        showToast('success', `Berhasil masuk dengan Google: ${user.displayName || user.email}`);
      }
      return true;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      showToast('error', 'Gagal masuk dengan Google. Pastikan popup tidak diblokir.');
      return false;
    }
  };

  const signOutGoogle = async (): Promise<void> => {
    try {
      await fbSignOut(auth);
      setFirebaseUser(null);
      showToast('info', 'Berhasil keluar dari akun Google.');
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
    }
  };

  // Demo Login
  const login = (role: UserRole, email: string) => {
    let targetUser: User | undefined;
    if (role === 'admin') {
      if (
        admin.email.toLowerCase() === email.toLowerCase() ||
        email === 'admin@smk.id' ||
        email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()
      ) {
        targetUser = admin;
      }
    } else if (role === 'pembimbing') {
      targetUser = supervisors.find((s) => s.email.toLowerCase() === email.toLowerCase());
      if (!targetUser && supervisors.length > 0) targetUser = supervisors[0];
    } else {
      targetUser = students.find((s) => s.email.toLowerCase() === email.toLowerCase());
      if (!targetUser && students.length > 0) targetUser = students[0];
    }

    if (targetUser) {
      setCurrentUserId(targetUser.id);
      showToast('success', `Berhasil login sebagai ${targetUser.name} (${role.toUpperCase()})`);
      return true;
    }

    showToast('error', 'Akun tidak ditemukan. Silakan cek email atau pilih akun demo.');
    return false;
  };

  const logout = () => {
    setCurrentUserId(null);
    showToast('info', 'Anda telah keluar dari aplikasi.');
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const target =
      userId === admin.id
        ? admin
        : students.find((s) => s.id === userId) || supervisors.find((s) => s.id === userId);
    if (target) {
      showToast('success', `Beralih peran: ${target.name} (${target.role.toUpperCase()})`);
    }
  };

  // Helper date function (returns YYYY-MM-DD)
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTimeString = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0]; // HH:mm:ss
  };

  const getTodayAttendance = (studentId: string) => {
    const today = getTodayString();
    return attendances.find((a) => a.studentId === studentId && a.date === today);
  };

  const getStudentAttendanceHistory = (studentId: string) => {
    return attendances
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => (b.date + b.checkInTime).localeCompare(a.date + a.checkInTime));
  };

  // Check in
  const checkIn = async (
    studentId: string,
    notes?: string,
    customStatus?: AttendanceStatus,
    customLocation?: string
  ): Promise<{ success: boolean; message: string }> => {
    const today = getTodayString();
    const existing = attendances.find((a) => a.studentId === studentId && a.date === today);

    if (existing) {
      showToast('error', 'Siswa sudah melakukan check-in hari ini!');
      return { success: false, message: 'Sudah melakukan check-in hari ini' };
    }

    const timeStr = getTimeString();
    let status: AttendanceStatus = customStatus || 'Hadir';
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    if (!customStatus && (hour > 8 || (hour === 8 && minute > 0))) {
      status = 'Terlambat';
    }

    const student = students.find((s) => s.id === studentId);
    const company = companies.find((c) => c.id === student?.companyId);

    const recordId = 'att-' + Date.now();
    const newRecord: AttendanceRecord = {
      id: recordId,
      studentId,
      date: today,
      checkInTime: timeStr,
      status,
      notes: notes || (status === 'Terlambat' ? 'Terlambat masuk kerja magang' : 'Hadir tepat waktu'),
      location: customLocation || company?.name || 'Tempat Magang',
      verifiedBySupervisor: false,
    };

    setAttendances((prev) => [newRecord, ...prev]);

    // Save to Firestore if connected
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'attendances', recordId), newRecord);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `attendances/${recordId}`);
      }
    }

    showToast('success', `Check-in berhasil pukul ${timeStr} [Status: ${status}]`);
    return { success: true, message: 'Check-in berhasil' };
  };

  // Check out
  const checkOut = async (studentId: string, notes?: string): Promise<{ success: boolean; message: string }> => {
    const today = getTodayString();
    const existingIndex = attendances.findIndex((a) => a.studentId === studentId && a.date === today);

    if (existingIndex === -1) {
      showToast('error', 'Harap lakukan Check-in terlebih dahulu sebelum Check-out!');
      return { success: false, message: 'Belum check-in hari ini' };
    }

    const existing = attendances[existingIndex];
    if (existing.checkOutTime) {
      showToast('error', 'Anda sudah melakukan check-out hari ini!');
      return { success: false, message: 'Sudah check-out' };
    }

    const timeStr = getTimeString();
    const updatedRecord: AttendanceRecord = {
      ...existing,
      checkOutTime: timeStr,
      notes: notes ? `${existing.notes ? existing.notes + ' | ' : ''}${notes}` : existing.notes,
    };

    setAttendances((prev) => {
      const copy = [...prev];
      copy[existingIndex] = updatedRecord;
      return copy;
    });

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'attendances', existing.id), updatedRecord);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `attendances/${existing.id}`);
      }
    }

    showToast('success', `Check-out berhasil pukul ${timeStr}. Sampai jumpa besok!`);
    return { success: true, message: 'Check-out berhasil' };
  };

  // Journals
  const createJournal = async (journalData: Omit<JournalEntry, 'id' | 'createdAt' | 'status'>): Promise<void> => {
    const jrnId = 'jrn-' + Date.now();
    const newJournal: JournalEntry = {
      ...journalData,
      id: jrnId,
      status: 'Menunggu Validasi',
      createdAt: new Date().toISOString(),
    };

    setJournals((prev) => [newJournal, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'journals', jrnId), newJournal);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `journals/${jrnId}`);
      }
    }

    showToast('success', 'Jurnal berhasil dikirim! Menunggu validasi dari pembimbing.');
  };

  const updateJournal = async (id: string, updates: Partial<JournalEntry>): Promise<void> => {
    let updatedItem: JournalEntry | undefined;
    setJournals((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          updatedItem = {
            ...j,
            ...updates,
            updatedAt: new Date().toISOString(),
            status: updates.status || (j.status === 'Perlu Revisi' ? 'Menunggu Validasi' : j.status),
          };
          return updatedItem;
        }
        return j;
      })
    );

    if (auth.currentUser && updatedItem) {
      try {
        await setDoc(doc(db, 'journals', id), updatedItem);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `journals/${id}`);
      }
    }

    showToast('success', 'Jurnal berhasil diperbarui dan dikirim ulang.');
  };

  const validateJournal = async (
    id: string,
    status: 'Disetujui' | 'Perlu Revisi',
    supervisorNotes: string,
    supervisorName: string
  ): Promise<void> => {
    let validatedItem: JournalEntry | undefined;
    setJournals((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          validatedItem = {
            ...j,
            status,
            supervisorNotes,
            validatedAt: new Date().toISOString(),
            validatedBy: supervisorName,
          };
          return validatedItem;
        }
        return j;
      })
    );

    if (auth.currentUser && validatedItem) {
      try {
        await setDoc(doc(db, 'journals', id), validatedItem);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `journals/${id}`);
      }
    }

    showToast('success', `Status jurnal berhasil diubah menjadi: ${status}`);
  };

  const deleteJournal = async (id: string): Promise<void> => {
    setJournals((prev) => prev.filter((j) => j.id !== id));

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'journals', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `journals/${id}`);
      }
    }

    showToast('info', 'Jurnal kegiatan telah dihapus.');
  };

  // Messages
  const sendMessage = async (senderId: string, receiverId: string, text: string): Promise<void> => {
    const sender =
      senderId === admin.id
        ? admin
        : students.find((s) => s.id === senderId) || supervisors.find((s) => s.id === senderId);

    if (!sender) return;

    const convId = [senderId, receiverId].sort().join('_');
    const now = new Date();
    const timeFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const msgId = 'msg-' + Date.now();
    const newMsg: Message = {
      id: msgId,
      conversationId: convId,
      senderId,
      senderName: sender.name,
      senderRole: sender.role,
      receiverId,
      text,
      timestamp: timeFormatted,
      read: false,
    };

    setMessages((prev) => [...prev, newMsg]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'messages', msgId), newMsg);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `messages/${msgId}`);
      }
    }
  };

  const markConversationAsRead = async (otherUserId: string): Promise<void> => {
    if (!currentUserId) return;
    const msgsToUpdate: Message[] = [];
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.receiverId === currentUserId && msg.senderId === otherUserId) {
          const updated = { ...msg, read: true };
          msgsToUpdate.push(updated);
          return updated;
        }
        return msg;
      })
    );

    if (auth.currentUser && msgsToUpdate.length > 0) {
      try {
        for (const m of msgsToUpdate) {
          await updateDoc(doc(db, 'messages', m.id), { read: true });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'messages');
      }
    }
  };

  const getUnreadCountForUser = (userId: string) => {
    return messages.filter((m) => m.receiverId === userId && !m.read).length;
  };

  // Announcements
  const createAnnouncement = async (ann: Omit<Announcement, 'id'>): Promise<void> => {
    const annId = 'ann-' + Date.now();
    const newAnn: Announcement = {
      ...ann,
      id: annId,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'announcements', annId), newAnn);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `announcements/${annId}`);
      }
    }

    showToast('success', 'Pengumuman baru berhasil dipublikasikan.');
  };

  const toggleAnnouncement = async (id: string): Promise<void> => {
    let targetAnn: Announcement | undefined;
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          targetAnn = { ...a, isActive: !a.isActive };
          return targetAnn;
        }
        return a;
      })
    );

    if (auth.currentUser && targetAnn) {
      try {
        await updateDoc(doc(db, 'announcements', id), { isActive: targetAnn.isActive });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `announcements/${id}`);
      }
    }
  };

  const deleteAnnouncement = async (id: string): Promise<void> => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'announcements', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
      }
    }

    showToast('info', 'Pengumuman dihapus.');
  };

  // Management (Admin)
  const addStudent = async (studentData: Omit<Student, 'id' | 'role'>): Promise<void> => {
    const stdId = 'std-' + Date.now();
    const newStd: Student = {
      ...studentData,
      id: stdId,
      role: 'siswa',
      avatar:
        studentData.avatar ||
        `https://images.unsplash.com/photo-${1534528741775 + students.length}?w=150&auto=format&fit=crop&q=80`,
    };
    setStudents((prev) => [...prev, newStd]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'students', stdId), newStd);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `students/${stdId}`);
      }
    }

    showToast('success', `Siswa ${newStd.name} berhasil didaftarkan.`);
  };

  const updateStudent = async (id: string, updates: Partial<Student>): Promise<void> => {
    let updatedStd: Student | undefined;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updatedStd = { ...s, ...updates };
          return updatedStd;
        }
        return s;
      })
    );

    if (auth.currentUser && updatedStd) {
      try {
        await setDoc(doc(db, 'students', id), updatedStd);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `students/${id}`);
      }
    }

    showToast('success', 'Data siswa berhasil diperbarui.');
  };

  const deleteStudent = async (id: string): Promise<void> => {
    setStudents((prev) => prev.filter((s) => s.id !== id));

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'students', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
      }
    }

    showToast('info', 'Data siswa telah dihapus.');
  };

  const addSupervisor = async (supData: Omit<Supervisor, 'id' | 'role'>): Promise<void> => {
    const supId = 'sup-' + Date.now();
    const newSup: Supervisor = {
      ...supData,
      id: supId,
      role: 'pembimbing',
      avatar:
        supData.avatar ||
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    };
    setSupervisors((prev) => [...prev, newSup]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'supervisors', supId), newSup);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `supervisors/${supId}`);
      }
    }

    showToast('success', `Pembimbing ${newSup.name} berhasil ditambahkan.`);
  };

  const updateSupervisor = async (id: string, updates: Partial<Supervisor>): Promise<void> => {
    let updatedSup: Supervisor | undefined;
    setSupervisors((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updatedSup = { ...s, ...updates };
          return updatedSup;
        }
        return s;
      })
    );

    if (auth.currentUser && updatedSup) {
      try {
        await setDoc(doc(db, 'supervisors', id), updatedSup);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `supervisors/${id}`);
      }
    }

    showToast('success', 'Data pembimbing berhasil diperbarui.');
  };

  const deleteSupervisor = async (id: string): Promise<void> => {
    setSupervisors((prev) => prev.filter((s) => s.id !== id));

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'supervisors', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `supervisors/${id}`);
      }
    }

    showToast('info', 'Data pembimbing telah dihapus.');
  };

  const addCompany = async (compData: Omit<Company, 'id'>): Promise<void> => {
    const compId = 'comp-' + Date.now();
    const newComp: Company = {
      ...compData,
      id: compId,
    };
    setCompanies((prev) => [...prev, newComp]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'companies', compId), newComp);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `companies/${compId}`);
      }
    }

    showToast('success', `Perusahaan ${newComp.name} berhasil ditambahkan.`);
  };

  const updateCompany = async (id: string, updates: Partial<Company>): Promise<void> => {
    let updatedComp: Company | undefined;
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedComp = { ...c, ...updates };
          return updatedComp;
        }
        return c;
      })
    );

    if (auth.currentUser && updatedComp) {
      try {
        await setDoc(doc(db, 'companies', id), updatedComp);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `companies/${id}`);
      }
    }

    showToast('success', 'Data perusahaan berhasil disimpan.');
  };

  const deleteCompany = async (id: string): Promise<void> => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'companies', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `companies/${id}`);
      }
    }

    showToast('info', 'Data perusahaan telah dihapus.');
  };

  const assignInternship = async (studentId: string, companyId: string, supervisorId: string): Promise<void> => {
    let targetStd: Student | undefined;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          targetStd = { ...s, companyId, supervisorId };
          return targetStd;
        }
        return s;
      })
    );

    if (auth.currentUser && targetStd) {
      try {
        await updateDoc(doc(db, 'students', studentId), { companyId, supervisorId });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `students/${studentId}`);
      }
    }

    showToast('success', 'Penempatan magang siswa berhasil diperbarui.');
  };

  const resetToDefaultData = async (): Promise<void> => {
    setStudents(INITIAL_STUDENTS);
    setSupervisors(INITIAL_SUPERVISORS);
    setCompanies(INITIAL_COMPANIES);
    setAttendances(INITIAL_ATTENDANCE);
    setJournals(INITIAL_JOURNALS);
    setMessages(INITIAL_MESSAGES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setCurrentUserId('std-1');
    localStorage.clear();

    if (auth.currentUser) {
      await seedFirebaseDatabase();
    }

    showToast('info', 'Seluruh data telah direset ke data default.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isFirebaseConnected,
        isFirebaseLoading,
        students,
        supervisors,
        admin,
        companies,
        attendances,
        journals,
        messages,
        announcements,
        toast,
        showToast,
        clearToast,
        login,
        logout,
        switchUser,
        signInWithGoogle,
        signOutGoogle,
        checkIn,
        checkOut,
        getTodayAttendance,
        getStudentAttendanceHistory,
        createJournal,
        updateJournal,
        validateJournal,
        deleteJournal,
        sendMessage,
        markConversationAsRead,
        getUnreadCountForUser,
        createAnnouncement,
        toggleAnnouncement,
        deleteAnnouncement,
        addStudent,
        updateStudent,
        deleteStudent,
        addSupervisor,
        updateSupervisor,
        deleteSupervisor,
        addCompany,
        updateCompany,
        deleteCompany,
        assignInternship,
        resetToDefaultData,
        seedFirebaseDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
