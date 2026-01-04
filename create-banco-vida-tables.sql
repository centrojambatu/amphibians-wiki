-- ============================================================================
-- SCRIPT: Crear tablas de Banco de Vida
-- Descripción: Sistema de gestión de colecciones biológicas
-- Conexión: coleccion.taxon_id → taxon.id_taxon (tabla existente)
-- Fecha: 2024-12-22
-- ============================================================================

-- ============================================================================
-- PARTE 0: ELIMINAR TABLAS EXISTENTES (en orden inverso de dependencias)
-- ============================================================================

-- Tablas de préstamo (dependen de otras)
DROP TABLE IF EXISTS prestamotejido CASCADE;
DROP TABLE IF EXISTS prestamocoleccion CASCADE;
DROP TABLE IF EXISTS prestamo CASCADE;

-- Tablas dependientes de coleccion
DROP TABLE IF EXISTS coleccionpersonal CASCADE;
DROP TABLE IF EXISTS identificacion CASCADE;
DROP TABLE IF EXISTS canto CASCADE;
DROP TABLE IF EXISTS tejido CASCADE;

-- Tabla central
DROP TABLE IF EXISTS coleccion CASCADE;

-- Tablas de campo base
DROP TABLE IF EXISTS campobasepersonal CASCADE;
DROP TABLE IF EXISTS cuerpoagua CASCADE;
DROP TABLE IF EXISTS diariocampobase CASCADE;
DROP TABLE IF EXISTS campobase CASCADE;

-- Tablas independientes
DROP TABLE IF EXISTS salida CASCADE;
DROP TABLE IF EXISTS permisocontrato CASCADE;
DROP TABLE IF EXISTS personal CASCADE;

-- Catálogos
DROP TABLE IF EXISTS cattipoecosistema CASCADE;
DROP TABLE IF EXISTS cattejido CASCADE;
DROP TABLE IF EXISTS catprovincia CASCADE;
DROP TABLE IF EXISTS catpreservacionconservacion CASCADE;
DROP TABLE IF EXISTS catprestamo CASCADE;

-- ============================================================================
-- PARTE 1: TABLAS CATÁLOGO (Lookup tables sin dependencias)
-- ============================================================================

