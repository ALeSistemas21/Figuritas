"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./utils/supabaseClient";
import Header from "./components/Header";
import RegisterModal from "./components/RegisterModal";
import DashboardView from "./components/DashboardView";
import AlbumView from "./components/AlbumView";
import MatchView from "./components/MatchView";
import ProposalsView from "./components/ProposalsView";
import { TOTAL_STICKERS_COUNT } from "./utils/figuData";
import { Trophy, Compass, Send, Home, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

const getJoinedName = (field: any): string => {
  if (!field) return "";
  if (Array.isArray(field)) {
    return field[0]?.nombre || "";
  }
  return field.nombre || "";
};

interface Profile {
  id: string;
  nombre: string;
  provincia_id: number;
  provincia: string;
  localidad_id: number;
  ciudad: string;
  escuela_id: number | null;
  escuela_nombre: string;
  completitud: number;
}

export default function Page() {
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [myCollection, setMyCollection] = useState<{ [stickerId: string]: number }>({});
  const [collectors, setCollectors] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);

  // Navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "album" | "matches" | "proposals">("dashboard");

  // Loading states
  const [initializing, setInitializing] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [generatingMock, setGeneratingMock] = useState(false);

  // Profile modal visibility
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 1. Initial Load: Check localStorage and fetch profile
  useEffect(() => {
    const profileId = localStorage.getItem("figumatch_profile_id");
    if (profileId) {
      loadProfileAndData(profileId);
    } else {
      setInitializing(false);
      setShowProfileModal(true);
    }
  }, []);

  const loadProfileAndData = async (profileId: string) => {
    setInitializing(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileErr } = await supabase
        .from("perfiles")
        .select(`
          id, nombre, provincia_id, localidad_id, escuela_id, completitud,
          provincias(nombre),
          localidades(nombre),
          escuelas(nombre)
        `)
        .eq("id", profileId)
        .single();

      if (profileErr) {
        if (profileErr.code === "PGRST116") {
          // Profile not found in DB, clear localStorage and show modal
          localStorage.removeItem("figumatch_profile_id");
          setShowProfileModal(true);
          setInitializing(false);
          return;
        }
        throw profileErr;
      }

      // Format profile data
      const formattedProfile = {
        id: profileData.id,
        nombre: profileData.nombre,
        provincia_id: profileData.provincia_id,
        provincia: getJoinedName(profileData.provincias),
        localidad_id: profileData.localidad_id,
        ciudad: getJoinedName(profileData.localidades),
        escuela_id: profileData.escuela_id,
        escuela_nombre: getJoinedName(profileData.escuelas),
        completitud: profileData.completitud
      };

      setMyProfile(formattedProfile);

      // Fetch collection
      const { data: collData, error: collErr } = await supabase
        .from("colecciones")
        .select("sticker_id, cantidad")
        .eq("perfil_id", profileId);

      if (collErr) throw collErr;

      const collMap: { [stickerId: string]: number } = {};
      collData?.forEach(item => {
        collMap[item.sticker_id] = item.cantidad;
      });
      setMyCollection(collMap);

      // Fetch collectors and proposals
      await Promise.all([
        fetchCollectors(formattedProfile),
        fetchProposals(profileId)
      ]);

      setShowProfileModal(false);
    } catch (err) {
      console.error("Error loading profile/data:", err);
    } finally {
      setInitializing(false);
    }
  };

  // Fetch active collectors
  const fetchCollectors = async (profile: any) => {
    if (!profile) return;
    setLoadingMatches(true);
    try {
      // Get all profiles except ours
      const { data, error } = await supabase
        .from("perfiles")
        .select(`
          id, nombre, provincia_id, localidad_id, escuela_id, completitud,
          provincias(nombre),
          localidades(nombre),
          escuelas(nombre)
        `)
        .neq("id", profile.id);

      if (error) throw error;

      // Fetch all collections for these profiles to compare inventory
      const { data: allColl, error: allCollErr } = await supabase
        .from("colecciones")
        .select("perfil_id, sticker_id, cantidad");

      if (allCollErr) throw allCollErr;

      // Group collections by profile_id
      const collectionsByProfile: { [pId: string]: { [sId: string]: number } } = {};
      allColl?.forEach(item => {
        if (!collectionsByProfile[item.perfil_id]) {
          collectionsByProfile[item.perfil_id] = {};
        }
        collectionsByProfile[item.perfil_id][item.sticker_id] = item.cantidad;
      });

      // Calculate proximity level and simulated distance for each collector
      const formattedCollectors = data.map(c => {
        let proximityLevel: 1 | 2 | 3 | 4 = 4;
        let distancia = 0; // km

        if (profile.escuela_id && c.escuela_id === profile.escuela_id) {
          proximityLevel = 1;
          distancia = 0.05; // 50 meters
        } else if (c.localidad_id === profile.localidad_id) {
          proximityLevel = 2;
          distancia = Math.random() * 3 + 0.5; // 0.5 - 3.5 km
        } else if (c.provincia_id === profile.provincia_id) {
          proximityLevel = 3;
          distancia = Math.random() * 80 + 15; // 15 - 95 km
        } else {
          proximityLevel = 4;
          distancia = Math.random() * 1000 + 150; // 150 - 1150 km
        }

        return {
          id: c.id,
          nombre: c.nombre,
          provincia_id: c.provincia_id,
          provincia: getJoinedName(c.provincias),
          localidad_id: c.localidad_id,
          ciudad: getJoinedName(c.localidades),
          escuela_id: c.escuela_id,
          escuela_nombre: getJoinedName(c.escuelas),
          completitud: c.completitud,
          proximityLevel,
          distancia,
          collection: collectionsByProfile[c.id] || {}
        };
      });

      // Sort by proximity level, then by distance, then by completitud
      formattedCollectors.sort((a, b) => {
        if (a.proximityLevel !== b.proximityLevel) {
          return a.proximityLevel - b.proximityLevel;
        }
        return a.distancia - b.distancia;
      });

      setCollectors(formattedCollectors);
    } catch (err) {
      console.error("Error fetching collectors:", err);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Fetch proposals
  const fetchProposals = async (profileId: string) => {
    setLoadingProposals(true);
    try {
      const { data, error } = await supabase
        .from("propuestas")
        .select(`
          id, solicitante_id, receptor_id, ofrece, solicita, estado, created_at,
          solicitante:perfiles!propuestas_solicitante_id_fkey(nombre, provincia_id, localidad_id, escuela_id, provincias(nombre), localidades(nombre), escuelas(nombre)),
          receptor:perfiles!propuestas_receptor_id_fkey(nombre, provincia_id, localidad_id, escuela_id, provincias(nombre), localidades(nombre), escuelas(nombre))
        `)
        .or(`solicitante_id.eq.${profileId},receptor_id.eq.${profileId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedProposals = data.map(p => {
        const solicitanteObj = Array.isArray(p.solicitante) ? p.solicitante[0] : p.solicitante;
        const receptorObj = Array.isArray(p.receptor) ? p.receptor[0] : p.receptor;

        return {
          id: p.id,
          solicitante_id: p.solicitante_id,
          solicitante_nombre: solicitanteObj?.nombre || "",
          solicitante_ciudad: getJoinedName(solicitanteObj?.localidades),
          solicitante_provincia: getJoinedName(solicitanteObj?.provincias),
          solicitante_escuela: getJoinedName(solicitanteObj?.escuelas),
          receptor_id: p.receptor_id,
          receptor_nombre: receptorObj?.nombre || "",
          receptor_ciudad: getJoinedName(receptorObj?.localidades),
          receptor_provincia: getJoinedName(receptorObj?.provincias),
          receptor_escuela: getJoinedName(receptorObj?.escuelas),
          ofrece: p.ofrece,
          solicita: p.solicita,
          estado: p.estado,
          created_at: p.created_at
        };
      });

      setProposals(formattedProposals);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    } finally {
      setLoadingProposals(false);
    }
  };

  // Save profile info (Register or edit)
  const handleSaveProfile = async (profileData: any) => {
    setSavingProfile(true);
    try {
      let profileId = localStorage.getItem("figumatch_profile_id");
      if (!profileId) {
        // Generate new uuid for profile
        profileId = crypto.randomUUID();
      }

      const payload = {
        id: profileId,
        nombre: profileData.nombre,
        provincia_id: profileData.provincia_id,
        localidad_id: profileData.localidad_id,
        escuela_id: profileData.escuela_id,
        completitud: myProfile?.completitud || 0
      };

      const { error } = await supabase
        .from("perfiles")
        .upsert(payload);

      if (error) throw error;

      localStorage.setItem("figumatch_profile_id", profileId);
      await loadProfileAndData(profileId);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Increment / Decrement quantities in Album
  const handleUpdateQuantity = async (stickerId: string, delta: number) => {
    if (!myProfile) return;
    const currentQty = myCollection[stickerId] || 0;
    const newQty = Math.max(0, currentQty + delta);

    if (newQty === currentQty) return;

    // Update local state immediately for snappy feel
    const updatedCollection = { ...myCollection, [stickerId]: newQty };
    setMyCollection(updatedCollection);

    try {
      // Upsert into colecciones
      const { error: collErr } = await supabase
        .from("colecciones")
        .upsert({
          perfil_id: myProfile.id,
          sticker_id: stickerId,
          cantidad: newQty
        });

      if (collErr) throw collErr;

      // Recalculate completitud
      let ownedCount = 0;
      Object.values(updatedCollection).forEach(qty => {
        if (qty >= 1) ownedCount++;
      });
      const newCompletitud = Math.round((ownedCount / TOTAL_STICKERS_COUNT) * 100);

      if (newCompletitud !== myProfile.completitud) {
        setMyProfile(prev => prev ? { ...prev, completitud: newCompletitud } : null);
        await supabase
          .from("perfiles")
          .update({ completitud: newCompletitud })
          .eq("id", myProfile.id);
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  // Propose a new trade
  const handleProposeTrade = async (receptorId: string, ofrece: string[], solicita: string[]) => {
    if (!myProfile) return;
    try {
      const { error } = await supabase
        .from("propuestas")
        .insert({
          solicitante_id: myProfile.id,
          receptor_id: receptorId,
          ofrece,
          solicita,
          estado: "pendiente"
        });

      if (error) throw error;

      await fetchProposals(myProfile.id);
      setActiveTab("proposals");
      
      // Auto-simulate a response after 4 seconds to make the app interactive!
      setTimeout(() => {
        simulateProposalAcceptance();
      }, 4000);
    } catch (err) {
      console.error("Error proposing trade:", err);
    }
  };

  // Simulate acceptance of a pending sent proposal for demo purposes
  const simulateProposalAcceptance = async () => {
    if (!myProfile) return;
    try {
      // Find the first pending sent proposal
      const pendingSent = proposals.find(p => p.solicitante_id === myProfile.id && p.estado === "pendiente");
      if (!pendingSent) return;

      // Execute acceptance logic
      await handleAcceptProposal(pendingSent.id);
    } catch (err) {
      console.error("Error simulating proposal acceptance:", err);
    }
  };

  // Accept trade proposal: executes the sticker transfer!
  const handleAcceptProposal = async (proposalId: string) => {
    if (!myProfile) return;
    try {
      // Fetch the proposal details
      const prop = proposals.find(p => p.id === proposalId);
      if (!prop) return;

      const receiverId = prop.receptor_id; // should be me (or vice versa in simulation)
      const senderId = prop.solicitante_id;

      // 1. Offered stickers (what receiver gets from sender)
      // For each offered sticker:
      // Receiver: quantity += 1
      // Sender: quantity -= 1 (from their duplicates, so it's decrementing the duplicates count)
      
      // 2. Requested stickers (what sender gets from receiver)
      // For each requested sticker:
      // Receiver: quantity -= 1
      // Sender: quantity += 1

      // Fetch current collection of sender from DB to make sure we modify it correctly
      const { data: senderCollData, error: senderCollErr } = await supabase
        .from("colecciones")
        .select("sticker_id, cantidad")
        .eq("perfil_id", senderId);

      if (senderCollErr) throw senderCollErr;

      const senderColl: { [stId: string]: number } = {};
      senderCollData?.forEach(item => {
        senderColl[item.sticker_id] = item.cantidad;
      });

      // Prepare batch updates
      const receiverUpdates: any[] = [];
      const senderUpdates: any[] = [];

      // Process offers (sender gives to receiver)
      prop.ofrece.forEach((stId: string) => {
        // Receiver gets it
        const curRxQty = myCollection[stId] || 0;
        receiverUpdates.push({ perfil_id: receiverId, sticker_id: stId, cantidad: curRxQty + 1 });
        
        // Sender loses one duplicate
        const curTxQty = senderColl[stId] || 0;
        senderUpdates.push({ perfil_id: senderId, sticker_id: stId, cantidad: Math.max(0, curTxQty - 1) });
      });

      // Process requests (receiver gives to sender)
      prop.solicita.forEach((stId: string) => {
        // Receiver loses one duplicate
        const curRxQty = myCollection[stId] || 0;
        receiverUpdates.push({ perfil_id: receiverId, sticker_id: stId, cantidad: Math.max(0, curRxQty - 1) });
        
        // Sender gets it
        const curTxQty = senderColl[stId] || 0;
        senderUpdates.push({ perfil_id: senderId, sticker_id: stId, cantidad: curTxQty + 1 });
      });

      // Run database upserts
      await Promise.all([
        ...receiverUpdates.map(u => supabase.from("colecciones").upsert(u)),
        ...senderUpdates.map(u => supabase.from("colecciones").upsert(u))
      ]);

      // Update proposal status in DB
      await supabase
        .from("propuestas")
        .update({ estado: "aceptado" })
        .eq("id", proposalId);

      // Trigger success celebration confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Reload
      await loadProfileAndData(myProfile.id);
      setActiveTab("dashboard");
    } catch (err) {
      console.error("Error executing trade acceptance:", err);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await supabase
        .from("propuestas")
        .update({ estado: "rechazado" })
        .eq("id", proposalId);
      if (myProfile) fetchProposals(myProfile.id);
    } catch (err) {
      console.error("Error rejecting proposal:", err);
    }
  };

  const handleCancelProposal = async (proposalId: string) => {
    try {
      await supabase
        .from("propuestas")
        .update({ estado: "cancelado" })
        .eq("id", proposalId);
      if (myProfile) fetchProposals(myProfile.id);
    } catch (err) {
      console.error("Error cancelling proposal:", err);
    }
  };

  // Logout/clear session
  const handleLogout = () => {
    localStorage.removeItem("figumatch_profile_id");
    setMyProfile(null);
    setMyCollection({});
    setCollectors([]);
    setProposals([]);
    setShowProfileModal(true);
  };

  // Generate mock users and randomize their collections
  const handleGenerateMockUsers = async () => {
    if (!myProfile) return;
    setGeneratingMock(true);
    try {
      // Define 4 mock users at different locations relative to ours
      const mockProfiles = [
        {
          id: crypto.randomUUID(),
          nombre: "Sofía (Misma Escuela)",
          provincia_id: myProfile.provincia_id,
          localidad_id: myProfile.localidad_id,
          escuela_id: myProfile.escuela_id, // Same school
          completitud: 68
        },
        {
          id: crypto.randomUUID(),
          nombre: "Martín (Misma Ciudad)",
          provincia_id: myProfile.provincia_id,
          localidad_id: myProfile.localidad_id,
          escuela_id: null, // Different school, same city
          completitud: 45
        },
        {
          id: crypto.randomUUID(),
          nombre: "Lucas (Misma Provincia)",
          provincia_id: myProfile.provincia_id,
          localidad_id: null, // Fetch a random other locality of the same province
          escuela_id: null,
          completitud: 32
        },
        {
          id: crypto.randomUUID(),
          nombre: "Victoria (Nivel Nacional)",
          provincia_id: null, // Different province
          localidad_id: null,
          escuela_id: null,
          completitud: 78
        }
      ];

      // Fix random localidades for Lucas (same province, different city)
      const { data: siblingLocs } = await supabase
        .from("localidades")
        .select("id")
        .eq("provincia_id", myProfile.provincia_id)
        .neq("id", myProfile.localidad_id)
        .limit(5);

      if (siblingLocs && siblingLocs.length > 0) {
        mockProfiles[2].localidad_id = siblingLocs[Math.floor(Math.random() * siblingLocs.length)].id;
      } else {
        mockProfiles[2].localidad_id = myProfile.localidad_id;
      }

      // Fix random province and city for Victoria
      const { data: randomProvs } = await supabase
        .from("provincias")
        .select("id")
        .neq("id", myProfile.provincia_id)
        .limit(5);

      if (randomProvs && randomProvs.length > 0) {
        const otherProvId = randomProvs[Math.floor(Math.random() * randomProvs.length)].id;
        mockProfiles[3].provincia_id = otherProvId;
        
        const { data: otherLocs } = await supabase
          .from("localidades")
          .select("id")
          .eq("provincia_id", otherProvId)
          .limit(5);
          
        if (otherLocs && otherLocs.length > 0) {
          mockProfiles[3].localidad_id = otherLocs[Math.floor(Math.random() * otherLocs.length)].id;
        }
      }

      // Upsert mock profiles
      await Promise.all(
        mockProfiles.map(p => 
          supabase.from("perfiles").upsert({
            id: p.id,
            nombre: p.nombre,
            provincia_id: p.provincia_id,
            localidad_id: p.localidad_id,
            escuela_id: p.escuela_id,
            completitud: p.completitud
          })
        )
      );

      // Generate random collections for them
      // We will add random key stickers (like ARG10, BRA7, FRA10, and others) as duplicates or owned
      const keyStickers = [
        "ARG1", "ARG4", "ARG9", "ARG10", "ARG11", 
        "BRA7", "BRA10", "BRA11",
        "FRA7", "FRA10", "FRA11",
        "POR7", "POR10",
        "ESP8", "ESP10", "ESP11",
        "ENG9", "ENG10",
        "GER10", "GER11",
        "URU8", "URU9", "URU11",
        "COL7", "COL10",
        "FWC00", "FWC1", "FWC2", "FWC5",
        "CC1", "CC10"
      ];

      const collRows: any[] = [];
      mockProfiles.forEach(p => {
        keyStickers.forEach(stId => {
          // 40% chance of having it
          if (Math.random() < 0.4) {
            // 20% chance of it being duplicate
            const qty = Math.random() < 0.2 ? 3 : 1;
            collRows.push({
              perfil_id: p.id,
              sticker_id: stId,
              cantidad: qty
            });
          }
        });
      });

      if (collRows.length > 0) {
        await supabase.from("colecciones").upsert(collRows);
      }

      await fetchCollectors(myProfile);
    } catch (err) {
      console.error("Error generating mock users:", err);
    } finally {
      setGeneratingMock(false);
    }
  };

  // Helper Stats calculation for Dashboard
  const myCollectionStats = useMemo(() => {
    let owned = 0;
    let duplicates = 0;
    Object.values(myCollection).forEach(qty => {
      if (qty >= 1) owned++;
      if (qty > 1) duplicates += (qty - 1);
    });

    return {
      owned,
      missing: TOTAL_STICKERS_COUNT - owned,
      duplicates,
      total: TOTAL_STICKERS_COUNT
    };
  }, [myCollection]);

  const pendingProposalsCount = useMemo(() => {
    if (!myProfile) return 0;
    return proposals.filter(p => p.receptor_id === myProfile.id && p.estado === "pendiente").length;
  }, [proposals, myProfile]);

  if (initializing) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 font-semibold">Cargando FiguMatch...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans pb-20 sm:pb-0">
      {/* Header */}
      <Header
        profile={myProfile}
        onEditProfile={() => setShowProfileModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Content SPA View */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && (
          <DashboardView
            profile={myProfile}
            stats={myCollectionStats}
            pendingProposalsCount={pendingProposalsCount}
            onNavigate={(view) => setActiveTab(view as any)}
            mockUsersCount={collectors.length}
            onGenerateMockUsers={handleGenerateMockUsers}
            generatingMock={generatingMock}
          />
        )}

        {activeTab === "album" && (
          <AlbumView
            myCollection={myCollection}
            onUpdateQuantity={handleUpdateQuantity}
          />
        )}

        {activeTab === "matches" && (
          <MatchView
            myProfile={myProfile}
            myCollection={myCollection}
            collectors={collectors}
            onProposeTrade={handleProposeTrade}
            loading={loadingMatches}
            onRefresh={() => fetchCollectors(myProfile)}
          />
        )}

        {activeTab === "proposals" && (
          <ProposalsView
            myProfileId={myProfile?.id || ""}
            proposals={proposals}
            onAccept={handleAcceptProposal}
            onReject={handleRejectProposal}
            onCancel={handleCancelProposal}
            loading={loadingProposals}
          />
        )}
      </main>

      {/* Bottom Sticky Navigation Bar (Responsive SPA) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/95 sm:sticky sm:top-auto sm:bottom-0 sm:border-t-0 sm:border-b sm:h-14">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
              activeTab === "dashboard"
                ? "text-emerald-500"
                : "text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300"
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab("album")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
              activeTab === "album"
                ? "text-emerald-500"
                : "text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300"
            }`}
          >
            <Trophy className="h-5 w-5" />
            <span>Mi Álbum</span>
          </button>

          <button
            onClick={() => setActiveTab("matches")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
              activeTab === "matches"
                ? "text-emerald-500"
                : "text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300"
            }`}
          >
            <Compass className="h-5 w-5" />
            <span>Coleccionistas</span>
          </button>

          <button
            onClick={() => setActiveTab("proposals")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition relative ${
              activeTab === "proposals"
                ? "text-emerald-500"
                : "text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300"
            }`}
          >
            <Send className="h-5 w-5" />
            <span>Mis Tratos</span>
            {pendingProposalsCount > 0 && (
              <span className="absolute -top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-extrabold text-white">
                {pendingProposalsCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Register/Edit Profile Modal */}
      <RegisterModal
        currentProfile={myProfile}
        isOpen={showProfileModal}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
