import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../types";
import { getEmployees, saveEmployees, setCurrentUser } from "../utils/storage";

interface UbahPasswordPageProps {
  user: Employee;
  onUserUpdate: (user: Employee) => void;
}

export default function UbahPasswordPage({
  user,
  onUserUpdate,
}: UbahPasswordPageProps) {
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [showLama, setShowLama] = useState(false);
  const [showBaru, setShowBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordLama !== user.password) {
      toast.error("Password lama tidak sesuai.");
      return;
    }

    if (passwordBaru.length < 6) {
      toast.error("Password baru minimal 6 karakter.");
      return;
    }

    if (passwordBaru !== konfirmasi) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const employees = getEmployees();
    const updated = employees.map((emp) =>
      emp.id === user.id ? { ...emp, password: passwordBaru } : emp,
    );
    saveEmployees(updated);

    const updatedUser = { ...user, password: passwordBaru };
    setCurrentUser(updatedUser);
    onUserUpdate(updatedUser);

    toast.success("Password berhasil diubah!");
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasi("");
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <div
        className="rounded-2xl shadow overflow-hidden"
        style={{ background: "#08263D" }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#2F6FB0" }}
          >
            <KeyRound size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">
              Ubah Password Admin
            </h2>
            <p className="text-xs" style={{ color: "#7BA7C9" }}>
              Ganti password akun {user.username}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password Lama */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-medium"
                style={{ color: "#A8C4DC" }}
              >
                Password Lama
              </Label>
              <div className="relative">
                <Input
                  type={showLama ? "text" : "password"}
                  value={passwordLama}
                  onChange={(e) => setPasswordLama(e.target.value)}
                  placeholder="Masukkan password lama"
                  required
                  autoComplete="current-password"
                  className="border-0 pr-10 text-white placeholder:text-gray-500"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLama(!showLama)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#7BA7C9" }}
                >
                  {showLama ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Baru */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-medium"
                style={{ color: "#A8C4DC" }}
              >
                Password Baru
              </Label>
              <div className="relative">
                <Input
                  type={showBaru ? "text" : "password"}
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  autoComplete="new-password"
                  className="border-0 pr-10 text-white placeholder:text-gray-500"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowBaru(!showBaru)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#7BA7C9" }}
                >
                  {showBaru ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-medium"
                style={{ color: "#A8C4DC" }}
              >
                Konfirmasi Password Baru
              </Label>
              <div className="relative">
                <Input
                  type={showKonfirmasi ? "text" : "password"}
                  value={konfirmasi}
                  onChange={(e) => setKonfirmasi(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  autoComplete="new-password"
                  className="border-0 pr-10 text-white placeholder:text-gray-500"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKonfirmasi(!showKonfirmasi)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#7BA7C9" }}
                >
                  {showKonfirmasi ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-semibold py-5 text-sm"
              style={{ background: "#2F6FB0" }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </span>
              ) : (
                "Simpan Password Baru"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
