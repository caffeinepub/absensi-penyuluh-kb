# E-VISUM PKB - Mobile Responsive

## Current State
Aplikasi E-VISUM PKB sudah berjalan dengan fitur:
- Login page
- Sidebar tetap (w-64) yang selalu tampil di semua ukuran layar
- Header bar di atas
- Halaman: Dashboard, Absensi, Kartu Pegawai, Rekap, Manajemen Pegawai, Ubah Password
- Saat ini di mobile, sidebar mengambil ruang besar dan konten menjadi sangat sempit
- Tidak ada bottom navigation untuk mobile
- Tabel di Dashboard dan Rekap tidak responsive di layar kecil

## Requested Changes (Diff)

### Add
- Bottom navigation bar untuk mobile (muncul di layar < md), menggantikan sidebar saat di HP
- Hamburger menu / drawer sidebar untuk mobile
- Mobile-friendly layout: konten full-width di mobile tanpa sidebar di sisi kiri
- Viewport meta tag yang tepat (sudah ada tapi perlu dipastikan)
- Tombol "hamburguer" / menu di header mobile untuk membuka sidebar sebagai overlay/drawer

### Modify
- **App.tsx**: Sidebar disembunyikan di mobile (`hidden md:flex`), konten full-width. Tambah overlay mobile sidebar. Tambah padding-bottom di main content saat di mobile untuk bottom nav.
- **Sidebar.tsx**: Ubah menjadi bisa tampil sebagai drawer di mobile (controlled via prop `isOpen` + `onClose`). Di desktop tetap static sidebar.
- **Header.tsx**: Tambah tombol hamburger di kiri (muncul hanya di mobile) untuk toggle sidebar drawer.
- **DashboardPage.tsx**: Tabel rekap terbaru bisa di-scroll horizontal di mobile. Tombol "Absensi Sekarang" full-width di mobile.
- **AbsensiPage.tsx**: Grid 2-kolom menjadi 1-kolom di mobile. Camera preview lebih pendek di mobile.
- **RekapPage.tsx**: Filter controls stack vertikal di mobile. Tabel bisa scroll horizontal.
- **ManajemenPegawaiPage.tsx** dan **KartuPegawaiPage.tsx**: Pastikan responsif.
- **index.css**: Tambahkan safe-area inset support untuk notch/home indicator di iPhone.

### Remove
- Tidak ada yang dihapus, hanya ubah tampilan berdasarkan breakpoint

## Implementation Plan
1. Update App.tsx: sidebar hanya tampil di md+, tambah state `sidebarOpen`, kirim ke Sidebar & Header. Main content full-width di mobile, tambah pb-16 di mobile untuk bottom nav.
2. Update Sidebar.tsx: terima prop `isOpen` dan `onClose`. Di mobile tampil sebagai overlay drawer (fixed, z-50). Di desktop tetap static.
3. Update Header.tsx: tambah prop `onMenuClick` dan tampilkan tombol hamburger di mobile (Menu icon dari lucide).
4. Buat MobileBottomNav component: tampil hanya di mobile (md:hidden), navigasi utama (Dashboard, Absensi, Kartu, Rekap), fixed bottom, style sesuai branding.
5. Update DashboardPage.tsx: overflow-x-auto untuk tabel, tombol responsif.
6. Update AbsensiPage.tsx: camera height responsif, layout single column di mobile.
7. Update RekapPage.tsx: filter controls flex-wrap, tabel scroll horizontal.
