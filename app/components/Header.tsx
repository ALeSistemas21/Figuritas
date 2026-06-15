"use client";

import React from "react";
import { Award, Edit2, LogOut, RefreshCw, Trophy } from "lucide-react";

interface HeaderProps {
  profile: {
    nombre: string;
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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20 dark:shadow-emerald-950/30">
            <Trophy className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              FiguMatch <span className="text-emerald-500">2026</span>
            </h1>
            <p className="hidden text-[10px] text-zinc-500 sm:block dark:text-zinc-400">
              Álbum de Figuritas Panini Mundial 2026
            </p>
          </div>
        </div>

        {/* Profile Info Section */}
        {profile && (
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden flex-col items-end text-right md:flex">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {profile.nombre}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {profile.ciudad}, {profile.provincia}
                {profile.escuela ? ` • ${profile.escuela}` : ""}
              </span>
            </div>

            {/* Progress Circle/Bar */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold dark:text-zinc-500">
                  Progreso
                </span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {profile.completitud}%
                </span>
              </div>
              <div className="relative h-10 w-10">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    className="stroke-zinc-100 dark:stroke-zinc-800"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    className="stroke-emerald-500 transition-all duration-500 ease-out"
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - profile.completitud / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-4 dark:border-zinc-800">
              <button
                onClick={onEditProfile}
                title="Editar Perfil"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850 dark:hover:text-zinc-50"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={onLogout}
                title="Salir / Cambiar Cuenta"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-rose-600 transition hover:bg-rose-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/20"
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
