import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import EmployeeCard from "../components/EmployeeCard";
import type { Employee } from "../types";
import { getEmployees } from "../utils/storage";

interface KartuPegawaiPageProps {
  user: Employee;
}

export default function KartuPegawaiPage({ user }: KartuPegawaiPageProps) {
  const isAdmin = user.role === "admin";
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(user.id);

  const pegawaiList = useMemo(() => {
    return getEmployees().filter((e) => e.role === "pegawai");
  }, []);

  const selectedEmployee = useMemo(() => {
    if (!isAdmin) return user;
    const allEmployees = getEmployees();
    return allEmployees.find((e) => e.id === selectedEmployeeId) ?? user;
  }, [isAdmin, selectedEmployeeId, user]);

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
