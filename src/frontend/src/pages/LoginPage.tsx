import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../types";
import { getEmployees, setCurrentUser } from "../utils/storage";

interface LoginPageProps {
  onLogin: (user: Employee) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const employees = getEmployees();
    const user = employees.find(
      (emp) => emp.username === username.trim() && emp.password === password,
    );

    if (!user) {
      setError("Username atau password salah. Silakan coba lagi.");
      setIsLoading(false);
      return;
    }

    setCurrentUser(user);
    toast.success(`Selamat datang, ${user.nama}!`);
    onLogin(user);
    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #C9D3DD 0%, #A8B8C8 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: "#08263D" }}
        >
          {/* Header */}
          <div
            className="px-8 py-8 text-center"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            <img
              src="/assets/logo_bkkbn-019d5e48-16d8-73fe-a725-df08e9261adf.jpg"
              alt="Logo BKKBN"
              className="w-16 h-16 rounded-2xl mx-auto mb-4 object-contain"
              style={{ background: "white", padding: "4px" }}
            />
            <h1 className="text-2xl font-bold text-white tracking-wide">
              E-VISUM PKB
            </h1>
            <p className="text-sm mt-1" style={{ color: "#7BA7C9" }}>
              Sistem Informasi Absensi Pegawai Penyuluh KB
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#A8C4DC" }}
                >
                  Username
                </Label>
                <Input
                  data-ocid="login.username.input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  required
                  autoComplete="username"
                  className="border-0 text-white placeholder:text-gray-500"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#A8C4DC" }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    data-ocid="login.password.input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
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
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#7BA7C9" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  data-ocid="login.error_state"
                  className="rounded-lg px-4 py-2.5 text-sm"
                  style={{
                    background: "rgba(216,74,74,0.15)",
                    color: "#F87171",
                    border: "1px solid rgba(216,74,74,0.3)",
                  }}
                >
                  {error}
                </div>
              )}

              <Button
                data-ocid="login.submit_button"
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-semibold py-5 text-sm"
                style={{ background: "#2F6FB0" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>

            <p
              className="text-center text-xs mt-6"
              style={{ color: "#5A7A95" }}
            >
              Demo pegawai: budi / password: budi123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
