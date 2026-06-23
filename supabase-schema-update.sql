-- ============================================================
-- ACTUALIZACIÓN: quitar dependencia de Supabase Auth
-- Ejecutar en SQL Editor de Supabase si ya corriste el schema inicial
-- ============================================================

-- 1. Quitar la foreign key de perfiles -> auth.users
ALTER TABLE public.perfiles DROP CONSTRAINT IF EXISTS perfiles_id_fkey;

-- 2. Cambiar el id de perfiles para que se genere solo (sin auth.users)
ALTER TABLE public.perfiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Deshabilitar RLS en todas las tablas (app interna Celsia)
ALTER TABLE public.perfiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_carga DISABLE ROW LEVEL SECURITY;

-- 4. Eliminar todas las políticas RLS existentes
DROP POLICY IF EXISTS "usuarios ven su perfil" ON public.perfiles;
DROP POLICY IF EXISTS "usuarios actualizan su perfil" ON public.perfiles;
DROP POLICY IF EXISTS "usuarios insertan su perfil" ON public.perfiles;
DROP POLICY IF EXISTS "admin ve todos los perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "usuarios ven estaciones" ON public.estaciones;
DROP POLICY IF EXISTS "admin gestiona estaciones" ON public.estaciones;
DROP POLICY IF EXISTS "usuarios ven sus sesiones" ON public.sesiones_carga;
DROP POLICY IF EXISTS "usuarios crean sesiones" ON public.sesiones_carga;
DROP POLICY IF EXISTS "usuarios actualizan sus sesiones" ON public.sesiones_carga;
DROP POLICY IF EXISTS "admin ve todas las sesiones" ON public.sesiones_carga;

-- 5. Dar acceso anon a todas las tablas
GRANT ALL ON public.perfiles TO anon;
GRANT ALL ON public.estaciones TO anon;
GRANT ALL ON public.sesiones_carga TO anon;
