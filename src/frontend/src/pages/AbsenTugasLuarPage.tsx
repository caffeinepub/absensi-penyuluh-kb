import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Camera,
  CheckCircle,
  FileText,
  MapPin,
  Save,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCamera } from "../camera/useCamera";
import type { Attendance, Employee } from "../types";
import { getAttendances, saveAttendances } from "../utils/storage";

interface AbsenTugasLuarPageProps {
  user: Employee;
}

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function AbsenTugasLuarPage({ user }: AbsenTugasLuarPageProps) {
  const today = new Date().toISOString().split("T")[0];
  const [tujuan, setTujuan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [suratDataUrl, setSuratDataUrl] = useState<string | null>(null);
  const [suratFileName, setSuratFileName] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [saving, setSaving] = useState(false);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [suratMode, setSuratMode] = useState<"upload" | "kamera">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    videoRef,
    canvasRef,
    isActive: cameraActive,
    isLoading: cameraLoading,
    isSupported,
    error: cameraError,
    startCamera,
    stopCamera,
    capturePhoto,
  } = useCamera({ facingMode: "environment", quality: 0.9 });

  const {
    videoRef: faceVideoRef,
    canvasRef: faceCanvasRef,
    isActive: faceActive,
    isLoading: faceCameraLoading,
    error: faceCameraError,
    startCamera: startFaceCamera,
    stopCamera: stopFaceCamera,
    capturePhoto: captureFacePhoto,
  } = useCamera({ facingMode: "user", quality: 0.85 });

  // Load today's record
  useEffect(() => {
    const attendances = getAttendances();
    const record =
      attendances.find(
        (a) =>
          a.employeeId === user.id &&
          a.tanggal === today &&
          a.jenisTugas === "luar",
      ) ?? null;
    setTodayRecord(record);
  }, [user.id, today]);

  // Get GPS silently
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => {},
      { timeout: 10000, enableHighAccuracy: true },
    );
  }, []);

  // Handle file upload surat tugas
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau PDF.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSuratDataUrl(reader.result as string);
        setSuratFileName(file.name);
        toast.success("Surat tugas berhasil diunggah!");
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // Foto surat via kamera
  const handleCaptureSurat = useCallback(async () => {
    const file = await capturePhoto();
    if (!file) {
      toast.error("Gagal mengambil foto surat.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSuratDataUrl(reader.result as string);
      setSuratFileName("foto_surat_tugas.jpg");
      stopCamera();
      toast.success("Foto surat tugas berhasil diambil!");
    };
    reader.readAsDataURL(file);
  }, [capturePhoto, stopCamera]);

  // Foto wajah
  const handleCaptureFace = useCallback(async () => {
    const file = await captureFacePhoto();
    if (!file) {
      toast.error("Gagal mengambil foto wajah.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoDataUrl(reader.result as string);
      stopFaceCamera();
      toast.success("Foto wajah berhasil diambil!");
    };
    reader.readAsDataURL(file);
  }, [captureFacePhoto, stopFaceCamera]);

  const handleSave = useCallback(async () => {
    if (!tujuan.trim()) {
      toast.error("Tujuan/lokasi tugas wajib diisi.");
      return;
    }
    if (!suratDataUrl) {
      toast.error("Surat tugas wajib dilampirkan!");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const attendances = getAttendances();
    const existingIdx = attendances.findIndex(
      (a) =>
        a.employeeId === user.id &&
        a.tanggal === today &&
        a.jenisTugas === "luar",
    );
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    if (existingIdx >= 0 && attendances[existingIdx].waktuMasuk) {
      // Check-out tugas luar
      attendances[existingIdx] = {
        ...attendances[existingIdx],
        waktuKeluar: timeStr,
        fotoDataUrl: photoDataUrl ?? attendances[existingIdx].fotoDataUrl,
      };
      saveAttendances(attendances);
      setTodayRecord(attendances[existingIdx]);
      toast.success("Absensi pulang tugas luar berhasil dicatat!");
    } else {
      const newRecord: Attendance = {
        id: `att_luar_${Date.now()}`,
        employeeId: user.id,
        employeeName: user.nama,
        employeeNip: user.nip,
        tanggal: today,
        waktuMasuk: timeStr,
        waktuKeluar: null,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        fotoDataUrl: photoDataUrl,
        status: "Tugas Luar",
        jenisTugas: "luar",
        tujuanTugas: tujuan.trim(),
        suratTugasDataUrl: suratDataUrl,
      };
      if (existingIdx >= 0) {
        attendances[existingIdx] = newRecord;
      } else {
        attendances.push(newRecord);
      }
      saveAttendances(attendances);
      setTodayRecord(newRecord);
      toast.success("Absensi tugas luar berhasil dicatat!");
    }

    setSaving(false);
  }, [tujuan, suratDataUrl, photoDataUrl, user, today, location]);

  const isCheckedIn = !!todayRecord?.waktuMasuk;
  const isCheckedOut = !!todayRecord?.waktuKeluar;

  return (
    <div className="space-y-4 md:space-y-5 max-w-3xl mx-auto">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4 md:p-5 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #3B1F7A 0%, #5B2D9E 100%)",
          color: "white",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <Briefcase size={22} />
        </div>
        <div>
          <div className="font-bold text-base">Absen Tugas Luar</div>
          <div className="text-xs opacity-80">
            Untuk kehadiran di luar kecamatan -- wajib lampirkan surat tugas
          </div>
        </div>
      </motion.div>

      {/* Status hari ini */}
      {todayRecord && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 md:p-4 flex items-center gap-3"
          style={{
            background: isCheckedOut ? "#EDFAF3" : "#F3EEFF",
            border: `1px solid ${isCheckedOut ? "#2FA66B" : "#7C3AED"}`,
          }}
        >
          <CheckCircle
            size={22}
            style={{ color: isCheckedOut ? "#2FA66B" : "#7C3AED" }}
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div
              className="font-semibold text-sm"
              style={{ color: isCheckedOut ? "#1A7A4A" : "#5B21B6" }}
            >
              {isCheckedOut
                ? "Absensi Tugas Luar Selesai"
                : "Sudah Absensi Tugas Luar Masuk"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              Masuk: {todayRecord.waktuMasuk ?? "-"} | Pulang:{" "}
              {todayRecord.waktuKeluar ?? "Belum absen pulang"}
            </div>
            {todayRecord.tujuanTugas && (
              <div className="text-xs mt-0.5" style={{ color: "#7C3AED" }}>
                Tujuan: {todayRecord.tujuanTugas}
              </div>
            )}
          </div>
          {todayRecord.suratTugasDataUrl?.startsWith("data:image") && (
            <img
              src={todayRecord.suratTugasDataUrl}
              alt="Surat Tugas"
              className="w-14 h-14 rounded-lg object-cover border flex-shrink-0"
              style={{ borderColor: "#7C3AED" }}
            />
          )}
        </motion.div>
      )}

      {!isCheckedOut && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          {/* Form kiri */}
          <div className="space-y-4">
            {/* Tujuan tugas */}
            <div
              className="rounded-xl overflow-hidden shadow-md"
              style={{ background: "#0E3B4C" }}
            >
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              >
                <MapPin size={16} className="text-purple-300" />
                <span className="text-white font-semibold text-sm">
                  Detail Tugas
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label
                    htmlFor="tujuan-input"
                    className="text-xs font-medium mb-1 block"
                    style={{ color: "#A8C4DC" }}
                  >
                    Tujuan / Lokasi Tugas{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="tujuan-input"
                    type="text"
                    value={tujuan}
                    onChange={(e) => setTujuan(e.target.value)}
                    placeholder="cth: Kantor BKKBN Provinsi, Jakarta"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                    }}
                    disabled={isCheckedIn}
                  />
                </div>
                <div>
                  <label
                    htmlFor="keterangan-input"
                    className="text-xs font-medium mb-1 block"
                    style={{ color: "#A8C4DC" }}
                  >
                    Keperluan / Keterangan
                  </label>
                  <textarea
                    id="keterangan-input"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="cth: Rapat koordinasi program KB tingkat provinsi"
                    rows={3}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                    }}
                    disabled={isCheckedIn}
                  />
                </div>
              </div>
            </div>

            {/* Surat tugas */}
            <div
              className="rounded-xl overflow-hidden shadow-md"
              style={{ background: "#0E3B4C" }}
            >
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              >
                <FileText size={16} className="text-yellow-300" />
                <span className="text-white font-semibold text-sm">
                  Surat Tugas{" "}
                  <span className="text-red-400 text-xs">*Wajib</span>
                </span>
              </div>
              <div className="p-4 space-y-3">
                {!suratDataUrl ? (
                  <>
                    {/* Mode selector */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSuratMode("upload");
                          stopCamera();
                        }}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background:
                            suratMode === "upload"
                              ? "#7C3AED"
                              : "rgba(255,255,255,0.08)",
                          color: suratMode === "upload" ? "white" : "#A8C4DC",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      >
                        <Upload size={13} className="inline mr-1" /> Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setSuratMode("kamera")}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background:
                            suratMode === "kamera"
                              ? "#7C3AED"
                              : "rgba(255,255,255,0.08)",
                          color: suratMode === "kamera" ? "white" : "#A8C4DC",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      >
                        <Camera size={13} className="inline mr-1" /> Foto Surat
                      </button>
                    </div>

                    {suratMode === "upload" ? (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full rounded-xl py-8 flex flex-col items-center gap-2 transition-all"
                          style={{
                            background: "rgba(124,58,237,0.1)",
                            border: "2px dashed rgba(124,58,237,0.5)",
                            color: "#A78BFA",
                          }}
                        >
                          <Upload size={28} />
                          <span className="text-sm font-medium">
                            Klik untuk unggah
                          </span>
                          <span className="text-xs opacity-70">
                            JPG, PNG, atau PDF -- maks 5 MB
                          </span>
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div
                          className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center"
                          style={{ height: "180px" }}
                        >
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            style={{ display: cameraActive ? "block" : "none" }}
                          />
                          <canvas ref={canvasRef} style={{ display: "none" }} />
                          {!cameraActive && (
                            <div className="text-center p-4">
                              <Camera
                                size={32}
                                className="text-gray-600 mx-auto mb-2"
                              />
                              <p className="text-gray-500 text-xs">
                                Kamera belum aktif
                              </p>
                            </div>
                          )}
                          {cameraError && (
                            <div
                              className="absolute inset-0 flex items-center justify-center text-center p-4"
                              style={{ background: "rgba(14,59,76,0.9)" }}
                            >
                              <p className="text-red-400 text-xs">
                                {cameraError.message}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!cameraActive ? (
                            <Button
                              onClick={() => startCamera()}
                              disabled={cameraLoading || isSupported === false}
                              className="flex-1 text-white text-xs font-semibold"
                              style={{ background: "#7C3AED" }}
                            >
                              {cameraLoading ? (
                                "Memuat..."
                              ) : (
                                <>
                                  <Camera size={13} className="mr-1" /> Buka
                                  Kamera
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={handleCaptureSurat}
                              className="flex-1 text-white text-xs font-semibold"
                              style={{ background: "#7C3AED" }}
                            >
                              <Camera size={13} className="mr-1" /> Foto Surat
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <Alert
                      className="border"
                      style={{
                        borderColor: "#7C3AED",
                        background: "rgba(124,58,237,0.1)",
                      }}
                    >
                      <CheckCircle
                        className="h-4 w-4"
                        style={{ color: "#A78BFA" }}
                      />
                      <AlertTitle
                        className="text-sm font-semibold"
                        style={{ color: "#C4B5FD" }}
                      >
                        Surat Tugas Terlampir
                      </AlertTitle>
                      <AlertDescription
                        className="text-xs"
                        style={{ color: "#A8C4DC" }}
                      >
                        {suratFileName}
                      </AlertDescription>
                    </Alert>
                    {suratDataUrl.startsWith("data:image") && (
                      <img
                        src={suratDataUrl}
                        alt="Preview Surat Tugas"
                        className="w-full rounded-xl object-contain max-h-48 border"
                        style={{
                          borderColor: "rgba(124,58,237,0.4)",
                          background: "#000",
                        }}
                      />
                    )}
                    {!isCheckedIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setSuratDataUrl(null);
                          setSuratFileName(null);
                        }}
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: "#F87171" }}
                      >
                        <X size={12} /> Hapus & unggah ulang
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kanan: Foto Wajah */}
          <div>
            <div
              className="rounded-xl overflow-hidden shadow-md"
              style={{ background: "#0E3B4C" }}
            >
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              >
                <Camera size={16} className="text-blue-300" />
                <span className="text-white font-semibold text-sm">
                  Verifikasi Wajah
                </span>
                <span className="ml-auto text-xs" style={{ color: "#7BA7C9" }}>
                  (opsional)
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div
                  className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center"
                  style={{ height: "200px" }}
                >
                  <video
                    ref={faceVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ display: faceActive ? "block" : "none" }}
                  />
                  <canvas ref={faceCanvasRef} style={{ display: "none" }} />
                  {photoDataUrl && !faceActive && (
                    <img
                      src={photoDataUrl}
                      alt="Wajah"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!faceActive && !photoDataUrl && (
                    <div className="text-center p-6">
                      <Camera
                        size={36}
                        className="text-gray-600 mx-auto mb-2"
                      />
                      <p className="text-gray-500 text-sm">
                        Kamera belum aktif
                      </p>
                    </div>
                  )}
                  {faceActive && (
                    <div
                      className="absolute bottom-3 left-0 right-0 text-center text-xs font-medium px-3 py-1.5 mx-4 rounded-lg"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        color: "#90CDF4",
                      }}
                    >
                      Hadapkan wajah ke kamera
                    </div>
                  )}
                  {photoDataUrl && (
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold"
                      style={{ background: "#2FA66B", color: "white" }}
                    >
                      <CheckCircle size={11} /> OK
                    </div>
                  )}
                  {faceCameraError && (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-center p-4"
                      style={{ background: "rgba(14,59,76,0.9)" }}
                    >
                      <p className="text-red-400 text-xs">
                        {faceCameraError.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!faceActive && !photoDataUrl && (
                    <Button
                      onClick={() => startFaceCamera()}
                      disabled={faceCameraLoading}
                      className="flex-1 text-white text-sm font-semibold"
                      style={{ background: "#2E7BC6" }}
                    >
                      {faceCameraLoading ? (
                        "Memuat..."
                      ) : (
                        <>
                          <Camera size={14} className="mr-1" /> Buka Kamera
                        </>
                      )}
                    </Button>
                  )}
                  {faceActive && (
                    <Button
                      onClick={handleCaptureFace}
                      className="flex-1 text-white text-sm font-semibold"
                      style={{ background: "#2E7BC6" }}
                    >
                      <Camera size={14} className="mr-1" /> Ambil Foto
                    </Button>
                  )}
                  {photoDataUrl && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPhotoDataUrl(null);
                        startFaceCamera();
                      }}
                      className="flex-1 text-sm"
                      style={{
                        borderColor: "rgba(255,255,255,0.2)",
                        color: "#A8C4DC",
                        background: "transparent",
                      }}
                    >
                      Ulang
                    </Button>
                  )}
                </div>

                {/* Info GPS */}
                {location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} style={{ color: "#4ADE80" }} />
                    <span className="text-xs" style={{ color: "#A8C4DC" }}>
                      GPS: {location.latitude.toFixed(5)},{" "}
                      {location.longitude.toFixed(5)}
                    </span>
                  </div>
                )}

                {/* Tombol Simpan */}
                <Button
                  data-ocid="tugasluar.save.button"
                  onClick={handleSave}
                  disabled={saving || !tujuan.trim() || !suratDataUrl}
                  className="w-full text-white text-sm font-semibold"
                  style={{
                    background:
                      !tujuan.trim() || !suratDataUrl ? "#4A6A70" : "#7C3AED",
                    opacity: !tujuan.trim() || !suratDataUrl ? 0.6 : 1,
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
                        ? "Simpan Absensi Pulang Tugas Luar"
                        : "Simpan Absensi Tugas Luar"}
                    </span>
                  )}
                </Button>

                {(!tujuan.trim() || !suratDataUrl) && (
                  <p
                    className="text-xs text-center"
                    style={{ color: "#F59E0B" }}
                  >
                    {!tujuan.trim() && !suratDataUrl
                      ? "Isi tujuan tugas dan lampirkan surat tugas terlebih dahulu"
                      : !tujuan.trim()
                        ? "Tujuan tugas belum diisi"
                        : "Surat tugas belum dilampirkan (wajib)"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCheckedOut && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl p-5 text-center"
          style={{ background: "#F3EEFF", border: "1px solid #7C3AED" }}
        >
          <CheckCircle
            size={36}
            className="mx-auto mb-2"
            style={{ color: "#7C3AED" }}
          />
          <div className="font-bold text-base" style={{ color: "#5B21B6" }}>
            Absensi Tugas Luar Selesai
          </div>
          <div className="text-xs mt-1" style={{ color: "#7C3AED" }}>
            Masuk: {todayRecord?.waktuMasuk} | Pulang:{" "}
            {todayRecord?.waktuKeluar}
          </div>
          {todayRecord?.tujuanTugas && (
            <div className="text-xs mt-0.5 text-gray-500">
              Tujuan: {todayRecord.tujuanTugas}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
