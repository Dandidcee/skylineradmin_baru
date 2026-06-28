import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toastManager } from "@/components/ui/toast";
import { setToken } from "@/services/api";

export function LoginPage() {
  const [email, setEmail] = useState("admin@skyflow.id");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal");
      
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toastManager.success({ title: "Login berhasil", description: "Mengalihkan ke dashboard..." });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err: any) {
      toastManager.error({ title: "Gagal Login", description: err.message || "Terjadi kesalahan" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc] p-4 sm:p-8 font-sans text-text">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl md:flex-row">
        
        {/* Desktop Left Side - Brand & Logo */}
        <div className="hidden w-1/2 flex-col items-center justify-center bg-primary p-12 text-white md:flex relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white opacity-10 blur-3xl"></div>
          
          <div className="z-10 flex flex-col items-center justify-center text-center">
            <img src="/LogoMain.png" alt="SkyFlow Logo" className="w-64 max-w-full h-auto object-contain drop-shadow-lg" />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex w-full flex-col justify-center p-8 sm:p-10 md:w-1/2 lg:p-14">
          <div className="mb-8 text-center md:text-left">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Selamat Datang 👋</h2>
            <p className="text-sm text-gray-500">Silakan login ke akun Anda.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 pr-10 text-sm outline-none focus:border-primary transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
