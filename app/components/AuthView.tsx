"use client";

import React, { useState } from "react";
import { auth, googleProvider } from "../utils/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

interface AuthViewProps {
  onAuthSuccess: () => void;
}

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getFriendlyError = (code: string) => {
    switch (code) {
      case "auth/invalid-email":
        return "El formato del correo electrónico no es válido.";
      case "auth/user-disabled":
        return "Esta cuenta ha sido desactivada.";
      case "auth/user-not-found":
        return "No se encontró ninguna cuenta con este correo.";
      case "auth/wrong-password":
        return "Contraseña incorrecta. Inténtalo de nuevo.";
      case "auth/email-already-in-use":
        return "Este correo ya está registrado en la aplicación.";
      case "auth/weak-password":
        return "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
      case "auth/popup-closed-by-user":
        return "Se cerró la ventana de autenticación de Google.";
      case "auth/invalid-credential":
        return "Credenciales inválidas. Revisa tus datos.";
      case "auth/operation-not-allowed":
        return "El método de inicio de sesión (Correo o Google) no está habilitado en la consola de Firebase. Por favor, ve a la sección de Authentication > Sign-in method y habilítalo.";
      case "auth/unauthorized-domain":
        return `El dominio '${typeof window !== "undefined" ? window.location.hostname : ""}' no está autorizado para autenticar en Firebase. Por favor, ve a la sección Authentication > Settings > Authorized domains de tu Consola de Firebase y agrégalo a la lista de dominios autorizados.`;
      default:
        return "Ocurrió un error al autenticar. Por favor, intenta de nuevo.";
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth!, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth!, email.trim(), password);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth!, googleProvider!);
      onAuthSuccess();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(getFriendlyError(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--color-fwc-blue)] px-4 py-12 overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-[var(--color-fwc-cyan)]/30 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[var(--color-fwc-purple)]/30 blur-3xl" />
      <div className="absolute -top-10 -right-10 h-96 w-96 rounded-full bg-[var(--color-fwc-red)]/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-96 w-96 rounded-full bg-[var(--color-fwc-green)]/20 blur-3xl" />

      {/* Main glassmorphism card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl glass-panel p-8">
        
        {/* App Logo / Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-fwc-red)] text-white shadow-xl shadow-[var(--color-fwc-red)]/30">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-4xl font-black uppercase tracking-tight text-white drop-shadow-md">
            FiguMatch <span className="text-[var(--color-fwc-yellow)]">26</span>
          </h1>
          <p className="mt-1.5 text-sm font-bold text-white/80">
            {isLogin ? "Iniciá sesión para gestionar tu álbum" : "Registrate para empezar a intercambiar"}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="mb-6 flex rounded-lg bg-black/20 p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-center text-xs font-black uppercase tracking-wider transition-all ${
              isLogin
                ? "bg-white text-[var(--color-fwc-blue)] shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-center text-xs font-black uppercase tracking-wider transition-all ${
              !isLogin
                ? "bg-white text-[var(--color-fwc-blue)] shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-lg bg-[var(--color-fwc-red)]/90 border border-[var(--color-fwc-red)] p-3.5 text-xs font-bold text-white shadow-lg">
            {error}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/90 mb-1.5 drop-shadow-md">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-white/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-white/20 bg-black/20 py-2.5 pl-10 pr-4 text-sm font-bold text-white placeholder-white/40 outline-none transition focus:border-white focus:bg-black/40 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/90 mb-1.5 drop-shadow-md">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-white/50" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-xl border border-white/20 bg-black/20 py-2.5 pl-10 pr-4 text-sm font-bold text-white placeholder-white/40 outline-none transition focus:border-white focus:bg-black/40 shadow-inner"
              />
            </div>
          </div>

          {/* Confirm Password (only for registration) */}
          {!isLogin && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/90 mb-1.5 drop-shadow-md">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-white/50" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-white/20 bg-black/20 py-2.5 pl-10 pr-4 text-sm font-bold text-white placeholder-white/40 outline-none transition focus:border-white focus:bg-black/40 shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-fwc-red)] py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-[var(--color-fwc-red)]/40 transition hover:bg-white hover:text-[var(--color-fwc-red)] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {isLogin ? "Entrar" : "Registrarme"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center justify-between">
          <span className="h-px w-full bg-white/20" />
          <span className="px-3 text-[10px] font-black uppercase tracking-wider text-white/60">O</span>
          <span className="h-px w-full bg-white/20" />
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-white bg-white py-3 text-sm font-black text-[var(--color-fwc-blue)] uppercase tracking-wider transition hover:bg-gray-100 disabled:opacity-50 shadow-xl"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {/* Google SVG Icon */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.69 5.69 0 0 1 8.24 12.8a5.69 5.69 0 0 1 5.751-5.714c1.479 0 2.82.528 3.87 1.39l2.946-2.945C18.99 3.84 15.938 2.8 12.24 2.8 6.643 2.8 2 7.279 2 12.8s4.643 10 10.24 10c6.12 0 9.87-4.17 9.87-10 0-.693-.06-1.14-.17-1.515H12.24Z"
                />
              </svg>
              Continuar con Google
            </>
          )}
        </button>

      </div>
    </div>
  );
}
