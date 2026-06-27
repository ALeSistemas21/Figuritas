"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { Search, Loader2, MapPin, School, User, Check } from "lucide-react";

interface RegisterModalProps {
  currentProfile: any | null;
  onSave: (profileData: any) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export default function RegisterModal({ currentProfile, onSave, isOpen, onClose }: RegisterModalProps) {
  const [nombre, setNombre] = useState("");
  const [idPublico, setIdPublico] = useState("");
  const [provinciaId, setProvinciaId] = useState<number | "">("");
  const [departamentoId, setDepartamentoId] = useState<number | "">("");
  const [localidadId, setLocalidadId] = useState<number | "">("");
  const [escuelaId, setEscuelaId] = useState<number | null>(null);
  const [noEscuela, setNoEscuela] = useState(false);

  // Lists from Supabase
  const [provincias, setProvincias] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [localidades, setLocalidades] = useState<any[]>([]);
  const [loadingProvs, setLoadingProvs] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingLocs, setLoadingLocs] = useState(false);

  // School Search autocomplete
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolSuggestions, setSchoolSuggestions] = useState<any[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  const schoolRef = useRef<HTMLDivElement>(null);

  // Close school suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (schoolRef.current && !schoolRef.current.contains(event.target as Node)) {
        setShowSchoolDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize fields if editing
  useEffect(() => {
    const initProfile = async () => {
      if (isOpen) {
        fetchProvincias();
        if (currentProfile) {
          setNombre(currentProfile.nombre || "");
          setIdPublico(currentProfile.id_publico || "");
          setProvinciaId(currentProfile.provincia_id || "");
          setDepartamentoId(currentProfile.departamento_id || "");
          setLocalidadId(currentProfile.localidad_id || "");
          setEscuelaId(currentProfile.escuela_id || null);
          setNoEscuela(!currentProfile.escuela_id);
          
          if (currentProfile.escuela_nombre) {
            setSelectedSchoolName(currentProfile.escuela_nombre);
            setSchoolQuery(currentProfile.escuela_nombre);
          } else {
            setSelectedSchoolName("");
            setSchoolQuery("");
          }
        } else {
          setNombre("");
          setProvinciaId("");
          setDepartamentoId("");
          setLocalidades([]);
          setLocalidadId("");
          setEscuelaId(null);
          setNoEscuela(false);
          setSchoolQuery("");
          setSelectedSchoolName("");
          
          // Generate a unique 6-digit number
          let unique = false;
          let code = "";
          let attempts = 0;
          while (!unique && attempts < 15) {
            attempts++;
            code = Math.floor(100000 + Math.random() * 900000).toString();
            try {
              const { data, error } = await supabase
                .from("perfiles")
                .select("id_publico")
                .eq("id_publico", code)
                .maybeSingle();
              if (!error && !data) {
                unique = true;
              }
            } catch (err) {
              console.error("Error verifying id_publico uniqueness:", err);
            }
          }
          setIdPublico(code);
        }
      }
    };
    initProfile();
  }, [currentProfile, isOpen]);

  // Load provinces on mount
  const fetchProvincias = async () => {
    setLoadingProvs(true);
    try {
      const { data, error } = await supabase
        .from("provincias")
        .select("id, nombre")
        .order("nombre");
      if (error) throw error;
      setProvincias(data || []);
    } catch (err) {
      console.error("Error fetching provinces:", err);
    } finally {
      setLoadingProvs(false);
    }
  };

  // Load departments when province changes
  useEffect(() => {
    if (provinciaId) {
      fetchDepartamentos(Number(provinciaId));
      if (!currentProfile || currentProfile.provincia_id !== Number(provinciaId)) {
        setDepartamentoId("");
        setLocalidades([]);
        setLocalidadId("");
        setEscuelaId(null);
        setSchoolQuery("");
        setSelectedSchoolName("");
      }
    } else {
      setDepartamentos([]);
      setDepartamentoId("");
      setLocalidades([]);
      setLocalidadId("");
      setEscuelaId(null);
      setSchoolQuery("");
      setSelectedSchoolName("");
    }
  }, [provinciaId, currentProfile]);

  // Load localities when department changes
  useEffect(() => {
    if (departamentoId) {
      fetchLocalidades(Number(departamentoId));
      if (!currentProfile || currentProfile.departamento_id !== Number(departamentoId)) {
        setLocalidadId("");
        setEscuelaId(null);
        setSchoolQuery("");
        setSelectedSchoolName("");
      }
    } else {
      setLocalidades([]);
      setLocalidadId("");
      setEscuelaId(null);
      setSchoolQuery("");
      setSelectedSchoolName("");
    }
  }, [departamentoId, currentProfile]);

  const fetchDepartamentos = async (provId: number) => {
    setLoadingDepts(true);
    try {
      const { data, error } = await supabase
        .from("departamentos")
        .select("id, nombre")
        .eq("provincia_id", provId)
        .order("nombre");
      if (error) throw error;
      setDepartamentos(data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    } finally {
      setLoadingDepts(false);
    }
  };

  const fetchLocalidades = async (deptId: number) => {
    setLoadingLocs(true);
    try {
      const { data, error } = await supabase
        .from("localidades")
        .select("id, nombre")
        .eq("departamento_id", deptId)
        .order("nombre");
      if (error) throw error;
      setLocalidades(data || []);
    } catch (err) {
      console.error("Error fetching localities:", err);
    } finally {
      setLoadingLocs(false);
    }
  };

  // Autocomplete schools from Supabase
  useEffect(() => {
    if (noEscuela) {
      setEscuelaId(null);
      setSelectedSchoolName("");
      setSchoolQuery("");
      setSchoolSuggestions([]);
      return;
    }

    if (!localidadId || schoolQuery.length < 2 || schoolQuery === selectedSchoolName) {
      setSchoolSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      searchSchools();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [schoolQuery, localidadId, noEscuela, selectedSchoolName]);

  const searchSchools = async () => {
    setLoadingSchools(true);
    try {
      const { data, error } = await supabase
        .from("escuelas")
        .select("id, nombre, domicilio")
        .eq("localidad_id", localidadId)
        .ilike("nombre", `%${schoolQuery}%`)
        .limit(10);
      if (error) throw error;
      setSchoolSuggestions(data || []);
      setShowSchoolDropdown(true);
    } catch (err) {
      console.error("Error searching schools:", err);
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleSelectSchool = (school: any) => {
    setEscuelaId(school.id);
    setSelectedSchoolName(school.nombre);
    setSchoolQuery(school.nombre);
    setShowSchoolDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !idPublico.trim() || !provinciaId || !departamentoId || !localidadId || (!escuelaId && !noEscuela)) {
      return;
    }

    const selectedProv = provincias.find(p => p.id === Number(provinciaId));
    const selectedDept = departamentos.find(d => d.id === Number(departamentoId));
    const selectedLoc = localidades.find(l => l.id === Number(localidadId));

    onSave({
      nombre: nombre.trim(),
      id_publico: idPublico.trim().toLowerCase(),
      provincia_id: Number(provinciaId),
      provincia: selectedProv?.nombre || "",
      departamento_id: Number(departamentoId),
      departamento: selectedDept?.nombre || "",
      localidad_id: Number(localidadId),
      ciudad: selectedLoc?.nombre || "",
      escuela_id: noEscuela ? null : escuelaId,
      escuela_nombre: noEscuela ? "" : selectedSchoolName
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {currentProfile ? "Editar tu Perfil" : "¡Bienvenido a FiguMatch!"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {currentProfile
              ? "Actualiza tu información para ver coleccionistas cercanos."
              : "Ingresa tus datos para empezar a intercambiar figuritas."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Tu Nombre / Apodo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
              <input
                type="text"
                required
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Martín"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
              />
            </div>
          </div>

          {/* ID Publico Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              ID de Usuario (Generado aleatoriamente)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-400 font-bold">#</span>
              <input
                type="text"
                required
                disabled
                value={idPublico}
                placeholder="Generando..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-100 py-2.5 pl-8 pr-4 text-sm text-zinc-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 outline-none"
              />
            </div>
          </div>

          {/* Provincia Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Provincia
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
              <select
                required
                value={provinciaId}
                onChange={e => setProvinciaId(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
              >
                <option value="">Selecciona tu provincia</option>
                {provincias.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {loadingProvs && (
                <Loader2 className="absolute right-3 top-2.5 h-4.5 w-4.5 animate-spin text-zinc-400" />
              )}
            </div>
          </div>

          {/* Departamento / Partido Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Departamento / Partido
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
              <select
                required
                disabled={!provinciaId}
                value={departamentoId}
                onChange={e => setDepartamentoId(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
              >
                <option value="">Selecciona tu departamento</option>
                {departamentos.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
              {loadingDepts && (
                <Loader2 className="absolute right-3 top-2.5 h-4.5 w-4.5 animate-spin text-zinc-400" />
              )}
            </div>
          </div>

          {/* Localidad Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Ciudad / Localidad
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
              <select
                required
                disabled={!departamentoId}
                value={localidadId}
                onChange={e => setLocalidadId(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
              >
                <option value="">Selecciona tu localidad</option>
                {localidades.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </select>
              {loadingLocs && (
                <Loader2 className="absolute right-3 top-2.5 h-4.5 w-4.5 animate-spin text-zinc-400" />
              )}
            </div>
          </div>

          {/* Escuela Autocomplete */}
          <div ref={schoolRef} className={`${noEscuela || !localidadId ? "opacity-50" : ""}`}>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Escuela / Colegio
            </label>
            <div className="relative">
              <School className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
              <input
                type="text"
                disabled={noEscuela || !localidadId}
                value={schoolQuery}
                onChange={e => setSchoolQuery(e.target.value)}
                onFocus={() => {
                  if (schoolSuggestions.length > 0) setShowSchoolDropdown(true);
                }}
                placeholder={
                  !localidadId
                    ? "Primero selecciona una localidad"
                    : "Escribe para buscar tu colegio..."
                }
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500 focus:bg-white disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
              />
              {loadingSchools && (
                <Loader2 className="absolute right-3 top-2.5 h-4.5 w-4.5 animate-spin text-emerald-500" />
              )}
              
              {/* Autocomplete Dropdown */}
              {showSchoolDropdown && schoolSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-850 dark:bg-zinc-900">
                  {schoolSuggestions.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSchool(s)}
                      className="flex w-full flex-col px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                    >
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {s.nombre}
                      </span>
                      {s.domicilio && (
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {s.domicilio}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* No Escuela Checkbox */}
          {localidadId && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="noEscuela"
                checked={noEscuela}
                onChange={e => {
                  setNoEscuela(e.target.checked);
                  if (e.target.checked) {
                    setEscuelaId(null);
                    setSchoolQuery("");
                    setSelectedSchoolName("");
                  }
                }}
                className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label
                htmlFor="noEscuela"
                className="text-xs font-medium text-zinc-600 dark:text-zinc-400 select-none cursor-pointer"
              >
                No asisto a ninguna escuela en esta localidad
              </label>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 mt-4">
            {currentProfile && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 rounded-xl border border-zinc-200 bg-white py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={
                !nombre.trim() || !idPublico.trim() || !provinciaId || !departamentoId || !localidadId || (!escuelaId && !noEscuela)
              }
              className={`${currentProfile && onClose ? "w-2/3" : "w-full"} rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-teal-600 disabled:opacity-50 disabled:pointer-events-none dark:shadow-emerald-950/20`}
            >
              {currentProfile ? "Guardar Cambios" : "Comenzar Aventura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
