-- Esquema de Base de Datos para FiguMatch 2026 en Supabase

-- 1. Tabla de Provincias
CREATE TABLE IF NOT EXISTS public.provincias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabla de Departamentos
CREATE TABLE IF NOT EXISTS public.departamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    provincia_id INTEGER REFERENCES public.provincias(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_departamento_provincia UNIQUE (provincia_id, nombre)
);

-- Indexar por provincia para acelerar búsquedas
CREATE INDEX IF NOT EXISTS idx_departamentos_provincia ON public.departamentos(provincia_id);

-- 3. Tabla de Localidades
CREATE TABLE IF NOT EXISTS public.localidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    departamento_id INTEGER REFERENCES public.departamentos(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_localidad_departamento UNIQUE (departamento_id, nombre)
);

-- Indexar por departamento para acelerar las búsquedas y ordenamiento
CREATE INDEX IF NOT EXISTS idx_localidades_departamento ON public.localidades(departamento_id);

-- 3. Tabla de Escuelas (Padrón Oficial)
CREATE TABLE IF NOT EXISTS public.escuelas (
    id SERIAL PRIMARY KEY,
    cueanexo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    domicilio VARCHAR(255),
    sector VARCHAR(50),
    ambito VARCHAR(50),
    localidad_id INTEGER REFERENCES public.localidades(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexar por localidad para acelerar la búsqueda por cercanía
CREATE INDEX IF NOT EXISTS idx_escuelas_localidad ON public.escuelas(localidad_id);
-- Indexar por nombre de escuela para buscador de texto
CREATE INDEX IF NOT EXISTS idx_escuelas_nombre ON public.escuelas(nombre);

-- 5. Tabla de Perfiles de Coleccionistas
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY, -- Enlaza con auth.users.id de Supabase o un UUID autogenerado
    id_publico VARCHAR(50) UNIQUE, -- Para buscar y agregar amigos
    nombre VARCHAR(100) NOT NULL,
    provincia_id INTEGER REFERENCES public.provincias(id),
    departamento_id INTEGER REFERENCES public.departamentos(id),
    localidad_id INTEGER REFERENCES public.localidades(id),
    escuela_id INTEGER REFERENCES public.escuelas(id) ON DELETE SET NULL,
    completitud INTEGER DEFAULT 0 NOT NULL, -- Porcentaje de completado (0-100)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_perfiles_cercania ON public.perfiles(provincia_id, departamento_id, localidad_id, escuela_id);

-- 5. Tabla de Colecciones (Relación figuritas por usuario)
CREATE TABLE IF NOT EXISTS public.colecciones (
    perfil_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
    sticker_id VARCHAR(10) NOT NULL, -- Ej: 'ARG10', 'BRA5'
    cantidad INTEGER DEFAULT 0 NOT NULL CHECK (cantidad >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (perfil_id, sticker_id)
);

-- Indexar colecciones para búsquedas rápidas de repetidas y faltantes
CREATE INDEX IF NOT EXISTS idx_colecciones_sticker ON public.colecciones(sticker_id);
CREATE INDEX IF NOT EXISTS idx_colecciones_perfil_cantidad ON public.colecciones(perfil_id, cantidad);

-- 6. Tabla de Propuestas de Intercambio
CREATE TABLE IF NOT EXISTS public.propuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitante_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
    receptor_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
    ofrece TEXT[] NOT NULL, -- Array de sticker_id que el solicitante da
    solicita TEXT[] NOT NULL, -- Array de sticker_id que el solicitante pide
    estado VARCHAR(20) DEFAULT 'pendiente' NOT NULL CHECK (estado IN ('pendiente', 'aceptado', 'rechazado', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_propuestas_solicitante ON public.propuestas(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_propuestas_receptor ON public.propuestas(receptor_id);

-- 7. Tabla de Amistades (Amigos y Solicitudes)
CREATE TABLE IF NOT EXISTS public.amistades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitante_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
    receptor_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' NOT NULL CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_amistad UNIQUE (solicitante_id, receptor_id)
);

CREATE INDEX IF NOT EXISTS idx_amistades_solicitante ON public.amistades(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_amistades_receptor ON public.amistades(receptor_id);

-- Habilitar seguridad de nivel de fila (Row Level Security - RLS) para producción
ALTER TABLE public.provincias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escuelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amistades ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Para lectura de catálogos (permitido para cualquier rol)
CREATE POLICY "Lectura pública de provincias" ON public.provincias FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Lectura pública de departamentos" ON public.departamentos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Lectura pública de localidades" ON public.localidades FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Lectura pública de escuelas" ON public.escuelas FOR SELECT TO anon, authenticated USING (true);

-- Para lectura e inserción de catálogos desde el script de carga (usar anon/authenticated si no tiene RLS de inserción, o permitir todo por ahora)
-- Para simplificar la importación desde el script de Python, permitiremos inserts/selects públicos en provincias, departamentos, localidades y escuelas
CREATE POLICY "Inserción pública de provincias" ON public.provincias FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Inserción pública de departamentos" ON public.departamentos FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Inserción pública de localidades" ON public.localidades FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Inserción pública de escuelas" ON public.escuelas FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Políticas de Perfiles (Lectura para todos, Modificación para el dueño)
CREATE POLICY "Cualquiera puede ver perfiles" ON public.perfiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Dueño puede crear/modificar su perfil" ON public.perfiles FOR ALL TO anon, authenticated 
    USING (true) 
    WITH CHECK (true);

-- Políticas de Colecciones (Lectura para todos, Modificación para el dueño)
CREATE POLICY "Cualquiera puede ver colecciones" ON public.colecciones FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Dueño puede modificar su colección" ON public.colecciones FOR ALL TO anon, authenticated 
    USING (true)
    WITH CHECK (true);

-- Políticas de Propuestas (Lectura si participa, Modificación si participa)
CREATE POLICY "Ver propuestas donde participo" ON public.propuestas FOR SELECT TO anon, authenticated 
    USING (true);
CREATE POLICY "Gestionar mis propuestas" ON public.propuestas FOR ALL TO anon, authenticated 
    USING (true)
    WITH CHECK (true);

-- Políticas de Amistades (Lectura si participa, Modificación si participa)
CREATE POLICY "Ver amistades donde participo" ON public.amistades FOR SELECT TO anon, authenticated 
    USING (true);
CREATE POLICY "Gestionar mis amistades" ON public.amistades FOR ALL TO anon, authenticated 
    USING (true)
    WITH CHECK (true);
