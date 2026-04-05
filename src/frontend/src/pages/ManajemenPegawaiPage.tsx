import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../types";
import { getEmployees, saveEmployees } from "../utils/storage";

type FormData = Omit<Employee, "id" | "createdAt">;

const emptyForm: FormData = {
  nama: "",
  nip: "",
  jabatan: "",
  unitKerja: "",
  role: "pegawai",
  username: "",
  password: "",
  status: "Aktif",
};

export default function ManajemenPegawaiPage() {
  const [employees, setEmployees] = useState<Employee[]>(() => getEmployees());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  const pegawaiCount = useMemo(
    () => employees.filter((e) => e.role === "pegawai").length,
    [employees],
  );

  const refreshEmployees = () => {
    setEmployees(getEmployees());
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.nama.trim()) errors.nama = "Nama wajib diisi";
    if (!formData.nip.trim()) errors.nip = "NIP wajib diisi";
    if (!formData.jabatan.trim()) errors.jabatan = "Jabatan wajib diisi";
    if (!formData.unitKerja.trim()) errors.unitKerja = "Unit kerja wajib diisi";
    if (!formData.username.trim()) errors.username = "Username wajib diisi";
    if (!editingId && !formData.password.trim())
      errors.password = "Password wajib diisi";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setFormData({
      nama: emp.nama,
      nip: emp.nip,
      jabatan: emp.jabatan,
      unitKerja: emp.unitKerja,
      role: emp.role,
      username: emp.username,
      password: emp.password,
      status: emp.status,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const all = getEmployees();
    if (editingId) {
      const idx = all.findIndex((e) => e.id === editingId);
      if (idx >= 0) {
        all[idx] = {
          ...all[idx],
          ...formData,
          password: formData.password || all[idx].password,
        };
      }
      saveEmployees(all);
      toast.success("Data pegawai berhasil diperbarui.");
    } else {
      const newEmp: Employee = {
        id: `emp_${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
      };
      all.push(newEmp);
      saveEmployees(all);
      toast.success("Pegawai baru berhasil ditambahkan.");
    }
    refreshEmployees();
    setIsDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const all = getEmployees().filter((e) => e.id !== deleteId);
    saveEmployees(all);
    refreshEmployees();
    setDeleteId(null);
    toast.success("Pegawai berhasil dihapus.");
  };

  const updateField = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key])
      setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4 md:p-5 shadow-sm flex items-center justify-between gap-3"
        style={{ background: "white" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#EBF4FB" }}
          >
            <Users size={20} style={{ color: "#2E7BC6" }} />
          </div>
          <div className="min-w-0">
            <div
              className="font-bold text-sm truncate"
              style={{ color: "#0A2B45" }}
            >
              Manajemen Pegawai
            </div>
            <div className="text-xs" style={{ color: "#6E8193" }}>
              {pegawaiCount} pegawai aktif
            </div>
          </div>
        </div>
        <Button
          data-ocid="manajemen.add.button"
          onClick={handleOpenAdd}
          className="text-white text-sm font-semibold flex items-center gap-2 flex-shrink-0"
          style={{ background: "#2E7BC6" }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Tambah Pegawai</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl shadow-sm overflow-hidden"
        style={{ background: "white" }}
      >
        <div className="px-4 md:px-5 py-4" style={{ background: "#0A2B45" }}>
          <h3 className="text-white font-semibold text-sm">Daftar Pegawai</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "560px" }}>
            <thead>
              <tr style={{ background: "#F1F5F9" }}>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  No
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Pegawai
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  NIP
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Jabatan
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Unit Kerja
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-400"
                    data-ocid="manajemen.empty_state"
                  >
                    Belum ada data pegawai.
                  </td>
                </tr>
              ) : (
                employees.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    data-ocid={`manajemen.employee.item.${idx + 1}`}
                    className="border-t hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "#F1F5F9" }}
                  >
                    <td className="px-3 md:px-4 py-3 text-gray-400 text-xs">
                      {idx + 1}
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{
                            background:
                              emp.role === "admin" ? "#D84A4A" : "#2F6FB0",
                          }}
                        >
                          {emp.nama.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-xs">
                            {emp.nama}
                          </div>
                          <div className="text-gray-400 text-[10px]">
                            {emp.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-600 text-xs font-mono">
                      {emp.nip}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-600 text-xs">
                      {emp.jabatan}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-600 text-xs">
                      {emp.unitKerja}
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <Badge
                        className="text-xs px-2 py-0.5 border-none"
                        style={{
                          background:
                            emp.status === "Aktif" ? "#EDFAF3" : "#FEE2E2",
                          color: emp.status === "Aktif" ? "#1A7A4A" : "#991B1B",
                        }}
                      >
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          data-ocid={`manajemen.employee.edit_button.${idx + 1}`}
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} style={{ color: "#2E7BC6" }} />
                        </button>
                        <button
                          type="button"
                          data-ocid={`manajemen.employee.delete_button.${idx + 1}`}
                          onClick={() => setDeleteId(emp.id)}
                          className="p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={13} style={{ color: "#D84A4A" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="w-[calc(100vw-2rem)] max-w-lg mx-auto"
          data-ocid="manajemen.employee.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#0A2B45" }}>
              {editingId ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 py-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="nama"
                className="text-xs font-medium text-gray-600"
              >
                Nama Lengkap *
              </Label>
              <Input
                id="nama"
                data-ocid="manajemen.nama.input"
                value={formData.nama}
                onChange={(e) => updateField("nama", e.target.value)}
                placeholder="Nama lengkap"
                className="text-sm"
              />
              {formErrors.nama && (
                <p
                  className="text-xs text-red-500"
                  data-ocid="manajemen.nama_error"
                >
                  {formErrors.nama}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="nip"
                className="text-xs font-medium text-gray-600"
              >
                NIP *
              </Label>
              <Input
                id="nip"
                data-ocid="manajemen.nip.input"
                value={formData.nip}
                onChange={(e) => updateField("nip", e.target.value)}
                placeholder="Nomor Induk Pegawai"
                className="text-sm"
              />
              {formErrors.nip && (
                <p
                  className="text-xs text-red-500"
                  data-ocid="manajemen.nip_error"
                >
                  {formErrors.nip}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="jabatan"
                className="text-xs font-medium text-gray-600"
              >
                Jabatan *
              </Label>
              <Input
                id="jabatan"
                data-ocid="manajemen.jabatan.input"
                value={formData.jabatan}
                onChange={(e) => updateField("jabatan", e.target.value)}
                placeholder="Jabatan pegawai"
                className="text-sm"
              />
              {formErrors.jabatan && (
                <p
                  className="text-xs text-red-500"
                  data-ocid="manajemen.jabatan_error"
                >
                  {formErrors.jabatan}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="unitKerja"
                className="text-xs font-medium text-gray-600"
              >
                Unit Kerja *
              </Label>
              <Input
                id="unitKerja"
                data-ocid="manajemen.unit.input"
                value={formData.unitKerja}
                onChange={(e) => updateField("unitKerja", e.target.value)}
                placeholder="Unit kerja"
                className="text-sm"
              />
              {formErrors.unitKerja && (
                <p
                  className="text-xs text-red-500"
                  data-ocid="manajemen.unit_error"
                >
                  {formErrors.unitKerja}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-xs font-medium text-gray-600"
              >
                Username *
              </Label>
              <Input
                id="username"
                data-ocid="manajemen.username.input"
                value={formData.username}
                onChange={(e) => updateField("username", e.target.value)}
                placeholder="Username login"
                className="text-sm"
              />
              {formErrors.username && (
                <p
                  className="text-xs text-red-500"
                  data-ocid="manajemen.username_error"
                >
                  {formErrors.username}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-medium text-gray-600"
              >
                Password {editingId ? "(kosongkan jika tidak berubah)" : "*"}
              </Label>
              <Input
                id="password"
                data-ocid="manajemen.password.input"
                type="password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Password login"
                className="text-sm"
              />
              {formErrors.password && (
                <p
                  className="text-xs text-red-500"
                  data-ocid="manajemen.password_error"
                >
                  {formErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(v) =>
                  updateField("role", v as "admin" | "pegawai")
                }
              >
                <SelectTrigger
                  data-ocid="manajemen.role.select"
                  className="text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pegawai">Pegawai</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  updateField("status", v as "Aktif" | "Tidak Aktif")
                }
              >
                <SelectTrigger
                  data-ocid="manajemen.status.select"
                  className="text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              data-ocid="manajemen.employee.cancel_button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              data-ocid="manajemen.employee.save_button"
              onClick={handleSave}
              className="text-white w-full sm:w-auto"
              style={{ background: "#2E7BC6" }}
            >
              {editingId ? "Simpan Perubahan" : "Tambah Pegawai"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="manajemen.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pegawai?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data pegawai akan dihapus
              secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="manajemen.delete.cancel_button">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="manajemen.delete.confirm_button"
              onClick={handleConfirmDelete}
              style={{ background: "#D84A4A", color: "white" }}
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
