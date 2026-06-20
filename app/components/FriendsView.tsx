"use client";

import React, { useState } from "react";
import { Search, UserPlus, UserCheck, UserX, Clock, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

interface FriendsViewProps {
  myProfile: any;
  friends: any[];
  requests: any[];
  onAccept: (reqId: string) => void;
  onReject: (reqId: string) => void;
  onSendRequest: (idPublico: string) => Promise<{ success: boolean; message: string }>;
  onViewCollection: (friendId: string, friendName: string) => void;
  loading: boolean;
}

export default function FriendsView({
  myProfile,
  friends,
  requests,
  onAccept,
  onReject,
  onSendRequest,
  onViewCollection,
  loading
}: FriendsViewProps) {
  const [searchId, setSearchId] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    
    setSending(true);
    setFeedback(null);
    const result = await onSendRequest(searchId.trim().toLowerCase());
    setFeedback({ type: result.success ? "success" : "error", msg: result.message });
    if (result.success) setSearchId("");
    setSending(false);
    
    setTimeout(() => setFeedback(null), 5000);
  };

  const receivedRequests = requests.filter(r => r.receptor_id === myProfile?.id && r.estado === 'pendiente');
  const sentRequests = requests.filter(r => r.solicitante_id === myProfile?.id && r.estado === 'pendiente');

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Add Friend & Pending Requests */}
        <div className="w-full md:w-1/3 space-y-6">
          {/* Add Friend Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-zinc-900 dark:text-zinc-50 mb-4">
              <UserPlus className="h-4.5 w-4.5 text-emerald-500" />
              Añadir Amigo
            </h3>
            <form onSubmit={handleSend} className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-bold">@</span>
                <input
                  type="text"
                  value={searchId}
                  onChange={e => setSearchId(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="ID Público"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-8 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </div>
              <button
                type="submit"
                disabled={!searchId.trim() || sending}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {sending ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </form>
            
            {feedback && (
              <div className={`mt-3 flex items-start gap-2 rounded-lg p-3 text-xs font-semibold ${
                feedback.type === "success" 
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                  : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
              }`}>
                {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <p>{feedback.msg}</p>
              </div>
            )}
          </div>

          {/* Pending Requests Received */}
          {receivedRequests.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20 shadow-sm">
              <h3 className="text-sm font-extrabold text-amber-900 dark:text-amber-500 mb-3 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5" />
                Solicitudes Recibidas
              </h3>
              <div className="space-y-2.5">
                {receivedRequests.map(req => (
                  <div key={req.id} className="rounded-xl border border-amber-200/60 bg-white p-3 dark:border-amber-900/40 dark:bg-zinc-900">
                    <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {req.solicitante.nombre}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                      @{req.solicitante.id_publico}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAccept(req.id)}
                        className="flex-1 rounded-lg bg-emerald-500 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => onReject(req.id)}
                        className="flex-1 rounded-lg bg-zinc-200 py-1.5 text-xs font-bold text-zinc-700 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Pending Requests Sent */}
          {sentRequests.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mb-3">
                Solicitudes Enviadas
              </h3>
              <div className="space-y-2">
                {sentRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between rounded-lg bg-zinc-50 p-2.5 px-3 dark:bg-zinc-950">
                    <div>
                      <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {req.receptor.nombre}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        @{req.receptor.id_publico}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded">
                      Pendiente
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Friends List */}
        <div className="w-full md:w-2/3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm h-full">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-zinc-900 dark:text-zinc-50 mb-5">
              <UserCheck className="h-5 w-5 text-indigo-500" />
              Mis Amigos ({friends.length})
            </h3>
            
            {friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserX className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  Aún no tienes amigos en tu red.
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">
                  Busca a otros coleccionistas por su ID Público para ver su progreso y facilitar intercambios.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {friends.map(friend => {
                  // The friend could be either the solicitante or receptor depending on who initiated
                  const friendProfile = friend.solicitante_id === myProfile.id ? friend.receptor : friend.solicitante;
                  
                  return (
                    <div key={friend.id} className="flex flex-col justify-between rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {friendProfile.nombre}
                          </h4>
                        </div>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                          @{friendProfile.id_publico}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => onViewCollection(friendProfile.id, friendProfile.nombre)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver Colección
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
