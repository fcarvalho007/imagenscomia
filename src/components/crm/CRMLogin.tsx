import { useState } from "react";
import { BarChart2, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Screen = "login" | "totp-setup" | "totp-verify";

interface CRMLoginProps {
  course?: boolean;
  onLogin: () => void;
}

export default function CRMLogin({ onLogin, course }: CRMLoginProps) {
  const [screen, setScreen] = useState<Screen>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // TOTP setup
  const [totpUri, setTotpUri] = useState("");
  const [totpQr, setTotpQr] = useState("");
  const [factorId, setFactorId] = useState("");

  // TOTP verify
  const [otpCode, setOtpCode] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (signInError) {
        // If user doesn't exist yet, try signup
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Credenciais inválidas.");
          setLoading(false);
          return;
        }
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Check MFA factors
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactors = factorsData?.totp || [];
      const verifiedFactors = totpFactors.filter((f) => f.status === "verified");

      if (verifiedFactors.length > 0) {
        // Has TOTP set up — go to verify screen
        setFactorId(verifiedFactors[0].id);
        setScreen("totp-verify");
      } else {
        // No TOTP — enroll now
        const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          issuer: "WebinarCRM",
          friendlyName: "WebinarCRM Admin",
        });

        if (enrollError || !enrollData) {
          setError(enrollError?.message || "Erro ao configurar 2FA.");
          setLoading(false);
          return;
        }

        setFactorId(enrollData.id);
        setTotpUri(enrollData.totp.uri);
        setTotpQr(enrollData.totp.qr_code);
        setScreen("totp-setup");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleTotpVerify = async () => {
    if (otpCode.length !== 6) return;
    setError("");
    setLoading(true);

    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError || !challengeData) {
        setError(challengeError?.message || "Erro no challenge.");
        setLoading(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: otpCode,
      });

      if (verifyError) {
        setError("Código inválido. Tente novamente.");
        setOtpCode("");
        setLoading(false);
        return;
      }

      // Assign admin role if needed
      await supabase.rpc("ensure_admin_role");

      // Check admin role
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { data: hasRole } = await supabase.rpc("has_role", {
          _user_id: session.session.user.id,
          _role: "admin",
        });

        if (!hasRole) {
          await supabase.auth.signOut();
          setError("Acesso restrito a administradores.");
          setScreen("login");
          setLoading(false);
          return;
        }
      }

      onLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleTotpSetupConfirm = async () => {
    if (otpCode.length !== 6) return;
    setError("");
    setLoading(true);

    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError || !challengeData) {
        setError(challengeError?.message || "Erro no challenge.");
        setLoading(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: otpCode,
      });

      if (verifyError) {
        setError("Código inválido. Verifique e tente novamente.");
        setOtpCode("");
        setLoading(false);
        return;
      }

      // Assign admin role
      await supabase.rpc("ensure_admin_role");

      onLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  const labelStyle = { color: "rgba(255,255,255,0.6)" };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0F172A" }}>
      <div
        className="w-full max-w-[420px] rounded-2xl p-10 max-sm:p-7"
        style={{
          background: "#1E293B",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.40)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={28} className="text-blue-300" />
          <span className="font-heading font-extrabold text-xl text-white">WebinarCRM</span>
        </div>
        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          {course ? "Curso de IA · Frederico Carvalho" : "Webinar IA · Frederico Carvalho"}
        </p>

        {/* ── Screen 1: Email + Password ── */}
        {screen === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={labelStyle}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="email@exemplo.pt"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-400/60"
                style={inputStyle}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={labelStyle}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white outline-none focus:ring-1 focus:ring-blue-400/60"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 py-3 rounded-[10px] font-heading font-semibold text-[15px] text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Entrar
            </button>

            {error && (
              <p className="text-[13px] text-center mt-1" style={{ color: "#f87171" }}>
                {error}
              </p>
            )}
          </form>
        )}

        {/* ── Screen 2: TOTP Setup (first time) ── */}
        {screen === "totp-setup" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-emerald-400" />
              <span className="text-white font-semibold text-[15px]">Configurar Autenticação 2FA</span>
            </div>

            <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Digitalize o QR code com a sua app de autenticação (Google Authenticator, Authy, etc.) e insira o código de 6 dígitos.
            </p>

            {totpQr && (
              <div className="flex justify-center py-3">
                <div className="bg-white rounded-xl p-3">
                  <img src={totpQr} alt="QR Code TOTP" className="w-[180px] h-[180px]" />
                </div>
              </div>
            )}

            {totpUri && (
              <div className="text-center">
                <button
                  onClick={() => navigator.clipboard.writeText(totpUri.split("secret=")[1]?.split("&")[0] || "")}
                  className="text-[11px] text-blue-300/70 hover:text-blue-300 transition-colors underline"
                >
                  Copiar chave manualmente
                </button>
              </div>
            )}

            <div className="flex flex-col items-center gap-3">
              <label className="text-[13px] font-medium" style={labelStyle}>
                Código de verificação
              </label>
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-white/5 border-white/15 text-white" />
                  <InputOTPSlot index={1} className="bg-white/5 border-white/15 text-white" />
                  <InputOTPSlot index={2} className="bg-white/5 border-white/15 text-white" />
                  <InputOTPSlot index={3} className="bg-white/5 border-white/15 text-white" />
                  <InputOTPSlot index={4} className="bg-white/5 border-white/15 text-white" />
                  <InputOTPSlot index={5} className="bg-white/5 border-white/15 text-white" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              onClick={handleTotpSetupConfirm}
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 rounded-[10px] font-heading font-semibold text-[15px] text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Confirmar e Activar
            </button>

            {error && (
              <p className="text-[13px] text-center" style={{ color: "#f87171" }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── Screen 3: TOTP Verify (subsequent logins) ── */}
        {screen === "totp-verify" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-blue-400" />
              <span className="text-white font-semibold text-[15px]">Verificação 2FA</span>
            </div>

            <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Insira o código de 6 dígitos da sua app de autenticação.
            </p>

            <div className="flex flex-col items-center gap-3 py-2">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-white/5 border-white/15 text-white" />
                  <InputOTPSlot index={1} className="bg-white/5 border-white/15 text-white" />
                  <InputOTPSlot index={2} className="bg-white/5 border-white/15 text-white" />
                  <InputOTPSlot index={3} className="bg-white/5 border-white/15 text-white" />
                  <InputOTPSlot index={4} className="bg-white/5 border-white/15 text-white" />
                  <InputOTPSlot index={5} className="bg-white/5 border-white/15 text-white" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              onClick={handleTotpVerify}
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 rounded-[10px] font-heading font-semibold text-[15px] text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Verificar
            </button>

            <button
              onClick={() => {
                supabase.auth.signOut();
                setScreen("login");
                setOtpCode("");
                setError("");
              }}
              className="w-full text-[13px] text-white/40 hover:text-white/60 transition-colors"
            >
              Voltar ao login
            </button>

            {error && (
              <p className="text-[13px] text-center" style={{ color: "#f87171" }}>
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
