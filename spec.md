# E-ABSENSI - Download Kartu Pegawai Ukuran ATM

## Current State
Kartu pegawai saat ini hanya bisa dicetak via browser print (`window.print()`). Tidak ada fitur download langsung sebagai file gambar dengan ukuran tertentu.

## Requested Changes (Diff)

### Add
- Tombol "Download Kartu" yang mengunduh kartu sebagai gambar PNG dengan ukuran standar kartu ATM (85.6 x 53.98mm, setara 1012 x 638px pada 300dpi / rasio 1.586:1)
- Gunakan `html2canvas` untuk render kartu ke canvas, lalu ekspor ke PNG
- Kartu dirender dalam ukuran proporsional ATM sebelum di-capture

### Modify
- `EmployeeCard.tsx`: tambah prop `onDownload` dan tombol Download terpisah dari Cetak
- `KartuPegawaiPage.tsx`: implementasi logika download menggunakan html2canvas dengan ukuran ATM card

### Remove
- Tidak ada yang dihapus; tombol Cetak tetap ada

## Implementation Plan
1. Install `html2canvas` (cek apakah sudah ada, jika tidak gunakan pendekatan canvas manual atau export via window.open blob)
2. Tambahkan fungsi `downloadAsATMCard` di KartuPegawaiPage yang:
   - Render kartu ke hidden div dengan ukuran tepat (1012x638px)
   - Capture dengan html2canvas
   - Trigger download file PNG
3. Tambahkan tombol Download di samping tombol Cetak
