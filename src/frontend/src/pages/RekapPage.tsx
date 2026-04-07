import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Eye, FileText, Pencil, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Attendance, Employee } from "../types";
import {
  getAttendances,
  getEmployees,
  saveAttendances,
} from "../utils/storage";

interface RekapPageProps {
  user: Employee;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Hadir: { bg: "#EDFAF3", text: "#1A7A4A" },
  Izin: { bg: "#FEF3C7", text: "#92400E" },
  Sakit: { bg: "#EBF4FB", text: "#1A5A8A" },
  Alpha: { bg: "#FEE2E2", text: "#991B1B" },
  "Tugas Luar": { bg: "#F3EEFF", text: "#5B21B6" },
};

const ALL_STATUSES: Attendance["status"][] = [
  "Hadir",
  "Izin",
  "Sakit",
  "Alpha",
  "Tugas Luar",
];

function SuratTugasModal({
  attendance,
  onClose,
}: {
  attendance: Attendance;
  onClose: () => void;
}) {
  const isPdf = attendance.suratTugasDataUrl?.startsWith(
    "data:application/pdf",
  );
  const isImage = attendance.suratTugasDataUrl?.startsWith("data:image");

  const handleDownload = () => {
    if (!attendance.suratTugasDataUrl) return;
    const ext = isPdf ? "pdf" : "jpg";
    const a = document.createElement("a");
    a.href = attendance.suratTugasDataUrl;
    a.download = `surat_tugas_${attendance.employeeName.replace(/\s+/g, "_")}_${attendance.tanggal}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <dialog
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden open:flex"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        open
        style={{
          margin: 0,
          padding: 0,
          border: "none",
          maxWidth: "32rem",
          width: "100%",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: "#0A2B45" }}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-blue-300" />
            <div>
              <div className="text-white font-semibold text-sm">
                Surat Tugas — {attendance.employeeName}
              </div>
              <div className="text-xs" style={{ color: "#7BA7C9" }}>
                {attendance.tanggal} · {attendance.tujuanTugas ?? "-"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isImage && (
            <img
              src={attendance.suratTugasDataUrl!}
              alt="Surat Tugas"
              className="w-full rounded-xl object-contain"
              style={{ maxHeight: "60vh" }}
            />
          )}
          {isPdf && (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 text-sm font-medium">
                Dokumen PDF tidak dapat dipratinjau.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Klik Unduh untuk membuka file.
              </p>
            </div>
          )}
          {!isImage && !isPdf && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Format file tidak dikenali.
            </div>
          )}
        </div>

        <div
          className="px-5 py-4 flex gap-2 flex-shrink-0"
          style={{ borderTop: "1px solid #F1F5F9" }}
        >
          <Button
            onClick={handleDownload}
            className="flex-1 text-white text-sm font-semibold flex items-center gap-2"
            style={{ background: "#2FA66B" }}
          >
            <Download size={15} />
            Unduh Surat Tugas
          </Button>
          <Button variant="outline" onClick={onClose} className="text-sm">
            Tutup
          </Button>
        </div>
      </dialog>
    </div>
  );
}

// Modal konfirmasi hapus
function DeleteConfirmModal({
  attendance,
  onConfirm,
  onCancel,
}: {
  attendance: Attendance;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
      role="presentation"
    >
      <dialog
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden open:flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        open
        style={{
          margin: 0,
          padding: 0,
          border: "none",
          maxWidth: "24rem",
          width: "100%",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: "#0A2B45" }}
        >
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-red-400" />
            <span className="text-white font-semibold text-sm">
              Hapus Data Absensi
            </span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
        <div className="px-5 py-5">
          <p className="text-gray-700 text-sm mb-1">
            Yakin ingin menghapus data absensi ini?
          </p>
          <p className="text-gray-500 text-xs">
            <span className="font-semibold text-gray-700">
              {attendance.employeeName}
            </span>{" "}
            — {attendance.tanggal} ({attendance.status})
          </p>
          <p className="text-red-500 text-xs mt-3">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div
          className="px-5 py-4 flex gap-2"
          style={{ borderTop: "1px solid #F1F5F9" }}
        >
          <Button
            onClick={onConfirm}
            className="flex-1 text-white text-sm font-semibold"
            style={{ background: "#D84A4A" }}
          >
            Ya, Hapus
          </Button>
          <Button variant="outline" onClick={onCancel} className="text-sm">
            Batal
          </Button>
        </div>
      </dialog>
    </div>
  );
}

// Modal edit data absensi
function EditAttendanceModal({
  attendance,
  onSave,
  onCancel,
}: {
  attendance: Attendance;
  onSave: (updated: Attendance) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<Attendance["status"]>(attendance.status);
  const [waktuMasuk, setWaktuMasuk] = useState(attendance.waktuMasuk ?? "");
  const [waktuKeluar, setWaktuKeluar] = useState(attendance.waktuKeluar ?? "");
  const [tujuanTugas, setTujuanTugas] = useState(attendance.tujuanTugas ?? "");

  const handleSave = () => {
    onSave({
      ...attendance,
      status,
      waktuMasuk: waktuMasuk.trim() || null,
      waktuKeluar: waktuKeluar.trim() || null,
      tujuanTugas: tujuanTugas.trim() || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
      role="presentation"
    >
      <dialog
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden open:flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        open
        style={{
          margin: 0,
          padding: 0,
          border: "none",
          maxWidth: "28rem",
          width: "100%",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: "#0A2B45" }}
        >
          <div className="flex items-center gap-2">
            <Pencil size={16} className="text-blue-300" />
            <div>
              <div className="text-white font-semibold text-sm">
                Edit Absensi
              </div>
              <div className="text-xs" style={{ color: "#7BA7C9" }}>
                {attendance.employeeName} — {attendance.tanggal}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Status */}
          <div className="space-y-1">
            <label
              htmlFor="edit-status"
              className="text-xs font-semibold text-gray-600 block"
            >
              Status Kehadiran
            </label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as Attendance["status"])}
            >
              <SelectTrigger id="edit-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Waktu Masuk */}
          <div className="space-y-1">
            <label
              htmlFor="edit-waktu-masuk"
              className="text-xs font-semibold text-gray-600 block"
            >
              Waktu Masuk
            </label>
            <input
              id="edit-waktu-masuk"
              type="time"
              value={waktuMasuk}
              onChange={(e) => setWaktuMasuk(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Waktu Keluar */}
          <div className="space-y-1">
            <label
              htmlFor="edit-waktu-keluar"
              className="text-xs font-semibold text-gray-600 block"
            >
              Waktu Pulang
            </label>
            <input
              id="edit-waktu-keluar"
              type="time"
              value={waktuKeluar}
              onChange={(e) => setWaktuKeluar(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Tujuan (khusus Tugas Luar) */}
          {status === "Tugas Luar" && (
            <div className="space-y-1">
              <label
                htmlFor="edit-tujuan"
                className="text-xs font-semibold text-gray-600 block"
              >
                Tujuan Tugas
              </label>
              <input
                id="edit-tujuan"
                type="text"
                value={tujuanTugas}
                onChange={(e) => setTujuanTugas(e.target.value)}
                placeholder="Contoh: Kantor Dinas Kesehatan"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}
        </div>

        <div
          className="px-5 py-4 flex gap-2"
          style={{ borderTop: "1px solid #F1F5F9" }}
        >
          <Button
            onClick={handleSave}
            className="flex-1 text-white text-sm font-semibold"
            style={{ background: "#2F6FB0" }}
          >
            Simpan Perubahan
          </Button>
          <Button variant="outline" onClick={onCancel} className="text-sm">
            Batal
          </Button>
        </div>
      </dialog>
    </div>
  );
}

export default function RekapPage({ user }: RekapPageProps) {
  const isAdmin = user.role === "admin";
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(now.getFullYear()),
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all");
  const [viewingSurat, setViewingSurat] = useState<Attendance | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(
    null,
  );
  const [deletingAttendance, setDeletingAttendance] =
    useState<Attendance | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>(() =>
    getAttendances(),
  );

  const employees = useMemo(
    () => getEmployees().filter((e) => e.role === "pegawai"),
    [],
  );

  const filtered: Attendance[] = useMemo(() => {
    return attendances
      .filter((a) => {
        const [yr, mo] = a.tanggal.split("-");
        const matchMonth = mo === selectedMonth && yr === selectedYear;

        if (!isAdmin) {
          return matchMonth && a.employeeId === user.id;
        }

        const matchEmployee =
          selectedEmployeeId === "all" || a.employeeId === selectedEmployeeId;
        return matchMonth && matchEmployee;
      })
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [
    attendances,
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
      tugasLuar: filtered.filter((a) => a.status === "Tugas Luar").length,
    }),
    [filtered],
  );

  const handleEdit = (updated: Attendance) => {
    const next = attendances.map((a) => (a.id === updated.id ? updated : a));
    saveAttendances(next);
    setAttendances(next);
    setEditingAttendance(null);
  };

  const handleDelete = (id: string) => {
    const next = attendances.filter((a) => a.id !== id);
    saveAttendances(next);
    setAttendances(next);
    setDeletingAttendance(null);
  };

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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
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
            {
              label: "Tugas Luar",
              value: stats.tugasLuar,
              color: "#7C3AED",
              bg: "#F3EEFF",
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
              {isAdmin
                ? `Rekap ${monthNames[selectedMonth]} ${selectedYear}`
                : `Rekap Absensi Saya — ${monthNames[selectedMonth]} ${selectedYear}`}
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
          <table
            className="w-full text-sm"
            style={{ minWidth: isAdmin ? "780px" : "580px" }}
          >
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
                  Lokasi / Tujuan
                </th>
                {isAdmin && (
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase no-print">
                    Surat Tugas
                  </th>
                )}
                {isAdmin && (
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase no-print">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 10 : 8}
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
                          style={{
                            background:
                              a.status === "Tugas Luar" ? "#7C3AED" : "#2F6FB0",
                          }}
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
                      {a.tujuanTugas
                        ? a.tujuanTugas
                        : a.latitude && a.longitude
                          ? `${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}`
                          : "-"}
                    </td>
                    {isAdmin && (
                      <td className="px-3 md:px-4 py-3 no-print">
                        {a.suratTugasDataUrl ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingSurat(a)}
                              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all"
                              style={{
                                background: "#F3EEFF",
                                color: "#7C3AED",
                              }}
                              title="Lihat surat tugas"
                            >
                              <Eye size={12} />
                              <span className="hidden sm:inline">Lihat</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const isPdf = a.suratTugasDataUrl?.startsWith(
                                  "data:application/pdf",
                                );
                                const ext = isPdf ? "pdf" : "jpg";
                                const anchor = document.createElement("a");
                                anchor.href = a.suratTugasDataUrl!;
                                anchor.download = `surat_tugas_${a.employeeName.replace(/\s+/g, "_")}_${a.tanggal}.${ext}`;
                                document.body.appendChild(anchor);
                                anchor.click();
                                document.body.removeChild(anchor);
                              }}
                              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all"
                              style={{
                                background: "#EDFAF3",
                                color: "#2FA66B",
                              }}
                              title="Unduh surat tugas"
                            >
                              <Download size={12} />
                              <span className="hidden sm:inline">Unduh</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    )}
                    {isAdmin && (
                      <td className="px-3 md:px-4 py-3 no-print">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingAttendance(a)}
                            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all hover:opacity-80"
                            style={{ background: "#EBF4FB", color: "#2F6FB0" }}
                            title="Edit data absensi"
                          >
                            <Pencil size={12} />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingAttendance(a)}
                            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all hover:opacity-80"
                            style={{ background: "#FEE2E2", color: "#D84A4A" }}
                            title="Hapus data absensi"
                          >
                            <Trash2 size={12} />
                            <span className="hidden sm:inline">Hapus</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal lihat surat tugas */}
      {viewingSurat && (
        <SuratTugasModal
          attendance={viewingSurat}
          onClose={() => setViewingSurat(null)}
        />
      )}

      {/* Modal edit absensi */}
      {editingAttendance && (
        <EditAttendanceModal
          attendance={editingAttendance}
          onSave={handleEdit}
          onCancel={() => setEditingAttendance(null)}
        />
      )}

      {/* Modal konfirmasi hapus */}
      {deletingAttendance && (
        <DeleteConfirmModal
          attendance={deletingAttendance}
          onConfirm={() => handleDelete(deletingAttendance.id)}
          onCancel={() => setDeletingAttendance(null)}
        />
      )}
    </div>
  );
}
