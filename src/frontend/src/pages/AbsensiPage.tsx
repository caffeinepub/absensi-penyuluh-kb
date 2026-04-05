import { Button } from "@/components/ui/button";
import { Camera, CheckCircle, MapPin, Save } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useCamera } from "../camera/useCamera";
import type { Attendance, Employee } from "../types";
import { getAttendances, saveAttendances } from "../utils/storage";

interface AbsensiPageProps {
  user: Employee;
}

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface NominatimResult {
  display_name: string;
}

export default function AbsensiPage({ user }: AbsensiPageProps) {
  const today = new Date().toISOString().split("T")[0];
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);

  const {
    videoRef,
    canvasRef,
    isActive,
    isLoading: cameraLoading,
    isSupported,
    error: cameraError,
    startCamera,
    stopCamera,
    capturePhoto,
  } = useCamera({ facingMode: "user", quality: 0.85 });

  // Load today's record
  useEffect(() => {
    const attendances = getAttendances();
    const record =
      attendances.find(
        (a) => a.employeeId === user.id && a.tanggal === today,
      ) ?? null;
    setTodayRecord(record);
  }, [user.id, today]);

  // Get geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocation({ latitude, longitude, accuracy });
        setLocationLoading(false);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = (await res.json()) as NominatimResult;
          setLocationAddress(data.display_name);
        } catch {
          setLocationAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
      },
      () => {
        // Fallback to Jakarta coordinates
        setLocation({ latitude: -6.2088, longitude: 106.8456, accuracy: 100 });
        setLocationAddress("Jakarta Pusat, DKI Jakarta");
        setLocationLoading(false);
      },
      { timeout: 10000 },
    );
  }, []);

  const handleStartCamera = useCallback(async () => {
    await startCamera();
  }, [startCamera]);

  const handleCapture = useCallback(async () => {
    const file = await capturePhoto();
    if (!file) {
      toast.error("Gagal mengambil foto.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoDataUrl(reader.result as string);
      stopCamera();
      toast.success("Foto berhasil diambil!");
    };
    reader.readAsDataURL(file);
  }, [capturePhoto, stopCamera]);

  const handleSaveAbsensi = useCallback(async () => {
    if (!photoDataUrl) {
      toast.error("Harap ambil foto terlebih dahulu.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const attendances = getAttendances();
    const existingIdx = attendances.findIndex(
      (a) => a.employeeId === user.id && a.tanggal === today,
    );
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    if (existingIdx >= 0 && attendances[existingIdx].waktuMasuk) {
      // Check-out
      attendances[existingIdx] = {
        ...attendances[existingIdx],
        waktuKeluar: timeStr,
        fotoDataUrl: photoDataUrl,
      };
      saveAttendances(attendances);
      setTodayRecord(attendances[existingIdx]);
      toast.success("Absensi pulang berhasil dicatat!");
    } else {
      // Check-in
      const newRecord: Attendance = {
        id: `att_${Date.now()}`,
        employeeId: user.id,
        employeeName: user.nama,
        employeeNip: user.nip,
        tanggal: today,
        waktuMasuk: timeStr,
        waktuKeluar: null,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        fotoDataUrl: photoDataUrl,
        status: "Hadir",
      };
      if (existingIdx >= 0) {
        attendances[existingIdx] = newRecord;
      } else {
        attendances.push(newRecord);
      }
      saveAttendances(attendances);
      setTodayRecord(newRecord);
      toast.success("Absensi masuk berhasil dicatat!");
    }
    setPhotoDataUrl(null);
    setSaving(false);
  }, [photoDataUrl, user.id, user.nama, user.nip, today, location]);

  const isCheckedIn = !!todayRecord?.waktuMasuk;
  const isCheckedOut = !!todayRecord?.waktuKeluar;
  const lat = location?.latitude ?? -6.2088;
  const lon = location?.longitude ?? 106.8456;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Status today */}
      {todayRecord && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 md:p-4 flex items-center gap-3"
          style={{
            background: isCheckedOut ? "#EDFAF3" : "#EBF4FB",
            border: `1px solid ${isCheckedOut ? "#2FA66B" : "#2E7BC6"}`,
          }}
        >
          <CheckCircle
            size={22}
            style={{ color: isCheckedOut ? "#2FA66B" : "#2E7BC6" }}
            className="flex-shrink-0"
          />
          <div className="min-w-0">
            <div
              className="font-semibold text-sm"
              style={{ color: isCheckedOut ? "#1A7A4A" : "#1A5A8A" }}
            >
              {isCheckedOut
                ? "Absensi Hari Ini Selesai"
                : "Sudah Absensi Masuk"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              Masuk: {todayRecord.waktuMasuk ?? "-"} | Pulang:{" "}
              {todayRecord.waktuKeluar ?? "Belum absen pulang"}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Camera section */}
        <div
          className="rounded-xl overflow-hidden shadow-md"
          style={{ background: "#0E3B4C" }}
        >
          <div
            className="px-4 md:px-5 py-3 md:py-4 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Camera size={18} className="text-blue-300" />
            <span className="text-white font-semibold text-sm">
              Verifikasi Wajah
            </span>
          </div>

          <div className="p-4 md:p-5 space-y-3 md:space-y-4">
            {/* Camera preview area */}
            <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center h-52 md:h-64">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ display: isActive ? "block" : "none" }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {photoDataUrl && !isActive && (
                <img
                  src={photoDataUrl}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}

              {!isActive && !photoDataUrl && (
                <div className="text-center p-6">
                  <Camera size={40} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Kamera belum aktif</p>
                </div>
              )}

              {isActive && (
                <div
                  className="absolute bottom-3 left-0 right-0 text-center text-xs font-medium px-3 py-1.5 mx-4 rounded-lg"
                  style={{ background: "rgba(0,0,0,0.6)", color: "#90CDF4" }}
                >
                  MEMINDAI WAJAH... Silakan Hadap Kamera
                </div>
              )}

              {photoDataUrl && (
                <div
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: "#2FA66B", color: "white" }}
                >
                  <CheckCircle size={12} /> Terdeteksi ✓
                </div>
              )}

              {cameraError && (
                <div
                  className="absolute inset-0 flex items-center justify-center text-center p-4"
                  style={{ background: "rgba(14,59,76,0.9)" }}
                >
                  <div>
                    <p className="text-red-400 text-sm font-medium mb-1">
                      Kamera tidak dapat diakses
                    </p>
                    <p className="text-gray-400 text-xs">
                      {cameraError.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {isSupported === false && (
              <p className="text-red-400 text-xs text-center">
                Kamera tidak didukung di browser ini.
              </p>
            )}

            <div className="flex gap-2 md:gap-3">
              {!isActive && !photoDataUrl && (
                <Button
                  data-ocid="absensi.start_camera.button"
                  onClick={handleStartCamera}
                  disabled={cameraLoading || isSupported === false}
                  className="flex-1 text-white text-sm font-semibold"
                  style={{ background: "#2E7BC6" }}
                >
                  {cameraLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memuat...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Camera size={15} /> Buka Kamera
                    </span>
                  )}
                </Button>
              )}

              {isActive && (
                <Button
                  data-ocid="absensi.capture.button"
                  onClick={handleCapture}
                  disabled={cameraLoading || !isActive}
                  className="flex-1 text-white text-sm font-semibold"
                  style={{ background: "#2E7BC6" }}
                >
                  <span className="flex items-center gap-2">
                    <Camera size={15} /> Ambil Foto
                  </span>
                </Button>
              )}

              {photoDataUrl && (
                <Button
                  data-ocid="absensi.retake.button"
                  variant="outline"
                  onClick={() => {
                    setPhotoDataUrl(null);
                    handleStartCamera();
                  }}
                  className="flex-1 text-sm"
                  style={{
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "#A8C4DC",
                    background: "transparent",
                  }}
                >
                  Ambil Ulang
                </Button>
              )}
            </div>

            {!isCheckedOut && (
              <Button
                data-ocid="absensi.save.button"
                onClick={handleSaveAbsensi}
                disabled={!photoDataUrl || saving}
                className="w-full text-white text-sm font-semibold"
                style={{
                  background: photoDataUrl ? "#2FA66B" : "#4A6A70",
                  opacity: !photoDataUrl ? 0.6 : 1,
                }}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save size={15} />
                    {isCheckedIn
                      ? "Simpan Absensi Pulang"
                      : "Simpan Absensi Masuk"}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Location section */}
        <div
          className="rounded-xl overflow-hidden shadow-md"
          style={{ background: "#0E3B4C" }}
        >
          <div
            className="px-4 md:px-5 py-3 md:py-4 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            <MapPin size={18} className="text-green-300" />
            <span className="text-white font-semibold text-sm">
              Lokasi GPS Pegawai
            </span>
          </div>

          <div className="p-4 md:p-5 space-y-3 md:space-y-4">
            {/* Map */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ height: "220px" }}
            >
              {locationLoading ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "#0A2B45" }}
                >
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-400 text-xs">
                      Mendapatkan lokasi...
                    </p>
                  </div>
                </div>
              ) : (
                <iframe
                  data-ocid="absensi.map_marker"
                  src={mapUrl}
                  title="Peta Lokasi"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              )}
            </div>

            {/* Location info */}
            <div className="space-y-2">
              {location && (
                <div className="flex items-start gap-2">
                  <MapPin
                    size={14}
                    className="text-green-400 mt-0.5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-white/80 text-xs leading-relaxed break-words">
                      {locationAddress ?? "Memuat alamat..."}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Akurasi: ±{location.accuracy.toFixed(0)} meter
                    </p>
                  </div>
                </div>
              )}

              {location && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: "#2FA66B", color: "white" }}
                >
                  <CheckCircle size={12} /> Lokasi Terverifikasi ✓
                </div>
              )}

              {locationLoading && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: "#D97706", color: "white" }}
                >
                  Mendeteksi lokasi...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
