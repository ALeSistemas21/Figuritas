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
}

export default function AlbumView({
  myCollection,
  onUpdateQuantity,
  otherUserCollection = null,
  otherUserName = "",
  onCloseOtherUserView
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
        <div className="flex items-center justify-between rounded-xl bg-indigo-50 p-4 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900">
          <div>
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
              Viendo colección de: <span className="underline">{otherUserName}</span>
            </h3>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/85 mt-0.5">
              Estás en modo lectura comparando con tu álbum.
            </p>
          </div>
          <button
            onClick={onCloseOtherUserView}
            className="flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 rounded-lg bg-white px-3 py-1.5 border border-indigo-200 dark:bg-zinc-900 dark:text-indigo-300 dark:border-indigo-900"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cerrar</span>
          </button>
        </div>
      )}

      {/* Control Panel (Search, Filters) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por código (ARG10) o jugador..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-xs text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
          />
        </div>

        {/* Filters Tabs */}
        <div className="flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-950">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
              filter === "all"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("missing")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
              filter === "missing"
                ? "bg-white text-rose-600 shadow-sm dark:bg-zinc-900 dark:text-rose-400"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Faltantes
          </button>
          <button
            onClick={() => setFilter("owned")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
              filter === "owned"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-900 dark:text-emerald-400"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Obtenidas
          </button>
          <button
            onClick={() => setFilter("duplicates")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
              filter === "duplicates"
                ? "bg-white text-amber-600 shadow-sm dark:bg-zinc-900 dark:text-amber-400"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
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
          <div className="md:col-span-1 max-h-[500px] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
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
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "text-zinc-650 hover:bg-zinc-50 dark:text-zinc-350 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sec.flag}</span>
                      <span>{sec.name}</span>
                    </div>
                    <span className="text-[10px] font-bold opacity-60">{sec.code}</span>
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
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {SECTIONS.find(s => s.code === activeSectionCode)?.flag}
                </span>
                <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50">
                  {SECTIONS.find(s => s.code === activeSectionCode)?.name}
                </h3>
              </div>
              <div className="flex gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <span>Obtenidas: <strong className="text-emerald-500">{sectionStats.owned}/{sectionStats.total}</strong></span>
                <span>Repetidas: <strong className="text-amber-500">+{sectionStats.duplicates}</strong></span>
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
                    className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 select-none ${
                      qty > 1
                        ? "border-amber-400 bg-amber-500/[0.04] shadow-sm shadow-amber-500/5 dark:border-amber-500/40"
                        : qty === 1
                        ? "border-emerald-300 bg-emerald-500/[0.03] dark:border-emerald-500/30"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {st.id}
                      </span>
                      {qty > 0 && (
                        <span
                          className={`flex h-5.5 min-w-5.5 items-center justify-center rounded-full text-[10px] font-black ${
                            qty > 1
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-500 text-white"
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
                      <div className="flex items-center gap-1.5 border-t border-zinc-100 pt-2.5 dark:border-zinc-800 mt-auto">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(st.id, -1)}
                          disabled={qty === 0}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white text-xs font-bold text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800 disabled:opacity-45 dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(st.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white text-xs font-bold text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-auto border-t border-zinc-100 pt-2 dark:border-zinc-800">
                        {qty > 0 ? (
                          <span className="text-emerald-500 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>La tiene ({qty})</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500">No la tiene</span>
                        )}
                      </div>
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
