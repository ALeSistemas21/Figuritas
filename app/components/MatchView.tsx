"use client";

import React, { useState, useMemo } from "react";
import { MapPin, School, ArrowRight, BookOpen, Send, User, ChevronRight, X, ArrowUpDown, RefreshCw, Check, Search, UserX } from "lucide-react";
import AlbumView from "./AlbumView";

interface Collector {
  id: string;
  nombre: string;
  provincia_id: number;
  provincia: string;
  departamento_id: number;
  departamento: string;
  localidad_id: number;
  ciudad: string;
  escuela_id: number | null;
  escuela_nombre: string;
  completitud: number;
  distancia: number; // Simulated distance in meters/km
  proximityLevel: 1 | 2 | 3 | 4 | 5; // 1 = Same school, 2 = Same city, 3 = Same departamento, 4 = Same province, 5 = National
  collection: { [stickerId: string]: number };
}

interface CollectorWithMatch extends Collector {
  iCanGive: string[];
  heCanGive: string[];
  matchScore: number;
}

interface MatchViewProps {
  myProfile: any | null;
  myCollection: { [stickerId: string]: number };
  collectors: any[];
  onProposeTrade: (receptorId: string, ofrece: string[], solicita: string[]) => void;
  loading: boolean;
  onRefresh: () => void;
  perfectMatchStickerId?: string | null;
  onClearPerfectMatch?: () => void;
}

