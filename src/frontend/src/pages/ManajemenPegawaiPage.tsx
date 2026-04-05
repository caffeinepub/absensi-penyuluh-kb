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
import { MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../types";
import { getEmployees, saveEmployees } from "../utils/storage";

type FormData = Omit<Employee, "id" | "createdAt"> & {
  kecamatanLatStr: string;
  kecamatanLonStr: string;
};

const emptyForm: FormData = {
  nama: "",
  nip: "",
  jabatan: "",
  unitKerja: "",
  role: "pegawai",
  username: "",
  password: "",
  status: "Aktif",
  kecamatanLat: null,
  kecamatanLon: null,
  kecamatanLatStr: "",
  kecamatanLonStr: "",
};

export default function ManajemenPegawaiPage() {
  const [employees, setEmployees] = useState<Employee[]>(() => getEmployees());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>(
    {},
  );

  const pegawaiCount = useMemo(
    () => employees.filter((e) => e.role === "pegawai").length,
    [employees],
  );

  const refreshEmployees = () => {
    setEmployees(getEmployees());
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<string, string>> = {};
    if (!formData.nama.trim()) errors.nama = "Nama wajib diisi";
    if (!formData.nip.trim()) errors.nip = "NIP wajib diisi";
    if (!formData.jabatan.trim()) errors.jabatan = "Jabatan wajib diisi";
    if (!formData.unitKerja.trim()) errors.unitKerja = "Unit kerja wajib diisi";
    if (!formData.username.trim()) errors.username = "Username wajib diisi";
    if (!editingId && !formData.password.trim())
      errors.password = "Password wajib diisi";
    if (
      formData.kecamatanLatStr &&
      Number.isNaN(Number.parseFloat(formData.kecamatanLatStr))
    )
      errors.kecamatanLatStr = "Latitude tidak valid";
    if (
      formData.kecamatanLonStr &&
      Number.isNaN(Number.parseFloat(formData.kecamatanLonStr))
    )
      errors.kecamatanLonStr = "Longitude tidak valid";
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
      kecamatanLat: emp.kecamatanLat ?? null,
      kecamatanLon: emp.kecamatanLon ?? null,
      kecamatanLatStr: emp.kecamatanLat != null ? String(emp.kecamatanLat) : "",
      kecamatanLonStr: emp.kecamatanLon != null ? String(emp.kecamatanLon) : "",
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const all = getEmployees();
    const kecamatanLat = formData.kecamatanLatStr
      ? Number.parseFloat(formData.kecamatanLatStr)
      : null;
    const kecamatanLon = formData.kecamatanLonStr
      ? Number.parseFloat(formData.kecamatanLonStr)
      : null;

    if (editingId) {
      const idx = all.findIndex((e) => e.id === editingId);
      if (idx >= 0) {
        all[idx] = {
          ...all[idx],
          nama: formData.nama,
          nip: formData.nip,
          jabatan: formData.jabatan,
          unitKerja: formData.unitKerja,
          role: formData.role,
          username: formData.username,
          password: formData.password || all[idx].password,
          status: formData.status,
          kecamatanLat,
          kecamatanLon,
        };
      }
      saveEmployees(all);
      toast.success("Data pegawai berhasil diperbarui.");
    } else {
      const newEmp: Employee = {
        id: `emp_${Date.now()}`,
        nama: formData.nama,
        nip: formData.nip,
        jabatan: formData.jabatan,
        unitKerja: formData.unitKerja,
        role: formData.role,
        username: formData.username,
        password: formData.password,
        status: formData.status,
        kecamatanLat,
        kecamatanLon,
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

  const updateField = (key: string, value: string | null) => {
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
          <table className="w-full text-sm" style={{ minWidth: "620px" }}>
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
                  Titik Absen
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
                    colSpan={8}
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
                      {emp.kecamatanLat != null && emp.kecamatanLon != null ? (
                        <div className="flex items-center gap-1">
                          <MapPin
                            size={11}
                            className="text-green-500 flex-shrink-0"
                          />
                          <span className="text-[10px] text-green-700 font-mono">
                            {emp.kecamatanLat.toFixed(4)},
                            {emp.kecamatanLon.toFixed(4)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-orange-400">
                          Belum diset
                        </span>
                      )}
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
          className="w-[calc(100vw-2rem)] max-w-lg mx-auto max-h-[90vh] overflow-y-auto"
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
                <p className="text-xs text-red-500">{formErrors.nama}</p>
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
                <p className="text-xs text-red-500">{formErrors.nip}</p>
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
                <p className="text-xs text-red-500">{formErrors.jabatan}</p>
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
                <p className="text-xs text-red-500">{formErrors.unitKerja}</p>
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
                <p className="text-xs text-red-500">{formErrors.username}</p>
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
                <p className="text-xs text-red-500">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => updateField("role", v)}
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
                onValueChange={(v) => updateField("status", v)}
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

            {/* Koordinat Kecamatan */}
            <div className="col-span-1 sm:col-span-2">
              <div
                className="rounded-lg p-3 space-y-3"
                style={{ background: "#F0F7FF", border: "1px solid #BFD9F2" }}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={14} style={{ color: "#2E7BC6" }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#0A2B45" }}
                  >
                    Titik Pusat Absensi (Koordinat Kecamatan)
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Absensi hanya bisa dilakukan dalam radius 300 meter dari titik
                  ini. Cari koordinat kecamatan di Google Maps lalu salin
                  latitude &amp; longitude-nya.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Latitude</Label>
                    <Input
                      data-ocid="manajemen.kecamatan_lat.input"
                      value={formData.kecamatanLatStr}
                      onChange={(e) =>
                        updateField("kecamatanLatStr", e.target.value)
                      }
                      placeholder="Contoh: -6.1752"
                      className="text-sm font-mono"
                    />
                    {formErrors.kecamatanLatStr && (
                      <p className="text-xs text-red-500">
                        {formErrors.kecamatanLatStr}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Longitude</Label>
                    <Input
                      data-ocid="manajemen.kecamatan_lon.input"
                      value={formData.kecamatanLonStr}
                      onChange={(e) =>
                        updateField("kecamatanLonStr", e.target.value)
                      }
                      placeholder="Contoh: 106.8272"
                      className="text-sm font-mono"
                    />
                    {formErrors.kecamatanLonStr && (
                      <p className="text-xs text-red-500">
                        {formErrors.kecamatanLonStr}
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
