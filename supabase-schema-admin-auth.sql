-- Agregar columna password_hash a perfiles (solo admins la tendrán)
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Si andguja@gmail.com ya existe, hacerlo admin (sin password aún — se pone desde la app)
UPDATE public.perfiles SET rol = 'admin' WHERE correo = 'andguja@gmail.com';

-- Si no existe, insertar el perfil admin
INSERT INTO public.perfiles (nombre_completo, empresa, correo, celular, placa, tipo_conector, marca_vehiculo, acepto_reglamento, rol)
SELECT 'Andres Agudelo', 'Celsia', 'andguja@gmail.com', '0000000000', 'ADMIN0', 'TIPO 1', 'N/A', true, 'admin'
WHERE NOT EXISTS (SELECT 1 FROM public.perfiles WHERE correo = 'andguja@gmail.com');
