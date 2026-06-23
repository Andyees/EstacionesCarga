-- ============================================================
-- SCHEMA COMPLETO - Estaciones de Carga Eléctrica Celsia
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE public.perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  empresa TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  celular TEXT NOT NULL,
  placa TEXT NOT NULL,
  tipo_conector TEXT NOT NULL CHECK (tipo_conector IN ('TIPO 1', 'TIPO 2', 'GBT')),
  marca_vehiculo TEXT NOT NULL,
  acepto_reglamento BOOLEAN NOT NULL DEFAULT FALSE,
  rol TEXT NOT NULL DEFAULT 'user' CHECK (rol IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de estaciones de carga
CREATE TABLE public.estaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo_conector TEXT NOT NULL CHECK (tipo_conector IN ('TIPO 1', 'TIPO 2', 'GBT')),
  ubicacion TEXT NOT NULL DEFAULT 'Celsia HQ',
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de sesiones de carga
CREATE TABLE public.sesiones_carga (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  placa TEXT NOT NULL,
  estacion_id UUID REFERENCES public.estaciones(id) ON DELETE SET NULL,
  tipo_conector TEXT NOT NULL CHECK (tipo_conector IN ('TIPO 1', 'TIPO 2', 'GBT')),
  hora_inicio TIMESTAMPTZ NOT NULL,
  hora_fin TIMESTAMPTZ,
  confirmacion_inicio BOOLEAN NOT NULL DEFAULT FALSE,
  confirmacion_fin BOOLEAN NOT NULL DEFAULT FALSE,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'finalizada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_carga ENABLE ROW LEVEL SECURITY;

-- Perfiles: cada usuario ve y edita solo el suyo; admin ve todos
CREATE POLICY "usuarios ven su perfil" ON public.perfiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios actualizan su perfil" ON public.perfiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "usuarios insertan su perfil" ON public.perfiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "admin ve todos los perfiles" ON public.perfiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Estaciones: todos los autenticados pueden ver
CREATE POLICY "usuarios ven estaciones" ON public.estaciones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "admin gestiona estaciones" ON public.estaciones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Sesiones: usuarios ven las suyas; admin ve todas
CREATE POLICY "usuarios ven sus sesiones" ON public.sesiones_carga
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "usuarios crean sesiones" ON public.sesiones_carga
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios actualizan sus sesiones" ON public.sesiones_carga
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "admin ve todas las sesiones" ON public.sesiones_carga
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- ============================================================
-- Datos iniciales - Estaciones de ejemplo
-- ============================================================

INSERT INTO public.estaciones (nombre, tipo_conector, ubicacion) VALUES
  ('Estación 1 - Tipo 1', 'TIPO 1', 'Parqueadero Piso 1'),
  ('Estación 2 - Tipo 1', 'TIPO 1', 'Parqueadero Piso 1'),
  ('Estación 3 - Tipo 2', 'TIPO 2', 'Parqueadero Piso 2'),
  ('Estación 4 - Tipo 2', 'TIPO 2', 'Parqueadero Piso 2'),
  ('Estación 5 - GBT', 'GBT', 'Parqueadero Externo');

-- ============================================================
-- Función para crear perfil automáticamente al registrarse
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- El perfil se crea desde la app con los datos del formulario
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
