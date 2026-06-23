-- Columna para rastrear si ya se envió el aviso de 30 min
ALTER TABLE public.sesiones_carga ADD COLUMN IF NOT EXISTS aviso_enviado BOOLEAN NOT NULL DEFAULT FALSE;

-- Índice para que el cron sea rápido
CREATE INDEX IF NOT EXISTS idx_sesiones_activas_aviso
  ON public.sesiones_carga (estado, aviso_enviado, hora_inicio)
  WHERE estado = 'activa' AND aviso_enviado = FALSE;
