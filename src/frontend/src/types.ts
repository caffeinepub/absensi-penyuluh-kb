export interface Employee {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  role: "admin" | "pegawai";
  username: string;
  password: string;
  status: "Aktif" | "Tidak Aktif";
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNip: string;
  tanggal: string;
  waktuMasuk: string | null;
  waktuKeluar: string | null;
  latitude: number | null;
  longitude: number | null;
  fotoDataUrl: string | null;
  status: "Hadir" | "Izin" | "Sakit" | "Alpha";
}

export type Page =
  | "dashboard"
  | "absensi"
  | "kartu"
  | "rekap"
  | "manajemen"
  | "ubahpassword";
