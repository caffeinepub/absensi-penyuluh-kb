import type { Attendance, Employee } from "../types";

const EMPLOYEES_KEY = "kb_employees";
const ATTENDANCES_KEY = "kb_attendances";
const CURRENT_USER_KEY = "kb_current_user";

export function getEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(EMPLOYEES_KEY);
    return raw ? (JSON.parse(raw) as Employee[]) : [];
  } catch {
    return [];
  }
}

export function saveEmployees(employees: Employee[]): void {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

export function getAttendances(): Attendance[] {
  try {
    const raw = localStorage.getItem(ATTENDANCES_KEY);
    return raw ? (JSON.parse(raw) as Attendance[]) : [];
  } catch {
    return [];
  }
}

export function saveAttendances(attendances: Attendance[]): void {
  localStorage.setItem(ATTENDANCES_KEY, JSON.stringify(attendances));
}

export function getCurrentUser(): Employee | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as Employee) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: Employee): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function seedInitialData(): void {
  const existing = localStorage.getItem(EMPLOYEES_KEY);
  if (existing) return;

  const employees: Employee[] = [
    {
      id: "1",
      nama: "Administrator",
      nip: "198501010001",
      jabatan: "Administrator Sistem",
      unitKerja: "BKKBN Pusat",
      role: "admin",
      username: "admin",
      password: "admin123",
      status: "Aktif",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      nama: "Budi Santoso",
      nip: "198501010002",
      jabatan: "Penyuluh KB Ahli Muda",
      unitKerja: "Kecamatan Cempaka Putih",
      role: "pegawai",
      username: "budi",
      password: "budi123",
      status: "Aktif",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "3",
      nama: "Siti Rahayu",
      nip: "199002020003",
      jabatan: "Penyuluh KB Ahli Pertama",
      unitKerja: "Kecamatan Menteng",
      role: "pegawai",
      username: "siti",
      password: "siti123",
      status: "Aktif",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "4",
      nama: "Ahmad Fauzi",
      nip: "198803030004",
      jabatan: "Penyuluh KB Ahli Madya",
      unitKerja: "Kecamatan Senen",
      role: "pegawai",
      username: "ahmad",
      password: "ahmad123",
      status: "Aktif",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "5",
      nama: "Dewi Kusuma",
      nip: "199104040005",
      jabatan: "Penyuluh KB Terampil",
      unitKerja: "Kecamatan Kemayoran",
      role: "pegawai",
      username: "dewi",
      password: "dewi123",
      status: "Aktif",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  ];

  const attendances: Attendance[] = [
    {
      id: "a1",
      employeeId: "2",
      employeeName: "Budi Santoso",
      employeeNip: "198501010002",
      tanggal: "2026-04-01",
      waktuMasuk: "07:55",
      waktuKeluar: "16:05",
      latitude: -6.1752,
      longitude: 106.8272,
      fotoDataUrl: null,
      status: "Hadir",
    },
    {
      id: "a2",
      employeeId: "3",
      employeeName: "Siti Rahayu",
      employeeNip: "199002020003",
      tanggal: "2026-04-01",
      waktuMasuk: "08:02",
      waktuKeluar: "16:00",
      latitude: -6.1869,
      longitude: 106.8349,
      fotoDataUrl: null,
      status: "Hadir",
    },
    {
      id: "a3",
      employeeId: "4",
      employeeName: "Ahmad Fauzi",
      employeeNip: "198803030004",
      tanggal: "2026-04-01",
      waktuMasuk: null,
      waktuKeluar: null,
      latitude: null,
      longitude: null,
      fotoDataUrl: null,
      status: "Sakit",
    },
    {
      id: "a4",
      employeeId: "5",
      employeeName: "Dewi Kusuma",
      employeeNip: "199104040005",
      tanggal: "2026-04-01",
      waktuMasuk: "07:50",
      waktuKeluar: "15:55",
      latitude: -6.1699,
      longitude: 106.8386,
      fotoDataUrl: null,
      status: "Hadir",
    },
    {
      id: "a5",
      employeeId: "2",
      employeeName: "Budi Santoso",
      employeeNip: "198501010002",
      tanggal: "2026-04-02",
      waktuMasuk: "08:10",
      waktuKeluar: "16:15",
      latitude: -6.1752,
      longitude: 106.8272,
      fotoDataUrl: null,
      status: "Hadir",
    },
    {
      id: "a6",
      employeeId: "3",
      employeeName: "Siti Rahayu",
      employeeNip: "199002020003",
      tanggal: "2026-04-02",
      waktuMasuk: null,
      waktuKeluar: null,
      latitude: null,
      longitude: null,
      fotoDataUrl: null,
      status: "Izin",
    },
    {
      id: "a7",
      employeeId: "4",
      employeeName: "Ahmad Fauzi",
      employeeNip: "198803030004",
      tanggal: "2026-04-02",
      waktuMasuk: "07:58",
      waktuKeluar: "16:00",
      latitude: -6.1892,
      longitude: 106.845,
      fotoDataUrl: null,
      status: "Hadir",
    },
    {
      id: "a8",
      employeeId: "5",
      employeeName: "Dewi Kusuma",
      employeeNip: "199104040005",
      tanggal: "2026-04-02",
      waktuMasuk: null,
      waktuKeluar: null,
      latitude: null,
      longitude: null,
      fotoDataUrl: null,
      status: "Alpha",
    },
    {
      id: "a9",
      employeeId: "2",
      employeeName: "Budi Santoso",
      employeeNip: "198501010002",
      tanggal: "2026-04-03",
      waktuMasuk: "07:45",
      waktuKeluar: "15:50",
      latitude: -6.1752,
      longitude: 106.8272,
      fotoDataUrl: null,
      status: "Hadir",
    },
    {
      id: "a10",
      employeeId: "3",
      employeeName: "Siti Rahayu",
      employeeNip: "199002020003",
      tanggal: "2026-04-03",
      waktuMasuk: "08:05",
      waktuKeluar: "16:10",
      latitude: -6.1869,
      longitude: 106.8349,
      fotoDataUrl: null,
      status: "Hadir",
    },
  ];

  saveEmployees(employees);
  saveAttendances(attendances);
}
