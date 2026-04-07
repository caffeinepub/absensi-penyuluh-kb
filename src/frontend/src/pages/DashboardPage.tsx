import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle,
  ClipboardCheck,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import type { Employee, Page } from "../types";
import { getAttendances, getEmployees } from "../utils/storage";

interface DashboardPageProps {
  user: Employee;
  onNavigate: (page: Page) => void;
}

const statusColors: Record<string, string> = {
  Hadir: "#2FA66B",
  Izin: "#D97706",
  Sakit: "#2E7BC6",
  Alpha: "#D84A4A",
  "Tugas Luar": "#7C3AED",
};

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const today = new Date().toISOString().split("T")[0];

  const { employees, attendances } = useMemo(() => {
    return {
      employees: getEmployees(),
      attendances: getAttendances(),
    };
  }, []);

  const pegawaiList = employees.filter((e) => e.role === "pegawai");
  const todayAttendances = attendances.filter((a) => a.tanggal === today);
  const recentAttendances = [...attendances]
    .sort((a, b) => {
      if (a.tanggal < b.tanggal) return 1;
      if (a.tanggal > b.tanggal) return -1;
      return (a.waktuMasuk ?? "") < (b.waktuMasuk ?? "") ? 1 : -1;
    })
    .slice(0, 5);

  const hadirCount = todayAttendances.filter(
    (a) => a.status === "Hadir",
  ).length;
  const sakitIzinCount = todayAttendances.filter(
    (a) => a.status === "Sakit" || a.status === "Izin",
  ).length;
  const alphaCount = todayAttendances.filter(
    (a) => a.status === "Alpha",
  ).length;
  const tugasLuarCount = todayAttendances.filter(
    (a) => a.status === "Tugas Luar",
  ).length;

  const metrics = [
    {
      label: "Total Pegawai",
      value: pegawaiList.length,
      icon: <Users size={22} />,
      color: "#2E7BC6",
      bg: "#EBF4FB",
    },
    {
      label: "Hadir Hari Ini",
      value: hadirCount,
      icon: <CheckCircle size={22} />,
      color: "#2FA66B",
      bg: "#EDFAF3",
    },
    {
      label: "Sakit / Izin",
      value: sakitIzinCount,
      icon: <AlertCircle size={22} />,
      color: "#D97706",
      bg: "#FEF3C7",
    },
    {
      label: "Alpha",
      value: alphaCount,
      icon: <XCircle size={22} />,
      color: "#D84A4A",
      bg: "#FEE2E2",
    },
    {
      label: "Tugas Luar",
      value: tugasLuarCount,
      icon: <Briefcase size={22} />,
      color: "#7C3AED",
      bg: "#F3EEFF",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl p-4 md:p-5 shadow-sm"
            style={{ background: "white" }}
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div
                className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center"
                style={{ background: m.bg, color: m.color }}
              >
                {m.icon}
              </div>
            </div>
            <div
              className="text-2xl md:text-3xl font-bold"
              style={{ color: "#0A2B45" }}
            >
              {m.value}
            </div>
            <div className="text-xs mt-1" style={{ color: "#6E8193" }}>
              {m.label}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl p-4 md:p-5 shadow-sm"
        style={{
          background: "linear-gradient(135deg, #08263D 0%, #0E3B4C 100%)",
          color: "white",
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(47,111,176,0.5)" }}
          >
            <ClipboardCheck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">Absensi Hari Ini</div>
            <div className="text-xs" style={{ color: "#7BA7C9" }}>
              {today} — Jangan lupa absensi
            </div>
          </div>
          <button
            type="button"
            data-ocid="dashboard.absensi.button"
            onClick={() => onNavigate("absensi")}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
            style={{ background: "#2F6FB0", color: "white" }}
          >
            Absensi
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            data-ocid="dashboard.tugasluar.button"
            onClick={() => onNavigate("tugasluar")}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
            style={{ background: "#6D28D9", color: "white" }}
          >
            <Briefcase size={14} />
            Tugas Luar
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-xl shadow-sm overflow-hidden"
        style={{ background: "white" }}
      >
        <div
          className="px-4 md:px-5 py-4 border-b"
          style={{ background: "#0A2B45", borderColor: "#1A3B55" }}
        >
          <h3 className="font-semibold text-white text-sm">
            Rekap Kehadiran (Terbaru)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "480px" }}>
            <thead>
              <tr style={{ background: "#F1F5F9" }}>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Pegawai
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Masuk
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pulang
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody data-ocid="dashboard.table">
              {recentAttendances.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="dashboard.empty_state"
                  >
                    Belum ada data absensi
                  </td>
                </tr>
              ) : (
                recentAttendances.map((a, idx) => (
                  <tr
                    key={a.id}
                    data-ocid={`dashboard.attendance.item.${idx + 1}`}
                    className="border-t hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "#F1F5F9" }}
                  >
                    <td className="px-3 md:px-4 py-3 text-gray-400 text-xs">
                      {idx + 1}
                    </td>
                    <td className="px-3 md:px-4 py-3 font-medium text-gray-800 text-xs md:text-sm">
                      {a.employeeName}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-600 text-xs">
                      {a.tanggal}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-600 text-xs">
                      {a.waktuMasuk ?? "-"}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-600 text-xs">
                      {a.waktuKeluar ?? "-"}
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <Badge
                        className="text-xs px-2 py-0.5 text-white border-none"
                        style={{
                          background: statusColors[a.status] ?? "#6E8193",
                        }}
                      >
                        {a.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
