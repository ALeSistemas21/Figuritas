"use client";

import React from "react";
import { AlertTriangle, Key, Shield, Terminal, ArrowRight } from "lucide-react";

export default function FirebaseSetupWarning() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-zinc-950 to-emerald-950 px-4 py-12">
      {/* Background decorative blobs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Main glassmorphism card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-6 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-lg shadow-amber-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">
              Configuración de Firebase Requerida
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Se detectaron credenciales de Firebase vacías o de prueba en tu entorno.
            </p>
          </div>
        </div>

        {/* Info */}
        <p className="text-sm text-zinc-350 leading-relaxed mb-6">
          Para que el sistema de registro e inicio de sesión de <strong>FiguMatch 2026</strong> funcione correctamente, necesitas enlazar la aplicación con tu propio proyecto de <strong>Google Firebase</strong>. Sigue los pasos a continuación:
        </p>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
              1
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Crear un proyecto de Firebase</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ingresa a la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Consola de Firebase</a>, crea un nuevo proyecto y registra una aplicación web para obtener tus credenciales.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
              2
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Habilitar Proveedores de Autenticación</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                En el menú de Firebase, ve a <strong>Build &gt; Authentication</strong>, haz clic en comenzar, y habilita los métodos de inicio de sesión de <strong>Correo electrónico/Contraseña</strong> y <strong>Google</strong>.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
              3
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Configurar tus Variables de Entorno</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Abre el archivo <a href="file:///home/alejandro/Documentos/Diplomatura%20FullStack/Post%20Diplomatura/Desarrollo%20con%20IA/Intercambiar%20figuritas/my-app/.env.local" className="text-emerald-400 hover:underline font-mono text-[11px]">.env.local</a> en la raíz de tu proyecto y reemplaza los valores de prueba con tus credenciales reales:
              </p>
              
              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-850 bg-zinc-950/80 p-4 font-mono text-xs text-zinc-450">
                <div>NEXT_PUBLIC_FIREBASE_API_KEY=<span className="text-emerald-400">"tu_api_key_aqui"</span></div>
                <div>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<span className="text-emerald-400">"tu_proyecto.firebaseapp.com"</span></div>
                <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID=<span className="text-emerald-400">"tu_proyecto_id"</span></div>
                <div>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<span className="text-emerald-400">"tu_proyecto.appspot.com"</span></div>
                <div>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<span className="text-emerald-400">"tu_sender_id"</span></div>
                <div>NEXT_PUBLIC_FIREBASE_APP_ID=<span className="text-emerald-400">"tu_app_id"</span></div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
              4
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Reiniciar el Servidor de Desarrollo</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Una vez guardado el archivo, detén el servidor actual en tu consola e inicialízalo nuevamente ejecutando:
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-1.5 font-mono text-xs text-zinc-300 w-fit">
                <Terminal className="h-3.5 w-3.5 text-zinc-500" />
                <span>npm run dev</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-zinc-400" />
            <span>FiguMatch utiliza autenticación segura integrada con Google Firebase.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
