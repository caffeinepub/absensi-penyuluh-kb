import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import EmployeeCard from "../components/EmployeeCard";
import type { Employee } from "../types";
import { getEmployees, saveEmployees, setCurrentUser } from "../utils/storage";

interface KartuPegawaiPageProps {
  user: Employee;
  onUserUpdate?: (updated: Employee) => void;
}

export default function KartuPegawaiPage({
  user,
  onUserUpdate,
}: KartuPegawaiPageProps) {
  const isAdmin = user.role === "admin";
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(user.id);
  const [, setRefreshKey] = useState(0);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const pegawaiList = useMemo(() => {
    return getEmployees().filter((e) => e.role === "pegawai");
  }, []);

  const selectedEmployee = useMemo(() => {
    if (!isAdmin) return getEmployees().find((e) => e.id === user.id) ?? user;
    const allEmployees = getEmployees();
    return allEmployees.find((e) => e.id === selectedEmployeeId) ?? user;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, selectedEmployeeId, user]);

  const handleFotoChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const all = getEmployees();
      const targetId = isAdmin ? selectedEmployeeId : user.id;
      const idx = all.findIndex((emp) => emp.id === targetId);
      if (idx >= 0) {
        all[idx] = { ...all[idx], foto: dataUrl };
        saveEmployees(all);
        // Update current user session if it's the logged-in user
        if (targetId === user.id) {
          const updated = all[idx];
          setCurrentUser(updated);
          onUserUpdate?.(updated);
        }
      }
      setRefreshKey((k) => k + 1);
      toast.success("Foto berhasil diperbarui.");
    };
    reader.readAsDataURL(file);
  };

  const handleHapusFoto = () => {
    const all = getEmployees();
    const targetId = isAdmin ? selectedEmployeeId : user.id;
    const idx = all.findIndex((emp) => emp.id === targetId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], foto: null };
      saveEmployees(all);
      if (targetId === user.id) {
        const updated = all[idx];
        setCurrentUser(updated);
        onUserUpdate?.(updated);
      }
    }
    setRefreshKey((k) => k + 1);
    toast.success("Foto berhasil dihapus.");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl shadow-sm overflow-hidden"
        style={{ background: "white" }}
      >
        <div
          className="px-4 md:px-6 py-4 flex flex-wrap items-center gap-3"
          style={{ background: "#0A2B45", borderBottom: "1px solid #1A3B55" }}
        >
          <h2 className="text-white font-semibold text-sm flex-1">
            Kartu Digital Pegawai
          </h2>
          {isAdmin && (
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger
                data-ocid="kartu.employee.select"
                className="w-full sm:w-56 text-sm border-0"
                style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
              >
                <SelectValue placeholder="Pilih Pegawai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={user.id}>Administrator (Saya)</SelectItem>
                {pegawaiList.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="p-4 md:p-6 flex justify-center">
          <div className="w-full max-w-sm md:max-w-none">
            <EmployeeCard employee={selectedEmployee} showPrintButton />
          </div>
        </div>

        {/* Tombol ganti/upload foto */}
        <div
          className="px-4 md:px-6 py-4 flex flex-wrap items-center gap-3"
          style={{ borderTop: "1px solid #F1F5F9" }}
        >
          <span className="text-xs font-semibold" style={{ color: "#0A2B45" }}>
            Foto Kartu:
          </span>
          <button
            type="button"
            onClick={() => fotoInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
            style={{ background: "#2E7BC6" }}
          >
            <Upload size={12} />
            Upload Foto
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: "#EBF4FB", color: "#2E7BC6" }}
          >
            <Camera size={12} />
            Ambil dari Kamera
          </button>
          {selectedEmployee.foto && (
            <button
              type="button"
              onClick={handleHapusFoto}
              className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1.5"
            >
              Hapus Foto
            </button>
          )}
          <input
            ref={fotoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFotoChange(file);
              e.target.value = "";
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFotoChange(file);
              e.target.value = "";
            }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl p-4 md:p-5 shadow-sm"
        style={{ background: "white" }}
      >
        <h3 className="font-semibold text-sm mb-3" style={{ color: "#0A2B45" }}>
          Informasi Pegawai
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {[
            { label: "Nama Lengkap", value: selectedEmployee.nama },
            { label: "NIP", value: selectedEmployee.nip },
            { label: "Jabatan", value: selectedEmployee.jabatan },
            { label: "Unit Kerja", value: selectedEmployee.unitKerja },
            { label: "Status", value: selectedEmployee.status },
            { label: "Username", value: selectedEmployee.username },
          ].map((item) => (
            <div key={item.label} className="space-y-0.5">
              <div className="text-xs font-medium" style={{ color: "#6E8193" }}>
                {item.label}
              </div>
              <div
                className="text-sm font-semibold break-words"
                style={{ color: "#0A2B45" }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
