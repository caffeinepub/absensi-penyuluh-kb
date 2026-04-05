import { cn } from "@/lib/utils";
import {
  BarChart3,
  ClipboardCheck,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Users,
  X,
} from "lucide-react";
import type { Page } from "../types";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  userRole: "admin" | "pegawai";
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems: {
  id: Page;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "absensi", label: "Absensi", icon: <ClipboardCheck size={18} /> },
  { id: "kartu", label: "Kartu Pegawai", icon: <CreditCard size={18} /> },
  { id: "rekap", label: "Rekap Kehadiran", icon: <BarChart3 size={18} /> },
  {
    id: "manajemen",
    label: "Manajemen Pegawai",
    icon: <Users size={18} />,
    adminOnly: true,
  },
  {
    id: "ubahpassword",
    label: "Ubah Password",
    icon: <KeyRound size={18} />,
    adminOnly: true,
  },
];

function SidebarContent({
  currentPage,
  onNavigate,
  onLogout,
  userRole,
  onClose,
}: Omit<SidebarProps, "isOpen">) {
  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || userRole === "admin",
  );

  const handleNav = (page: Page) => {
    onNavigate(page);
    onClose?.();
  };

  return (
    <>
      {/* Brand */}
      <div
        className="flex items-center justify-between px-5 py-5 border-b flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo_bkkbn-019d5e48-16d8-73fe-a725-df08e9261adf.jpg"
            alt="Logo BKKBN"
            className="w-9 h-9 rounded-lg flex-shrink-0 object-contain"
          />
          <div>
            <div className="text-white font-bold text-sm leading-tight tracking-wide">
              E-VISUM PKB
            </div>
            <div className="text-xs" style={{ color: "#7BA7C9" }}>
              Sistem Informasi
            </div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Tutup menu"
          >
            <X size={18} className="text-white" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            data-ocid={`sidebar.${item.id}.link`}
            onClick={() => handleNav(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left",
              currentPage === item.id ? "text-white" : "hover:text-white",
            )}
            style={{
              background: currentPage === item.id ? "#2F6FB0" : "transparent",
              color: currentPage === item.id ? "white" : "#A8C4DC",
            }}
          >
            <span
              style={{ color: currentPage === item.id ? "white" : "#7BA7C9" }}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div
        className="px-3 pb-5 flex-shrink-0"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "12px",
        }}
      >
        <button
          type="button"
          data-ocid="sidebar.logout.button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={{ color: "#A8C4DC" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "rgba(216,74,74,0.2)";
            el.style.color = "#F87171";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "transparent";
            el.style.color = "#A8C4DC";
          }}
        >
          <LogOut size={18} style={{ color: "#7BA7C9" }} />
          Keluar
        </button>
      </div>
    </>
  );
}

export default function Sidebar({
  currentPage,
  onNavigate,
  onLogout,
  userRole,
  isOpen = false,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <aside
        className="sidebar no-print hidden md:flex flex-col w-64 min-h-screen flex-shrink-0"
        style={{
          background: "linear-gradient(180deg, #08263D 0%, #0A2B45 100%)",
        }}
      >
        <SidebarContent
          currentPage={currentPage}
          onNavigate={onNavigate}
          onLogout={onLogout}
          userRole={userRole}
        />
      </aside>

      {/* Mobile overlay backdrop — uses button for keyboard accessibility */}
      {isOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-40 w-full h-full bg-black/50 no-print cursor-default"
          onClick={onClose}
          aria-label="Tutup menu"
          tabIndex={-1}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="sidebar no-print md:hidden fixed left-0 top-0 z-50 h-full w-72 flex flex-col"
        style={{
          background: "linear-gradient(180deg, #08263D 0%, #0A2B45 100%)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
        aria-hidden={!isOpen}
      >
        <SidebarContent
          currentPage={currentPage}
          onNavigate={onNavigate}
          onLogout={onLogout}
          userRole={userRole}
          onClose={onClose}
        />
      </aside>
    </>
  );
}
