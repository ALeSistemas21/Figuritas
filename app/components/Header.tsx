"use client";

import React from "react";
import { Award, Edit2, LogOut, RefreshCw, Trophy, Send, Users } from "lucide-react";

interface HeaderProps {
  profile: {
    nombre: string;
    id_publico: string;
    provincia: string;
    ciudad: string;
    escuela?: string;
    completitud: number;
  } | null;
  onEditProfile: () => void;
  onLogout: () => void;
}

export default function Header({ profile, onEditProfile, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-[var(--color-fwc-cyan)]/30 bg-[var(--color-fwc-blue)]/90 backdrop-blur-md shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-fwc-red)] shadow-md shadow-[var(--color-fwc-red)]/40">
            <Trophy className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-sm">
              FiguMatch <span className="text-[var(--color-fwc-yellow)]">26</span>
            </h1>
            <p className="hidden text-[10px] font-bold text-white/70 uppercase tracking-wider sm:block">
              Álbum de Figuritas Panini Mundial 2026
            </p>
          </div>
        </div>

        {/* Profile Info Section */}
        {profile && (
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden flex-col items-end text-right md:flex">
              <span className="text-sm font-black text-white flex items-center gap-1.5 drop-shadow-sm">
                {profile.nombre}
                <span className="text-xs text-[var(--color-fwc-cyan)] font-mono">#{profile.id_publico}</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                {profile.ciudad}, {profile.provincia}
                {profile.escuela ? ` • ${profile.escuela}` : ""}
              </span>
            </div>

            {/* Progress Circle/Bar */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-white/70 font-black">
                  Progreso
                </span>
                <span className="text-sm font-black text-[var(--color-fwc-yellow)] drop-shadow-sm">
                  {profile.completitud}%
                </span>
              </div>
              <div className="relative h-10 w-10 drop-shadow-md">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    className="stroke-white/20"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    className="stroke-[var(--color-fwc-yellow)] transition-all duration-500 ease-out"
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - profile.completitud / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award className="h-4 w-4 text-[var(--color-fwc-yellow)]" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 border-l border-white/20 pl-4">
              <button
                onClick={onEditProfile}
                title="Editar Perfil"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white hover:text-[var(--color-fwc-blue)]"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={onLogout}
                title="Salir / Cambiar Cuenta"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-fwc-red)]/80 text-white transition hover:bg-[var(--color-fwc-red)]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
