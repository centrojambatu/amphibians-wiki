-- ============================================================================
-- MIGRACIÓN: Cambiar INTEGER a BIGINT para soportar IDs grandes de FileMaker
-- ============================================================================

-- Primero eliminar todas las tablas y recrearlas con BIGINT
-- (más simple que ALTER TABLE por las dependencias de FK)

DROP TABLE IF EXISTS prestamotejido CASCADE;
DROP TABLE IF EXISTS prestamocoleccion CASCADE;
DROP TABLE IF EXISTS prestamo CASCADE;
DROP TABLE IF EXISTS coleccionpersonal CASCADE;
DROP TABLE IF EXISTS identificacion CASCADE;
DROP TABLE IF EXISTS canto CASCADE;
DROP TABLE IF EXISTS tejido CASCADE;
DROP TABLE IF EXISTS coleccion CASCADE;
DROP TABLE IF EXISTS campobasepersonal CASCADE;
DROP TABLE IF EXISTS cuerpoagua CASCADE;
DROP TABLE IF EXISTS diariocampobase CASCADE;
DROP TABLE IF EXISTS campobase CASCADE;
DROP TABLE IF EXISTS salida CASCADE;
DROP TABLE IF EXISTS permisocontrato CASCADE;
DROP TABLE IF EXISTS personal CASCADE;

-- Recrear tablas con BIGINT

