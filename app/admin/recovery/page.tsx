"use client";

import { useEffect, useState } from 'react';

interface RecoveryImage {
  category: string;
  filename: string;
  url: string;
  isGrid: boolean;
}

const TEAMS = ["ARG", "BRA", "FRA", "GER", "ESP", "ENG", "POR", "ITA", "URU", "COL", "MEX", "USA", "CAN", "NED", "BEL", "CRO", "JPN", "MAR", "SEN", "KOR", "SUI", "AUS", "ECU", "POL", "WAL", "QAT", "CMR", "SRB", "GHA", "IRN", "KSA", "CRC", "TUN", "PER", "CHI", "SWE", "UKR", "EGY", "NGA", "CIV", "ALG", "MLI", "RSA", "COD", "BFA", "GUI", "UGA", "ZAM", "GAB", "CGO"]; // Add any missing prefixes if needed

interface MissingSticker {
  id: string;
  name: string;
}

export default function RecoveryPage() {
  const [missingIds, setMissingIds] = useState<MissingSticker[]>([]);
  const [images, setImages] = useState<RecoveryImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Teams to populate the select dropdowns for mass assignments
  const [selectedTeams, setSelectedTeams] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/recovery');
    const data = await res.json();
    setMissingIds(data.missingIds);
    setImages(data.images);
    if (data.missingIds.length > 0 && !selectedId) {
      setSelectedId(data.missingIds[0].id);
    }
    setLoading(false);
  };

  const handleApply = async (image: RecoveryImage, gridIndex?: number) => {
    if (!selectedId) return;

    const res = await fetch('/api/recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedId,
        category: image.category,
        filename: image.filename,
        isGrid: image.isGrid,
        gridIndex
      })
    });

    if (res.ok) {
      setMissingIds(prev => {
        const newMissing = prev.filter(item => item.id !== selectedId);
        if (newMissing.length > 0) {
          setSelectedId(newMissing[0].id);
        } else {
          setSelectedId(null);
        }
        return newMissing;
      });
    } else {
      alert('Hubo un error al procesar la imagen');
    }
  };

  const handleMassAssign = async (image: RecoveryImage) => {
    const team = selectedTeams[image.filename];
    if (!team) {
      alert('Por favor selecciona un equipo primero.');
      return;
    }
    if (!confirm(`¿Estás seguro de recortar y asignar esta plancha de 16 jugadores al equipo ${team} (desde ${team}2 hasta ${team}17)?`)) return;

    const res = await fetch('/api/recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: image.category,
        filename: image.filename,
        isGrid: true,
        massAssignTeam: team
      })
    });

    if (res.ok) {
      alert(`¡Plancha entera asignada a ${team} correctamente!`);
      fetchData(); // Refresh list to update all 16 missing IDs
    } else {
      alert('Hubo un error al procesar la plancha');
    }
  };

  if (loading) return <div className="p-10 text-white">Cargando...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Herramienta de Recuperación Visual</h1>
        <p className="text-neutral-400 mb-8">Asigna masivamente planchas de 16 a los equipos, o clica individualmente.</p>

        {missingIds.length === 0 ? (
          <div className="bg-green-900/50 text-green-400 p-4 rounded-xl border border-green-500/20">
            ¡Felicidades! No faltan figuritas. Todas las 992 están en su lugar.
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar: IDs */}
            <div className="lg:w-1/4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 sticky top-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Faltantes ({missingIds.length})</h2>
              <div className="flex flex-col gap-2">
                {missingIds.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`text-left px-4 py-2 rounded-lg transition-colors flex flex-col ${
                      selectedId === item.id ? 'bg-blue-600 text-white font-bold' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    <span>{item.id}</span>
                    <span className="text-xs opacity-75 font-mono">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Area: Images */}
            <div className="lg:w-3/4">
              <h2 className="text-xl font-bold mb-4">Selecciona la imagen para: <span className="text-blue-400">{selectedId}</span></h2>
              
              <div className="space-y-12">
                {images.map((img, idx) => (
                  <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-neutral-400 font-mono text-sm">{img.category} / {img.filename}</span>
                      {img.isGrid ? (
                        <div className="flex items-center gap-4">
                           <span className="text-sm text-neutral-400">Haz clic en cada cara para asignarla al ID actual.</span>
                           <span className="px-2 py-1 bg-yellow-900/50 text-yellow-400 text-xs rounded-md">Grid 4x4</span>
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded-md">Individual</span>
                      )}
                    </div>
                    
                    {img.isGrid ? (
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 16 }).map((_, i) => {
                          const row = Math.floor(i / 4);
                          const col = i % 4;
                          return (
                            <div 
                              key={i} 
                              className="relative aspect-[3/4] cursor-pointer group rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500"
                              onClick={() => handleApply(img, i)}
                            >
                              <img 
                                src={img.url} 
                                alt="Grid part"
                                className="absolute max-w-none"
                                style={{
                                  width: '400%',
                                  height: '400%',
                                  left: `-${col * 100}%`,
                                  top: `-${row * 100}%`
                                }}
                              />
                              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 flex items-center justify-center transition-all">
                                <span className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-2 py-1 rounded shadow-lg text-sm font-bold">
                                  {selectedId ? `Asignar a ${selectedId}` : 'Seleccione ID faltante'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div 
                        className="relative w-48 aspect-[3/4] cursor-pointer group rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500"
                        onClick={() => handleApply(img)}
                      >
                        <img src={img.url} alt="Individual" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 flex items-center justify-center transition-all">
                          <span className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-2 py-1 rounded shadow-lg text-sm font-bold">
                            {selectedId ? `Asignar a ${selectedId}` : 'Seleccione ID faltante'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
