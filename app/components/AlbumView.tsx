"use client";

import React from "react";
import { Search, X, AlertCircle } from "lucide-react";
import { useAlbum } from "../hooks/useAlbum";
import { StickerCard } from "./StickerCard";

export interface Sticker {
  id: string;
  seccion: string;
  numero: string;
  nombre: string;
  url_imagen: string | null;
}

interface AlbumViewProps {
  myCollection: { [stickerId: string]: number };
  onUpdateQuantity?: (stickerId: string, delta: number) => void;
  otherUserCollection?: { [stickerId: string]: number } | null;
  otherUserName?: string;
  onCloseOtherUserView?: () => void;
  onSearchPerfectMatch?: (stickerId: string) => void;
}

export default function AlbumView({
  myCollection,
  onUpdateQuantity,
  otherUserCollection = null,
  otherUserName = "",
  onCloseOtherUserView,
  onSearchPerfectMatch
}: AlbumViewProps) {
  const isReadOnly = !!otherUserCollection;
  const activeCollection = otherUserCollection || myCollection;

  const {
    activeSectionCode,
    searchQuery,
    filter,
    sections,
    isLoading,
    filteredStickers,
    sectionStats,
    updateFilterWithTransition,
    updateSectionWithTransition,
    updateSearchWithTransition
  } = useAlbum(activeCollection);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header Info (If viewing another user's collection) */}
      {isReadOnly && (
        <div className="flex items-center justify-between rounded-xl glass-panel p-4 border border-[var(--color-fwc-cyan)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-fwc-blue)] dark:text-white">
              Viendo colección de: <span className="underline">{otherUserName}</span>
            </h3>
            <p className="text-[11px] text-[var(--color-fwc-blue)]/80 dark:text-white/85 mt-0.5">
              Estás en modo lectura comparando con tu álbum.
            </p>
          </div>
          <button
            onClick={onCloseOtherUserView}
            className="flex items-center gap-1 text-xs font-bold text-[var(--color-fwc-red)] hover:text-white hover:bg-[var(--color-fwc-red)] transition-colors rounded-lg bg-white px-3 py-1.5 border border-[var(--color-fwc-red)]/50 dark:bg-zinc-900 dark:border-[var(--color-fwc-red)]/50"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cerrar</span>
          </button>
        </div>
      )}

      {/* Control Panel (Search, Filters) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between glass-panel p-4 rounded-xl">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-[var(--color-fwc-blue)]/50 dark:text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => updateSearchWithTransition(e.target.value)}
            placeholder="Buscar por código (ARG10) o jugador..."
            className="w-full rounded-xl border border-[var(--color-fwc-cyan)]/50 bg-white/50 py-2 pl-9 pr-4 text-xs text-zinc-900 outline-none transition focus:border-[var(--color-fwc-blue)] focus:bg-white dark:border-white/20 dark:bg-zinc-900/50 dark:text-white dark:focus:border-white"
          />
        </div>

        {/* Filters Tabs */}
        <div className="flex rounded-lg bg-black/5 p-1 dark:bg-white/10">
          <button
            onClick={() => updateFilterWithTransition("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-black transition ${filter === "all"
                ? "bg-white text-[var(--color-fwc-blue)] shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-[var(--color-fwc-blue)]/70 hover:text-[var(--color-fwc-blue)] dark:text-white/70 dark:hover:text-white"
              }`}
          >
            Todas
          </button>
          <button
            onClick={() => updateFilterWithTransition("missing")}
            className={`rounded-md px-3 py-1.5 text-xs font-black transition ${filter === "missing"
                ? "bg-[var(--color-fwc-red)] text-white shadow-sm"
                : "text-[var(--color-fwc-blue)]/70 hover:text-[var(--color-fwc-red)] dark:text-white/70 dark:hover:text-[var(--color-fwc-red)]"
              }`}
          >
            Faltantes
          </button>
          <button
            onClick={() => updateFilterWithTransition("owned")}
            className={`rounded-md px-3 py-1.5 text-xs font-black transition ${filter === "owned"
                ? "bg-[var(--color-fwc-green)] text-white shadow-sm"
                : "text-[var(--color-fwc-blue)]/70 hover:text-[var(--color-fwc-green)] dark:text-white/70 dark:hover:text-[var(--color-fwc-green)]"
              }`}
          >
            Obtenidas
          </button>
          <button
            onClick={() => updateFilterWithTransition("duplicates")}
            className={`rounded-md px-3 py-1.5 text-xs font-black transition ${filter === "duplicates"
                ? "bg-[var(--color-fwc-orange)] text-white shadow-sm"
                : "text-[var(--color-fwc-blue)]/70 hover:text-[var(--color-fwc-orange)] dark:text-white/70 dark:hover:text-[var(--color-fwc-orange)]"
              }`}
          >
            Repetidas
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar Navigation + Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        {/* Navigation Sidebar (Scrollable country list) */}
        {!searchQuery && (
          <div className="md:col-span-1 max-h-[500px] overflow-y-auto rounded-xl glass-panel p-2.5">
            <h3 className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-[var(--color-fwc-purple)] dark:text-white/60">
              Selecciones
            </h3>
            <div className="space-y-1">
              {sections.map(sec => {
                const isActive = activeSectionCode === sec.code;
                return (
                  <button
                    key={sec.code}
                    onClick={() => updateSectionWithTransition(sec.code)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition ${isActive
                        ? "bg-[var(--color-fwc-blue)] text-white shadow-md shadow-[var(--color-fwc-blue)]/20 scale-[1.02]"
                        : "text-[var(--color-fwc-blue)] hover:bg-white/50 dark:text-white dark:hover:bg-white/10"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sec.flag}</span>
                      <span>{sec.name}</span>
                    </div>
                    <span className={`text-[10px] font-black ${isActive ? "opacity-100 text-[var(--color-fwc-yellow)]" : "opacity-60"}`}>{sec.code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stickers Grid */}
        <div className={searchQuery ? "md:col-span-4" : "md:col-span-3"}>
          {/* Section Stats (only if not searching) */}
          {!searchQuery && (
            <div className="flex items-center justify-between border-b-2 border-[var(--color-fwc-blue)]/10 pb-3 mb-4 dark:border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl drop-shadow-sm">
                  {sections.find(s => s.code === activeSectionCode)?.flag}
                </span>
                <h3 className="text-2xl font-black uppercase text-[var(--color-fwc-blue)] dark:text-white tracking-tight">
                  {sections.find(s => s.code === activeSectionCode)?.name}
                </h3>
              </div>
              <div className="flex gap-4 text-xs font-bold text-[var(--color-fwc-blue)] dark:text-white">
                <span className="bg-white/50 px-2 py-1 rounded-md">Obtenidas: <strong className="text-[var(--color-fwc-green)]">{sectionStats.owned}/{sectionStats.total}</strong></span>
                <span className="bg-white/50 px-2 py-1 rounded-md">Repetidas: <strong className="text-[var(--color-fwc-orange)]">+{sectionStats.duplicates}</strong></span>
              </div>
            </div>
          )}

          {/* Grid Container */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-fwc-blue)]"></div>
            </div>
          ) : filteredStickers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
              <AlertCircle className="h-10 w-10 text-zinc-400" />
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                No se encontraron figuritas con el filtro seleccionado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredStickers.map(st => (
                <StickerCard
                  key={st.id}
                  st={st}
                  qty={activeCollection[st.id] || 0}
                  myQty={myCollection[st.id] || 0}
                  isReadOnly={isReadOnly}
                  onUpdateQuantity={onUpdateQuantity}
                  onSearchPerfectMatch={onSearchPerfectMatch}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
