"use client";

import React from "react";
import { 
  Trophy, 
  Layers, 
  AlertCircle, 
  MapPin, 
  School, 
  ArrowRight, 
  UserCheck, 
  Hourglass,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface DashboardViewProps {
  profile: any;
  stats: {
    owned: number;
    missing: number;
    duplicates: number;
    total: number;
  };
  pendingProposalsCount: number;
  onNavigate: (view: string) => void;
}

export default function DashboardView({
  profile,
  stats,
  pendingProposalsCount,
  onNavigate
}: DashboardViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-700 p-6 text-white shadow-xl shadow-emerald-950/10 dark:shadow-emerald-950/20">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          ¡Hola, {profile?.nombre}! 👋
        </h2>
        <p className="mt-1 text-sm text-emerald-100 max-w-lg">
          Lleva el control de tu álbum del Mundial 2026. Encuentra coleccionistas en tu zona y completa tu colección de forma inteligente.
        </p>

        {/* Location Tags */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5" />
            <span>{profile?.ciudad}, {profile?.provincia}</span>
          </div>
          {profile?.escuela_nombre && (
            <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <School className="h-3.5 w-3.5" />
              <span>{profile?.escuela_nombre}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Completitud */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Completado
            </span>
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-zinc-950 dark:text-zinc-50">
            {stats.total > 0 ? Math.round((stats.owned / stats.total) * 100) : 0}%
          </p>
          <div className="mt-3.5 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div 
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${stats.total > 0 ? Math.round((stats.owned / stats.total) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Obtenidas */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Obtenidas
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-zinc-950 dark:text-zinc-50">
            {stats.owned}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1 dark:text-zinc-500">
            de {stats.total} figuritas totales
          </p>
        </div>

        {/* Faltantes */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Faltantes
            </span>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-zinc-950 dark:text-zinc-50">
            {stats.missing}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1 dark:text-zinc-500">
            {((stats.missing / stats.total) * 100).toFixed(0)}% del total
          </p>
        </div>

        {/* Repetidas */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Repetidas
            </span>
            <Layers className="h-5 w-5 text-teal-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-zinc-950 dark:text-zinc-50">
            {stats.duplicates}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1 dark:text-zinc-500">
            listas para intercambiar
          </p>
        </div>
      </div>

      {/* Main Grid: Info & Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Accesos Rápidos
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Action Card 1: My Album */}
            <button
              onClick={() => onNavigate("album")}
              className="flex items-start gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 text-left hover:border-emerald-500 hover:shadow-md transition dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:border-emerald-500"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Gestionar Álbum</h4>
                <p className="text-xs text-zinc-500 mt-0.5 dark:text-zinc-400">
                  Marca tus figuritas pegadas y selecciona tus repetidas.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400 self-center" />
            </button>

            {/* Action Card 2: Matchmaking */}
            <button
              onClick={() => onNavigate("matches")}
              className="flex items-start gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 text-left hover:border-emerald-500 hover:shadow-md transition dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:border-emerald-500"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Buscar Matches</h4>
                <p className="text-xs text-zinc-500 mt-0.5 dark:text-zinc-400">
                  Encuentra coleccionistas cerca de tu escuela o ciudad.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400 self-center" />
            </button>
          </div>
        </div>

        {/* Community / Dev Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Red de Intercambio
          </h3>

          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 space-y-4">
            {/* Pending Proposals Indicator */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600">
                  <Hourglass className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Tratos Pendientes</h4>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Esperando confirmación</p>
                </div>
              </div>
              {pendingProposalsCount > 0 ? (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                  {pendingProposalsCount}
                </span>
              ) : (
                <span className="text-xs text-zinc-400">Ninguno</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
