import { useState, useEffect, useMemo } from "react";
import { supabase } from "../utils/supabaseClient";
import type { Sticker } from "../components/AlbumView";
import type { Section } from "../utils/figuData";

export type FilterType = "all" | "missing" | "owned" | "duplicates";

export function useAlbum(activeCollection: { [stickerId: string]: number }) {
  const [activeSectionCode, setActiveSectionCode] = useState("FWC");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const [allStickers, setAllStickers] = useState<Sticker[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStickers() {
      setIsLoading(true);
      try {
        const [stickersRes, sectionsRes] = await Promise.all([
          supabase.from('figuritas').select('*'),
          supabase.from('secciones').select('*').order('orden', { ascending: true })
        ]);
        if (stickersRes.error) throw stickersRes.error;
        if (sectionsRes.error) throw sectionsRes.error;

        setAllStickers(stickersRes.data || []);

        const mappedSections = (sectionsRes.data || []).map((s: any) => ({
          code: s.code,
          name: s.name,
          flag: s.flag,
          isSpecial: s.is_special
        }));
        setSections(mappedSections);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStickers();
  }, []);

  // Filter and search stickers
  const activeSectionStickers = useMemo(() => {
    return allStickers.filter(s => {
      if (activeSectionCode === "PANINI") {
        return s.id === "PAN00";
      }
      if (activeSectionCode === "PAN") {
        return s.id.startsWith("PAN") && s.id !== "PAN00";
      }
      return s.id.startsWith(activeSectionCode);
    });
  }, [allStickers, activeSectionCode]);

  const filteredStickers = useMemo(() => {
    // If search query is active, search across the ENTIRE album
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      const results = allStickers.filter(st =>
        st.id.toLowerCase().includes(query) ||
        st.nombre.toLowerCase().includes(query) ||
        st.seccion.toLowerCase().includes(query)
      );

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
    return activeSectionStickers.filter(st => {
      const qty = activeCollection[st.id] || 0;
      if (filter === "missing") return qty === 0;
      if (filter === "owned") return qty >= 1;
      if (filter === "duplicates") return qty > 1;
      return true;
    });
  }, [activeSectionCode, activeSectionStickers, searchQuery, filter, activeCollection, allStickers]);

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

  // View Transitions API wrapper for updating filters safely
  const updateFilterWithTransition = (newFilter: FilterType) => {
    if (!document.startViewTransition) {
      setFilter(newFilter);
      return;
    }
    document.startViewTransition(() => {
      setFilter(newFilter);
    });
  };

  const updateSectionWithTransition = (code: string) => {
    if (!document.startViewTransition) {
      setActiveSectionCode(code);
      setSearchQuery("");
      return;
    }
    document.startViewTransition(() => {
      setActiveSectionCode(code);
      setSearchQuery("");
    });
  };

  const updateSearchWithTransition = (query: string) => {
    // Para búsquedas escribiendo letra por letra, document.startViewTransition
    // puede ser ruidoso, así que se podría omitir o usar con debounce.
    // Usaremos React state normal para el input.
    setSearchQuery(query);
  };

  return {
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
  };
}
