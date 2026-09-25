import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Toast } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginView } from './components/auth/LoginView';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { AttendanceView } from './components/student/AttendanceView';
import { JournalView } from './components/student/JournalView';
import { DocumentationGallery } from './components/student/DocumentationGallery';

// Supervisor Views
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { SupervisorStudentsView } from './components/supervisor/SupervisorStudentsView';
import { SupervisorJournalsView } from './components/supervisor/SupervisorJournalsView';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminStudentsView } from './components/admin/AdminStudentsView';
import { AdminSupervisorsView } from './components/admin/AdminSupervisorsView';
import { AdminCompaniesView } from './components/admin/AdminCompaniesView';
import { AdminPlacementView } from './components/admin/AdminPlacementView';
import { AdminReportsView } from './components/admin/AdminReportsView';

// Shared Views
import { ChatView } from './components/chat/ChatView';
import { AnnouncementsView } from './components/common/AnnouncementsView';
import { ProfileView } from './components/common/ProfileView';

const MainAppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [extraNavData, setExtraNavData] = useState<any>(null);

  // If not authenticated, show Login View
  if (!currentUser) {
    return <LoginView />;
  }

  const handleNavigate = (tab: string, extraData?: any) => {
    setCurrentTab(tab);
    if (extraData) {
      setExtraNavData(extraData);
    }
    setIsSidebarOpen(false);
  };

  const handleOpenMessageWithUser = (userId: string) => {
    setExtraNavData({ recipientId: userId });
    setCurrentTab('pesan');
    setIsSidebarOpen(false);
  };

  // Render content according to currentTab and user role
  const renderViewContent = () => {
    const role = currentUser.role;

    switch (currentTab) {
      case 'dashboard':
        if (role === 'siswa') {
          return <StudentDashboard onNavigate={handleNavigate} />;
        }
        if (role === 'pembimbing') {
          return (
            <SupervisorDashboard
              onNavigate={handleNavigate}
              onOpenMessageWithUser={handleOpenMessageWithUser}
            />
          );
        }
        return <AdminDashboard onNavigate={handleNavigate} />;

      case 'absensi':
        if (role === 'siswa') {
          return <AttendanceView />;
        }
        // Supervisor and Admin see the consolidated reports/records
        return <AdminReportsView />;

      case 'jurnal':
        if (role === 'siswa') {
          return (
            <JournalView
              initialOpenCreate={extraNavData?.openCreate}
              initialFilter={extraNavData?.statusFilter}
            />
          );
        }
        if (role === 'pembimbing') {
          return <SupervisorJournalsView initialFilter={extraNavData?.statusFilter} />;
        }
        return <AdminReportsView />;

      case 'dokumentasi':
        return <DocumentationGallery />;

      case 'pesan':
        return <ChatView initialRecipientId={extraNavData?.recipientId} />;

      case 'pengumuman':
        return <AnnouncementsView />;

      case 'profil':
        return <ProfileView />;

      // Supervisor specific
      case 'siswa-bimbingan':
        return (
          <SupervisorStudentsView
            initialStudentId={extraNavData?.selectedStudentId}
            onOpenMessageWithUser={handleOpenMessageWithUser}
          />
        );

      // Admin specific
      case 'data-siswa':
        return <AdminStudentsView />;

      case 'data-pembimbing':
        return <AdminSupervisorsView />;

      case 'perusahaan':
        return <AdminCompaniesView />;

      case 'penempatan':
        return <AdminPlacementView />;

      case 'laporan':
        return <AdminReportsView />;

      default:
        return (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Halaman Sedang Disiapkan</h3>
            <p className="text-xs text-slate-500 mt-1">Silakan pilih menu lain dari bilah navigasi.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigateToMessages={() => handleNavigate('pesan')}
        onNavigateToProfile={() => handleNavigate('profil')}
      />

      {/* Main Container with Sidebar and Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => handleNavigate(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Content Panel */}
        <main className="flex-1 min-w-0 pb-12">
          {renderViewContent()}
        </main>
      </div>

      {/* Global Notification Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
