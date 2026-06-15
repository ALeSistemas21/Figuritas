"use client";

import React from "react";
import { Hourglass, CheckCircle2, XCircle, Trash2, ArrowRight, ArrowLeft, Send } from "lucide-react";

interface Proposal {
  id: string;
  solicitante_id: string;
  solicitante_nombre: string;
  solicitante_ciudad: string;
  solicitante_provincia: string;
  solicitante_escuela?: string;
  receptor_id: string;
  receptor_nombre: string;
  receptor_ciudad: string;
  receptor_provincia: string;
  receptor_escuela?: string;
  ofrece: string[];
  solicita: string[];
  estado: "pendiente" | "aceptado" | "rechazado" | "cancelado";
  created_at: string;
}

interface ProposalsViewProps {
  myProfileId: string;
  proposals: Proposal[];
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  onCancel: (proposalId: string) => void;
  loading: boolean;
}

export default function ProposalsView({
  myProfileId,
  proposals,
  onAccept,
  onReject,
  onCancel,
  loading
}: ProposalsViewProps) {
  // Separate incoming (received) and outgoing (sent) proposals
  const receivedProposals = proposals.filter(p => p.receptor_id === myProfileId);
  const sentProposals = proposals.filter(p => p.solicitante_id === myProfileId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Received Proposals Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Propuestas Recibidas ({receivedProposals.length})
        </h3>

        {receivedProposals.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/20">
            <p className="text-xs">No tienes propuestas de intercambio recibidas en este momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {receivedProposals.map(p => (
              <div
                key={p.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
              >
                {/* Header Info */}
                <div className="flex items-start justify-between border-b border-zinc-100 pb-3 dark:border-zinc-850">
                  <div>
                    <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50">
                      {p.solicitante_nombre}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {p.solicitante_ciudad}, {p.solicitante_provincia}
                      {p.solicitante_escuela ? ` • ${p.solicitante_escuela}` : ""}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.75 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                    <Hourglass className="h-3 w-3" />
                    <span>Pendiente</span>
                  </span>
                </div>

                {/* Offer vs Request details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Offers (What I get) */}
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Te entrega (Tus Faltantes):
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.ofrece.map(stId => (
                        <span
                          key={stId}
                          className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40"
                        >
                          {stId}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requests (What I give) */}
                  <div className="space-y-1 text-left border-t border-zinc-100 pt-3 md:border-t-0 md:pt-0 md:border-l md:pl-4 dark:border-zinc-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">
                      Te solicita (Tus Repetidas):
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.solicita.map(stId => (
                        <span
                          key={stId}
                          className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40"
                        >
                          {stId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accept/Reject Buttons */}
                {p.estado === "pendiente" && (
                  <div className="flex items-center justify-end gap-2.5 border-t border-zinc-100 pt-4 dark:border-zinc-850">
                    <button
                      onClick={() => onReject(p.id)}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-650 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => onAccept(p.id)}
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/10 hover:from-emerald-700 hover:to-teal-600 transition"
                    >
                      Aceptar Intercambio
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Proposals Section */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Propuestas Enviadas ({sentProposals.length})
        </h3>

        {sentProposals.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/20">
            <p className="text-xs">No has enviado ninguna propuesta de intercambio todavía.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sentProposals.map(p => {
              let statusTag = "";
              let statusClass = "";
              let statusIcon = null;

              if (p.estado === "pendiente") {
                statusTag = "Pendiente";
                statusClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40";
                statusIcon = <Hourglass className="h-3 w-3" />;
              } else if (p.estado === "aceptado") {
                statusTag = "Aceptado";
                statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40";
                statusIcon = <CheckCircle2 className="h-3 w-3" />;
              } else {
                statusTag = p.estado === "rechazado" ? "Rechazado" : "Cancelado";
                statusClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40";
                statusIcon = <XCircle className="h-3 w-3" />;
              }

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
                >
                  {/* Header Info */}
                  <div className="flex items-start justify-between border-b border-zinc-100 pb-3 dark:border-zinc-850">
                    <div>
                      <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50">
                        Para: {p.receptor_nombre}
                      </h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {p.receptor_ciudad}, {p.receptor_provincia}
                        {p.receptor_escuela ? ` • ${p.receptor_escuela}` : ""}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.75 text-[10px] font-black uppercase tracking-wider ${statusClass}`}>
                      {statusIcon}
                      <span>{statusTag}</span>
                    </span>
                  </div>

                  {/* Offer vs Request details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Offers (What I give) */}
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">
                        Le entregas (Tus Repetidas):
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.ofrece.map(stId => (
                          <span
                            key={stId}
                            className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40"
                          >
                            {stId}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Requests (What I get) */}
                    <div className="space-y-1 text-left border-t border-zinc-100 pt-3 md:border-t-0 md:pt-0 md:border-l md:pl-4 dark:border-zinc-800">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Le solicitas (Sus Repetidas):
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.solicita.map(stId => (
                          <span
                            key={stId}
                            className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40"
                          >
                            {stId}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  {p.estado === "pendiente" && (
                    <div className="flex items-center justify-end border-t border-zinc-100 pt-3.5 dark:border-zinc-850">
                      <button
                        onClick={() => onCancel(p.id)}
                        className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-550 hover:bg-zinc-50 hover:text-rose-600 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Cancelar Propuesta</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