-- Personal
CREATE TABLE personal (
  id_personal BIGINT PRIMARY KEY,
  identificacion TEXT,
  nombre TEXT NOT NULL,
  siglas TEXT,
  cargo TEXT,
  institucion TEXT,
  telefono TEXT,
  email TEXT,
  paginaweb TEXT,
  especialista BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permisos y Contratos
CREATE TABLE permisocontrato (
  id_permisocontrato BIGINT PRIMARY KEY,
  npicmpf TEXT,
  tipo_autorizacion TEXT,
  fecha_ini DATE,
  fecha_fin DATE,
  estado TEXT,
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salidas
CREATE TABLE salida (
  id_salida BIGINT PRIMARY KEY,
  nombre TEXT NOT NULL,
  detalle TEXT,
  fecha_ini DATE,
  fecha_fin DATE,
  inversion NUMERIC(12,2),
  numero_dias INTEGER,
  inversion_por_dia NUMERIC(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campo Base
CREATE TABLE campobase (
  id_campobase BIGINT PRIMARY KEY,
  salida_id BIGINT REFERENCES salida(id_salida) ON DELETE SET NULL,
  nombre TEXT,
  provincia TEXT,
  localidad TEXT,
  latitud NUMERIC(10,7),
  longitud NUMERIC(10,7),
  datum TEXT DEFAULT 'WGS84',
  altitud NUMERIC(6,1),
  miembros TEXT,
  asistentes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diario Campo Base
CREATE TABLE diariocampobase (
  id_diariocampobase BIGINT PRIMARY KEY,
  campobase_id BIGINT REFERENCES campobase(id_campobase) ON DELETE CASCADE,
  fecha DATE,
  hora_inicio TIME,
  hora_fin TIME,
  temperatura NUMERIC(5,2),
  estado_tiempo TEXT,
  numero_colectores INTEGER,
  descripcion_area TEXT,
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cuerpo Agua
CREATE TABLE cuerpoagua (
  id_cuerpoagua BIGINT PRIMARY KEY,
  campobase_id BIGINT REFERENCES campobase(id_campobase) ON DELETE SET NULL,
  nombre TEXT,
  tipo TEXT,
  temperatura_ambiente NUMERIC(5,2),
  oxigeno_disuelto NUMERIC(8,4),
  mv_ph NUMERIC(8,4),
  ph NUMERIC(4,2),
  mvorp NUMERIC(8,4),
  ustm NUMERIC(10,4),
  ustma NUMERIC(10,4),
  mocm NUMERIC(10,4),
  ppmtd NUMERIC(10,4),
  psu NUMERIC(10,4),
  ot NUMERIC(10,4),
  fnu NUMERIC(10,4),
  temp NUMERIC(5,2),
  psi NUMERIC(10,4),
  lat NUMERIC(10,7),
  lon NUMERIC(10,7),
  datum TEXT DEFAULT 'WGS84',
  equipo TEXT,
  cod_lote_datos TEXT,
  nota TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campo Base Personal
CREATE TABLE campobasepersonal (
  id_campobasepersonal BIGINT PRIMARY KEY,
  campobase_id BIGINT NOT NULL REFERENCES campobase(id_campobase) ON DELETE CASCADE,
  personal_id BIGINT NOT NULL REFERENCES personal(id_personal) ON DELETE CASCADE,
  lider BOOLEAN DEFAULT FALSE,
  asistente BOOLEAN DEFAULT FALSE,
  fecha TIMESTAMP WITH TIME ZONE,
  foto_url TEXT,
  foto_ref TEXT,
  foto_extfile TEXT,
  foto_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colección (tabla central)
CREATE TABLE coleccion (
  id_coleccion BIGINT PRIMARY KEY,
  campobase_id BIGINT REFERENCES campobase(id_campobase) ON DELETE SET NULL,
  personal_id BIGINT REFERENCES personal(id_personal) ON DELETE SET NULL,
  infocuerpoagua_id BIGINT REFERENCES cuerpoagua(id_cuerpoagua) ON DELETE SET NULL,
  permisocontrato_id BIGINT REFERENCES permisocontrato(id_permisocontrato) ON DELETE SET NULL,
  taxon_id INTEGER REFERENCES taxon(id_taxon) ON DELETE SET NULL,
  num_colector TEXT,
  sc TEXT,
  gui TEXT,
  num_museo TEXT,
  sc_acronimo TEXT,
  sc_numero INTEGER,
  sc_sufijo TEXT,
  estatus_identificacion TEXT,
  taxon_nombre TEXT,
  identificacion_posible TEXT,
  identificacion_sp TEXT,
  identificacion_cuestionable TEXT,
  identificado_por TEXT,
  fecha_identifica DATE,
  estadio TEXT,
  numero_individuos INTEGER DEFAULT 1,
  sexo TEXT,
  estado TEXT,
  svl NUMERIC(6,2),
  peso NUMERIC(8,3),
  estatus_tipo TEXT,
  fecha_col DATE,
  hora TIME,
  hora_aprox TIME,
  colectores TEXT,
  metodo_fijacion TEXT,
  fecha_fijacion DATE,
  metodo_preservacion TEXT,
  tejido_count INTEGER DEFAULT 0,
  extrato_piel_count INTEGER DEFAULT 0,
  provincia TEXT,
  detalle_localidad TEXT,
  latitud NUMERIC(10,7),
  longitud NUMERIC(10,7),
  sistema_coordenadas TEXT,
  altitud NUMERIC(6,1),
  fuente_coord TEXT,
  habitat TEXT,
  temperatura NUMERIC(5,2),
  humedad NUMERIC(5,2),
  ph NUMERIC(4,2),
  nombre_comun TEXT,
  idioma_nc TEXT,
  fuente_nombrecomun TEXT,
  foto_insitu BOOLEAN DEFAULT FALSE,
  autor_foto_is TEXT,
  foto_exsitu BOOLEAN DEFAULT FALSE,
  autor_foto_es TEXT,
  nota_foto TEXT,
  observacion TEXT,
  gbif BOOLEAN DEFAULT FALSE,
  coordenadas TEXT,
  numero_cuadernocampo TEXT,
  responsable_ingreso TEXT,
  rango TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tejido
CREATE TABLE tejido (
  id_tejido BIGINT PRIMARY KEY,
  coleccion_id BIGINT NOT NULL REFERENCES coleccion(id_coleccion) ON DELETE CASCADE,
  permisocontrato_id BIGINT REFERENCES permisocontrato(id_permisocontrato) ON DELETE SET NULL,
  codtejido TEXT,
  tipotejido TEXT,
  preservacion TEXT,
  fecha DATE,
  ubicacion TEXT,
  piso TEXT,
  rack TEXT,
  caja TEXT,
  coordenada TEXT,
  estatus TEXT DEFAULT 'Disponible',
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Canto
CREATE TABLE canto (
  id_canto BIGINT PRIMARY KEY,
  coleccion_id BIGINT NOT NULL REFERENCES coleccion(id_coleccion) ON DELETE CASCADE,
  gui_aud TEXT,
  temp NUMERIC(5,2),
  humedad NUMERIC(5,2),
  nubosidad NUMERIC(5,2),
  distancia_micro NUMERIC(6,2),
  autor TEXT,
  hora TIME,
  fecha DATE,
  equipo TEXT,
  lugar TEXT,
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Identificación
CREATE TABLE identificacion (
  id_identificacion BIGINT PRIMARY KEY,
  coleccion_id BIGINT NOT NULL REFERENCES coleccion(id_coleccion) ON DELETE CASCADE,
  taxon_nombre TEXT,
  responsable TEXT,
  fecha DATE,
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colección Personal
CREATE TABLE coleccionpersonal (
  id_coleccionpersonal BIGINT PRIMARY KEY,
  coleccion_id BIGINT NOT NULL REFERENCES coleccion(id_coleccion) ON DELETE CASCADE,
  personal_id BIGINT NOT NULL REFERENCES personal(id_personal) ON DELETE CASCADE,
  principal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Préstamo
CREATE TABLE prestamo (
  id_prestamo BIGINT PRIMARY KEY,
  personal_id BIGINT REFERENCES personal(id_personal) ON DELETE SET NULL,
  numero_prestamo TEXT,
  beneficiario TEXT,
  cargo TEXT,
  institucion TEXT,
  telefono TEXT,
  email TEXT,
  web TEXT,
  fecha_prestamo DATE,
  fecha_devolucion DATE,
  estado TEXT DEFAULT 'Activo',
  material TEXT,
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Préstamo Colección
CREATE TABLE prestamocoleccion (
  id_prestamocoleccion BIGINT PRIMARY KEY,
  prestamo_id BIGINT NOT NULL REFERENCES prestamo(id_prestamo) ON DELETE CASCADE,
  coleccion_id BIGINT NOT NULL REFERENCES coleccion(id_coleccion) ON DELETE CASCADE,
  permisocontrato_id BIGINT REFERENCES permisocontrato(id_permisocontrato) ON DELETE SET NULL,
  estado BOOLEAN DEFAULT TRUE,
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Préstamo Tejido
CREATE TABLE prestamotejido (
  id_prestamotejido BIGINT PRIMARY KEY,
  prestamo_id BIGINT NOT NULL REFERENCES prestamo(id_prestamo) ON DELETE CASCADE,
  tejido_id BIGINT NOT NULL REFERENCES tejido(id_tejido) ON DELETE CASCADE,
  permisocontrato_id BIGINT REFERENCES permisocontrato(id_permisocontrato) ON DELETE SET NULL,
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_coleccion_taxon_id ON coleccion(taxon_id);
CREATE INDEX idx_coleccion_campobase_id ON coleccion(campobase_id);
CREATE INDEX idx_coleccion_personal_id ON coleccion(personal_id);
CREATE INDEX idx_coleccion_fecha_col ON coleccion(fecha_col);
CREATE INDEX idx_tejido_coleccion_id ON tejido(coleccion_id);
CREATE INDEX idx_campobase_salida_id ON campobase(salida_id);

-- RLS
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisocontrato ENABLE ROW LEVEL SECURITY;
ALTER TABLE salida ENABLE ROW LEVEL SECURITY;
ALTER TABLE campobase ENABLE ROW LEVEL SECURITY;
ALTER TABLE diariocampobase ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuerpoagua ENABLE ROW LEVEL SECURITY;
ALTER TABLE campobasepersonal ENABLE ROW LEVEL SECURITY;
ALTER TABLE coleccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE tejido ENABLE ROW LEVEL SECURITY;
ALTER TABLE canto ENABLE ROW LEVEL SECURITY;
ALTER TABLE identificacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE coleccionpersonal ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamo ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamocoleccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamotejido ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Allow public read" ON personal FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON permisocontrato FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON salida FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON campobase FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON diariocampobase FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON cuerpoagua FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON campobasepersonal FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON coleccion FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON tejido FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON canto FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON identificacion FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON coleccionpersonal FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON prestamo FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON prestamocoleccion FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON prestamotejido FOR SELECT USING (true);


