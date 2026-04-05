import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Attendance, Employee } from "../types";
import { getAttendances, getEmployees } from "../utils/storage";

interface RekapPageProps {
  user: Employee;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Hadir: { bg: "#EDFAF3", text: "#1A7A4A" },
  Izin: { bg: "#FEF3C7", text: "#92400E" },
  Sakit: { bg: "#EBF4FB", text: "#1A5A8A" },
  Alpha: { bg: "#FEE2E2", text: "#991B1B" },
};

export default function RekapPage({ user }: RekapPageProps) {
  const isAdmin = user.role === "admin";
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(now.getFullYear()),
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    isAdmin ? "all" : user.id,
  );

  const employees = useMemo(
    () => getEmployees().filter((e) => e.role === "pegawai"),
    [],
  );
  const allAttendances = useMemo(() => getAttendances(), []);

  const filtered: Attendance[] = useMemo(() => {
    return allAttendances
      .filter((a) => {
        const [yr, mo] = a.tanggal.split("-");
        const matchMonth = mo === selectedMonth && yr === selectedYear;
        const matchEmployee =
          selectedEmployeeId === "all" || a.employeeId === selectedEmployeeId;
        const isOwn = isAdmin || a.employeeId === user.id;
        return matchMonth && matchEmployee && isOwn;
      })
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [
    allAttendances,
    selectedMonth,
    selectedYear,
    selectedEmployeeId,
    isAdmin,
    user.id,
  ]);

  const stats = useMemo(
    () => ({
      hadir: filtered.filter((a) => a.status === "Hadir").length,
      izin: filtered.filter((a) => a.status === "Izin").length,
      sakit: filtered.filter((a) => a.status === "Sakit").length,
      alpha: filtered.filter((a) => a.status === "Alpha").length,
    }),
    [filtered],
  );

  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
  const monthNames: Record<string, string> = {
    "01": "Januari",
    "02": "Februari",
    "03": "Maret",
    "04": "April",
    "05": "Mei",
    "06": "Juni",
    "07": "Juli",
    "08": "Agustus",
    "09": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Desember",
  };
  const years = ["2024", "2025", "2026"];

  return (
    <div className="space-y-4 md:space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4 md:p-5 shadow-sm"
        style={{ background: "white" }}
      >
        <div className="flex flex-wrap gap-2 md:gap-3 items-end">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 block">
              Bulan
            </span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger
                data-ocid="rekap.month.select"
                className="w-32 md:w-36"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {monthNames[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 block">
              Tahun
            </span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger
                data-ocid="rekap.year.select"
                className="w-24 md:w-28"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 block">
                Pegawai
              </span>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger
                  data-ocid="rekap.employee.select"
                  className="w-44 md:w-52"
                >
                  <SelectValue placeholder="Semua Pegawai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pegawai</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="ml-auto no-print">
            <Button
              data-ocid="rekap.export.button"
              onClick={() => window.print()}
              className="text-white text-sm font-semibold flex items-center gap-2"
              style={{ background: "#2FA66B" }}
            >
              <Download size={15} />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {(
          [
            {
              label: "Hadir",
              value: stats.hadir,
              color: "#2FA66B",
              bg: "#EDFAF3",
            },
            {
              label: "Izin",
              value: stats.izin,
              color: "#D97706",
              bg: "#FEF3C7",
            },
            {
              label: "Sakit",
              value: stats.sakit,
              color: "#2E7BC6",
              bg: "#EBF4FB",
            },
            {
              label: "Alpha",
              value: stats.alpha,
              color: "#D84A4A",
              bg: "#FEE2E2",
            },
          ] as const
        ).map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl p-3 md:p-4 shadow-sm"
            style={{ background: s.bg }}
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{ color: s.color }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl shadow-sm overflow-hidden"
        style={{ background: "white" }}
      >
        <div
          className="px-4 md:px-5 py-4 flex items-center justify-between"
          style={{ background: "#0A2B45" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={16} className="text-blue-300 flex-shrink-0" />
            <span className="text-white font-semibold text-sm truncate">
              Rekap {monthNames[selectedMonth]} {selectedYear}
            </span>
          </div>
          <span
            className="text-xs flex-shrink-0 ml-2"
            style={{ color: "#7BA7C9" }}
          >
            {filtered.length} data
          </span>
        </div>

        <div className="overflow-x-auto" id="rekap-table-print">
          <table className="w-full text-sm" style={{ minWidth: "580px" }}>
            <thead>
              <tr style={{ background: "#F1F5F9" }}>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  No
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Nama Pegawai
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  NIP
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Masuk
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Pulang
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Lokasi
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center"
                    data-ocid="rekap.empty_state"
                  >
                    <div className="text-gray-400 text-sm">
                      Tidak ada data absensi untuk periode ini.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((a, idx) => (
                  <tr
                    key={a.id}
                    data-ocid={`rekap.attendance.item.${idx + 1}`}
                    className="border-t hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "#F1F5F9" }}
                  >
                    <td className="px-3 md:px-4 py-3 text-gray-400 text-xs">
                      {idx + 1}
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: "#2F6FB0" }}
                        >
                          {a.employeeName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 text-xs">
                          {a.employeeName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-600 text-xs font-mono">
                      {a.employeeNip}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-600 text-xs">
                      {a.tanggal}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs font-medium">
                      {a.waktuMasuk ?? "-"}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs font-medium">
                      {a.waktuKeluar ?? "-"}
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <Badge
                        className="text-xs px-2 py-0.5 border-none font-semibold"
                        style={{
                          background: STATUS_COLORS[a.status]?.bg ?? "#F1F5F9",
                          color: STATUS_COLORS[a.status]?.text ?? "#374151",
                        }}
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-500 text-xs">
                      {a.latitude && a.longitude
                        ? `${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}`
                        : "-"}
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
