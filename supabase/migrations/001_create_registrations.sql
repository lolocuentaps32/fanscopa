-- FANS Copa - Registrations Table Migration
-- Run this SQL in Supabase SQL Editor or via psql

-- Create table for registrations
CREATE TABLE IF NOT EXISTS public.registrations (
  id SERIAL PRIMARY KEY,
  orden_registro INTEGER UNIQUE NOT NULL,
  fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_registro TIME NOT NULL DEFAULT CURRENT_TIME,
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL DEFAULT '',
  abonado BOOLEAN DEFAULT FALSE,
  prioritario BOOLEAN DEFAULT FALSE,
  vip BOOLEAN DEFAULT FALSE,
  solicitud TEXT NOT NULL,
  email TEXT,
  cp TEXT,
  dni TEXT UNIQUE NOT NULL,
  direccion TEXT,
  fecha_nac DATE,
  localidad TEXT,
  telefono TEXT,
  observaciones TEXT,
  aceptacion_com BOOLEAN DEFAULT FALSE,
  aceptacion_term BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Procesando', 'Aceptado', 'Rechazado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for demo/simple auth)
CREATE POLICY "Allow public read" ON public.registrations
  FOR SELECT USING (true);

-- Policy: Allow public insert
CREATE POLICY "Allow public insert" ON public.registrations
  FOR INSERT WITH CHECK (true);

-- Policy: Allow public update
CREATE POLICY "Allow public update" ON public.registrations
  FOR UPDATE USING (true);

-- Policy: Allow public delete
CREATE POLICY "Allow public delete" ON public.registrations
  FOR DELETE USING (true);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS registrations_updated_at ON public.registrations;
CREATE TRIGGER registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.registrations (orden_registro, fecha_registro, hora_registro, nombre, apellidos, abonado, prioritario, vip, solicitud, email, cp, dni, direccion, fecha_nac, localidad, telefono, observaciones, aceptacion_com, aceptacion_term, status)
VALUES 
  (360, '2026-02-04', '18:19:07', 'Marco', 'Urbano Castilla', true, true, false, 'Abono Copa', 'manuel.urba@gmail.com', '13300', '45738884A', 'Francisco Morales Nieva 2', '2022-06-03', 'Valdepeñas', '648251815', '', true, true, 'Aceptado'),
  (589, '2026-02-05', '19:40:22', 'Marco', 'Navarro Rubio', false, false, false, 'Entrada Cuartos de Final', 'marco.navarro@gmail.com', '13300', '71371668T', 'Salida Membrilla', '2007-11-29', 'Valdepeñas', '640664250', '', true, true, 'Pendiente')
ON CONFLICT (dni) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_registrations_dni ON public.registrations(dni);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
