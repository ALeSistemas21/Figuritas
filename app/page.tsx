"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./utils/supabaseClient";
import { auth, isFirebaseConfigured } from "./utils/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getUUIDv5 } from "./utils/uuidv5";
import Header from "./components/Header";
import RegisterModal from "./components/RegisterModal";
import AuthView from "./components/AuthView";
import FirebaseSetupWarning from "./components/FirebaseSetupWarning";
import DashboardView from "./components/DashboardView";
import AlbumView from "./components/AlbumView";
import MatchView from "./components/MatchView";
import ProposalsView from "./components/ProposalsView";
import FriendsView from "./components/FriendsView";
import { TOTAL_STICKERS_COUNT } from "./utils/figuData";
import { Trophy, Compass, Send, Home, Loader2, Users } from "lucide-react";
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
  id_publico: string;
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
}

export default function Page() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [myCollection, setMyCollection] = useState<{ [stickerId: string]: number }>({});
  const [collectors, setCollectors] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friendCollection, setFriendCollection] = useState<{ id: string; name: string; items: { [stickerId: string]: number } } | null>(null);
  const [perfectMatchFilter, setPerfectMatchFilter] = useState<string | null>(null);

  // Navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "album" | "matches" | "proposals" | "friends">("dashboard");

  // Loading states
  const [initializing, setInitializing] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [generatingMock, setGeneratingMock] = useState(false);

  // Profile modal visibility
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 1. Initial Load: Listen to Firebase Authentication state changes
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setInitializing(false);
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Derive standard UUID v5 from Firebase UID
        const derivedUuid = await getUUIDv5(user.uid);
        await loadProfileAndData(derivedUuid);
      } else {
        setMyProfile(null);
        setMyCollection({});
        setCollectors([]);
        setProposals([]);
        setFriends([]);
        setFriendRequests([]);
        setInitializing(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadProfileAndData = async (profileId: string) => {
    setInitializing(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileErr } = await supabase
        .from("perfiles")
        .select(`
          id, id_publico, nombre, provincia_id, departamento_id, localidad_id, escuela_id, completitud,
          provincias(nombre),
          departamentos(nombre),
          localidades(nombre),
          escuelas(nombre)
        `)
        .eq("id", profileId)
        .single();

      if (profileErr) {
        if (profileErr.code === "PGRST116") {
          // Profile not found in DB, show registration modal
          setShowProfileModal(true);
          setInitializing(false);
          return;
        }
        throw profileErr;
      }

      // Format profile data
      const formattedProfile = {
        id: profileData.id,
        id_publico: profileData.id_publico,
        nombre: profileData.nombre,
        provincia_id: profileData.provincia_id,
        provincia: getJoinedName(profileData.provincias),
        departamento_id: profileData.departamento_id,
        departamento: getJoinedName(profileData.departamentos),
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
        fetchProposals(profileId),
        fetchFriends(profileId)
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
          id, nombre, provincia_id, departamento_id, localidad_id, escuela_id, completitud,
          provincias(nombre),
          departamentos(nombre),
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
        let proximityLevel: 1 | 2 | 3 | 4 | 5 = 5;
        let distancia = 0; // km

        if (profile.escuela_id && c.escuela_id === profile.escuela_id) {
          proximityLevel = 1;
          distancia = 0.05; // 50 meters
        } else if (c.localidad_id === profile.localidad_id) {
          proximityLevel = 2;
          distancia = Math.random() * 3 + 0.5; // 0.5 - 3.5 km
        } else if (c.departamento_id === profile.departamento_id) {
          proximityLevel = 3;
          distancia = Math.random() * 10 + 4; // 4 - 14 km (Departamento)
        } else if (c.provincia_id === profile.provincia_id) {
          proximityLevel = 4;
          distancia = Math.random() * 80 + 15; // 15 - 95 km
        } else {
          proximityLevel = 5;
          distancia = Math.random() * 1000 + 150; // 150 - 1150 km
        }

        return {
          id: c.id,
          nombre: c.nombre,
          provincia_id: c.provincia_id,
          provincia: getJoinedName(c.provincias),
          departamento_id: c.departamento_id,
          departamento: getJoinedName(c.departamentos),
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
          solicitante:perfiles!propuestas_solicitante_id_fkey(
            nombre, provincia_id, departamento_id, localidad_id, escuela_id,
            provincias(nombre), departamentos(nombre), localidades(nombre), escuelas(nombre)
          ),
          receptor:perfiles!propuestas_receptor_id_fkey(
            nombre, provincia_id, departamento_id, localidad_id, escuela_id,
            provincias(nombre), departamentos(nombre), localidades(nombre), escuelas(nombre)
          )
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
          solicitante_departamento: getJoinedName(solicitanteObj?.departamentos),
          solicitante_provincia: getJoinedName(solicitanteObj?.provincias),
          solicitante_escuela: getJoinedName(solicitanteObj?.escuelas),
          receptor_id: p.receptor_id,
          receptor_nombre: receptorObj?.nombre || "",
          receptor_ciudad: getJoinedName(receptorObj?.localidades),
          receptor_departamento: getJoinedName(receptorObj?.departamentos),
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

  const fetchFriends = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from("amistades")
        .select(`
          id, solicitante_id, receptor_id, estado,
          solicitante:perfiles!amistades_solicitante_id_fkey(id, id_publico, nombre),
          receptor:perfiles!amistades_receptor_id_fkey(id, id_publico, nombre)
        `)
        .or(`solicitante_id.eq.${profileId},receptor_id.eq.${profileId}`);

      if (error) throw error;
      
      const acc = data.filter(a => a.estado === "aceptada");
      const reqs = data.filter(a => a.estado === "pendiente");
      setFriends(acc);
      setFriendRequests(reqs);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  const handleSendFriendRequest = async (idPublico: string) => {
    if (!myProfile) return { success: false, message: "No profile" };
    if (idPublico === myProfile.id_publico) return { success: false, message: "No puedes agregarte a ti mismo" };
    try {
      const { data: targetUser, error: searchErr } = await supabase
        .from("perfiles")
        .select("id")
        .eq("id_publico", idPublico)
        .single();
      
      if (searchErr || !targetUser) return { success: false, message: "Usuario no encontrado" };
      
      const { error: insertErr } = await supabase
        .from("amistades")
        .insert({
          solicitante_id: myProfile.id,
          receptor_id: targetUser.id,
          estado: "pendiente"
        });
        
      if (insertErr) {
        if (insertErr.code === "23505") return { success: false, message: "La solicitud ya existe o ya son amigos" };
        throw insertErr;
      }
      
      await fetchFriends(myProfile.id);
      return { success: true, message: "Solicitud enviada exitosamente" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Error al enviar solicitud" };
    }
  };

  const handleAcceptFriendRequest = async (reqId: string) => {
    try {
      await supabase.from("amistades").update({ estado: "aceptada" }).eq("id", reqId);
      if (myProfile) fetchFriends(myProfile.id);
    } catch (err) {}
  };

  const handleRejectFriendRequest = async (reqId: string) => {
    try {
      await supabase.from("amistades").update({ estado: "rechazada" }).eq("id", reqId);
      if (myProfile) fetchFriends(myProfile.id);
    } catch (err) {}
  };

  const handleViewFriendCollection = async (friendId: string, friendName: string) => {
    try {
      const { data, error } = await supabase
        .from("colecciones")
        .select("sticker_id, cantidad")
        .eq("perfil_id", friendId);
        
      if (error) throw error;
      
      const collMap: { [sId: string]: number } = {};
      data?.forEach((d: any) => { collMap[d.sticker_id] = d.cantidad; });
      
      setFriendCollection({ id: friendId, name: friendName, items: collMap });
      setActiveTab("album");
    } catch (err) {
      console.error("Error viewing friend collection:", err);
    }
  };

  const handleSearchPerfectMatch = (stickerId: string) => {
    setPerfectMatchFilter(stickerId);
    setActiveTab("matches");
  };

  // Save profile info (Register or edit)
  const handleSaveProfile = async (profileData: any) => {
    if (!auth || !auth.currentUser) return;
    setSavingProfile(true);
    try {
      // Use deterministic UUID v5 from Firebase UID
      const profileId = await getUUIDv5(auth.currentUser.uid);

      const payload = {
        id: profileId,
        id_publico: profileData.id_publico,
        nombre: profileData.nombre,
        provincia_id: profileData.provincia_id,
        departamento_id: profileData.departamento_id,
        localidad_id: profileData.localidad_id,
        escuela_id: profileData.escuela_id,
        completitud: myProfile?.completitud || 0
      };

      const { error } = await supabase
        .from("perfiles")
        .upsert(payload);

      if (error) throw error;

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
      const prop = proposals.find(p => p.id === proposalId);
      if (!prop) return;

      const receiverId = prop.receptor_id; 
      const senderId = prop.solicitante_id;

      // 1. Fetch fresh collections for BOTH users from DB
      const { data: bothCollData, error: collErr } = await supabase
        .from("colecciones")
        .select("perfil_id, sticker_id, cantidad")
        .in("perfil_id", [senderId, receiverId]);

      if (collErr) throw collErr;

      const senderColl: { [stId: string]: number } = {};
      const receiverColl: { [stId: string]: number } = {};
      
      bothCollData?.forEach(item => {
        if (item.perfil_id === senderId) senderColl[item.sticker_id] = item.cantidad;
        if (item.perfil_id === receiverId) receiverColl[item.sticker_id] = item.cantidad;
      });

      // 2. Validate sender has at least 2 of what they offer
      const senderMissingDups = prop.ofrece.filter((stId: string) => (senderColl[stId] || 0) < 2);
      
      // 3. Validate receiver (me) has at least 2 of what is requested
      const receiverMissingDups = prop.solicita.filter((stId: string) => (receiverColl[stId] || 0) < 2);

      // If either party lacks the required duplicates, the trade is invalid
      if (senderMissingDups.length > 0 || receiverMissingDups.length > 0) {
        let reason = "";
        if (senderMissingDups.length > 0) reason += "El solicitante ya no tiene repetidas algunas figuritas ofrecidas. ";
        if (receiverMissingDups.length > 0) reason += "Tú ya no tienes repetidas algunas figuritas solicitadas. ";
        
        alert(`No se puede completar el trato:\n${reason}\nEl trato será cancelado automáticamente.`);
        
        // Auto-cancel the invalid proposal
        await supabase.from("propuestas").update({ estado: "cancelado" }).eq("id", proposalId);
        if (myProfile) await fetchProposals(myProfile.id);
        return;
      }

      // 4. Prepare batch updates (since it's valid)
      const receiverUpdates: any[] = [];
      const senderUpdates: any[] = [];

      prop.ofrece.forEach((stId: string) => {
        const curRxQty = receiverColl[stId] || 0;
        receiverUpdates.push({ perfil_id: receiverId, sticker_id: stId, cantidad: curRxQty + 1 });
        
        const curTxQty = senderColl[stId] || 0;
        senderUpdates.push({ perfil_id: senderId, sticker_id: stId, cantidad: curTxQty - 1 });
      });

      prop.solicita.forEach((stId: string) => {
        const curRxQty = receiverColl[stId] || 0;
        receiverUpdates.push({ perfil_id: receiverId, sticker_id: stId, cantidad: curRxQty - 1 });
        
        const curTxQty = senderColl[stId] || 0;
        senderUpdates.push({ perfil_id: senderId, sticker_id: stId, cantidad: curTxQty + 1 });
      });

      // 5. Run database upserts
      await Promise.all([
        ...receiverUpdates.map(u => supabase.from("colecciones").upsert(u)),
        ...senderUpdates.map(u => supabase.from("colecciones").upsert(u))
      ]);

      // 6. Update proposal status
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

      // Refresh data
      if (myProfile) {
        await fetchProposals(myProfile.id);
        await fetchCollectors(myProfile);
        
        // Update local collection state efficiently
        const newMyCollection = { ...myCollection };
        receiverUpdates.forEach(u => {
          newMyCollection[u.sticker_id] = u.cantidad;
        });
        setMyCollection(newMyCollection);
      }
    } catch (err) {
      console.error("Error accepting proposal:", err);
      alert("Hubo un error al aceptar el trato. Por favor, intenta nuevamente.");
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
  const handleLogout = async () => {
    try {
      await auth?.signOut();
      // State is automatically cleaned up in onAuthStateChanged
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Generate mock users and randomize their collections
  const handleGenerateMockUsers = async () => {
    if (!myProfile) return;
    setGeneratingMock(true);
    try {
      // Define 5 mock users at different locations relative to ours
      const mockProfiles = [
        {
          id: crypto.randomUUID(),
          nombre: "Sofía (Misma Escuela)",
          provincia_id: myProfile.provincia_id,
          departamento_id: myProfile.departamento_id,
          localidad_id: myProfile.localidad_id,
          escuela_id: myProfile.escuela_id, // Same school
          completitud: 68
        },
        {
          id: crypto.randomUUID(),
          nombre: "Martín (Misma Ciudad)",
          provincia_id: myProfile.provincia_id,
          departamento_id: myProfile.departamento_id,
          localidad_id: myProfile.localidad_id,
          escuela_id: null, // Different school, same city
          completitud: 45
        },
        {
          id: crypto.randomUUID(),
          nombre: "Lucas (Mismo Departamento)",
          provincia_id: myProfile.provincia_id,
          departamento_id: myProfile.departamento_id,
          localidad_id: null, // Sibling locality of the department
          escuela_id: null,
          completitud: 32
        },
        {
          id: crypto.randomUUID(),
          nombre: "Mateo (Misma Provincia)",
          provincia_id: myProfile.provincia_id,
          departamento_id: null, // Sibling department
          localidad_id: null,
          escuela_id: null,
          completitud: 53
        },
        {
          id: crypto.randomUUID(),
          nombre: "Victoria (Nivel Nacional)",
          provincia_id: null, // Different province
          departamento_id: null,
          localidad_id: null,
          escuela_id: null,
          completitud: 78
        }
      ];

      // Fix random localidades for Lucas (same department, different city)
      const { data: siblingLocs } = await supabase
        .from("localidades")
        .select("id")
        .eq("departamento_id", myProfile.departamento_id)
        .neq("id", myProfile.localidad_id)
        .limit(5);

      if (siblingLocs && siblingLocs.length > 0) {
        mockProfiles[2].localidad_id = siblingLocs[Math.floor(Math.random() * siblingLocs.length)].id;
      } else {
        mockProfiles[2].localidad_id = myProfile.localidad_id;
      }

      // Fix random department and locality for Mateo (same province, different department)
      const { data: siblingDepts } = await supabase
        .from("departamentos")
        .select("id")
        .eq("provincia_id", myProfile.provincia_id)
        .neq("id", myProfile.departamento_id)
        .limit(5);

      if (siblingDepts && siblingDepts.length > 0) {
        const siblingDeptId = siblingDepts[Math.floor(Math.random() * siblingDepts.length)].id;
        mockProfiles[3].departamento_id = siblingDeptId;
        
        const { data: siblingDeptLocs } = await supabase
          .from("localidades")
          .select("id")
          .eq("departamento_id", siblingDeptId)
          .limit(5);

        if (siblingDeptLocs && siblingDeptLocs.length > 0) {
          mockProfiles[3].localidad_id = siblingDeptLocs[Math.floor(Math.random() * siblingDeptLocs.length)].id;
        } else {
          mockProfiles[3].localidad_id = myProfile.localidad_id;
        }
      } else {
        mockProfiles[3].departamento_id = myProfile.departamento_id;
        mockProfiles[3].localidad_id = myProfile.localidad_id;
      }

      // Fix random province, department and city for Victoria
      const { data: randomProvs } = await supabase
        .from("provincias")
        .select("id")
        .neq("id", myProfile.provincia_id)
        .limit(5);

      if (randomProvs && randomProvs.length > 0) {
        const otherProvId = randomProvs[Math.floor(Math.random() * randomProvs.length)].id;
        mockProfiles[4].provincia_id = otherProvId;
        
        const { data: otherDepts } = await supabase
          .from("departamentos")
          .select("id")
          .eq("provincia_id", otherProvId)
          .limit(5);
          
        if (otherDepts && otherDepts.length > 0) {
          const otherDeptId = otherDepts[Math.floor(Math.random() * otherDepts.length)].id;
          mockProfiles[4].departamento_id = otherDeptId;
          
          const { data: otherLocs } = await supabase
            .from("localidades")
            .select("id")
            .eq("departamento_id", otherDeptId)
            .limit(5);
            
          if (otherLocs && otherLocs.length > 0) {
            mockProfiles[4].localidad_id = otherLocs[Math.floor(Math.random() * otherLocs.length)].id;
          }
        }
      }

      // Upsert mock profiles
      await Promise.all(
        mockProfiles.map(p => 
          supabase.from("perfiles").upsert({
            id: p.id,
            id_publico: Math.floor(100000 + Math.random() * 900000).toString(),
            nombre: p.nombre,
            provincia_id: p.provincia_id,
            departamento_id: p.departamento_id,
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

  if (!isFirebaseConfigured) {
    return <FirebaseSetupWarning />;
  }

  if (authLoading || (firebaseUser && initializing)) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 font-semibold">Cargando FiguMatch...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return <AuthView onAuthSuccess={() => {}} />;
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
            otherUserCollection={friendCollection?.items}
            otherUserName={friendCollection?.name}
            onCloseOtherUserView={() => setFriendCollection(null)}
            onSearchPerfectMatch={handleSearchPerfectMatch}
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
            perfectMatchStickerId={perfectMatchFilter}
            onClearPerfectMatch={() => setPerfectMatchFilter(null)}
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

        {activeTab === "friends" && (
          <FriendsView
            myProfile={myProfile}
            friends={friends}
            requests={friendRequests}
            onAccept={handleAcceptFriendRequest}
            onReject={handleRejectFriendRequest}
            onSendRequest={handleSendFriendRequest}
            onViewCollection={handleViewFriendCollection}
            loading={false}
          />
        )}
      </main>

      {/* Bottom Sticky Navigation Bar (Responsive SPA) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-[var(--color-fwc-cyan)]/30 bg-[var(--color-fwc-blue)]/95 backdrop-blur-md sm:sticky sm:top-auto sm:bottom-0 sm:border-t-0 sm:border-b-2 sm:h-14">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-wider transition ${
              activeTab === "dashboard"
                ? "text-[var(--color-fwc-yellow)] drop-shadow-md scale-110"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab("album")}
            className={`flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-wider transition ${
              activeTab === "album"
                ? "text-[var(--color-fwc-yellow)] drop-shadow-md scale-110"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Trophy className="h-5 w-5" />
            <span>Mi Álbum</span>
          </button>

          <button
            onClick={() => setActiveTab("matches")}
            className={`flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-wider transition ${
              activeTab === "matches"
                ? "text-[var(--color-fwc-yellow)] drop-shadow-md scale-110"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Compass className="h-5 w-5" />
            <span>Coleccionistas</span>
          </button>

          <button
            onClick={() => setActiveTab("proposals")}
            className={`flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-wider transition relative ${
              activeTab === "proposals"
                ? "text-[var(--color-fwc-yellow)] drop-shadow-md scale-110"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Send className="h-5 w-5" />
            <span>Mis Tratos</span>
            {pendingProposalsCount > 0 && (
              <span className="absolute -top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-fwc-red)] text-[8px] font-black text-white shadow-sm ring-2 ring-[var(--color-fwc-blue)]">
                {pendingProposalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("friends")}
            className={`flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-wider transition relative ${
              activeTab === "friends"
                ? "text-[var(--color-fwc-yellow)] drop-shadow-md scale-110"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Amigos</span>
            {friendRequests.filter(r => r.receptor_id === myProfile?.id && r.estado === 'pendiente').length > 0 && (
              <span className="absolute -top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-fwc-red)] text-[8px] font-black text-white shadow-sm ring-2 ring-[var(--color-fwc-blue)]">
                {friendRequests.filter(r => r.receptor_id === myProfile?.id && r.estado === 'pendiente').length}
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
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}