export default function MatchView({
  myProfile,
  myCollection,
  collectors,
  onProposeTrade,
  loading,
  onRefresh,
  perfectMatchStickerId = null,
  onClearPerfectMatch
}: MatchViewProps) {
  const [selectedCollectorForAlbum, setSelectedCollectorForAlbum] = useState<Collector | null>(null);
  const [selectedCollectorForTrade, setSelectedCollectorForTrade] = useState<CollectorWithMatch | null>(null);

  // States for trade proposal modal
  const [selectedToGive, setSelectedToGive] = useState<string[]>([]);
  const [selectedToReceive, setSelectedToReceive] = useState<string[]>([]);

  // Handle Perfect Match filter
  const displayedCollectors = useMemo(() => {
    if (!perfectMatchStickerId) return collectors;

    return collectors.filter(c => {
      // Condición 1: Tienen repetida la figurita objetivo
      const tienenObjetivo = (c.collection[perfectMatchStickerId] || 0) > 1;
      if (!tienenObjetivo) return false;

      // Condición 2: Necesitan al menos UNA figurita que yo tenga repetida
      let necesitanMia = false;
      for (const [stId, myQty] of Object.entries(myCollection)) {
        if (myQty > 1) {
          const theirQty = c.collection[stId] || 0;
          if (theirQty === 0) {
            necesitanMia = true;
            break;
          }
        }
      }

      return necesitanMia;
    });
  }, [collectors, perfectMatchStickerId, myCollection]);

  // 1. Calculate matching details for each collector
  const collectorsWithMatches = useMemo(() => {
    return displayedCollectors.map(c => {
      // Find what stickers I have repeated that he lacks
      const iCanGive: string[] = [];
      // Find what stickers he has repeated that I lack
      const heCanGive: string[] = [];

      // Loop through all keys where I have duplicates (quantity > 1)
      Object.keys(myCollection).forEach(stId => {
        if (myCollection[stId] > 1 && (!c.collection[stId] || c.collection[stId] === 0)) {
          iCanGive.push(stId);
        }
      });

      // Loop through all keys where he has duplicates
      Object.keys(c.collection).forEach(stId => {
        if (c.collection[stId] > 1 && (!myCollection[stId] || myCollection[stId] === 0)) {
          heCanGive.push(stId);
        }
      });

      return {
        ...c,
        iCanGive,
        heCanGive,
        matchScore: Math.min(iCanGive.length, heCanGive.length) // potential mutual trades
      };
    });
  }, [displayedCollectors, myCollection]);

  // Open trade modal and pre-set selections
  const openTradeModal = (collector: any) => {
    setSelectedCollectorForTrade(collector);
    setSelectedToGive([]);
    setSelectedToReceive([]);
  };

  const handleToggleGive = (stId: string) => {
    setSelectedToGive(prev =>
      prev.includes(stId) ? prev.filter(x => x !== stId) : [...prev, stId]
    );
  };

  const handleToggleReceive = (stId: string) => {
    setSelectedToReceive(prev =>
      prev.includes(stId) ? prev.filter(x => x !== stId) : [...prev, stId]
    );
  };

  const submitProposal = () => {
    if (!selectedCollectorForTrade || (selectedToGive.length === 0 && selectedToReceive.length === 0)) return;
    onProposeTrade(selectedCollectorForTrade.id, selectedToGive, selectedToReceive);
    setSelectedCollectorForTrade(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* View Title */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Encontrar Coleccionistas
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Ordenados por cercanía para facilitar el intercambio presencial.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-500" : ""}`} />
          Actualizar
        </button>
      </div>

      {perfectMatchStickerId && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-950/30">
          <div className="flex items-center gap-2">
            <Search className="h-4.5 w-4.5 text-indigo-500" />
            <div>
              <h4 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
                Filtro de Match Perfecto activo: <span className="text-indigo-600 dark:text-indigo-400">{perfectMatchStickerId}</span>
              </h4>
              <p className="text-[10px] font-medium text-indigo-700/80 dark:text-indigo-400/80">
                Mostrando usuarios que tienen repetida la {perfectMatchStickerId} y que necesitan alguna de tus repetidas.
              </p>
            </div>
          </div>
          <button 
            onClick={onClearPerfectMatch}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/60 text-indigo-700 hover:bg-white dark:bg-zinc-900/60 dark:text-indigo-300 dark:hover:bg-zinc-900 transition"
            title="Quitar filtro"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading && collectors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 text-emerald-500 animate-spin border-4 border-emerald-500/30 border-t-emerald-500 rounded-full" />
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Buscando coleccionistas cercanos...</p>
        </div>
      ) : collectorsWithMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
          <UserX className="h-10 w-10 text-zinc-400" />
          <p className="mt-sm text-sm text-zinc-500 dark:text-zinc-400">
            {perfectMatchStickerId ? "No hay usuarios que cumplan esta doble coincidencia de match." : "No se encontraron otros coleccionistas activos en este momento."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {collectorsWithMatches.map(c => {
            // Proximity Tag Config
            let proximityTag = "";
            let proximityClass = "";
            let distanceStr = "";

            if (c.proximityLevel === 1) {
              proximityTag = "Misma Escuela";
              proximityClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900";
              distanceStr = "A pocos metros (en el colegio)";
            } else if (c.proximityLevel === 2) {
              proximityTag = "Misma Ciudad";
              proximityClass = "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900";
              distanceStr = `A ${c.distancia.toFixed(1)} km`;
            } else if (c.proximityLevel === 3) {
              proximityTag = "Mismo Departamento";
              proximityClass = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900";
              distanceStr = `A ${c.distancia.toFixed(1)} km`;
            } else if (c.proximityLevel === 4) {
              proximityTag = "Misma Provincia";
              proximityClass = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900";
              distanceStr = `A ${c.distancia.toFixed(0)} km`;
            } else {
              proximityTag = "Nivel Nacional";
              proximityClass = "bg-zinc-50 text-zinc-650 border-zinc-200 dark:bg-zinc-850 dark:text-zinc-450 dark:border-zinc-800";
              distanceStr = `A más de ${c.distancia.toFixed(0)} km`;
            }

            return (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 hover:shadow-md transition"
              >
                {/* Header Profile Info */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50">{c.nombre}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {c.ciudad}, {c.departamento}, {c.provincia}
                        {c.escuela_nombre ? ` • ${c.escuela_nombre}` : ""}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.75 text-[9px] font-black uppercase tracking-wider ${proximityClass}`}>
                      {proximityTag}
                    </span>
                  </div>

                  <p className="text-[10px] font-bold text-zinc-400 mt-2.5 flex items-center gap-1 dark:text-zinc-500">
                    <MapPin className="h-3 w-3" />
                    <span>{distanceStr} • Álbum al {c.completitud}%</span>
                  </p>
                </div>

                {/* Overlaps details */}
                <div className="my-5 grid grid-cols-2 gap-3 border-y border-zinc-100 py-3.5 dark:border-zinc-800/60">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Te puede dar:
                    </span>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {c.heCanGive.length} figus
                    </p>
                    <p className="text-[9px] text-zinc-400 mt-0.5 dark:text-zinc-500 truncate">
                      {c.heCanGive.slice(0, 4).join(", ")}
                      {c.heCanGive.length > 4 ? "..." : ""}
                    </p>
                  </div>

                  <div className="text-left border-l border-zinc-100 pl-3.5 dark:border-zinc-800/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Le podés dar:
                    </span>
                    <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {c.iCanGive.length} figus
                    </p>
                    <p className="text-[9px] text-zinc-400 mt-0.5 dark:text-zinc-500 truncate">
                      {c.iCanGive.slice(0, 4).join(", ")}
                      {c.iCanGive.length > 4 ? "..." : ""}
                    </p>
                  </div>
                </div>

                {/* Matching Badges */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setSelectedCollectorForAlbum(c)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-350 dark:hover:bg-zinc-850"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Ver Álbum</span>
                  </button>

                  <button
                    onClick={() => openTradeModal(c)}
                    disabled={c.heCanGive.length === 0 && c.iCanGive.length === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/10 hover:from-emerald-700 hover:to-teal-600 transition disabled:opacity-45 disabled:pointer-events-none"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Intercambiar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: View Collector Album */}
      {selectedCollectorForAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="overflow-y-auto flex-1">
              <AlbumView
                myCollection={myCollection}
                otherUserCollection={selectedCollectorForAlbum.collection}
                otherUserName={selectedCollectorForAlbum.nombre}
                onCloseOtherUserView={() => setSelectedCollectorForAlbum(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Configure Trade Proposal */}
      {selectedCollectorForTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Proponer Intercambio con {selectedCollectorForTrade.nombre}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 dark:text-zinc-500">
                  Selecciona qué figuritas intercambiarán.
                </p>
              </div>
              <button
                onClick={() => setSelectedCollectorForTrade(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Side-by-side Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto py-2">
              {/* Left Column: I Give */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[10px] text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                    {selectedToGive.length}
                  </span>
                  <span>Tus Repetidas que le das:</span>
                </h4>
                {selectedCollectorForTrade.iCanGive.length === 0 ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">No tienes repetidas que le falten.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCollectorForTrade.iCanGive.map(stId => {
                      const isSelected = selectedToGive.includes(stId);
                      return (
                        <button
                          key={stId}
                          type="button"
                          onClick={() => handleToggleGive(stId)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 border ${
                            isSelected
                              ? "bg-indigo-650 text-white border-indigo-600"
                              : "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800"
                          }`}
                        >
                          {stId}
                          {isSelected && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: I Receive */}
              <div className="space-y-2 border-t border-zinc-100 pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-4 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                    {selectedToReceive.length}
                  </span>
                  <span>Sus Repetidas que recibes:</span>
                </h4>
                {selectedCollectorForTrade.heCanGive.length === 0 ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">No tiene repetidas que te falten.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCollectorForTrade.heCanGive.map(stId => {
                      const isSelected = selectedToReceive.includes(stId);
                      return (
                        <button
                          key={stId}
                          type="button"
                          onClick={() => handleToggleReceive(stId)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 border ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-500"
                              : "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800"
                          }`}
                        >
                          {stId}
                          {isSelected && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-zinc-100 pt-4 mt-5 flex items-center justify-between dark:border-zinc-800">
              <div className="flex items-center gap-1 text-xs font-extrabold text-zinc-650 dark:text-zinc-450">
                <span>Intercambio:</span>
                <span className="text-indigo-650 dark:text-indigo-400">{selectedToGive.length} dadas</span>
                <span>x</span>
                <span className="text-emerald-600 dark:text-emerald-400">{selectedToReceive.length} recibidas</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCollectorForTrade(null)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-350"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={submitProposal}
                  disabled={selectedToGive.length === 0 && selectedToReceive.length === 0}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-teal-600 disabled:opacity-50"
                >
                  Enviar Propuesta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline helper for spinners
function LoaderSpinner({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
