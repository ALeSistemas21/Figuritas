"use client";

import React, { useState, useMemo } from "react";
import { SECTIONS, getStickersForSection, TOTAL_STICKERS_COUNT } from "../utils/figuData";
import { Search, ChevronRight, X, Layers, AlertCircle, CheckCircle2 } from "lucide-react";

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

  const [activeSectionCode, setActiveSectionCode] = useState("FWC");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "missing" | "owned" | "duplicates">("all");

  // Filter and search stickers
  const activeSectionStickers = useMemo(() => {
    return getStickersForSection(activeSectionCode);
  }, [activeSectionCode]);

  const filteredStickers = useMemo(() => {
    // If search query is active, search across the ENTIRE album
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      const results: { id: string; num: string; name: string; sectionCode: string }[] = [];
      
      SECTIONS.forEach(sec => {
        const secStickers = getStickersForSection(sec.code);
        secStickers.forEach(st => {
          if (
            st.id.toLowerCase().includes(query) ||
            st.name.toLowerCase().includes(query) ||
            sec.name.toLowerCase().includes(query)
          ) {
            results.push({ ...st, sectionCode: sec.code });
          }
        });
      });
      
      // Apply status filter on search results
      return results.filter(st => {
        const qty = activeCollection[st.id] || 0;
        if (filter === "missing") return qty === 0;
        if (filter === "owned") return qty >= 1;
        if (filter === "duplicates") return qty > 1;
        return true;
      });
    }

    // Otherwise, filter within the active section
    return activeSectionStickers.map(st => ({ ...st, sectionCode: activeSectionCode })).filter(st => {
      const qty = activeCollection[st.id] || 0;
      if (filter === "missing") return qty === 0;
      if (filter === "owned") return qty >= 1;
      if (filter === "duplicates") return qty > 1;
      return true;
    });
  }, [activeSectionCode, activeSectionStickers, searchQuery, filter, activeCollection]);

  // Calculate statistics for the active view
  const sectionStats = useMemo(() => {
    let owned = 0;
    let duplicates = 0;
    
    activeSectionStickers.forEach(st => {
      const qty = activeCollection[st.id] || 0;
      if (qty >= 1) owned++;
      if (qty > 1) duplicates += (qty - 1);
    });
    
    return {
      total: activeSectionStickers.length,
      owned,
      missing: activeSectionStickers.length - owned,
      duplicates
    };
  }, [activeSectionStickers, activeCollection]);

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
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por código (ARG10) o jugador..."
            className="w-full rounded-xl border border-[var(--color-fwc-cyan)]/50 bg-white/50 py-2 pl-9 pr-4 text-xs text-zinc-900 outline-none transition focus:border-[var(--color-fwc-blue)] focus:bg-white dark:border-white/20 dark:bg-zinc-900/50 dark:text-white dark:focus:border-white"
          />
        </div>

        {/* Filters Tabs */}
        <div className="flex rounded-lg bg-black/5 p-1 dark:bg-white/10">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-black transition ${
              filter === "all"
                ? "bg-white text-[var(--color-fwc-blue)] shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-[var(--color-fwc-blue)]/70 hover:text-[var(--color-fwc-blue)] dark:text-white/70 dark:hover:text-white"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("missing")}
            className={`rounded-md px-3 py-1.5 text-xs font-black transition ${
              filter === "missing"
                ? "bg-[var(--color-fwc-red)] text-white shadow-sm"
                : "text-[var(--color-fwc-blue)]/70 hover:text-[var(--color-fwc-red)] dark:text-white/70 dark:hover:text-[var(--color-fwc-red)]"
            }`}
          >
            Faltantes
          </button>
          <button
            onClick={() => setFilter("owned")}
            className={`rounded-md px-3 py-1.5 text-xs font-black transition ${
              filter === "owned"
                ? "bg-[var(--color-fwc-green)] text-white shadow-sm"
                : "text-[var(--color-fwc-blue)]/70 hover:text-[var(--color-fwc-green)] dark:text-white/70 dark:hover:text-[var(--color-fwc-green)]"
            }`}
          >
            Obtenidas
          </button>
          <button
            onClick={() => setFilter("duplicates")}
            className={`rounded-md px-3 py-1.5 text-xs font-black transition ${
              filter === "duplicates"
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
              {SECTIONS.map(sec => {
                const isActive = activeSectionCode === sec.code;
                return (
                  <button
                    key={sec.code}
                    onClick={() => {
                      setActiveSectionCode(sec.code);
                      setSearchQuery("");
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition ${
                      isActive
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
                  {SECTIONS.find(s => s.code === activeSectionCode)?.flag}
                </span>
                <h3 className="text-2xl font-black uppercase text-[var(--color-fwc-blue)] dark:text-white tracking-tight">
                  {SECTIONS.find(s => s.code === activeSectionCode)?.name}
                </h3>
              </div>
              <div className="flex gap-4 text-xs font-bold text-[var(--color-fwc-blue)] dark:text-white">
                <span className="bg-white/50 px-2 py-1 rounded-md">Obtenidas: <strong className="text-[var(--color-fwc-green)]">{sectionStats.owned}/{sectionStats.total}</strong></span>
                <span className="bg-white/50 px-2 py-1 rounded-md">Repetidas: <strong className="text-[var(--color-fwc-orange)]">+{sectionStats.duplicates}</strong></span>
              </div>
            </div>
          )}

          {/* Grid Container */}
          {filteredStickers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
              <AlertCircle className="h-10 w-10 text-zinc-400" />
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                No se encontraron figuritas con el filtro seleccionado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredStickers.map(st => {
                const qty = activeCollection[st.id] || 0;
                const myQty = myCollection[st.id] || 0;

                // Highlighting rules for read-only comparison mode
                let matchLabel = "";
                let matchClass = "";
                
                if (isReadOnly) {
                  const otherQty = qty;
                  if (otherQty > 1 && myQty === 0) {
                    // He has duplicates, I need it
                    matchLabel = "Te la puede dar";
                    matchClass = "bg-emerald-500 text-white shadow-emerald-500/10";
                  } else if (otherQty === 0 && myQty > 1) {
                    // He needs it, I have duplicates
                    matchLabel = "Se la podés dar";
                    matchClass = "bg-indigo-500 text-white shadow-indigo-500/10";
                  }
                }

                return (
                  <div
                    key={st.id}
                    className={`relative flex flex-col justify-between rounded-sm border-[4px] p-2.5 transition-all duration-200 select-none sticker-card bg-white dark:bg-zinc-900 ${
                      qty > 1
                        ? "border-[var(--color-fwc-orange)]/80"
                        : qty === 1
                        ? "border-[var(--color-fwc-green)]"
                        : "border-zinc-200/80 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 dark:border-zinc-700"
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-1 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-fwc-blue)] dark:text-white/80">
                        {st.id}
                      </span>
                      {qty > 0 && (
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black shadow-sm ${
                            qty > 1
                              ? "bg-[var(--color-fwc-orange)] text-white"
                              : "bg-[var(--color-fwc-green)] text-white"
                          }`}
                        >
                          {qty > 1 ? `+${qty - 1}` : "✓"}
                        </span>
                      )}
                    </div>

                    {/* Body Info */}
                    <div className="mt-3.5 mb-5 min-h-[44px]">
                      <h4 className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-tight">
                        {st.name}
                      </h4>
                    </div>

                    {/* Proximity/Match Tag in ReadOnly Mode */}
                    {matchLabel && (
                      <div className={`absolute -top-2 left-3 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${matchClass}`}>
                        {matchLabel}
                      </div>
                    )}

                    {/* Action Controls (If editable) */}
                    {!isReadOnly && onUpdateQuantity ? (
                      <div className="flex items-center gap-1.5 pt-2.5 mt-auto">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(st.id, -1)}
                          disabled={qty === 0}
                          className="flex h-7 w-7 items-center justify-center rounded bg-zinc-100 text-[14px] font-black text-zinc-500 transition hover:bg-[var(--color-fwc-red)] hover:text-white disabled:opacity-45 dark:bg-zinc-800"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center text-sm font-black text-[var(--color-fwc-blue)] dark:text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(st.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded bg-[var(--color-fwc-blue)]/10 text-[14px] font-black text-[var(--color-fwc-blue)] transition hover:bg-[var(--color-fwc-green)] hover:text-white dark:bg-white/10 dark:text-white"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 mt-auto border-t border-zinc-100 pt-2 dark:border-zinc-800">
                        {isReadOnly ? (
                          <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                            {qty > 0 ? (
                              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>La tiene ({qty})</span>
                              </span>
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-500">No la tiene</span>
                            )}
                          </div>
                        ) : (
                          // It's not read-only, but onUpdateQuantity is missing? Or it's our album but qty == 0 and we want to show Perfect Match button
                          null
                        )}
                      </div>
                    )}
                    
                    {/* Botón de Match Perfecto para mis figuritas faltantes */}
                    {!isReadOnly && qty === 0 && onSearchPerfectMatch && (
                      <button
                        type="button"
                        onClick={() => onSearchPerfectMatch(st.id)}
                        className="mt-2 w-full rounded bg-[var(--color-fwc-blue)]/10 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--color-fwc-blue)] transition hover:bg-[var(--color-fwc-blue)] hover:text-white dark:bg-white/10 dark:text-white flex items-center justify-center gap-1"
                      >
                        <Search className="h-3 w-3" />
                        Match Perfecto
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
