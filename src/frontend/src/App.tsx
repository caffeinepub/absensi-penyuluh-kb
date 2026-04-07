import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import MobileBottomNav from "./components/MobileBottomNav";
import Sidebar from "./components/Sidebar";
import AbsenTugasLuarPage from "./pages/AbsenTugasLuarPage";
import AbsensiPage from "./pages/AbsensiPage";
import DashboardPage from "./pages/DashboardPage";
import KartuPegawaiPage from "./pages/KartuPegawaiPage";
import LoginPage from "./pages/LoginPage";
import ManajemenPegawaiPage from "./pages/ManajemenPegawaiPage";
import RekapPage from "./pages/RekapPage";
import UbahPasswordPage from "./pages/UbahPasswordPage";
import type { Employee, Page } from "./types";
import {
  clearCurrentUser,
  getCurrentUser,
  seedInitialData,
} from "./utils/storage";

seedInitialData();

export default function App() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: Employee) => {
    setCurrentUser(user);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUser(null);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const handleUserUpdate = (updatedUser: Employee) => {
    setCurrentUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#C9D3DD" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const pageTitles: Record<Page, string> = {
    dashboard: "Dashboard",
    absensi: "Absensi",
    tugasluar: "Absen Tugas Luar",
    kartu: "Kartu Pegawai",
    rekap: "Rekap Kehadiran",
    manajemen: "Manajemen Pegawai",
    ubahpassword: "Ubah Password",
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#C9D3DD" }}
    >
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userRole={currentUser.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header
          pageTitle={pageTitles[currentPage]}
          user={currentUser}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-3 md:p-6 pb-20 md:pb-6">
          {currentPage === "dashboard" && (
            <DashboardPage user={currentUser} onNavigate={handleNavigate} />
          )}
          {currentPage === "absensi" && <AbsensiPage user={currentUser} />}
          {currentPage === "tugasluar" && (
            <AbsenTugasLuarPage user={currentUser} />
          )}
          {currentPage === "kartu" && <KartuPegawaiPage user={currentUser} />}
          {currentPage === "rekap" && <RekapPage user={currentUser} />}
          {currentPage === "manajemen" && currentUser.role === "admin" && (
            <ManajemenPegawaiPage />
          )}
          {currentPage === "ubahpassword" && currentUser.role === "admin" && (
            <UbahPasswordPage
              user={currentUser}
              onUserUpdate={handleUserUpdate}
            />
          )}
        </main>
        <footer className="py-3 text-center text-xs text-gray-500 no-print hidden md:block">
          © {new Date().getFullYear()}. Built with ❤ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav currentPage={currentPage} onNavigate={handleNavigate} />

      <Toaster />
    </div>
  );
}
