import React from "react";
import { Search, CheckCircle2 } from "lucide-react";
import type { Sticker } from "./AlbumView";

interface StickerCardProps {
  st: Sticker;
  qty: number;
  myQty: number;
  isReadOnly: boolean;
  onUpdateQuantity?: (stickerId: string, delta: number) => void;
  onSearchPerfectMatch?: (stickerId: string) => void;
}

export const StickerCard = React.memo(function StickerCard({
  st,
  qty,
  myQty,
  isReadOnly,
  onUpdateQuantity,
  onSearchPerfectMatch
}: StickerCardProps) {
  const url_imagen = st.url_imagen || `https://kdshlsfhbznbgvbsmfdo.supabase.co/storage/v1/object/public/Stickers/${st.id}.png`;

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
      className={`sticker-card-container relative flex flex-col justify-between rounded-sm border-[4px] aspect-[3/4] p-2.5 transition-all duration-200 select-none bg-white dark:bg-zinc-900 overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_none_auto_350px] ${qty > 1
          ? "border-[var(--color-fwc-orange)]/80"
          : qty === 1
            ? "border-[var(--color-fwc-green)]"
            : "border-zinc-200/80 dark:border-zinc-700"
        }`}
    >
      {/* Grayscale Background Image */}
      {url_imagen && (
        <div className="absolute inset-0 z-0">
          <img
            src={url_imagen}
            alt={st.nombre}
            className={`w-full h-full object-cover transition-all duration-300 ${qty === 0 ? 'grayscale opacity-40 blur-[2px] dark:opacity-30' : 'grayscale-0 opacity-100 blur-none'}`}
            loading="lazy"
          />
        </div>
      )}

      {/* Dark gradient overlay for readability if there is an image */}
      {url_imagen && <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>}

      {/* Header info */}
      <div className="relative z-10 flex items-center justify-between pb-1 mb-1">
        <span className={`text-[10px] font-black uppercase tracking-wider rounded px-1.5 py-0.5 ${url_imagen ? 'text-white bg-black/60 backdrop-blur-sm' : 'text-[var(--color-fwc-blue)] dark:text-white/80'}`}>
          {st.id}
        </span>
        {qty > 0 && (
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black shadow-sm ${qty > 1
                ? "bg-[var(--color-fwc-orange)] text-white"
                : "bg-[var(--color-fwc-green)] text-white"
              }`}
          >
            {qty > 1 ? `+${qty - 1}` : "✓"}
          </span>
        )}
      </div>

      {/* Body Info */}
      <div className="relative z-10 mt-1 mb-5 min-h-[44px]">
        {qty === 0 && (
          <h4 className={`text-[11px] font-extrabold line-clamp-2 leading-tight inline-block rounded px-1.5 py-1 ${url_imagen ? 'text-white bg-black/60 backdrop-blur-sm shadow-sm' : 'text-zinc-800 dark:text-zinc-200'}`}>
            {st.nombre}
          </h4>
        )}
      </div>

      {/* Proximity/Match Tag in ReadOnly Mode */}
      {matchLabel && (
        <div className={`absolute -top-2 left-3 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${matchClass}`}>
          {matchLabel}
        </div>
      )}

      {/* Action Controls (If editable) */}
      {!isReadOnly && onUpdateQuantity ? (
        <div className={`relative z-10 flex items-center gap-1.5 mt-auto p-1.5 rounded-lg ${url_imagen ? 'bg-black/60 backdrop-blur-sm' : 'bg-zinc-50 dark:bg-zinc-800/50'}`}>
          <button
            type="button"
            onClick={() => onUpdateQuantity(st.id, -1)}
            disabled={qty === 0}
            className={`flex h-7 w-7 items-center justify-center rounded text-[14px] font-black transition disabled:opacity-45 hover:bg-[var(--color-fwc-red)] hover:text-white ${url_imagen ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300'}`}
          >
            -
          </button>
          <span className={`flex-1 text-center text-sm font-black ${url_imagen ? 'text-white drop-shadow-sm' : 'text-[var(--color-fwc-blue)] dark:text-white'}`}>
            {qty}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(st.id, 1)}
            className={`flex h-7 w-7 items-center justify-center rounded text-[14px] font-black transition hover:bg-[var(--color-fwc-green)] hover:text-white ${url_imagen ? 'bg-[var(--color-fwc-blue)]/90 text-white' : 'bg-[var(--color-fwc-blue)]/10 text-[var(--color-fwc-blue)] dark:bg-white/10 dark:text-white'}`}
          >
            +
          </button>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col gap-1.5 mt-auto border-t border-zinc-100/50 pt-2">
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
            null
          )}
        </div>
      )}

      {/* Botón de Match Perfecto para mis figuritas faltantes */}
      {!isReadOnly && qty === 0 && onSearchPerfectMatch && (
        <button
          type="button"
          onClick={() => onSearchPerfectMatch(st.id)}
          className={`relative z-10 mt-2 w-full rounded py-1.5 text-[9px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 ${url_imagen ? 'bg-black/60 backdrop-blur-sm text-white hover:bg-[var(--color-fwc-blue)]' : 'bg-[var(--color-fwc-blue)]/10 text-[var(--color-fwc-blue)] hover:bg-[var(--color-fwc-blue)] hover:text-white dark:bg-white/10 dark:text-white'}`}
        >
          <Search className="h-3 w-3" />
          Match Perfecto
        </button>
      )}
    </div>
  );
});