-- Catálogo de tipos de préstamo
CREATE TABLE IF NOT EXISTS catprestamo (
  id_catprestamo SERIAL PRIMARY KEY,
  tipo_prestamo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catálogo de métodos de preservación y conservación
CREATE TABLE IF NOT EXISTS catpreservacionconservacion (
  id_catpreservacionconservacion SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  preservacion BOOLEAN DEFAULT FALSE,
  conservacion BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catálogo de provincias de Ecuador
CREATE TABLE IF NOT EXISTS catprovincia (
  dpa TEXT PRIMARY KEY,  -- Código DPA (División Político Administrativa)
  provincia TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catálogo de tipos de tejido
CREATE TABLE IF NOT EXISTS cattejido (
  id_cattejido SERIAL PRIMARY KEY,
  tipotejido TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catálogo de tipos de ecosistema
CREATE TABLE IF NOT EXISTS cattipoecosistema (
  id_cattipoecosistema SERIAL PRIMARY KEY,
  ecosistema TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PARTE 2: TABLAS INDEPENDIENTES (Sin FK a otras tablas nuevas)
-- ============================================================================

-- Personal / Investigadores
CREATE TABLE IF NOT EXISTS personal (
  id_personal SERIAL PRIMARY KEY,
  identificacion TEXT,  -- Cédula, pasaporte, otro
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
CREATE TABLE IF NOT EXISTS permisocontrato (
  id_permisocontrato SERIAL PRIMARY KEY,
  npicmpf TEXT,  -- Número de Permiso de Investigación o Contrato Marco o Patente de Funcionamiento
  tipo_autorizacion TEXT CHECK (tipo_autorizacion IN ('Permiso', 'Patente', 'Contrato')),
  fecha_ini DATE,
  fecha_fin DATE,
  estado TEXT CHECK (estado IN ('Caducado', 'Vigente')),
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salidas de campo / Expediciones
CREATE TABLE IF NOT EXISTS salida (
  id_salida SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,  -- Formato: AñoMes: Nombre (ej: 2512: Salida Diciembre 2025)
  detalle TEXT,
  fecha_ini DATE,
  fecha_fin DATE,
  inversion NUMERIC(12,2),
  numero_dias INTEGER,
  inversion_por_dia NUMERIC(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PARTE 3: CAMPOBASE Y DEPENDIENTES
-- ============================================================================

-- Campo Base (localización durante salida)
CREATE TABLE IF NOT EXISTS campobase (
  id_campobase SERIAL PRIMARY KEY,
  salida_id INTEGER REFERENCES salida(id_salida) ON DELETE SET NULL,
  nombre TEXT,  -- Formato: CB+Año+Mes+Día+": Nombre"
  provincia TEXT,
  localidad TEXT,
  latitud NUMERIC(10,7),
  longitud NUMERIC(10,7),
  datum TEXT DEFAULT 'WGS84' CHECK (datum IN ('WGS84', 'PSAD56', 'ND')),
  altitud NUMERIC(6,1),
  miembros TEXT,
  asistentes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diario de Campo Base
CREATE TABLE IF NOT EXISTS diariocampobase (
  id_diariocampobase SERIAL PRIMARY KEY,
  campobase_id INTEGER REFERENCES campobase(id_campobase) ON DELETE CASCADE,
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

-- Datos de Cuerpos de Agua
CREATE TABLE IF NOT EXISTS cuerpoagua (
  id_cuerpoagua SERIAL PRIMARY KEY,
  campobase_id INTEGER REFERENCES campobase(id_campobase) ON DELETE SET NULL,
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

-- Relación Campo Base - Personal
CREATE TABLE IF NOT EXISTS campobasepersonal (
  id_campobasepersonal SERIAL PRIMARY KEY,
  campobase_id INTEGER NOT NULL REFERENCES campobase(id_campobase) ON DELETE CASCADE,
  personal_id INTEGER NOT NULL REFERENCES personal(id_personal) ON DELETE CASCADE,
  lider BOOLEAN DEFAULT FALSE,
  asistente BOOLEAN DEFAULT FALSE,
  fecha TIMESTAMP WITH TIME ZONE,
  foto_url TEXT,
  foto_ref TEXT,
  foto_extfile TEXT,
  foto_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campobase_id, personal_id)
);

-- ============================================================================
-- PARTE 4: COLECCION (Tabla Central) - Conecta con taxon existente
-- ============================================================================

CREATE TABLE IF NOT EXISTS coleccion (
  id_coleccion SERIAL PRIMARY KEY,
  campobase_id INTEGER REFERENCES campobase(id_campobase) ON DELETE SET NULL,
  personal_id INTEGER REFERENCES personal(id_personal) ON DELETE SET NULL,
  infocuerpoagua_id INTEGER REFERENCES cuerpoagua(id_cuerpoagua) ON DELETE SET NULL,
  permisocontrato_id INTEGER REFERENCES permisocontrato(id_permisocontrato) ON DELETE SET NULL,
  taxon_id INTEGER REFERENCES taxon(id_taxon) ON DELETE SET NULL,  -- FK a tabla existente en Supabase

  -- Identificadores
  num_colector TEXT,
  sc TEXT,  -- Código de colección
  gui TEXT,
  num_museo TEXT,
  sc_acronimo TEXT,  -- Siempre en mayúsculas
  sc_numero INTEGER,
  sc_sufijo TEXT,  -- Siempre en minúsculas

  -- Identificación taxonómica
  estatus_identificacion TEXT,
  taxon_nombre TEXT,  -- Nombre del taxón (copia local)
  identificacion_posible TEXT,
  identificacion_sp TEXT,
  identificacion_cuestionable TEXT,
  identificado_por TEXT,
  fecha_identifica DATE,

  -- Datos del espécimen
  estadio TEXT CHECK (estadio IN ('Adulto', 'Juvenil', 'Metamorfo', 'Renacuajo', 'Huevo', 'Subadulto', 'Puesta')),
  numero_individuos INTEGER DEFAULT 1,
  sexo TEXT CHECK (sexo IN ('Macho', 'Hembra', 'ND')),
  estado TEXT CHECK (estado IN ('Vivo', 'En colección', 'Préstamo temp.', 'Préstamo perm.', 'Indeterminado', 'Perdido')),
  svl NUMERIC(6,2),  -- Snout-vent length
  peso NUMERIC(8,3),
  estatus_tipo TEXT CHECK (estatus_tipo IN ('Holotipo', 'Paratipo', NULL)),

  -- Fecha y colecta
  fecha_col DATE,
  hora TIME,
  hora_aprox TIME,
  colectores TEXT,

  -- Preservación
  metodo_fijacion TEXT CHECK (metodo_fijacion IN ('Alcohol 75%', 'Formol 10%')),
  fecha_fijacion DATE,
  metodo_preservacion TEXT,
  tejido_count INTEGER DEFAULT 0,  -- Se actualiza automáticamente
  extrato_piel_count INTEGER DEFAULT 0,  -- Se actualiza automáticamente

  -- Localización
  provincia TEXT,
  detalle_localidad TEXT,
  latitud NUMERIC(10,7),
  longitud NUMERIC(10,7),
  sistema_coordenadas TEXT,
  altitud NUMERIC(6,1),
  fuente_coord TEXT,

  -- Ambiente
  habitat TEXT,
  temperatura NUMERIC(5,2),
  humedad NUMERIC(5,2),
  ph NUMERIC(4,2),

  -- Nombres comunes
  nombre_comun TEXT,
  idioma_nc TEXT,
  fuente_nombrecomun TEXT,

  -- Fotografías
  foto_insitu BOOLEAN DEFAULT FALSE,
  autor_foto_is TEXT,
  foto_exsitu BOOLEAN DEFAULT FALSE,
  autor_foto_es TEXT,
  nota_foto TEXT,

  -- Metadata
  observacion TEXT,
  gbif BOOLEAN DEFAULT FALSE,
  coordenadas TEXT CHECK (coordenadas IN ('Publicar', 'Ofuscar', 'No publicar')),
  numero_cuadernocampo TEXT,
  responsable_ingreso TEXT,
  rango TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PARTE 5: TABLAS DEPENDIENTES DE COLECCION
-- ============================================================================

-- Tejidos de especímenes
CREATE TABLE IF NOT EXISTS tejido (
  id_tejido SERIAL PRIMARY KEY,
  coleccion_id INTEGER NOT NULL REFERENCES coleccion(id_coleccion) ON DELETE CASCADE,
  permisocontrato_id INTEGER REFERENCES permisocontrato(id_permisocontrato) ON DELETE SET NULL,
  codtejido TEXT,
  tipotejido TEXT,
  preservacion TEXT,
  fecha DATE,
  ubicacion TEXT,
  piso TEXT CHECK (piso IN ('1', '2', '3', '4', '5')),
  rack TEXT,
  caja TEXT,
  coordenada TEXT,
  estatus TEXT CHECK (estatus IN ('Disponible', 'No disponible')) DEFAULT 'Disponible',
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cantos grabados
CREATE TABLE IF NOT EXISTS canto (
  id_canto SERIAL PRIMARY KEY,
  coleccion_id INTEGER NOT NULL REFERENCES coleccion(id_coleccion) ON DELETE CASCADE,
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

-- Histórico de identificaciones
CREATE TABLE IF NOT EXISTS identificacion (
  id_identificacion SERIAL PRIMARY KEY,
  coleccion_id INTEGER NOT NULL REFERENCES coleccion(id_coleccion) ON DELETE CASCADE,
  taxon_nombre TEXT,
  responsable TEXT,
  fecha DATE,
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relación Colección - Personal (colectores)
CREATE TABLE IF NOT EXISTS coleccionpersonal (
  id_coleccionpersonal SERIAL PRIMARY KEY,
  coleccion_id INTEGER NOT NULL REFERENCES coleccion(id_coleccion) ON DELETE CASCADE,
  personal_id INTEGER NOT NULL REFERENCES personal(id_personal) ON DELETE CASCADE,
  principal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coleccion_id, personal_id)
);

-- ============================================================================
-- PARTE 6: PRÉSTAMOS
-- ============================================================================

-- Préstamos de material
CREATE TABLE IF NOT EXISTS prestamo (
  id_prestamo SERIAL PRIMARY KEY,
  personal_id INTEGER REFERENCES personal(id_personal) ON DELETE SET NULL,
  numero_prestamo TEXT,
  beneficiario TEXT,
  cargo TEXT,
  institucion TEXT,
  telefono TEXT,
  email TEXT,
  web TEXT,
  fecha_prestamo DATE,
  fecha_devolucion DATE,
  estado TEXT CHECK (estado IN ('Activo', 'Cerrado')) DEFAULT 'Activo',
  material TEXT,
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Préstamo de colecciones
CREATE TABLE IF NOT EXISTS prestamocoleccion (
  id_prestamocoleccion SERIAL PRIMARY KEY,
  prestamo_id INTEGER NOT NULL REFERENCES prestamo(id_prestamo) ON DELETE CASCADE,
  coleccion_id INTEGER NOT NULL REFERENCES coleccion(id_coleccion) ON DELETE CASCADE,
  permisocontrato_id INTEGER REFERENCES permisocontrato(id_permisocontrato) ON DELETE SET NULL,
  estado BOOLEAN DEFAULT TRUE,
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prestamo_id, coleccion_id)
);

-- Préstamo de tejidos
CREATE TABLE IF NOT EXISTS prestamotejido (
  id_prestamotejido SERIAL PRIMARY KEY,
  prestamo_id INTEGER NOT NULL REFERENCES prestamo(id_prestamo) ON DELETE CASCADE,
  tejido_id INTEGER NOT NULL REFERENCES tejido(id_tejido) ON DELETE CASCADE,
  permisocontrato_id INTEGER REFERENCES permisocontrato(id_permisocontrato) ON DELETE SET NULL,
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prestamo_id, tejido_id)
);

-- ============================================================================
-- PARTE 7: ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================================================

-- Índices para coleccion (tabla central)
CREATE INDEX IF NOT EXISTS idx_coleccion_taxon_id ON coleccion(taxon_id);
CREATE INDEX IF NOT EXISTS idx_coleccion_campobase_id ON coleccion(campobase_id);
CREATE INDEX IF NOT EXISTS idx_coleccion_personal_id ON coleccion(personal_id);
CREATE INDEX IF NOT EXISTS idx_coleccion_fecha_col ON coleccion(fecha_col);
CREATE INDEX IF NOT EXISTS idx_coleccion_sc ON coleccion(sc);
CREATE INDEX IF NOT EXISTS idx_coleccion_num_museo ON coleccion(num_museo);
CREATE INDEX IF NOT EXISTS idx_coleccion_estado ON coleccion(estado);

-- Índices para tejido
CREATE INDEX IF NOT EXISTS idx_tejido_coleccion_id ON tejido(coleccion_id);
CREATE INDEX IF NOT EXISTS idx_tejido_estatus ON tejido(estatus);

-- Índices para campobase
CREATE INDEX IF NOT EXISTS idx_campobase_salida_id ON campobase(salida_id);
CREATE INDEX IF NOT EXISTS idx_campobase_provincia ON campobase(provincia);

-- Índices para prestamo
CREATE INDEX IF NOT EXISTS idx_prestamo_personal_id ON prestamo(personal_id);
CREATE INDEX IF NOT EXISTS idx_prestamo_estado ON prestamo(estado);

-- Índices para personal
CREATE INDEX IF NOT EXISTS idx_personal_nombre ON personal(nombre);
CREATE INDEX IF NOT EXISTS idx_personal_institucion ON personal(institucion);

-- ============================================================================
-- PARTE 8: TRIGGERS PARA updated_at
-- ============================================================================

-- Usar la función existente update_updated_at_column() o crear si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers para todas las tablas nuevas
DROP TRIGGER IF EXISTS update_catprestamo_updated_at ON catprestamo;
CREATE TRIGGER update_catprestamo_updated_at BEFORE UPDATE ON catprestamo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_catpreservacionconservacion_updated_at ON catpreservacionconservacion;
CREATE TRIGGER update_catpreservacionconservacion_updated_at BEFORE UPDATE ON catpreservacionconservacion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cattejido_updated_at ON cattejido;
CREATE TRIGGER update_cattejido_updated_at BEFORE UPDATE ON cattejido FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cattipoecosistema_updated_at ON cattipoecosistema;
CREATE TRIGGER update_cattipoecosistema_updated_at BEFORE UPDATE ON cattipoecosistema FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personal_updated_at ON personal;
CREATE TRIGGER update_personal_updated_at BEFORE UPDATE ON personal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permisocontrato_updated_at ON permisocontrato;
CREATE TRIGGER update_permisocontrato_updated_at BEFORE UPDATE ON permisocontrato FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salida_updated_at ON salida;
CREATE TRIGGER update_salida_updated_at BEFORE UPDATE ON salida FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campobase_updated_at ON campobase;
CREATE TRIGGER update_campobase_updated_at BEFORE UPDATE ON campobase FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_diariocampobase_updated_at ON diariocampobase;
CREATE TRIGGER update_diariocampobase_updated_at BEFORE UPDATE ON diariocampobase FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cuerpoagua_updated_at ON cuerpoagua;
CREATE TRIGGER update_cuerpoagua_updated_at BEFORE UPDATE ON cuerpoagua FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campobasepersonal_updated_at ON campobasepersonal;
CREATE TRIGGER update_campobasepersonal_updated_at BEFORE UPDATE ON campobasepersonal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coleccion_updated_at ON coleccion;
CREATE TRIGGER update_coleccion_updated_at BEFORE UPDATE ON coleccion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tejido_updated_at ON tejido;
CREATE TRIGGER update_tejido_updated_at BEFORE UPDATE ON tejido FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_canto_updated_at ON canto;
CREATE TRIGGER update_canto_updated_at BEFORE UPDATE ON canto FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_identificacion_updated_at ON identificacion;
CREATE TRIGGER update_identificacion_updated_at BEFORE UPDATE ON identificacion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coleccionpersonal_updated_at ON coleccionpersonal;
CREATE TRIGGER update_coleccionpersonal_updated_at BEFORE UPDATE ON coleccionpersonal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prestamo_updated_at ON prestamo;
CREATE TRIGGER update_prestamo_updated_at BEFORE UPDATE ON prestamo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prestamocoleccion_updated_at ON prestamocoleccion;
CREATE TRIGGER update_prestamocoleccion_updated_at BEFORE UPDATE ON prestamocoleccion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prestamotejido_updated_at ON prestamotejido;
CREATE TRIGGER update_prestamotejido_updated_at BEFORE UPDATE ON prestamotejido FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PARTE 9: TRIGGER PARA ACTUALIZAR CONTEO DE TEJIDOS EN COLECCION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_coleccion_tejido_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE coleccion
    SET tejido_count = (SELECT COUNT(*) FROM tejido WHERE coleccion_id = NEW.coleccion_id)
    WHERE id_coleccion = NEW.coleccion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE coleccion
    SET tejido_count = (SELECT COUNT(*) FROM tejido WHERE coleccion_id = OLD.coleccion_id)
    WHERE id_coleccion = OLD.coleccion_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_tejido_count ON tejido;
CREATE TRIGGER trigger_update_tejido_count
AFTER INSERT OR DELETE ON tejido
FOR EACH ROW EXECUTE FUNCTION update_coleccion_tejido_count();

-- ============================================================================
-- PARTE 10: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE catprestamo ENABLE ROW LEVEL SECURITY;
ALTER TABLE catpreservacionconservacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE catprovincia ENABLE ROW LEVEL SECURITY;
ALTER TABLE cattejido ENABLE ROW LEVEL SECURITY;
ALTER TABLE cattipoecosistema ENABLE ROW LEVEL SECURITY;
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

-- Políticas de lectura pública para catálogos
DROP POLICY IF EXISTS "Allow public read access" ON catprestamo;
CREATE POLICY "Allow public read access" ON catprestamo FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON catpreservacionconservacion;
CREATE POLICY "Allow public read access" ON catpreservacionconservacion FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON catprovincia;
CREATE POLICY "Allow public read access" ON catprovincia FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON cattejido;
CREATE POLICY "Allow public read access" ON cattejido FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON cattipoecosistema;
CREATE POLICY "Allow public read access" ON cattipoecosistema FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON personal;
CREATE POLICY "Allow public read access" ON personal FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON permisocontrato;
CREATE POLICY "Allow public read access" ON permisocontrato FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON salida;
CREATE POLICY "Allow public read access" ON salida FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON campobase;
CREATE POLICY "Allow public read access" ON campobase FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON diariocampobase;
CREATE POLICY "Allow public read access" ON diariocampobase FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON cuerpoagua;
CREATE POLICY "Allow public read access" ON cuerpoagua FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON campobasepersonal;
CREATE POLICY "Allow public read access" ON campobasepersonal FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON coleccion;
CREATE POLICY "Allow public read access" ON coleccion FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON tejido;
CREATE POLICY "Allow public read access" ON tejido FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON canto;
CREATE POLICY "Allow public read access" ON canto FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON identificacion;
CREATE POLICY "Allow public read access" ON identificacion FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON coleccionpersonal;
CREATE POLICY "Allow public read access" ON coleccionpersonal FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON prestamo;
CREATE POLICY "Allow public read access" ON prestamo FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON prestamocoleccion;
CREATE POLICY "Allow public read access" ON prestamocoleccion FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON prestamotejido;
CREATE POLICY "Allow public read access" ON prestamotejido FOR SELECT USING (true);

-- ============================================================================
-- PARTE 11: DATOS INICIALES PARA CATÁLOGOS
-- ============================================================================

-- Provincias de Ecuador (DPA oficial)
INSERT INTO catprovincia (dpa, provincia) VALUES
  ('01', 'Azuay'),
  ('02', 'Bolívar'),
  ('03', 'Cañar'),
  ('04', 'Carchi'),
  ('05', 'Cotopaxi'),
  ('06', 'Chimborazo'),
  ('07', 'El Oro'),
  ('08', 'Esmeraldas'),
  ('09', 'Guayas'),
  ('10', 'Imbabura'),
  ('11', 'Loja'),
  ('12', 'Los Ríos'),
  ('13', 'Manabí'),
  ('14', 'Morona Santiago'),
  ('15', 'Napo'),
  ('16', 'Pastaza'),
  ('17', 'Pichincha'),
  ('18', 'Tungurahua'),
  ('19', 'Zamora Chinchipe'),
  ('20', 'Galápagos'),
  ('21', 'Sucumbíos'),
  ('22', 'Orellana'),
  ('23', 'Santo Domingo de los Tsáchilas'),
  ('24', 'Santa Elena')
ON CONFLICT (dpa) DO NOTHING;

-- Tipos de tejido comunes
INSERT INTO cattejido (tipotejido) VALUES
  ('Hígado'),
  ('Músculo'),
  ('Corazón'),
  ('Piel'),
  ('Sangre'),
  ('Hueso'),
  ('Cerebro'),
  ('Gónada'),
  ('Cola (regenerable)'),
  ('Dedo');

-- Métodos de preservación/conservación
INSERT INTO catpreservacionconservacion (nombre, preservacion, conservacion) VALUES
  ('Alcohol 75%', true, true),
  ('Alcohol 96%', true, true),
  ('Formol 10%', true, false),
  ('Congelado -20°C', false, true),
  ('Congelado -80°C', false, true),
  ('Liofilizado', false, true),
  ('Buffer de lisis', true, true),
  ('RNAlater', true, true),
  ('Seco', false, true);

-- Tipos de préstamo
INSERT INTO catprestamo (tipo_prestamo) VALUES
  ('Temporal'),
  ('Permanente'),
  ('Intercambio'),
  ('Donación');

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Resumen de tablas creadas:
-- 1. catprestamo
-- 2. catpreservacionconservacion
-- 3. catprovincia
-- 4. cattejido
-- 5. cattipoecosistema
-- 6. personal
-- 7. permisocontrato
-- 8. salida
-- 9. campobase
-- 10. diariocampobase
-- 11. cuerpoagua
-- 12. campobasepersonal
-- 13. coleccion (conecta con taxon existente)
-- 14. tejido
-- 15. canto
-- 16. identificacion
-- 17. coleccionpersonal
-- 18. prestamo
-- 19. prestamocoleccion
-- 20. prestamotejido

