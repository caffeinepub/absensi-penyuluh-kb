import {
  BarChart3,
  Briefcase,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";
import type { Page } from "../types";

interface MobileBottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "absensi" as Page, label: "Absensi", icon: ClipboardCheck },
  { id: "tugasluar" as Page, label: "Tugas Luar", icon: Briefcase },
  { id: "kartu" as Page, label: "Kartu", icon: CreditCard },
  { id: "rekap" as Page, label: "Rekap", icon: BarChart3 },
];

export default function MobileBottomNav({
  currentPage,
  onNavigate,
}: MobileBottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex no-print pb-safe"
      style={{
        background: "linear-gradient(180deg, #08263D 0%, #0A2B45 100%)",
      }}
      data-ocid="mobile.bottom_nav"
    >
      {navItems.map((item) => {
        const isActive = currentPage === item.id;
        const isTugasLuar = item.id === "tugasluar";
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            data-ocid={`mobile.nav.${item.id}.button`}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-all duration-150"
            style={{
              background: isActive
                ? isTugasLuar
                  ? "rgba(109,40,217,0.35)"
                  : "rgba(47,111,176,0.3)"
                : "transparent",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
              style={{
                background: isActive
                  ? isTugasLuar
                    ? "#6D28D9"
                    : "#2F6FB0"
                  : "transparent",
              }}
            >
              <Icon
                size={16}
                style={{
                  color: isActive
                    ? "white"
                    : isTugasLuar
                      ? "#C4B5FD"
                      : "#7BA7C9",
                }}
              />
            </div>
            <span
              className="text-[9px] font-medium leading-tight"
              style={{
                color: isActive ? "white" : isTugasLuar ? "#C4B5FD" : "#7BA7C9",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
