---
name: figumatch-architecture
description: "Use when modifying or debugging the FiguMatch 2026 codebase. Triggers: figumatch, figumatch-architecture, album, match, matchmaking, trade, public_id, schools, locations, trade transactions."
metadata:
  author: Antigravity
  version: "1.0.0"
---

# FiguMatch 2026 - Architecture & Coding Standards

This skill documents the architecture, data layer, UI/UX conventions, and critical business logic for the **FiguMatch 2026** web application. Refer to this guide to maintain architectural consistency, styling patterns, and robust transactional flow.

---

## 1. Architectural Overview

FiguMatch 2026 is designed as a **Monolithic Single Page Application (SPA)** built with Next.js (App Router) and Tailwind CSS.

### Orchestration in `app/page.tsx`
* **Central State Container**: [page.tsx](file:///home/alejandro/Documentos/Diplomatura%20FullStack/Post%20Diplomatura/Desarrollo%20con%20IA/Intercambiar%20figuritas/my-app/app/page.tsx) is the orchestrator. It manages user authentication, profile creation, and active view states.
* **Component Communication**: Sub-components are stateless/controlled whenever possible, receiving state and callback handlers via props. Avoid introducing independent state sync loops in sub-components to prevent UI desynchronization.
* **Sub-components structure**:
  * [Header.tsx](file:///home/alejandro/Documentos/Diplomatura%20FullStack/Post%20Diplomatura/Desarrollo%20con%20IA/Intercambiar%20figuritas/my-app/app/components/Header.tsx): Renders global stats, user info, and the Edit Profile button.
  * [RegisterModal.tsx](file:///home/alejandro/Documentos/Diplomatura%20FullStack/Post%20Diplomatura/Desarrollo%20con%20IA/Intercambiar%20figuritas/my-app/app/components/RegisterModal.tsx): Handles profile creation and editing, featuring dynamic inputs for Provinces, Localities, and Schools. Includes a "Cancel" button for editing.
  * [DashboardView.tsx](file:///home/alejandro/Documentos/Diplomatura%20FullStack/Post%20Diplomatura/Desarrollo%20con%20IA/Intercambiar%20figuritas/my-app/app/components/DashboardView.tsx): Aggregates user progress, completion rates, and key metrics.
  * [AlbumView.tsx](file:///home/alejandro/Documentos/Diplomatura%20FullStack/Post%20Diplomatura/Desarrollo%20con%20IA/Intercambiar%20figuritas/my-app/app/components/AlbumView.tsx): Displays the interactive grid of 994 World Cup stickers divided by sections, handles filters, and manages quantity updates.
  * [MatchView.tsx](file:///home/alejandro/Documentos/Diplomatura%20FullStack/Post%20Diplomatura/Desarrollo%20con%20IA/Intercambiar%20figuritas/my-app/app/components/MatchView.tsx): Contains the matchmaking interface, proximity-based list of collectors, album comparisons, and the "Perfect Match" (double coincidence) generator.
  * [ProposalsView.tsx](file:///home/alejandro/Documentos/Diplomatura%20FullStack/Post%20Diplomatura/Desarrollo%20con%20IA/Intercambiar%20figuritas/my-app/app/components/ProposalsView.tsx): Manages trading desks, offers/requests configurations, and incoming/outgoing trade flows.
  * [FriendsView.tsx](file:///home/alejandro/Documentos/Diplomatura%20FullStack/Post%20Diplomatura/Desarrollo%20con%20IA/Intercambiar%20figuritas/my-app/app/components/FriendsView.tsx): Renders public ID searching, friendship requests, list of friends, and triggers detailed read-only views of friends' collections.

---

## 2. Design System & UI/UX Standards

The application adheres to a premium dark-themed, glassmorphic design system using Tailwind CSS. Maintain these visual conventions:

### Color Palette
* **Backgrounds & Containers**: Deep dark tones. Use `bg-zinc-950` with glassmorphic cards configured with border lines (`border-zinc-800/80` or `border-zinc-800`) and slight translucency (`bg-zinc-900/50 backdrop-blur-md`).
* **Primary / Success Actions**: Emerald and Teal gradients (e.g., `from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700`).
* **Social / Friends Module**: Indigo accents (e.g., `from-indigo-600 to-purple-600`).
* **Pending / Caution Actions**: Amber indicators for pending trades or alerts.
* **Destructive Actions / Errors**: Rose/Red highlights (e.g., `from-rose-600 to-red-700` or text `text-rose-400`).

### Typography & Layout
* Fonts: Inter or Outfit (sans-serif modern defaults).
* Icons: Consistent use of `lucide-react` icons.
* Layout: Mobile-first responsive wrapper with a centered max-width boundary (`max-w-md md:max-w-2xl lg:max-w-6xl mx-auto`).

---

## 3. Data Flow & Supabase Conventions

### Geographic & Institutional Dependencies
Registration and profile editing flow requires strict cascading queries:
1. **Provincias**: Loaded on initial modal paint.
2. **Localidades**: Filtered reactively based on selected `provincia_id`.
3. **Escuelas**: Input triggers a search with autocompletado in real-time but is restricted to the chosen `localidad_id` and requires at least 2 characters.
   * If "No asisto a ninguna escuela" is checked, set `escuela_id = null`.

### ID Público (Public ID)
* Profiles are mapped via `id_publico`, which must be unique and is automatically generated by the system as a random 6-digit number.
* It is displayed with a `#` prefix (e.g. `#123456`) and the input field is disabled during registration/editing.
* When adding a friend, lookups must verify that the target `id_publico` exists, is active, and is not the current user's own `id_publico`.

---

## 4. Key Business Logic

### Proximity Algorithm
Proximity for suggesting matches is logical, calculated using database relationships and mapped to simulated distances:
1. **Misma Escuela**: Distance ~50 meters.
2. **Misma Localidad**: Distance ~3.5 km.
3. **Mismo Departamento**: Distance ~14 km.
4. **Misma Provincia**: Distance ~95 km.
5. **Nivel Nacional**: Distance ~150+ km.

### Perfect Match (Double Coincidences)
A Perfect Match is triggered from a missing sticker in the user's album:
* Looks for another user who:
  1. Has the requested sticker as a duplicate (quantity >= 2).
  2. Is missing at least one sticker that the current user has as a duplicate (quantity >= 2).
* Sorts results using the proximity order described above.

### Trade Transaction Safety
Trades must handle concurrent updates or out-of-stock scenarios gracefully:
* Before accepting a trade, the client/server must confirm that **both** users still possess the items involved in the trade:
  * The sender must have the offered stickers in quantity >= 2.
  * The recipient must have the requested stickers in quantity >= 2.
* If validation fails (e.g., a card was traded in another proposal), block the transaction, display an error message, and mark/update the proposal status accordingly.
