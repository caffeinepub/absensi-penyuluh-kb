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
  // Koordinat titik absensi kecamatan
  kecamatanLat?: number | null;
  kecamatanLon?: number | null;
  // Foto pegawai (base64 data URL)
  foto?: string | null;
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
  status: "Hadir" | "Izin" | "Sakit" | "Alpha" | "Tugas Luar";
  // Field khusus tugas luar
  jenisTugas?: "reguler" | "luar";
  tujuanTugas?: string | null;
  suratTugasDataUrl?: string | null;
}

export type Page =
  | "dashboard"
  | "absensi"
  | "kartu"
  | "rekap"
  | "manajemen"
  | "ubahpassword"
  | "tugasluar";
