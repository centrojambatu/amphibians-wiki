export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      animacion: {
        Row: {
          descripcion: string | null
          enlace: string
          id_animacion: number
          nombre: string
          taxon_id: number
          thumbnail: string | null
        }
        Insert: {
          descripcion?: string | null
          enlace?: string
          id_animacion?: number
          nombre?: string
          taxon_id: number
          thumbnail?: string | null
        }
        Update: {
          descripcion?: string | null
          enlace?: string
          id_animacion?: number
          nombre?: string
          taxon_id?: number
          thumbnail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      autor: {
        Row: {
          apellidos: string
          biografia_id: number | null
          contador_citas_autor: number | null
          enlace_biografia: string | null
          enlace_google_scholar: string | null
          genero: string | null
          id_autor: number
          nombres: string | null
        }
        Insert: {
          apellidos: string
          biografia_id?: number | null
          contador_citas_autor?: number | null
          enlace_biografia?: string | null
          enlace_google_scholar?: string | null
          genero?: string | null
          id_autor?: number
          nombres?: string | null
        }
        Update: {
          apellidos?: string
          biografia_id?: number | null
          contador_citas_autor?: number | null
          enlace_biografia?: string | null
          enlace_google_scholar?: string | null
          genero?: string | null
          id_autor?: number
          nombres?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autor_biografia_id_fkey"
            columns: ["biografia_id"]
            isOneToOne: false
            referencedRelation: "biografia"
            referencedColumns: ["id_biografia"]
          },
        ]
      }
      biografia: {
        Row: {
          ano_nacimiento: number | null
          apellidos: string | null
          asociaciones_profesionales: string | null
          email: string | null
          experiencia_laboral: string | null
          id_biografia: number
          inicio_interes_estudio: string | null
          interes_investigacion: string | null
          lugar_nacimiento: string | null
          nombres: string | null
          posicion_actual: string | null
          premios_reconocimientos: string | null
          titulos_academicos: string | null
          traducciones: Json | null
        }
        Insert: {
          ano_nacimiento?: number | null
          apellidos?: string | null
          asociaciones_profesionales?: string | null
          email?: string | null
          experiencia_laboral?: string | null
          id_biografia?: number
          inicio_interes_estudio?: string | null
          interes_investigacion?: string | null
          lugar_nacimiento?: string | null
          nombres?: string | null
          posicion_actual?: string | null
          premios_reconocimientos?: string | null
          titulos_academicos?: string | null
          traducciones?: Json | null
        }
        Update: {
          ano_nacimiento?: number | null
          apellidos?: string | null
          asociaciones_profesionales?: string | null
          email?: string | null
          experiencia_laboral?: string | null
          id_biografia?: number
          inicio_interes_estudio?: string | null
          interes_investigacion?: string | null
          lugar_nacimiento?: string | null
          nombres?: string | null
          posicion_actual?: string | null
          premios_reconocimientos?: string | null
          titulos_academicos?: string | null
          traducciones?: Json | null
        }
        Relationships: []
      }
      campobase: {
        Row: {
          altitud: number | null
          asistentes: string | null
          created_at: string | null
          datum: string | null
          id_campobase: number
          latitud: number | null
          localidad: string | null
          longitud: number | null
          miembros: string | null
          nombre: string | null
          provincia_id: number | null
          salida_id: number | null
          updated_at: string | null
        }
        Insert: {
          altitud?: number | null
          asistentes?: string | null
          created_at?: string | null
          datum?: string | null
          id_campobase: number
          latitud?: number | null
          localidad?: string | null
          longitud?: number | null
          miembros?: string | null
          nombre?: string | null
          provincia_id?: number | null
          salida_id?: number | null
          updated_at?: string | null
        }
        Update: {
          altitud?: number | null
          asistentes?: string | null
          created_at?: string | null
          datum?: string | null
          id_campobase?: number
          latitud?: number | null
          localidad?: string | null
          longitud?: number | null
          miembros?: string | null
          nombre?: string | null
          provincia_id?: number | null
          salida_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campobase_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "geopolitica"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "campobase_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_localidades"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "campobase_salida_id_fkey"
            columns: ["salida_id"]
            isOneToOne: false
            referencedRelation: "salida"
            referencedColumns: ["id_salida"]
          },
        ]
      }
      campobasepersonal: {
        Row: {
          asistente: boolean | null
          campobase_id: number
          created_at: string | null
          fecha: string | null
          foto_extfile: string | null
          foto_ref: string | null
          foto_type: string | null
          foto_url: string | null
          id_campobasepersonal: number
          lider: boolean | null
          personal_id: number
          updated_at: string | null
        }
        Insert: {
          asistente?: boolean | null
          campobase_id: number
          created_at?: string | null
          fecha?: string | null
          foto_extfile?: string | null
          foto_ref?: string | null
          foto_type?: string | null
          foto_url?: string | null
          id_campobasepersonal: number
          lider?: boolean | null
          personal_id: number
          updated_at?: string | null
        }
        Update: {
          asistente?: boolean | null
          campobase_id?: number
          created_at?: string | null
          fecha?: string | null
          foto_extfile?: string | null
          foto_ref?: string | null
          foto_type?: string | null
          foto_url?: string | null
          id_campobasepersonal?: number
          lider?: boolean | null
          personal_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campobasepersonal_campobase_id_fkey"
            columns: ["campobase_id"]
            isOneToOne: false
            referencedRelation: "campobase"
            referencedColumns: ["id_campobase"]
          },
          {
            foreignKeyName: "campobasepersonal_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id_personal"]
          },
        ]
      }
      canto: {
        Row: {
          catalogo_awe_id: number | null
          cc: string | null
          coleccion_externa_id: number | null
          coleccion_id: number | null
          colector: string | null
          copyright: string | null
          created_at: string | null
          distancia_micro: number | null
          elevacion: number | null
          enlace: string | null
          equipo: string | null
          especies_fondo: string | null
          estado: string | null
          fecha: string | null
          gui_aud: string | null
          hora: string | null
          humedad: number | null
          id_canto: number
          latitud: number | null
          localidad: string | null
          longitud: number | null
          nombre: string | null
          nombre_archivo: string | null
          nubosidad: number | null
          observacion: string | null
          observacion_carga: string | null
          pais: string | null
          provincia: string | null
          publicacion_id: number | null
          publicar: boolean | null
          serie_campo: string | null
          taxon_id: number | null
          temp_agua: number | null
          temp_aire: number | null
          updated_at: string | null
        }
        Insert: {
          catalogo_awe_id?: number | null
          cc?: string | null
          coleccion_externa_id?: number | null
          coleccion_id?: number | null
          colector?: string | null
          copyright?: string | null
          created_at?: string | null
          distancia_micro?: number | null
          elevacion?: number | null
          enlace?: string | null
          equipo?: string | null
          especies_fondo?: string | null
          estado?: string | null
          fecha?: string | null
          gui_aud?: string | null
          hora?: string | null
          humedad?: number | null
          id_canto?: number
          latitud?: number | null
          localidad?: string | null
          longitud?: number | null
          nombre?: string | null
          nombre_archivo?: string | null
          nubosidad?: number | null
          observacion?: string | null
          observacion_carga?: string | null
          pais?: string | null
          provincia?: string | null
          publicacion_id?: number | null
          publicar?: boolean | null
          serie_campo?: string | null
          taxon_id?: number | null
          temp_agua?: number | null
          temp_aire?: number | null
          updated_at?: string | null
        }
        Update: {
          catalogo_awe_id?: number | null
          cc?: string | null
          coleccion_externa_id?: number | null
          coleccion_id?: number | null
          colector?: string | null
          copyright?: string | null
          created_at?: string | null
          distancia_micro?: number | null
          elevacion?: number | null
          enlace?: string | null
          equipo?: string | null
          especies_fondo?: string | null
          estado?: string | null
          fecha?: string | null
          gui_aud?: string | null
          hora?: string | null
          humedad?: number | null
          id_canto?: number
          latitud?: number | null
          localidad?: string | null
          longitud?: number | null
          nombre?: string | null
          nombre_archivo?: string | null
          nubosidad?: number | null
          observacion?: string | null
          observacion_carga?: string | null
          pais?: string | null
          provincia?: string | null
          publicacion_id?: number | null
          publicar?: boolean | null
          serie_campo?: string | null
          taxon_id?: number | null
          temp_agua?: number | null
          temp_aire?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canto_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "canto_coleccion_externa_id_fkey"
            columns: ["coleccion_externa_id"]
            isOneToOne: false
            referencedRelation: "coleccion_externa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canto_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
          {
            foreignKeyName: "canto_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "canto_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "canto_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "canto_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "canto_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "canto_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "canto_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      catalogo_awe: {
        Row: {
          descripcion: string | null
          id_catalogo_awe: number
          nombre: string
          orden: number | null
          sigla: string | null
          tipo_catalogo_awe_id: number | null
          traducciones: Json | null
        }
        Insert: {
          descripcion?: string | null
          id_catalogo_awe?: number
          nombre: string
          orden?: number | null
          sigla?: string | null
          tipo_catalogo_awe_id?: number | null
          traducciones?: Json | null
        }
        Update: {
          descripcion?: string | null
          id_catalogo_awe?: number
          nombre?: string
          orden?: number | null
          sigla?: string | null
          tipo_catalogo_awe_id?: number | null
          traducciones?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "catalogo_awe_tipo_catalogo_awe_id_fkey"
            columns: ["tipo_catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "tipo_catalogo_awe"
            referencedColumns: ["id_tipo_catalogo_awe"]
          },
          {
            foreignKeyName: "catalogo_awe_tipo_catalogo_awe_id_fkey"
            columns: ["tipo_catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "vw_tipo_catalogo_lac"
            referencedColumns: ["id_tipo_catalogo_awe"]
          },
        ]
      }
      catalogo_publicaciones: {
        Row: {
          descripcion: string | null
          id: number
          nombre: string | null
          tipo: string | null
        }
        Insert: {
          descripcion?: string | null
          id?: number
          nombre?: string | null
          tipo?: string | null
        }
        Update: {
          descripcion?: string | null
          id?: number
          nombre?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      coleccion: {
        Row: {
          autor_foto_es: string | null
          autor_foto_is: string | null
          campobase_id: number | null
          catalogo_museo: string | null
          colectores: string | null
          condicion_reproductiva: string | null
          coordenadas: string | null
          created_at: string | null
          datos_ambientales: string | null
          elevacion: number | null
          esperma: boolean | null
          esqueleto_transparentacion: boolean | null
          estadio: string | null
          estado: string | null
          estatus_identificacion: string | null
          estatus_tipo: string | null
          extrato_piel_count: number | null
          fecha_col: string | null
          fecha_fijacion: string | null
          fecha_identifica: string | null
          foto_exsitu: boolean | null
          foto_insitu: boolean | null
          fuente_coord: string | null
          fuente_nombrecomun: string | null
          gbif: boolean | null
          gui: string | null
          habitat: string | null
          heces: boolean | null
          hora: string | null
          hora_aprox: string | null
          humedad: number | null
          id_coleccion: number
          identificacion_cuestionable: string | null
          identificacion_posible: string | null
          identificacion_sp: string | null
          identificado_por: string | null
          idioma_nc: string | null
          infocuerpoagua_id: number | null
          latitud: number | null
          localidad: string | null
          longitud: number | null
          metodo_fijacion: string | null
          metodo_preservacion: string | null
          nombre_comun: string | null
          nota_foto: string | null
          num_colector: string | null
          numero_cuadernocampo: string | null
          numero_individuos: number | null
          numero_museo: string | null
          observacion: string | null
          permisocontrato_id: number | null
          personal_id: number | null
          peso: number | null
          ph: number | null
          piel_exudado: boolean | null
          piel_liofilizado: boolean | null
          provincia_id: number | null
          publicar: boolean | null
          rango: string | null
          responsable_ingreso: string | null
          sangre: boolean | null
          sc: string | null
          sc_acronimo: string | null
          sc_numero: number | null
          sc_sufijo: string | null
          sexo: string | null
          svl: number | null
          taxon_id: number | null
          tejido_count: number | null
          tejido_higado: boolean | null
          tejido_musculo: boolean | null
          temperatura: number | null
          updated_at: string | null
          verificado: boolean | null
        }
        Insert: {
          autor_foto_es?: string | null
          autor_foto_is?: string | null
          campobase_id?: number | null
          catalogo_museo?: string | null
          colectores?: string | null
          condicion_reproductiva?: string | null
          coordenadas?: string | null
          created_at?: string | null
          datos_ambientales?: string | null
          elevacion?: number | null
          esperma?: boolean | null
          esqueleto_transparentacion?: boolean | null
          estadio?: string | null
          estado?: string | null
          estatus_identificacion?: string | null
          estatus_tipo?: string | null
          extrato_piel_count?: number | null
          fecha_col?: string | null
          fecha_fijacion?: string | null
          fecha_identifica?: string | null
          foto_exsitu?: boolean | null
          foto_insitu?: boolean | null
          fuente_coord?: string | null
          fuente_nombrecomun?: string | null
          gbif?: boolean | null
          gui?: string | null
          habitat?: string | null
          heces?: boolean | null
          hora?: string | null
          hora_aprox?: string | null
          humedad?: number | null
          id_coleccion: number
          identificacion_cuestionable?: string | null
          identificacion_posible?: string | null
          identificacion_sp?: string | null
          identificado_por?: string | null
          idioma_nc?: string | null
          infocuerpoagua_id?: number | null
          latitud?: number | null
          localidad?: string | null
          longitud?: number | null
          metodo_fijacion?: string | null
          metodo_preservacion?: string | null
          nombre_comun?: string | null
          nota_foto?: string | null
          num_colector?: string | null
          numero_cuadernocampo?: string | null
          numero_individuos?: number | null
          numero_museo?: string | null
          observacion?: string | null
          permisocontrato_id?: number | null
          personal_id?: number | null
          peso?: number | null
          ph?: number | null
          piel_exudado?: boolean | null
          piel_liofilizado?: boolean | null
          provincia_id?: number | null
          publicar?: boolean | null
          rango?: string | null
          responsable_ingreso?: string | null
          sangre?: boolean | null
          sc?: string | null
          sc_acronimo?: string | null
          sc_numero?: number | null
          sc_sufijo?: string | null
          sexo?: string | null
          svl?: number | null
          taxon_id?: number | null
          tejido_count?: number | null
          tejido_higado?: boolean | null
          tejido_musculo?: boolean | null
          temperatura?: number | null
          updated_at?: string | null
          verificado?: boolean | null
        }
        Update: {
          autor_foto_es?: string | null
          autor_foto_is?: string | null
          campobase_id?: number | null
          catalogo_museo?: string | null
          colectores?: string | null
          condicion_reproductiva?: string | null
          coordenadas?: string | null
          created_at?: string | null
          datos_ambientales?: string | null
          elevacion?: number | null
          esperma?: boolean | null
          esqueleto_transparentacion?: boolean | null
          estadio?: string | null
          estado?: string | null
          estatus_identificacion?: string | null
          estatus_tipo?: string | null
          extrato_piel_count?: number | null
          fecha_col?: string | null
          fecha_fijacion?: string | null
          fecha_identifica?: string | null
          foto_exsitu?: boolean | null
          foto_insitu?: boolean | null
          fuente_coord?: string | null
          fuente_nombrecomun?: string | null
          gbif?: boolean | null
          gui?: string | null
          habitat?: string | null
          heces?: boolean | null
          hora?: string | null
          hora_aprox?: string | null
          humedad?: number | null
          id_coleccion?: number
          identificacion_cuestionable?: string | null
          identificacion_posible?: string | null
          identificacion_sp?: string | null
          identificado_por?: string | null
          idioma_nc?: string | null
          infocuerpoagua_id?: number | null
          latitud?: number | null
          localidad?: string | null
          longitud?: number | null
          metodo_fijacion?: string | null
          metodo_preservacion?: string | null
          nombre_comun?: string | null
          nota_foto?: string | null
          num_colector?: string | null
          numero_cuadernocampo?: string | null
          numero_individuos?: number | null
          numero_museo?: string | null
          observacion?: string | null
          permisocontrato_id?: number | null
          personal_id?: number | null
          peso?: number | null
          ph?: number | null
          piel_exudado?: boolean | null
          piel_liofilizado?: boolean | null
          provincia_id?: number | null
          publicar?: boolean | null
          rango?: string | null
          responsable_ingreso?: string | null
          sangre?: boolean | null
          sc?: string | null
          sc_acronimo?: string | null
          sc_numero?: number | null
          sc_sufijo?: string | null
          sexo?: string | null
          svl?: number | null
          taxon_id?: number | null
          tejido_count?: number | null
          tejido_higado?: boolean | null
          tejido_musculo?: boolean | null
          temperatura?: number | null
          updated_at?: string | null
          verificado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "coleccion_campobase_id_fkey"
            columns: ["campobase_id"]
            isOneToOne: false
            referencedRelation: "campobase"
            referencedColumns: ["id_campobase"]
          },
          {
            foreignKeyName: "coleccion_infocuerpoagua_id_fkey"
            columns: ["infocuerpoagua_id"]
            isOneToOne: false
            referencedRelation: "cuerpoagua"
            referencedColumns: ["id_cuerpoagua"]
          },
          {
            foreignKeyName: "coleccion_permisocontrato_id_fkey"
            columns: ["permisocontrato_id"]
            isOneToOne: false
            referencedRelation: "permisocontrato"
            referencedColumns: ["id_permisocontrato"]
          },
          {
            foreignKeyName: "coleccion_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id_personal"]
          },
          {
            foreignKeyName: "coleccion_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "geopolitica"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "coleccion_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_localidades"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      coleccion_externa: {
        Row: {
          catalogo_museo: string | null
          colectores: string | null
          created_at: string
          elevacion: number | null
          fecha: string | null
          id: number
          latitud: number | null
          localidad: string | null
          longitud: number | null
          numero_museo: string | null
          provincia_id: number | null
          publicacion_id: number | null
          publicar: boolean | null
          taxon_id: number | null
          tipo: string | null
        }
        Insert: {
          catalogo_museo?: string | null
          colectores?: string | null
          created_at?: string
          elevacion?: number | null
          fecha?: string | null
          id?: number
          latitud?: number | null
          localidad?: string | null
          longitud?: number | null
          numero_museo?: string | null
          provincia_id?: number | null
          publicacion_id?: number | null
          publicar?: boolean | null
          taxon_id?: number | null
          tipo?: string | null
        }
        Update: {
          catalogo_museo?: string | null
          colectores?: string | null
          created_at?: string
          elevacion?: number | null
          fecha?: string | null
          id?: number
          latitud?: number | null
          localidad?: string | null
          longitud?: number | null
          numero_museo?: string | null
          provincia_id?: number | null
          publicacion_id?: number | null
          publicar?: boolean | null
          taxon_id?: number | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coleccion_externa_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "geopolitica"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "coleccion_externa_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_localidades"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "coleccion_externa_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "coleccion_externa_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "coleccion_externa_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "coleccion_externa_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "coleccion_externa_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "coleccion_externa_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_externa_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      coleccion_externa_catalogo_awe: {
        Row: {
          catalogo_awe_id: number
          coleccion_externa_id: number
          id: number
          observación: string | null
        }
        Insert: {
          catalogo_awe_id: number
          coleccion_externa_id: number
          id?: number
          observación?: string | null
        }
        Update: {
          catalogo_awe_id?: number
          coleccion_externa_id?: number
          id?: number
          observación?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coleccion_externa_catalogo_awe_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "coleccion_externa_catalogo_awe_coleccion_externa_id_fkey"
            columns: ["coleccion_externa_id"]
            isOneToOne: false
            referencedRelation: "coleccion_externa"
            referencedColumns: ["id"]
          },
        ]
      }
      coleccion_externa_precipitacion: {
        Row: {
          abr_prec: number | null
          ago_prec: number | null
          coleccion_externa_id: number | null
          created_at: string
          dic_prec: number | null
          ene_prec: number | null
          feb_prec: number | null
          id: number
          jul_prec: number | null
          jun_prec: number | null
          mar_prec: number | null
          may_prec: number | null
          nov_prec: number | null
          oct_prec: number | null
          prom_anual_prec: number | null
          sep_prec: number | null
        }
        Insert: {
          abr_prec?: number | null
          ago_prec?: number | null
          coleccion_externa_id?: number | null
          created_at?: string
          dic_prec?: number | null
          ene_prec?: number | null
          feb_prec?: number | null
          id?: number
          jul_prec?: number | null
          jun_prec?: number | null
          mar_prec?: number | null
          may_prec?: number | null
          nov_prec?: number | null
          oct_prec?: number | null
          prom_anual_prec?: number | null
          sep_prec?: number | null
        }
        Update: {
          abr_prec?: number | null
          ago_prec?: number | null
          coleccion_externa_id?: number | null
          created_at?: string
          dic_prec?: number | null
          ene_prec?: number | null
          feb_prec?: number | null
          id?: number
          jul_prec?: number | null
          jun_prec?: number | null
          mar_prec?: number | null
          may_prec?: number | null
          nov_prec?: number | null
          oct_prec?: number | null
          prom_anual_prec?: number | null
          sep_prec?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coleccion_externa_precipitacion_coleccion_externa_id_fkey"
            columns: ["coleccion_externa_id"]
            isOneToOne: false
            referencedRelation: "coleccion_externa"
            referencedColumns: ["id"]
          },
        ]
      }
      coleccion_externa_temperatura: {
        Row: {
          abr_temp: number | null
          ago_temp: number | null
          coleccion_externa_id: number | null
          created_at: string
          dic_temp: number | null
          ene_temp: number | null
          feb_temp: number | null
          id: number
          jul_temp: number | null
          jun_temp: number | null
          mar_temp: number | null
          may_temp: number | null
          nov_temp: number | null
          oct_temp: number | null
          prom_anual_temp: number | null
          sep_temp: number | null
        }
        Insert: {
          abr_temp?: number | null
          ago_temp?: number | null
          coleccion_externa_id?: number | null
          created_at?: string
          dic_temp?: number | null
          ene_temp?: number | null
          feb_temp?: number | null
          id?: number
          jul_temp?: number | null
          jun_temp?: number | null
          mar_temp?: number | null
          may_temp?: number | null
          nov_temp?: number | null
          oct_temp?: number | null
          prom_anual_temp?: number | null
          sep_temp?: number | null
        }
        Update: {
          abr_temp?: number | null
          ago_temp?: number | null
          coleccion_externa_id?: number | null
          created_at?: string
          dic_temp?: number | null
          ene_temp?: number | null
          feb_temp?: number | null
          id?: number
          jul_temp?: number | null
          jun_temp?: number | null
          mar_temp?: number | null
          may_temp?: number | null
          nov_temp?: number | null
          oct_temp?: number | null
          prom_anual_temp?: number | null
          sep_temp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coleccion_externa_temperatura_coleccion_externa_id_fkey"
            columns: ["coleccion_externa_id"]
            isOneToOne: false
            referencedRelation: "coleccion_externa"
            referencedColumns: ["id"]
          },
        ]
      }
      coleccionpersonal: {
        Row: {
          coleccion_id: number
          created_at: string | null
          id_coleccionpersonal: number
          personal_id: number
          principal: boolean | null
          updated_at: string | null
        }
        Insert: {
          coleccion_id: number
          created_at?: string | null
          id_coleccionpersonal: number
          personal_id: number
          principal?: boolean | null
          updated_at?: string | null
        }
        Update: {
          coleccion_id?: number
          created_at?: string | null
          id_coleccionpersonal?: number
          personal_id?: number
          principal?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coleccionpersonal_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
          {
            foreignKeyName: "coleccionpersonal_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id_personal"]
          },
        ]
      }
      cuerpoagua: {
        Row: {
          campobase_id: number | null
          cod_lote_datos: string | null
          created_at: string | null
          datum: string | null
          equipo: string | null
          fnu: number | null
          id_cuerpoagua: number
          lat: number | null
          lon: number | null
          mocm: number | null
          mv_ph: number | null
          mvorp: number | null
          nombre: string | null
          nota: string | null
          ot: number | null
          oxigeno_disuelto: number | null
          ph: number | null
          ppmtd: number | null
          psi: number | null
          psu: number | null
          temp: number | null
          temperatura_ambiente: number | null
          tipo_microhabitat_id: number | null
          updated_at: string | null
          ustm: number | null
          ustma: number | null
        }
        Insert: {
          campobase_id?: number | null
          cod_lote_datos?: string | null
          created_at?: string | null
          datum?: string | null
          equipo?: string | null
          fnu?: number | null
          id_cuerpoagua: number
          lat?: number | null
          lon?: number | null
          mocm?: number | null
          mv_ph?: number | null
          mvorp?: number | null
          nombre?: string | null
          nota?: string | null
          ot?: number | null
          oxigeno_disuelto?: number | null
          ph?: number | null
          ppmtd?: number | null
          psi?: number | null
          psu?: number | null
          temp?: number | null
          temperatura_ambiente?: number | null
          tipo_microhabitat_id?: number | null
          updated_at?: string | null
          ustm?: number | null
          ustma?: number | null
        }
        Update: {
          campobase_id?: number | null
          cod_lote_datos?: string | null
          created_at?: string | null
          datum?: string | null
          equipo?: string | null
          fnu?: number | null
          id_cuerpoagua?: number
          lat?: number | null
          lon?: number | null
          mocm?: number | null
          mv_ph?: number | null
          mvorp?: number | null
          nombre?: string | null
          nota?: string | null
          ot?: number | null
          oxigeno_disuelto?: number | null
          ph?: number | null
          ppmtd?: number | null
          psi?: number | null
          psu?: number | null
          temp?: number | null
          temperatura_ambiente?: number | null
          tipo_microhabitat_id?: number | null
          updated_at?: string | null
          ustm?: number | null
          ustma?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cuerpoagua_campobase_id_fkey"
            columns: ["campobase_id"]
            isOneToOne: false
            referencedRelation: "campobase"
            referencedColumns: ["id_campobase"]
          },
          {
            foreignKeyName: "cuerpoagua_tipo_microhabitat_id_fkey"
            columns: ["tipo_microhabitat_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
        ]
      }
      diariocampobase: {
        Row: {
          campobase_id: number | null
          created_at: string | null
          descripcion_area: string | null
          estado_tiempo: string | null
          fecha: string | null
          hora_fin: string | null
          hora_inicio: string | null
          id_diariocampobase: number
          numero_colectores: number | null
          observacion: string | null
          temperatura: number | null
          updated_at: string | null
        }
        Insert: {
          campobase_id?: number | null
          created_at?: string | null
          descripcion_area?: string | null
          estado_tiempo?: string | null
          fecha?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id_diariocampobase: number
          numero_colectores?: number | null
          observacion?: string | null
          temperatura?: number | null
          updated_at?: string | null
        }
        Update: {
          campobase_id?: number | null
          created_at?: string | null
          descripcion_area?: string | null
          estado_tiempo?: string | null
          fecha?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id_diariocampobase?: number
          numero_colectores?: number | null
          observacion?: string | null
          temperatura?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diariocampobase_campobase_id_fkey"
            columns: ["campobase_id"]
            isOneToOne: false
            referencedRelation: "campobase"
            referencedColumns: ["id_campobase"]
          },
        ]
      }
      enlace_relacionado_manejo_ex_situ: {
        Row: {
          enlace: string
          id_enlace_relacionado_manejo_ex_situ: number
          manejo_ex_situ_id: number
          manejo_ex_situ_taxon_id: number
          nombre: string
        }
        Insert: {
          enlace?: string
          id_enlace_relacionado_manejo_ex_situ?: number
          manejo_ex_situ_id: number
          manejo_ex_situ_taxon_id: number
          nombre?: string
        }
        Update: {
          enlace?: string
          id_enlace_relacionado_manejo_ex_situ?: number
          manejo_ex_situ_id?: number
          manejo_ex_situ_taxon_id?: number
          nombre?: string
        }
        Relationships: []
      }
      enlace_relacionado_taxon: {
        Row: {
          enlace: string
          id_enlace_relacionado_taxon: number
          nombre: string
          taxon_id: number
        }
        Insert: {
          enlace?: string
          id_enlace_relacionado_taxon?: number
          nombre?: string
          taxon_id: number
        }
        Update: {
          enlace?: string
          id_enlace_relacionado_taxon?: number
          nombre?: string
          taxon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      ficha_especie: {
        Row: {
          agradecimiento: string | null
          anfibio_conservacion: boolean | null
          anfibio_investigacion: boolean | null
          area_distribucion: number | null
          asw: string | null
          autoria_compilador: string | null
          autoria_editor: string | null
          aw: string | null
          blog: string | null
          canto: string | null
          canto_destacado_id: number | null
          colector: string | null
          color_en_preservacion: string | null
          color_en_vida: string | null
          comentario_estatus_poblacional: string | null
          comparacion: string | null
          compilador: string | null
          descripcion: string | null
          descubridor: string | null
          diagnosis: string | null
          dieta: string | null
          distribucion: string | null
          distribucion_global: string | null
          editor: string | null
          etimologia: string | null
          fecha_actualizacion: string | null
          fecha_compilacion: string | null
          fecha_edicion: string | null
          fotografia_destacada_id: number | null
          fuente_lista_roja: string | null
          gbif: string | null
          genbank: string | null
          habitat_biologia: string | null
          herpnet: string | null
          historial: string | null
          id_ficha_especie: number
          identificacion: string | null
          inaturalist: string | null
          informacion_adicional: string | null
          larva: string | null
          morfometria: string | null
          morphosource: string | null
          observacion_zona_altitudinal: string | null
          pluviocidad_max: number | null
          pluviocidad_min: number | null
          pluviocidad_prom: number | null
          publicacion_id: number | null
          publicar: boolean
          rango_altitudinal: string | null
          rango_altitudinal_max: number | null
          rango_altitudinal_min: number | null
          referencia_area_protegida: string | null
          reproduccion: string | null
          sinonimia: string | null
          svl_hembra: string | null
          svl_macho: string | null
          taxon_id: number
          taxonomia: string | null
          temperatura_max: number | null
          temperatura_min: number | null
          temperatura_prom: number | null
          traducciones: Json | null
          uicn: string | null
          ultimo_avistamiento: string | null
          usos: string | null
          video_destacado_id: number | null
          wikipedia: string | null
        }
        Insert: {
          agradecimiento?: string | null
          anfibio_conservacion?: boolean | null
          anfibio_investigacion?: boolean | null
          area_distribucion?: number | null
          asw?: string | null
          autoria_compilador?: string | null
          autoria_editor?: string | null
          aw?: string | null
          blog?: string | null
          canto?: string | null
          canto_destacado_id?: number | null
          colector?: string | null
          color_en_preservacion?: string | null
          color_en_vida?: string | null
          comentario_estatus_poblacional?: string | null
          comparacion?: string | null
          compilador?: string | null
          descripcion?: string | null
          descubridor?: string | null
          diagnosis?: string | null
          dieta?: string | null
          distribucion?: string | null
          distribucion_global?: string | null
          editor?: string | null
          etimologia?: string | null
          fecha_actualizacion?: string | null
          fecha_compilacion?: string | null
          fecha_edicion?: string | null
          fotografia_destacada_id?: number | null
          fuente_lista_roja?: string | null
          gbif?: string | null
          genbank?: string | null
          habitat_biologia?: string | null
          herpnet?: string | null
          historial?: string | null
          id_ficha_especie?: number
          identificacion?: string | null
          inaturalist?: string | null
          informacion_adicional?: string | null
          larva?: string | null
          morfometria?: string | null
          morphosource?: string | null
          observacion_zona_altitudinal?: string | null
          pluviocidad_max?: number | null
          pluviocidad_min?: number | null
          pluviocidad_prom?: number | null
          publicacion_id?: number | null
          publicar?: boolean
          rango_altitudinal?: string | null
          rango_altitudinal_max?: number | null
          rango_altitudinal_min?: number | null
          referencia_area_protegida?: string | null
          reproduccion?: string | null
          sinonimia?: string | null
          svl_hembra?: string | null
          svl_macho?: string | null
          taxon_id: number
          taxonomia?: string | null
          temperatura_max?: number | null
          temperatura_min?: number | null
          temperatura_prom?: number | null
          traducciones?: Json | null
          uicn?: string | null
          ultimo_avistamiento?: string | null
          usos?: string | null
          video_destacado_id?: number | null
          wikipedia?: string | null
        }
        Update: {
          agradecimiento?: string | null
          anfibio_conservacion?: boolean | null
          anfibio_investigacion?: boolean | null
          area_distribucion?: number | null
          asw?: string | null
          autoria_compilador?: string | null
          autoria_editor?: string | null
          aw?: string | null
          blog?: string | null
          canto?: string | null
          canto_destacado_id?: number | null
          colector?: string | null
          color_en_preservacion?: string | null
          color_en_vida?: string | null
          comentario_estatus_poblacional?: string | null
          comparacion?: string | null
          compilador?: string | null
          descripcion?: string | null
          descubridor?: string | null
          diagnosis?: string | null
          dieta?: string | null
          distribucion?: string | null
          distribucion_global?: string | null
          editor?: string | null
          etimologia?: string | null
          fecha_actualizacion?: string | null
          fecha_compilacion?: string | null
          fecha_edicion?: string | null
          fotografia_destacada_id?: number | null
          fuente_lista_roja?: string | null
          gbif?: string | null
          genbank?: string | null
          habitat_biologia?: string | null
          herpnet?: string | null
          historial?: string | null
          id_ficha_especie?: number
          identificacion?: string | null
          inaturalist?: string | null
          informacion_adicional?: string | null
          larva?: string | null
          morfometria?: string | null
          morphosource?: string | null
          observacion_zona_altitudinal?: string | null
          pluviocidad_max?: number | null
          pluviocidad_min?: number | null
          pluviocidad_prom?: number | null
          publicacion_id?: number | null
          publicar?: boolean
          rango_altitudinal?: string | null
          rango_altitudinal_max?: number | null
          rango_altitudinal_min?: number | null
          referencia_area_protegida?: string | null
          reproduccion?: string | null
          sinonimia?: string | null
          svl_hembra?: string | null
          svl_macho?: string | null
          taxon_id?: number
          taxonomia?: string | null
          temperatura_max?: number | null
          temperatura_min?: number | null
          temperatura_prom?: number | null
          traducciones?: Json | null
          uicn?: string | null
          ultimo_avistamiento?: string | null
          usos?: string | null
          video_destacado_id?: number | null
          wikipedia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ficha_especie_canto_destacado_id_fkey"
            columns: ["canto_destacado_id"]
            isOneToOne: false
            referencedRelation: "canto"
            referencedColumns: ["id_canto"]
          },
          {
            foreignKeyName: "ficha_especie_fotografia_destacada_id_fkey"
            columns: ["fotografia_destacada_id"]
            isOneToOne: false
            referencedRelation: "fotografia"
            referencedColumns: ["id_fotografia"]
          },
          {
            foreignKeyName: "ficha_especie_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "ficha_especie_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "ficha_especie_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "ficha_especie_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "ficha_especie_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "ficha_especie_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_video_destacado_id_fkey"
            columns: ["video_destacado_id"]
            isOneToOne: false
            referencedRelation: "video"
            referencedColumns: ["id_video"]
          },
        ]
      }
      ficha_familia: {
        Row: {
          agradecimientos: string | null
          contenido: string | null
          definicion: string | null
          distribucion: string | null
          etimologia: string | null
          id_ficha_familia: number
          observaciones: string | null
          sinonimia: string | null
          taxon_id: number
        }
        Insert: {
          agradecimientos?: string | null
          contenido?: string | null
          definicion?: string | null
          distribucion?: string | null
          etimologia?: string | null
          id_ficha_familia?: number
          observaciones?: string | null
          sinonimia?: string | null
          taxon_id: number
        }
        Update: {
          agradecimientos?: string | null
          contenido?: string | null
          definicion?: string | null
          distribucion?: string | null
          etimologia?: string | null
          id_ficha_familia?: number
          observaciones?: string | null
          sinonimia?: string | null
          taxon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_familia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      ficha_genero: {
        Row: {
          agradecimientos: string | null
          contenido: string | null
          definicion: string | null
          distribucion: string | null
          etimologia: string | null
          id_ficha_genero: number
          observaciones: string | null
          sinonimia: string | null
          taxon_id: number
        }
        Insert: {
          agradecimientos?: string | null
          contenido?: string | null
          definicion?: string | null
          distribucion?: string | null
          etimologia?: string | null
          id_ficha_genero?: number
          observaciones?: string | null
          sinonimia?: string | null
          taxon_id: number
        }
        Update: {
          agradecimientos?: string | null
          contenido?: string | null
          definicion?: string | null
          distribucion?: string | null
          etimologia?: string | null
          id_ficha_genero?: number
          observaciones?: string | null
          sinonimia?: string | null
          taxon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_genero_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      ficha_orden: {
        Row: {
          agradecimientos: string | null
          contenido: string | null
          definicion: string | null
          distribucion: string | null
          etimologia: string | null
          id_ficha_orden: number
          observaciones: string | null
          sinonimia: string | null
          taxon_id: number
        }
        Insert: {
          agradecimientos?: string | null
          contenido?: string | null
          definicion?: string | null
          distribucion?: string | null
          etimologia?: string | null
          id_ficha_orden?: number
          observaciones?: string | null
          sinonimia?: string | null
          taxon_id: number
        }
        Update: {
          agradecimientos?: string | null
          contenido?: string | null
          definicion?: string | null
          distribucion?: string | null
          etimologia?: string | null
          id_ficha_orden?: number
          observaciones?: string | null
          sinonimia?: string | null
          taxon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_orden_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: true
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      fotografia: {
        Row: {
          autor: string | null
          catalogo_awe_id: number
          catalogo_museo: string | null
          coleccion_externa_id: number | null
          coleccion_id: number | null
          created_at: string | null
          descripción: string | null
          destacada: boolean
          enlace: string
          fecha: string | null
          id_fotografia: number
          latitud: number | null
          localidad: string | null
          longitud: number | null
          nombre: string
          observaciones: string | null
          orden: number | null
          publicacion_id: number | null
          publicar: boolean | null
          slide_id: number | null
          taxon_id: number | null
          tipo_licencia: string | null
        }
        Insert: {
          autor?: string | null
          catalogo_awe_id: number
          catalogo_museo?: string | null
          coleccion_externa_id?: number | null
          coleccion_id?: number | null
          created_at?: string | null
          descripción?: string | null
          destacada?: boolean
          enlace?: string
          fecha?: string | null
          id_fotografia?: number
          latitud?: number | null
          localidad?: string | null
          longitud?: number | null
          nombre?: string
          observaciones?: string | null
          orden?: number | null
          publicacion_id?: number | null
          publicar?: boolean | null
          slide_id?: number | null
          taxon_id?: number | null
          tipo_licencia?: string | null
        }
        Update: {
          autor?: string | null
          catalogo_awe_id?: number
          catalogo_museo?: string | null
          coleccion_externa_id?: number | null
          coleccion_id?: number | null
          created_at?: string | null
          descripción?: string | null
          destacada?: boolean
          enlace?: string
          fecha?: string | null
          id_fotografia?: number
          latitud?: number | null
          localidad?: string | null
          longitud?: number | null
          nombre?: string
          observaciones?: string | null
          orden?: number | null
          publicacion_id?: number | null
          publicar?: boolean | null
          slide_id?: number | null
          taxon_id?: number | null
          tipo_licencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fotografia_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "fotografia_coleccion_externa_id_fkey"
            columns: ["coleccion_externa_id"]
            isOneToOne: false
            referencedRelation: "coleccion_externa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotografia_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
          {
            foreignKeyName: "fotografia_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "fotografia_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "fotografia_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "fotografia_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "fotografia_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "fotografia_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "fotografia_slide_id_fkey"
            columns: ["slide_id"]
            isOneToOne: false
            referencedRelation: "slide"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      geopolitica: {
        Row: {
          geopolitica_id: number | null
          id_geopolitica: number
          nombre: string
          rank_geopolitica_id: number
        }
        Insert: {
          geopolitica_id?: number | null
          id_geopolitica?: number
          nombre: string
          rank_geopolitica_id: number
        }
        Update: {
          geopolitica_id?: number | null
          id_geopolitica?: number
          nombre?: string
          rank_geopolitica_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "geopolitica_geopolitica_id_fkey"
            columns: ["geopolitica_id"]
            isOneToOne: false
            referencedRelation: "geopolitica"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "geopolitica_geopolitica_id_fkey"
            columns: ["geopolitica_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_localidades"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "geopolitica_rank_geopolitica_id_fkey"
            columns: ["rank_geopolitica_id"]
            isOneToOne: false
            referencedRelation: "rank_geopolitica"
            referencedColumns: ["id_rank_geopolitica"]
          },
        ]
      }
      identificacion: {
        Row: {
          coleccion_id: number
          comentario: string | null
          created_at: string | null
          fecha: string | null
          id_identificacion: number
          responsable: string | null
          taxon_nombre: string | null
          updated_at: string | null
        }
        Insert: {
          coleccion_id: number
          comentario?: string | null
          created_at?: string | null
          fecha?: string | null
          id_identificacion: number
          responsable?: string | null
          taxon_nombre?: string | null
          updated_at?: string | null
        }
        Update: {
          coleccion_id?: number
          comentario?: string | null
          created_at?: string | null
          fecha?: string | null
          id_identificacion?: number
          responsable?: string | null
          taxon_nombre?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identificacion_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
        ]
      }
      manejo_ex_situ: {
        Row: {
          administracion_proyecto_recursos: string | null
          antecedente: string | null
          autor_foto_ex_situ: string | null
          cita: string | null
          comentarios: string | null
          dieta_nutricion: string | null
          diversidad_genetica: string | null
          enlace_plan_manejo: string | null
          fecha_actualizacion: string | null
          fotografia_ex_situ: string | null
          genetica_pie_parental: string | null
          historial_ficha: string | null
          id_manejo_ex_situ: number
          mantenimiento: string | null
          numero_adulto_hembra: number | null
          numero_adulto_macho: number | null
          numero_fundador_hembra: number | null
          numero_fundador_macho: number | null
          numero_fundador_nd: number | null
          numero_fundador_renacuajo: number | null
          numero_juvenil: number | null
          numero_renacuajo: number | null
          plan_manejo: string | null
          procedencia_habitat: string | null
          publicar: boolean
          reintroduccion: string | null
          reproduccion_comportamiento: string | null
          taxon_id: number
        }
        Insert: {
          administracion_proyecto_recursos?: string | null
          antecedente?: string | null
          autor_foto_ex_situ?: string | null
          cita?: string | null
          comentarios?: string | null
          dieta_nutricion?: string | null
          diversidad_genetica?: string | null
          enlace_plan_manejo?: string | null
          fecha_actualizacion?: string | null
          fotografia_ex_situ?: string | null
          genetica_pie_parental?: string | null
          historial_ficha?: string | null
          id_manejo_ex_situ?: number
          mantenimiento?: string | null
          numero_adulto_hembra?: number | null
          numero_adulto_macho?: number | null
          numero_fundador_hembra?: number | null
          numero_fundador_macho?: number | null
          numero_fundador_nd?: number | null
          numero_fundador_renacuajo?: number | null
          numero_juvenil?: number | null
          numero_renacuajo?: number | null
          plan_manejo?: string | null
          procedencia_habitat?: string | null
          publicar?: boolean
          reintroduccion?: string | null
          reproduccion_comportamiento?: string | null
          taxon_id: number
        }
        Update: {
          administracion_proyecto_recursos?: string | null
          antecedente?: string | null
          autor_foto_ex_situ?: string | null
          cita?: string | null
          comentarios?: string | null
          dieta_nutricion?: string | null
          diversidad_genetica?: string | null
          enlace_plan_manejo?: string | null
          fecha_actualizacion?: string | null
          fotografia_ex_situ?: string | null
          genetica_pie_parental?: string | null
          historial_ficha?: string | null
          id_manejo_ex_situ?: number
          mantenimiento?: string | null
          numero_adulto_hembra?: number | null
          numero_adulto_macho?: number | null
          numero_fundador_hembra?: number | null
          numero_fundador_macho?: number | null
          numero_fundador_nd?: number | null
          numero_fundador_renacuajo?: number | null
          numero_juvenil?: number | null
          numero_renacuajo?: number | null
          plan_manejo?: string | null
          procedencia_habitat?: string | null
          publicar?: boolean
          reintroduccion?: string | null
          reproduccion_comportamiento?: string | null
          taxon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      manejo_ex_situ_geopolitica: {
        Row: {
          geopolitica_id: number
          id_manejo_ex_situ_geopolitica: number
          manejo_ex_situ_id: number | null
          manejo_ex_situ_taxon_id: number
          microhabitat: string | null
        }
        Insert: {
          geopolitica_id: number
          id_manejo_ex_situ_geopolitica?: number
          manejo_ex_situ_id?: number | null
          manejo_ex_situ_taxon_id: number
          microhabitat?: string | null
        }
        Update: {
          geopolitica_id?: number
          id_manejo_ex_situ_geopolitica?: number
          manejo_ex_situ_id?: number | null
          manejo_ex_situ_taxon_id?: number
          microhabitat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_geopolitica_id_fkey"
            columns: ["geopolitica_id"]
            isOneToOne: false
            referencedRelation: "geopolitica"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_geopolitica_id_fkey"
            columns: ["geopolitica_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_localidades"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_fkey"
            columns: ["manejo_ex_situ_id", "manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "manejo_ex_situ"
            referencedColumns: ["id_manejo_ex_situ", "taxon_id"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey"
            columns: ["manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      manejo_ex_situ_protocolo: {
        Row: {
          catalogo_awe_id: number
          id_manejo_ex_situ_protocolo: number
          manejo_ex_situ_id: number
          manejo_ex_situ_taxon_id: number
          protocolo: string
        }
        Insert: {
          catalogo_awe_id: number
          id_manejo_ex_situ_protocolo?: number
          manejo_ex_situ_id: number
          manejo_ex_situ_taxon_id: number
          protocolo: string
        }
        Update: {
          catalogo_awe_id?: number
          id_manejo_ex_situ_protocolo?: number
          manejo_ex_situ_id?: number
          manejo_ex_situ_taxon_id?: number
          protocolo?: string
        }
        Relationships: [
          {
            foreignKeyName: "manejo_ex_situ_protocolo_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "manejo_ex_situ_protocolo_manejo_ex_situ_fkey"
            columns: ["manejo_ex_situ_id", "manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "manejo_ex_situ"
            referencedColumns: ["id_manejo_ex_situ", "taxon_id"]
          },
        ]
      }
      manejo_ex_situ_publicacion: {
        Row: {
          id_manejo_ex_situ_publicacion: number
          manejo_ex_situ_id: number
          manejo_ex_situ_taxon_id: number
          publicacion_id: number
        }
        Insert: {
          id_manejo_ex_situ_publicacion?: number
          manejo_ex_situ_id: number
          manejo_ex_situ_taxon_id: number
          publicacion_id: number
        }
        Update: {
          id_manejo_ex_situ_publicacion?: number
          manejo_ex_situ_id?: number
          manejo_ex_situ_taxon_id?: number
          publicacion_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "manejo_ex_situ_publicacion_manejo_ex_situ_fkey"
            columns: ["manejo_ex_situ_id", "manejo_ex_situ_taxon_id"]
            isOneToOne: false
            referencedRelation: "manejo_ex_situ"
            referencedColumns: ["id_manejo_ex_situ", "taxon_id"]
          },
          {
            foreignKeyName: "manejo_ex_situ_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "manejo_ex_situ_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "manejo_ex_situ_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "manejo_ex_situ_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "manejo_ex_situ_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "manejo_ex_situ_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
        ]
      }
      nombre_comun: {
        Row: {
          catalogo_awe_etnia_id: number | null
          catalogo_awe_idioma_id: number | null
          comentario: string | null
          id_nombre_comun: number
          nombre: string
          principal: boolean
          publicacion_id: number | null
          taxon_id: number | null
        }
        Insert: {
          catalogo_awe_etnia_id?: number | null
          catalogo_awe_idioma_id?: number | null
          comentario?: string | null
          id_nombre_comun?: number
          nombre: string
          principal: boolean
          publicacion_id?: number | null
          taxon_id?: number | null
        }
        Update: {
          catalogo_awe_etnia_id?: number | null
          catalogo_awe_idioma_id?: number | null
          comentario?: string | null
          id_nombre_comun?: number
          nombre?: string
          principal?: boolean
          publicacion_id?: number | null
          taxon_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nombre_comun_catalogo_awe_etnia_id_fkey"
            columns: ["catalogo_awe_etnia_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "nombre_comun_catalogo_awe_idioma_id_fkey"
            columns: ["catalogo_awe_idioma_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "nombre_comun_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      nombre_comun_vernaculo: {
        Row: {
          catalogo_awe_idioma_id: number | null
          id: number
          nombre: string
          publicacion_id: number | null
          taxon_id: number | null
        }
        Insert: {
          catalogo_awe_idioma_id?: number | null
          id?: number
          nombre: string
          publicacion_id?: number | null
          taxon_id?: number | null
        }
        Update: {
          catalogo_awe_idioma_id?: number | null
          id?: number
          nombre?: string
          publicacion_id?: number | null
          taxon_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nombre_comun_vernaculo_catalogo_awe_idioma_id_fkey"
            columns: ["catalogo_awe_idioma_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "nombre_comun_vernaculo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      nombre_renacuajos: {
        Row: {
          catalogo_awe_idioma_id: number | null
          id: number
          nombre: string
          publicacion_id: number | null
        }
        Insert: {
          catalogo_awe_idioma_id?: number | null
          id?: number
          nombre: string
          publicacion_id?: number | null
        }
        Update: {
          catalogo_awe_idioma_id?: number | null
          id?: number
          nombre?: string
          publicacion_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nombre_renacuajos_catalogo_awe_idioma_id_fkey"
            columns: ["catalogo_awe_idioma_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "nombre_renacuajos_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_renacuajos_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_renacuajos_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_renacuajos_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_renacuajos_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "nombre_renacuajos_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
        ]
      }
      permisocontrato: {
        Row: {
          created_at: string | null
          estado: string | null
          fecha_fin: string | null
          fecha_ini: string | null
          id_permisocontrato: number
          npicmpf: string | null
          observacion: string | null
          tipo_autorizacion: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_ini?: string | null
          id_permisocontrato: number
          npicmpf?: string | null
          observacion?: string | null
          tipo_autorizacion?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_ini?: string | null
          id_permisocontrato?: number
          npicmpf?: string | null
          observacion?: string | null
          tipo_autorizacion?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      personal: {
        Row: {
          cargo: string | null
          created_at: string | null
          email: string | null
          especialista: boolean | null
          id_personal: number
          identificacion: string | null
          institucion: string | null
          nombre: string
          paginaweb: string | null
          siglas: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          especialista?: boolean | null
          id_personal: number
          identificacion?: string | null
          institucion?: string | null
          nombre: string
          paginaweb?: string | null
          siglas?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          especialista?: boolean | null
          id_personal?: number
          identificacion?: string | null
          institucion?: string | null
          nombre?: string
          paginaweb?: string | null
          siglas?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      personal_autor: {
        Row: {
          autor_id: number
          id_personal_autor: number
          personal_id: number
        }
        Insert: {
          autor_id: number
          id_personal_autor?: number
          personal_id: number
        }
        Update: {
          autor_id?: number
          id_personal_autor?: number
          personal_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_autor_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "autor"
            referencedColumns: ["id_autor"]
          },
          {
            foreignKeyName: "personal_autor_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "vw_autor"
            referencedColumns: ["id_autor"]
          },
          {
            foreignKeyName: "personal_autor_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id_personal"]
          },
        ]
      }
      personal_publicacion: {
        Row: {
          borrado: boolean
          id_personal_publicacion: number
          personal_id: number
          publicacion_id: number
          publicar: boolean
        }
        Insert: {
          borrado?: boolean
          id_personal_publicacion?: number
          personal_id: number
          publicacion_id: number
          publicar?: boolean
        }
        Update: {
          borrado?: boolean
          id_personal_publicacion?: number
          personal_id?: number
          publicacion_id?: number
          publicar?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "personal_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "personal_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "personal_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "personal_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "personal_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "personal_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
        ]
      }
      prestamo: {
        Row: {
          beneficiario: string | null
          cargo: string | null
          created_at: string | null
          email: string | null
          estado: string | null
          fecha_devolucion: string | null
          fecha_prestamo: string | null
          id_prestamo: number
          institucion: string | null
          material: string | null
          numero_prestamo: string | null
          observacion: string | null
          personal_id: number | null
          telefono: string | null
          tipo_prestamo_id: number | null
          updated_at: string | null
          web: string | null
        }
        Insert: {
          beneficiario?: string | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          estado?: string | null
          fecha_devolucion?: string | null
          fecha_prestamo?: string | null
          id_prestamo: number
          institucion?: string | null
          material?: string | null
          numero_prestamo?: string | null
          observacion?: string | null
          personal_id?: number | null
          telefono?: string | null
          tipo_prestamo_id?: number | null
          updated_at?: string | null
          web?: string | null
        }
        Update: {
          beneficiario?: string | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          estado?: string | null
          fecha_devolucion?: string | null
          fecha_prestamo?: string | null
          id_prestamo?: number
          institucion?: string | null
          material?: string | null
          numero_prestamo?: string | null
          observacion?: string | null
          personal_id?: number | null
          telefono?: string | null
          tipo_prestamo_id?: number | null
          updated_at?: string | null
          web?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prestamo_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id_personal"]
          },
          {
            foreignKeyName: "prestamo_tipo_prestamo_id_fkey"
            columns: ["tipo_prestamo_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
        ]
      }
      prestamocoleccion: {
        Row: {
          coleccion_id: number
          created_at: string | null
          estado: boolean | null
          id_prestamocoleccion: number
          observacion: string | null
          permisocontrato_id: number | null
          prestamo_id: number
          updated_at: string | null
        }
        Insert: {
          coleccion_id: number
          created_at?: string | null
          estado?: boolean | null
          id_prestamocoleccion: number
          observacion?: string | null
          permisocontrato_id?: number | null
          prestamo_id: number
          updated_at?: string | null
        }
        Update: {
          coleccion_id?: number
          created_at?: string | null
          estado?: boolean | null
          id_prestamocoleccion?: number
          observacion?: string | null
          permisocontrato_id?: number | null
          prestamo_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prestamocoleccion_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
          {
            foreignKeyName: "prestamocoleccion_permisocontrato_id_fkey"
            columns: ["permisocontrato_id"]
            isOneToOne: false
            referencedRelation: "permisocontrato"
            referencedColumns: ["id_permisocontrato"]
          },
          {
            foreignKeyName: "prestamocoleccion_prestamo_id_fkey"
            columns: ["prestamo_id"]
            isOneToOne: false
            referencedRelation: "prestamo"
            referencedColumns: ["id_prestamo"]
          },
        ]
      }
      prestamotejido: {
        Row: {
          created_at: string | null
          id_prestamotejido: number
          observacion: string | null
          permisocontrato_id: number | null
          prestamo_id: number
          tejido_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id_prestamotejido: number
          observacion?: string | null
          permisocontrato_id?: number | null
          prestamo_id: number
          tejido_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id_prestamotejido?: number
          observacion?: string | null
          permisocontrato_id?: number | null
          prestamo_id?: number
          tejido_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prestamotejido_permisocontrato_id_fkey"
            columns: ["permisocontrato_id"]
            isOneToOne: false
            referencedRelation: "permisocontrato"
            referencedColumns: ["id_permisocontrato"]
          },
          {
            foreignKeyName: "prestamotejido_prestamo_id_fkey"
            columns: ["prestamo_id"]
            isOneToOne: false
            referencedRelation: "prestamo"
            referencedColumns: ["id_prestamo"]
          },
          {
            foreignKeyName: "prestamotejido_tejido_id_fkey"
            columns: ["tejido_id"]
            isOneToOne: false
            referencedRelation: "tejido"
            referencedColumns: ["id_tejido"]
          },
        ]
      }
      publicacion: {
        Row: {
          anfibios_ecuador: boolean | null
          cita: string | null
          cita_corta: string | null
          cita_larga: string | null
          contador_citas: number | null
          editor: boolean
          editorial: string | null
          fecha: string
          formato_impreso: boolean | null
          id_publicacion: number
          indexada: boolean | null
          justificacion: string | null
          noticia: boolean
          numero: string | null
          numero_publicacion_ano: number | null
          observaciones: string | null
          pagina: string | null
          palabras_clave: string | null
          rel_conservacion: boolean
          rel_ecologia: boolean
          rel_evolucion: boolean
          rel_taxonomia: boolean
          resumen: string | null
          titulo: string
          titulo_secundario: string | null
          volumen: string | null
        }
        Insert: {
          anfibios_ecuador?: boolean | null
          cita?: string | null
          cita_corta?: string | null
          cita_larga?: string | null
          contador_citas?: number | null
          editor?: boolean
          editorial?: string | null
          fecha: string
          formato_impreso?: boolean | null
          id_publicacion?: number
          indexada?: boolean | null
          justificacion?: string | null
          noticia?: boolean
          numero?: string | null
          numero_publicacion_ano?: number | null
          observaciones?: string | null
          pagina?: string | null
          palabras_clave?: string | null
          rel_conservacion?: boolean
          rel_ecologia?: boolean
          rel_evolucion?: boolean
          rel_taxonomia?: boolean
          resumen?: string | null
          titulo: string
          titulo_secundario?: string | null
          volumen?: string | null
        }
        Update: {
          anfibios_ecuador?: boolean | null
          cita?: string | null
          cita_corta?: string | null
          cita_larga?: string | null
          contador_citas?: number | null
          editor?: boolean
          editorial?: string | null
          fecha?: string
          formato_impreso?: boolean | null
          id_publicacion?: number
          indexada?: boolean | null
          justificacion?: string | null
          noticia?: boolean
          numero?: string | null
          numero_publicacion_ano?: number | null
          observaciones?: string | null
          pagina?: string | null
          palabras_clave?: string | null
          rel_conservacion?: boolean
          rel_ecologia?: boolean
          rel_evolucion?: boolean
          rel_taxonomia?: boolean
          resumen?: string | null
          titulo?: string
          titulo_secundario?: string | null
          volumen?: string | null
        }
        Relationships: []
      }
      publicacion_ano: {
        Row: {
          ano: number
          id_publicacion_ano: number
          publicacion_id: number
        }
        Insert: {
          ano: number
          id_publicacion_ano?: number
          publicacion_id: number
        }
        Update: {
          ano?: number
          id_publicacion_ano?: number
          publicacion_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "publicacion_ano_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_ano_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_ano_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_ano_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_ano_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_ano_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
        ]
      }
      publicacion_autor: {
        Row: {
          autor_id: number
          id_publicacion_autor: number
          orden_autor: number
          publicacion_id: number
        }
        Insert: {
          autor_id: number
          id_publicacion_autor?: number
          orden_autor?: number
          publicacion_id: number
        }
        Update: {
          autor_id?: number
          id_publicacion_autor?: number
          orden_autor?: number
          publicacion_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "publicacion_autor_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "autor"
            referencedColumns: ["id_autor"]
          },
          {
            foreignKeyName: "publicacion_autor_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "vw_autor"
            referencedColumns: ["id_autor"]
          },
          {
            foreignKeyName: "publicacion_autor_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_autor_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_autor_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_autor_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_autor_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_autor_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
        ]
      }
      publicacion_catalogo_awe: {
        Row: {
          catalogo_publicaciones_id: number | null
          id_publicacion_catalogo_awe: number
          publicacion_id: number
        }
        Insert: {
          catalogo_publicaciones_id?: number | null
          id_publicacion_catalogo_awe?: number
          publicacion_id: number
        }
        Update: {
          catalogo_publicaciones_id?: number | null
          id_publicacion_catalogo_awe?: number
          publicacion_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "publicacion_catalogo_awe_catalogo_publicaciones_id_fkey"
            columns: ["catalogo_publicaciones_id"]
            isOneToOne: false
            referencedRelation: "catalogo_publicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
        ]
      }
      publicacion_enlace: {
        Row: {
          enlace: string
          exclusivo_cj: boolean
          id_publicacion_enlace: number
          publicacion_id: number
          texto_enlace: string
        }
        Insert: {
          enlace: string
          exclusivo_cj?: boolean
          id_publicacion_enlace?: number
          publicacion_id: number
          texto_enlace: string
        }
        Update: {
          enlace?: string
          exclusivo_cj?: boolean
          id_publicacion_enlace?: number
          publicacion_id?: number
          texto_enlace?: string
        }
        Relationships: [
          {
            foreignKeyName: "publicacion_enlace_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_enlace_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_enlace_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_enlace_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_enlace_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_enlace_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
        ]
      }
      rank: {
        Row: {
          id_rank: number
          orden: number
          rank: string
          rank_ingles: string | null
        }
        Insert: {
          id_rank?: number
          orden: number
          rank: string
          rank_ingles?: string | null
        }
        Update: {
          id_rank?: number
          orden?: number
          rank?: string
          rank_ingles?: string | null
        }
        Relationships: []
      }
      rank_geopolitica: {
        Row: {
          id_rank_geopolitica: number
          nombre: string
          orden: number
        }
        Insert: {
          id_rank_geopolitica?: number
          nombre: string
          orden: number
        }
        Update: {
          id_rank_geopolitica?: number
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      salida: {
        Row: {
          created_at: string | null
          detalle: string | null
          fecha_fin: string | null
          fecha_ini: string | null
          id_salida: number
          inversion: number | null
          inversion_por_dia: number | null
          nombre: string
          numero_dias: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          detalle?: string | null
          fecha_fin?: string | null
          fecha_ini?: string | null
          id_salida: number
          inversion?: number | null
          inversion_por_dia?: number | null
          nombre: string
          numero_dias?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          detalle?: string | null
          fecha_fin?: string | null
          fecha_ini?: string | null
          id_salida?: number
          inversion?: number | null
          inversion_por_dia?: number | null
          nombre?: string
          numero_dias?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      slide: {
        Row: {
          fecha: string | null
          id: number
          localidad: string | null
          nombre_fotografo: string | null
          numero_campo: string | null
          numero_museo: string | null
          numero_slide: number | null
          observaciones: string | null
          otros_datos: string | null
          taxon_id: number | null
          tipo_foto: string | null
        }
        Insert: {
          fecha?: string | null
          id?: number
          localidad?: string | null
          nombre_fotografo?: string | null
          numero_campo?: string | null
          numero_museo?: string | null
          numero_slide?: number | null
          observaciones?: string | null
          otros_datos?: string | null
          taxon_id?: number | null
          tipo_foto?: string | null
        }
        Update: {
          fecha?: string | null
          id?: number
          localidad?: string | null
          nombre_fotografo?: string | null
          numero_campo?: string | null
          numero_museo?: string | null
          numero_slide?: number | null
          observaciones?: string | null
          otros_datos?: string | null
          taxon_id?: number | null
          tipo_foto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "slide_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      taxon: {
        Row: {
          autor_ano: string | null
          en_ecuador: boolean
          endemica: boolean
          eol: boolean | null
          id_taxon: number
          id_taxon_correcto: number | null
          nombre_aceptado: boolean
          nombre_comun: string | null
          nombre_original: boolean
          publicacion: string | null
          rank_id: number | null
          sinonimo: boolean
          taxon: string
          taxon_id: number | null
        }
        Insert: {
          autor_ano?: string | null
          en_ecuador?: boolean
          endemica?: boolean
          eol?: boolean | null
          id_taxon?: number
          id_taxon_correcto?: number | null
          nombre_aceptado?: boolean
          nombre_comun?: string | null
          nombre_original?: boolean
          publicacion?: string | null
          rank_id?: number | null
          sinonimo?: boolean
          taxon: string
          taxon_id?: number | null
        }
        Update: {
          autor_ano?: string | null
          en_ecuador?: boolean
          endemica?: boolean
          eol?: boolean | null
          id_taxon?: number
          id_taxon_correcto?: number | null
          nombre_aceptado?: boolean
          nombre_comun?: string | null
          nombre_original?: boolean
          publicacion?: string | null
          rank_id?: number | null
          sinonimo?: boolean
          taxon?: string
          taxon_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "rank"
            referencedColumns: ["id_rank"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      taxon_catalogo_awe: {
        Row: {
          catalogo_awe_id: number
          id_taxon_catalogo_awe: number
          observación: string | null
          taxon_id: number
        }
        Insert: {
          catalogo_awe_id: number
          id_taxon_catalogo_awe?: number
          observación?: string | null
          taxon_id: number
        }
        Update: {
          catalogo_awe_id?: number
          id_taxon_catalogo_awe?: number
          observación?: string | null
          taxon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      taxon_geopolitica: {
        Row: {
          geopolitica_id: number
          id_taxon_geopolitica: number
          principal: boolean
          taxon_id: number
        }
        Insert: {
          geopolitica_id: number
          id_taxon_geopolitica?: number
          principal?: boolean
          taxon_id: number
        }
        Update: {
          geopolitica_id?: number
          id_taxon_geopolitica?: number
          principal?: boolean
          taxon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "taxon_geopolitica_geopolitica_id_fkey"
            columns: ["geopolitica_id"]
            isOneToOne: false
            referencedRelation: "geopolitica"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "taxon_geopolitica_geopolitica_id_fkey"
            columns: ["geopolitica_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_localidades"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      taxon_publicacion: {
        Row: {
          id_taxon_publicacion: number
          principal: boolean
          publicacion_id: number
          referencia_clave: boolean | null
          svl_hembra: boolean
          svl_macho: boolean
          taxon_id: number
          tema: string | null
        }
        Insert: {
          id_taxon_publicacion?: number
          principal?: boolean
          publicacion_id: number
          referencia_clave?: boolean | null
          svl_hembra?: boolean
          svl_macho?: boolean
          taxon_id: number
          tema?: string | null
        }
        Update: {
          id_taxon_publicacion?: number
          principal?: boolean
          publicacion_id?: number
          referencia_clave?: boolean | null
          svl_hembra?: boolean
          svl_macho?: boolean
          taxon_id?: number
          tema?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      esperma: {
        Row: {
          caja: string | null
          codesperma: string | null
          coleccion_id: number
          coordenada: string | null
          created_at: string | null
          estatus: string | null
          fecha: string | null
          id_esperma: number
          observacion: string | null
          permisocontrato_id: number | null
          piso: string | null
          preservacion: string | null
          rack: string | null
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          caja?: string | null
          codesperma?: string | null
          coleccion_id: number
          coordenada?: string | null
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_esperma?: number
          observacion?: string | null
          permisocontrato_id?: number | null
          piso?: string | null
          preservacion?: string | null
          rack?: string | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          caja?: string | null
          codesperma?: string | null
          coleccion_id?: number
          coordenada?: string | null
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_esperma?: number
          observacion?: string | null
          permisocontrato_id?: number | null
          piso?: string | null
          preservacion?: string | null
          rack?: string | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esperma_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
          {
            foreignKeyName: "esperma_permisocontrato_id_fkey"
            columns: ["permisocontrato_id"]
            isOneToOne: false
            referencedRelation: "permisocontrato"
            referencedColumns: ["id_permisocontrato"]
          },
        ]
      }
      heces: {
        Row: {
          caja: string | null
          codheces: string | null
          coleccion_id: number
          coordenada: string | null
          created_at: string | null
          estatus: string | null
          fecha: string | null
          id_heces: number
          observacion: string | null
          permisocontrato_id: number | null
          piso: string | null
          preservacion: string | null
          rack: string | null
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          caja?: string | null
          codheces?: string | null
          coleccion_id: number
          coordenada?: string | null
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_heces?: number
          observacion?: string | null
          permisocontrato_id?: number | null
          piso?: string | null
          preservacion?: string | null
          rack?: string | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          caja?: string | null
          codheces?: string | null
          coleccion_id?: number
          coordenada?: string | null
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_heces?: number
          observacion?: string | null
          permisocontrato_id?: number | null
          piso?: string | null
          preservacion?: string | null
          rack?: string | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "heces_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
          {
            foreignKeyName: "heces_permisocontrato_id_fkey"
            columns: ["permisocontrato_id"]
            isOneToOne: false
            referencedRelation: "permisocontrato"
            referencedColumns: ["id_permisocontrato"]
          },
        ]
      }
      extracto_piel: {
        Row: {
          caja: string | null
          codextracto_piel: string | null
          coleccion_id: number
          coordenada: string | null
          created_at: string | null
          estatus: string | null
          fecha: string | null
          id_extracto_piel: number
          observacion: string | null
          permisocontrato_id: number | null
          piso: string | null
          preservacion: string | null
          rack: string | null
          tipo_extracto_piel_id: number | null
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          caja?: string | null
          codextracto_piel?: string | null
          coleccion_id: number
          coordenada?: string | null
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_extracto_piel?: number
          observacion?: string | null
          permisocontrato_id?: number | null
          piso?: string | null
          preservacion?: string | null
          rack?: string | null
          tipo_extracto_piel_id?: number | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          caja?: string | null
          codextracto_piel?: string | null
          coleccion_id?: number
          coordenada?: string | null
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_extracto_piel?: number
          observacion?: string | null
          permisocontrato_id?: number | null
          piso?: string | null
          preservacion?: string | null
          rack?: string | null
          tipo_extracto_piel_id?: number | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracto_piel_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
          {
            foreignKeyName: "extracto_piel_permisocontrato_id_fkey"
            columns: ["permisocontrato_id"]
            isOneToOne: false
            referencedRelation: "permisocontrato"
            referencedColumns: ["id_permisocontrato"]
          },
          {
            foreignKeyName: "extracto_piel_tipo_extracto_piel_id_fkey"
            columns: ["tipo_extracto_piel_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
        ]
      }
      secuencia: {
        Row: {
          caja: string | null
          codsecuencia: string | null
          coleccion_id: number
          coordenada: string | null
          created_at: string | null
          estatus: string | null
          fecha: string | null
          id_secuencia: number
          observacion: string | null
          permisocontrato_id: number | null
          piso: string | null
          preservacion: string | null
          rack: string | null
          tipo_secuencia_id: number | null
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          caja?: string | null
          codsecuencia?: string | null
          coleccion_id: number
          coordenada?: string | null
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_secuencia?: number
          observacion?: string | null
          permisocontrato_id?: number | null
          piso?: string | null
          preservacion?: string | null
          rack?: string | null
          tipo_secuencia_id?: number | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          caja?: string | null
          codsecuencia?: string | null
          coleccion_id?: number
          coordenada?: string | null
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_secuencia?: number
          observacion?: string | null
          permisocontrato_id?: number | null
          piso?: string | null
          preservacion?: string | null
          rack?: string | null
          tipo_secuencia_id?: number | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secuencia_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
          {
            foreignKeyName: "secuencia_permisocontrato_id_fkey"
            columns: ["permisocontrato_id"]
            isOneToOne: false
            referencedRelation: "permisocontrato"
            referencedColumns: ["id_permisocontrato"]
          },
          {
            foreignKeyName: "secuencia_tipo_secuencia_id_fkey"
            columns: ["tipo_secuencia_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
        ]
      }
      swabs: {
        Row: {
          caja: string | null
          codswab: string | null
          coleccion_id: number
          created_at: string | null
          estatus: string | null
          fecha: string | null
          id_swab: number
          jaula: string | null
          observacion: string | null
          permisocontrato_id: number | null
          preservante: string | null
          tipo_swab_id: number | null
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          caja?: string | null
          codswab?: string | null
          coleccion_id: number
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_swab?: number
          jaula?: string | null
          observacion?: string | null
          permisocontrato_id?: number | null
          preservante?: string | null
          tipo_swab_id?: number | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          caja?: string | null
          codswab?: string | null
          coleccion_id?: number
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_swab?: number
          jaula?: string | null
          observacion?: string | null
          permisocontrato_id?: number | null
          preservante?: string | null
          tipo_swab_id?: number | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swabs_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
          {
            foreignKeyName: "swabs_permisocontrato_id_fkey"
            columns: ["permisocontrato_id"]
            isOneToOne: false
            referencedRelation: "permisocontrato"
            referencedColumns: ["id_permisocontrato"]
          },
          {
            foreignKeyName: "swabs_tipo_swab_id_fkey"
            columns: ["tipo_swab_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
        ]
      }
      tejido: {
        Row: {
          caja: string | null
          codtejido: string | null
          coleccion_id: number
          coordenada: string | null
          created_at: string | null
          estatus: string | null
          fecha: string | null
          id_tejido: number
          observacion: string | null
          permisocontrato_id: number | null
          piso: string | null
          preservacion: string | null
          rack: string | null
          tipo_tejido_id: number | null
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          caja?: string | null
          codtejido?: string | null
          coleccion_id: number
          coordenada?: string | null
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_tejido: number
          observacion?: string | null
          permisocontrato_id?: number | null
          piso?: string | null
          preservacion?: string | null
          rack?: string | null
          tipo_tejido_id?: number | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          caja?: string | null
          codtejido?: string | null
          coleccion_id?: number
          coordenada?: string | null
          created_at?: string | null
          estatus?: string | null
          fecha?: string | null
          id_tejido?: number
          observacion?: string | null
          permisocontrato_id?: number | null
          piso?: string | null
          preservacion?: string | null
          rack?: string | null
          tipo_tejido_id?: number | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tejido_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
          {
            foreignKeyName: "tejido_permisocontrato_id_fkey"
            columns: ["permisocontrato_id"]
            isOneToOne: false
            referencedRelation: "permisocontrato"
            referencedColumns: ["id_permisocontrato"]
          },
          {
            foreignKeyName: "tejido_tipo_tejido_id_fkey"
            columns: ["tipo_tejido_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
        ]
      }
      tipo: {
        Row: {
          catalogo_awe_id: number
          comentario: string | null
          geopolitica_id: number | null
          id_tipo: number
          medidas: string | null
          numero_museo: string
          principal: boolean
          publicacion_id: number | null
          taxon_id: number
        }
        Insert: {
          catalogo_awe_id: number
          comentario?: string | null
          geopolitica_id?: number | null
          id_tipo?: number
          medidas?: string | null
          numero_museo: string
          principal?: boolean
          publicacion_id?: number | null
          taxon_id: number
        }
        Update: {
          catalogo_awe_id?: number
          comentario?: string | null
          geopolitica_id?: number | null
          id_tipo?: number
          medidas?: string | null
          numero_museo?: string
          principal?: boolean
          publicacion_id?: number | null
          taxon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tipo_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "tipo_geopolitica_id_fkey"
            columns: ["geopolitica_id"]
            isOneToOne: false
            referencedRelation: "geopolitica"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "tipo_geopolitica_id_fkey"
            columns: ["geopolitica_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_localidades"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "tipo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "tipo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "tipo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "tipo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "tipo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "tipo_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      tipo_catalogo_awe: {
        Row: {
          descripcion: string | null
          id_tipo_catalogo_awe: number
          nombre: string
        }
        Insert: {
          descripcion?: string | null
          id_tipo_catalogo_awe?: number
          nombre: string
        }
        Update: {
          descripcion?: string | null
          id_tipo_catalogo_awe?: number
          nombre?: string
        }
        Relationships: []
      }
      video: {
        Row: {
          autor: string | null
          catalogo_awe_id: number | null
          coleccion_externa_id: number | null
          coleccion_id: number | null
          descripcion: string | null
          enlace: string
          id_video: number
          nombre: string
          numero_museo: string | null
          publicar: boolean | null
          taxon_id: number
          thumbnail: string | null
        }
        Insert: {
          autor?: string | null
          catalogo_awe_id?: number | null
          coleccion_externa_id?: number | null
          coleccion_id?: number | null
          descripcion?: string | null
          enlace?: string
          id_video?: number
          nombre?: string
          numero_museo?: string | null
          publicar?: boolean | null
          taxon_id: number
          thumbnail?: string | null
        }
        Update: {
          autor?: string | null
          catalogo_awe_id?: number | null
          coleccion_externa_id?: number | null
          coleccion_id?: number | null
          descripcion?: string | null
          enlace?: string
          id_video?: number
          nombre?: string
          numero_museo?: string | null
          publicar?: boolean | null
          taxon_id?: number
          thumbnail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "video_coleccion_externa_id_fkey"
            columns: ["coleccion_externa_id"]
            isOneToOne: false
            referencedRelation: "coleccion_externa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "coleccion"
            referencedColumns: ["id_coleccion"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "video_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      z_alumno: {
        Row: {
          altura: number | null
          created_at: string
          edad: number | null
          fecha: string | null
          hombre: boolean | null
          id: number
          nombre: string | null
        }
        Insert: {
          altura?: number | null
          created_at?: string
          edad?: number | null
          fecha?: string | null
          hombre?: boolean | null
          id?: number
          nombre?: string | null
        }
        Update: {
          altura?: number | null
          created_at?: string
          edad?: number | null
          fecha?: string | null
          hombre?: boolean | null
          id?: number
          nombre?: string | null
        }
        Relationships: []
      }
      z_padres: {
        Row: {
          created_at: string
          id: number
          id_alumno: number | null
          nombre: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_alumno?: number | null
          nombre?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          id_alumno?: number | null
          nombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "z_padres_id_alumno_fkey"
            columns: ["id_alumno"]
            isOneToOne: false
            referencedRelation: "z_alumno"
            referencedColumns: ["id"]
          },
        ]
      }
      z_telefono: {
        Row: {
          created_at: string
          id: number
          id_alumno: number | null
          numero: string | null
          principal: boolean | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_alumno?: number | null
          numero?: string | null
          principal?: boolean | null
        }
        Update: {
          created_at?: string
          id?: number
          id_alumno?: number | null
          numero?: string | null
          principal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "telefono_id_alumno_fkey"
            columns: ["id_alumno"]
            isOneToOne: false
            referencedRelation: "z_alumno"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mv_colecciones_mapa: {
        Row: {
          catalogo_museo: string | null
          cita_corta: string | null
          colectores: string | null
          elevacion: number | null
          fecha_coleccion: string | null
          id_coleccion: number | null
          latitud: number | null
          localidad: string | null
          longitud: number | null
          nombre_especie: string | null
          numero_museo: string | null
          origen: string | null
          provincia: string | null
          rank_id: number | null
          row_id: number | null
          taxon_id: number | null
        }
        Relationships: []
      }
      mv_mapoteca_catalogos_busqueda: {
        Row: {
          catalogo_museo: string | null
          numero_museo: string | null
        }
        Relationships: []
      }
      mv_mapoteca_especies_busqueda: {
        Row: {
          endemica: boolean | null
          familia: string | null
          genero: string | null
          lista_roja_nombre: string | null
          nombre_comun: string | null
          nombre_especie: string | null
          taxon_id: number | null
        }
        Relationships: []
      }
      mv_mapoteca_localidades_busqueda: {
        Row: {
          localidad: string | null
        }
        Relationships: []
      }
      mv_sapoteca_stats: {
        Row: {
          publicaciones_anio_actual: number | null
          total_cientificas: number | null
          total_conservacion: number | null
          total_divulgacion: number | null
          total_ecologia: number | null
          total_evolucion: number | null
          total_indexadas: number | null
          total_no_indexadas: number | null
          total_taxonomia: number | null
          total_ultima_decada: number | null
        }
        Relationships: []
      }
      vw_autor: {
        Row: {
          apellidos: string | null
          enlace_biografia: string | null
          id_autor: number | null
          nombre_completo: string | null
          nombres: string | null
        }
        Insert: {
          apellidos?: string | null
          enlace_biografia?: string | null
          id_autor?: number | null
          nombre_completo?: never
          nombres?: string | null
        }
        Update: {
          apellidos?: string | null
          enlace_biografia?: string | null
          id_autor?: number | null
          nombre_completo?: never
          nombres?: string | null
        }
        Relationships: []
      }
      vw_colecciones: {
        Row: {
          catalogo_museo: string | null
          cita_corta: string | null
          colectores: string | null
          elevacion: number | null
          fecha_coleccion: string | null
          id_coleccion: number | null
          latitud: number | null
          localidad: string | null
          longitud: number | null
          nombre_especie: string | null
          numero_museo: string | null
          origen: string | null
          provincia: string | null
          rank_id: number | null
          taxon_id: number | null
        }
        Relationships: []
      }
      vw_ficha_especie_completa: {
        Row: {
          area_distribucion: number | null
          awe_areas_protegidas_estado: string | null
          awe_areas_protegidas_privadas: string | null
          awe_bosques_protegidos: string | null
          awe_cites: string | null
          awe_distribucion_altitudinal: string | null
          awe_ecosistemas: string | null
          awe_estadio_animal: string | null
          awe_estatus_nombre_cientifico: string | null
          awe_estatus_tipologico: string | null
          awe_etnia: string | null
          awe_idioma: string | null
          awe_lista_roja_coloma: string | null
          awe_lista_roja_uicn: string | null
          awe_regiones_biogeograficas: string | null
          awe_regiones_biogeograficas_detalle: string | null
          awe_reservas_biosfera: string | null
          awe_tipo_generacional: string | null
          clase: string | null
          distribucion: string | null
          distribucion_global: string | null
          en_ecuador: boolean | null
          endemica: boolean | null
          especie: string | null
          especie_autor: string | null
          especie_taxon_id: number | null
          familia: string | null
          fuente_lista_roja: string | null
          genero: string | null
          id_ficha_especie: number | null
          nombre_cientifico: string | null
          nombre_comun: string | null
          observacion_zona_altitudinal: string | null
          orden: string | null
          phylum: string | null
          pluviocidad: number | null
          publicar: boolean | null
          rango_altitudinal: string | null
          rango_altitudinal_max: number | null
          rango_altitudinal_min: number | null
          referencia_area_protegida: string | null
          reino: string | null
          temperatura: number | null
          ubicaciones_geopoliticas: string | null
          ubicaciones_principales: string | null
          ultimo_avistamiento: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey"
            columns: ["especie_taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_ficha_especie_conservacion: {
        Row: {
          autor_ano: string | null
          colector: string | null
          en_ecuador: boolean | null
          endemica: boolean | null
          especie: string | null
          etimologia: string | null
          genero: string | null
          habitat_biologia: string | null
          id_ficha_especie: number | null
          id_genero: number | null
          id_taxon: number | null
          nombre_cientifico: string | null
          nombre_comun: string | null
          taxonomia: string | null
        }
        Relationships: []
      }
      vw_ficha_especie_investigacion: {
        Row: {
          autor_ano: string | null
          colector: string | null
          en_ecuador: boolean | null
          endemica: boolean | null
          especie: string | null
          etimologia: string | null
          genero: string | null
          habitat_biologia: string | null
          id_ficha_especie: number | null
          id_genero: number | null
          id_taxon: number | null
          nombre_cientifico: string | null
          nombre_comun: string | null
          taxonomia: string | null
        }
        Relationships: []
      }
      vw_lista_especies: {
        Row: {
          autor_ano: string | null
          en_ecuador: boolean | null
          endemica: boolean | null
          eol: boolean | null
          especie: string | null
          genero: string | null
          id_genero: number | null
          id_taxon: number | null
          id_taxon_correcto: number | null
          id_taxon_padre: number | null
          nombre_aceptado: boolean | null
          nombre_cientifico: string | null
          nombre_comun: string | null
          nombre_original: boolean | null
          publicacion: string | null
          rank_id: number | null
          sinonimo: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "rank"
            referencedColumns: ["id_rank"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_lista_especies_alejandro_arteaga: {
        Row: {
          autor_ano: string | null
          en_ecuador: boolean | null
          endemica: boolean | null
          especie: string | null
          genero: string | null
          id_taxon: number | null
          id_taxon_correcto: number | null
          id_taxon_padre: number | null
          nombre_cientifico: string | null
          nombre_comun: string | null
          publicacion: string | null
          rank_id: number | null
          sinonimo: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "rank"
            referencedColumns: ["id_rank"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_lista_especies_george_fletcher: {
        Row: {
          autor_ano: string | null
          en_ecuador: boolean | null
          endemica: boolean | null
          especie: string | null
          genero: string | null
          id_taxon: number | null
          id_taxon_correcto: number | null
          id_taxon_padre: number | null
          nombre_cientifico: string | null
          nombre_comun: string | null
          publicacion: string | null
          rank_id: number | null
          sinonimo: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "rank"
            referencedColumns: ["id_rank"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_lista_especies_jmg: {
        Row: {
          autor_ano: string | null
          en_ecuador: boolean | null
          endemica: boolean | null
          especie: string | null
          genero: string | null
          id_taxon: number | null
          id_taxon_correcto: number | null
          id_taxon_padre: number | null
          nombre_cientifico: string | null
          nombre_comun: string | null
          publicacion: string | null
          rank_id: number | null
          sinonimo: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "rank"
            referencedColumns: ["id_rank"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey"
            columns: ["id_taxon_padre"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_lista_familias: {
        Row: {
          autor_ano: string | null
          en_ecuador: boolean | null
          endemica: boolean | null
          familia: string | null
          id_familia: number | null
          id_orden: number | null
          id_taxon_correcto: number | null
          nombre_aceptado: boolean | null
          nombre_comun: string | null
          nombre_original: boolean | null
          orden: string | null
          publicacion: string | null
          rank: string | null
          rank_id: number | null
          sinonimo: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "rank"
            referencedColumns: ["id_rank"]
          },
        ]
      }
      vw_lista_generos: {
        Row: {
          autor_ano: string | null
          en_ecuador: boolean | null
          endemica: boolean | null
          familia: string | null
          genero: string | null
          id_familia: number | null
          id_genero: number | null
          id_orden: number | null
          id_taxon_correcto: number | null
          nombre_aceptado: boolean | null
          nombre_comun: string | null
          nombre_comun_familia: string | null
          nombre_original: boolean | null
          orden: string | null
          publicacion: string | null
          rank: string | null
          rank_id: number | null
          sinonimo: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "rank"
            referencedColumns: ["id_rank"]
          },
        ]
      }
      vw_lista_localidades: {
        Row: {
          geopolitica_id: number | null
          id_geopolitica: number | null
          nombre: string | null
          nombre_corto: string | null
          rank_geopolitica_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "geopolitica_geopolitica_id_fkey"
            columns: ["geopolitica_id"]
            isOneToOne: false
            referencedRelation: "geopolitica"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "geopolitica_geopolitica_id_fkey"
            columns: ["geopolitica_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_localidades"
            referencedColumns: ["id_geopolitica"]
          },
          {
            foreignKeyName: "geopolitica_rank_geopolitica_id_fkey"
            columns: ["rank_geopolitica_id"]
            isOneToOne: false
            referencedRelation: "rank_geopolitica"
            referencedColumns: ["id_rank_geopolitica"]
          },
        ]
      }
      vw_lista_spp: {
        Row: {
          autor_ano: string | null
          cites: string | null
          en_ecuador: boolean | null
          endemica: boolean | null
          eol: boolean | null
          especie: string | null
          familia: string | null
          genero: string | null
          id_especie: number | null
          id_familia: number | null
          id_genero: number | null
          id_orden: number | null
          id_taxon_correcto: number | null
          lrcoloma: string | null
          lruicn: string | null
          nombre_aceptado: boolean | null
          nombre_cientifico: string | null
          nombre_comun: string | null
          nombre_comun_familia: string | null
          nombre_comun_genero: string | null
          nombre_original: boolean | null
          orden: string | null
          publicacion: string | null
          publicar: boolean | null
          sinonimo: boolean | null
        }
        Relationships: []
      }
      vw_lista_spp_lrc: {
        Row: {
          autor_ano: string | null
          cites: string | null
          en_ecuador: boolean | null
          endemica: boolean | null
          eol: boolean | null
          especie: string | null
          familia: string | null
          genero: string | null
          id_especie: number | null
          id_familia: number | null
          id_genero: number | null
          id_orden: number | null
          id_taxon_correcto: number | null
          lrcoloma: string | null
          lruicn: string | null
          nombre_aceptado: boolean | null
          nombre_cientifico: string | null
          nombre_comun: string | null
          nombre_comun_familia: string | null
          nombre_comun_genero: string | null
          nombre_lrcoloma: string | null
          nombre_original: boolean | null
          orden: string | null
          orden_lrcoloma: number | null
          publicacion: string | null
          publicar: boolean | null
          sinonimo: boolean | null
        }
        Relationships: []
      }
      vw_moleculoteca_taxon: {
        Row: {
          count_esperma: number | null
          count_esqueleto_transparentacion: number | null
          count_heces: number | null
          count_piel_exudado: number | null
          count_piel_liofilizado: number | null
          count_sangre: number | null
          count_tejido_higado: number | null
          count_tejido_musculo: number | null
          taxon_id: number | null
          total_registros: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "coleccion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_nombres_comunes: {
        Row: {
          especie: string | null
          id_ficha_especie: number | null
          id_taxon: number | null
          nombre_cientifico: string | null
          nombre_comun_aleman: string | null
          nombre_comun_arabe: string | null
          nombre_comun_chino: string | null
          nombre_comun_espanol: string | null
          nombre_comun_frances: string | null
          nombre_comun_hindu: string | null
          nombre_comun_holandes: string | null
          nombre_comun_ingles: string | null
          nombre_comun_italiano: string | null
          nombre_comun_japones: string | null
          nombre_comun_portugues: string | null
          nombre_comun_ruso: string | null
          nombres_comunes_json: Json | null
        }
        Relationships: []
      }
      vw_publicacion_anfibios_ecuador: {
        Row: {
          cita: string | null
          cita_corta: string | null
          cita_larga: string | null
          fecha: string | null
          id_publicacion: number | null
          indexada: boolean | null
          numero_publicacion_ano: number | null
          tipo: string | null
          titulo: string | null
          titulo_secundario: string | null
        }
        Insert: {
          cita?: string | null
          cita_corta?: string | null
          cita_larga?: string | null
          fecha?: string | null
          id_publicacion?: number | null
          indexada?: boolean | null
          numero_publicacion_ano?: number | null
          tipo?: never
          titulo?: string | null
          titulo_secundario?: string | null
        }
        Update: {
          cita?: string | null
          cita_corta?: string | null
          cita_larga?: string | null
          fecha?: string | null
          id_publicacion?: number | null
          indexada?: boolean | null
          numero_publicacion_ano?: number | null
          tipo?: never
          titulo?: string | null
          titulo_secundario?: string | null
        }
        Relationships: []
      }
      vw_publicacion_categoria: {
        Row: {
          catalogo_awe_id: number | null
          id_publicacion_catalogo_awe: number | null
          publicacion_id: number | null
        }
        Insert: {
          catalogo_awe_id?: never
          id_publicacion_catalogo_awe?: number | null
          publicacion_id?: number | null
        }
        Update: {
          catalogo_awe_id?: never
          id_publicacion_catalogo_awe?: number | null
          publicacion_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
        ]
      }
      vw_publicacion_cientifica_ecuador: {
        Row: {
          anfibios_ecuador: boolean | null
          cita: string | null
          cita_corta: string | null
          cita_larga: string | null
          contador_citas: number | null
          editor: boolean | null
          editorial: string | null
          fecha: string | null
          formato_impreso: boolean | null
          id_publicacion: number | null
          indexada: boolean | null
          justificacion: string | null
          noticia: boolean | null
          numero: string | null
          numero_publicacion_ano: number | null
          observaciones: string | null
          pagina: string | null
          palabras_clave: string | null
          rel_conservacion: boolean | null
          rel_ecologia: boolean | null
          rel_evolucion: boolean | null
          rel_taxonomia: boolean | null
          resumen: string | null
          titulo: string | null
          titulo_secundario: string | null
          volumen: string | null
        }
        Insert: {
          anfibios_ecuador?: boolean | null
          cita?: string | null
          cita_corta?: string | null
          cita_larga?: string | null
          contador_citas?: number | null
          editor?: boolean | null
          editorial?: string | null
          fecha?: string | null
          formato_impreso?: boolean | null
          id_publicacion?: number | null
          indexada?: boolean | null
          justificacion?: string | null
          noticia?: boolean | null
          numero?: string | null
          numero_publicacion_ano?: number | null
          observaciones?: string | null
          pagina?: string | null
          palabras_clave?: string | null
          rel_conservacion?: boolean | null
          rel_ecologia?: boolean | null
          rel_evolucion?: boolean | null
          rel_taxonomia?: boolean | null
          resumen?: string | null
          titulo?: string | null
          titulo_secundario?: string | null
          volumen?: string | null
        }
        Update: {
          anfibios_ecuador?: boolean | null
          cita?: string | null
          cita_corta?: string | null
          cita_larga?: string | null
          contador_citas?: number | null
          editor?: boolean | null
          editorial?: string | null
          fecha?: string | null
          formato_impreso?: boolean | null
          id_publicacion?: number | null
          indexada?: boolean | null
          justificacion?: string | null
          noticia?: boolean | null
          numero?: string | null
          numero_publicacion_ano?: number | null
          observaciones?: string | null
          pagina?: string | null
          palabras_clave?: string | null
          rel_conservacion?: boolean | null
          rel_ecologia?: boolean | null
          rel_evolucion?: boolean | null
          rel_taxonomia?: boolean | null
          resumen?: string | null
          titulo?: string | null
          titulo_secundario?: string | null
          volumen?: string | null
        }
        Relationships: []
      }
      vw_publicacion_completa: {
        Row: {
          autores_nombres: string | null
          id_publicacion: number | null
          titulo: string | null
        }
        Insert: {
          autores_nombres?: never
          id_publicacion?: number | null
          titulo?: string | null
        }
        Update: {
          autores_nombres?: never
          id_publicacion?: number | null
          titulo?: string | null
        }
        Relationships: []
      }
      vw_publicacion_completa_ecuador: {
        Row: {
          anos: string | null
          autores_nombres: string | null
          cita: string | null
          cita_corta: string | null
          cita_larga: string | null
          fecha: string | null
          id_publicacion: number | null
          indexada: boolean | null
          numero_publicacion_ano: number | null
          titulo: string | null
          titulo_secundario: string | null
          total_enlaces: number | null
        }
        Insert: {
          anos?: never
          autores_nombres?: never
          cita?: string | null
          cita_corta?: string | null
          cita_larga?: string | null
          fecha?: string | null
          id_publicacion?: number | null
          indexada?: boolean | null
          numero_publicacion_ano?: number | null
          titulo?: string | null
          titulo_secundario?: string | null
          total_enlaces?: never
        }
        Update: {
          anos?: never
          autores_nombres?: never
          cita?: string | null
          cita_corta?: string | null
          cita_larga?: string | null
          fecha?: string | null
          id_publicacion?: number | null
          indexada?: boolean | null
          numero_publicacion_ano?: number | null
          titulo?: string | null
          titulo_secundario?: string | null
          total_enlaces?: never
        }
        Relationships: []
      }
      vw_publicacion_sec_despliegue: {
        Row: {
          catalogo_awe_id: number | null
          id_publicacion_catalogo_awe: number | null
          publicacion_id: number | null
        }
        Insert: {
          catalogo_awe_id?: never
          id_publicacion_catalogo_awe?: number | null
          publicacion_id?: number | null
        }
        Update: {
          catalogo_awe_id?: never
          id_publicacion_catalogo_awe?: number | null
          publicacion_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
        ]
      }
      vw_publicacion_slug: {
        Row: {
          cita_corta: string | null
          fecha: string | null
          id_publicacion: number | null
          numero_publicacion_ano: number | null
          slug: string | null
          titulo: string | null
        }
        Insert: {
          cita_corta?: string | null
          fecha?: string | null
          id_publicacion?: number | null
          numero_publicacion_ano?: number | null
          slug?: never
          titulo?: string | null
        }
        Update: {
          cita_corta?: string | null
          fecha?: string | null
          id_publicacion?: number | null
          numero_publicacion_ano?: number | null
          slug?: never
          titulo?: string | null
        }
        Relationships: []
      }
      vw_publicacion_tipo: {
        Row: {
          catalogo_publicaciones_id: number | null
          id_publicacion_catalogo_awe: number | null
          publicacion_id: number | null
        }
        Insert: {
          catalogo_publicaciones_id?: number | null
          id_publicacion_catalogo_awe?: number | null
          publicacion_id?: number | null
        }
        Update: {
          catalogo_publicaciones_id?: number | null
          id_publicacion_catalogo_awe?: number | null
          publicacion_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "publicacion_catalogo_awe_catalogo_publicaciones_id_fkey"
            columns: ["catalogo_publicaciones_id"]
            isOneToOne: false
            referencedRelation: "catalogo_publicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
        ]
      }
      vw_publicaciones_ecuador_por_ano: {
        Row: {
          ano: number | null
          cantidad: number | null
        }
        Relationships: []
      }
      vw_taxon_ar_pr_estado: {
        Row: {
          catalogo_awe_id: number | null
          id_taxon_catalogo_awe: number | null
          taxon_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_taxon_ar_pr_privada: {
        Row: {
          catalogo_awe_id: number | null
          id_taxon_catalogo_awe: number | null
          taxon_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_taxon_cites: {
        Row: {
          catalogo_awe_id: number | null
          id_taxon_catalogo_awe: number | null
          taxon_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_taxon_coloma: {
        Row: {
          catalogo_awe_id: number | null
          id_taxon_catalogo_awe: number | null
          taxon_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_taxon_dist_altitudinal: {
        Row: {
          catalogo_awe_id: number | null
          id_taxon_catalogo_awe: number | null
          taxon_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_taxon_lista_roja: {
        Row: {
          catalogo_awe_id: number | null
          id_taxon_catalogo_awe: number | null
          taxon_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_taxon_publicacion: {
        Row: {
          id_taxon_publicacion: number | null
          principal: boolean | null
          publicacion_id: number | null
          svl_hembra: boolean | null
          svl_macho: boolean | null
          taxon_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicacion"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_anfibios_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_cientifica_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_completa_ecuador"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "vw_publicacion_slug"
            referencedColumns: ["id_publicacion"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_taxon_region_biogeografica: {
        Row: {
          catalogo_awe_id: number | null
          categoria: string | null
          id_taxon_catalogo_awe: number | null
          taxon_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey"
            columns: ["catalogo_awe_id"]
            isOneToOne: false
            referencedRelation: "catalogo_awe"
            referencedColumns: ["id_catalogo_awe"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "taxon"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_conservacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_ficha_especie_investigacion"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_alejandro_arteaga"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_george_fletcher"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_especies_jmg"
            referencedColumns: ["id_taxon"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_familias"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_generos"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_especie"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_familia"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_genero"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_lista_spp_lrc"
            referencedColumns: ["id_orden"]
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey"
            columns: ["taxon_id"]
            isOneToOne: false
            referencedRelation: "vw_nombres_comunes"
            referencedColumns: ["id_taxon"]
          },
        ]
      }
      vw_tipo_catalogo_lac: {
        Row: {
          descripcion: string | null
          id_tipo_catalogo_awe: number | null
          nombre: string | null
        }
        Insert: {
          descripcion?: string | null
          id_tipo_catalogo_awe?: number | null
          nombre?: string | null
        }
        Update: {
          descripcion?: string | null
          id_tipo_catalogo_awe?: number | null
          nombre?: string | null
        }
        Relationships: []
      }
      vw_total_autores_ecuador: {
        Row: {
          total: number | null
        }
        Relationships: []
      }
      vw_total_autores_ecuador_cientificas: {
        Row: {
          total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_publicacion_slug: {
        Args: {
          año_num: number
          cita_corta_text: string
          id_publicacion_num: number
          titulo_text: string
        }
        Returns: string
      }
      get_anos_publicaciones_ecuador: {
        Args: never
        Returns: {
          ano: number
        }[]
      }
      get_colecciones_mapa: {
        Args: {
          p_catalogo_museo?: string
          p_elevacion_max?: number
          p_elevacion_min?: number
          p_especies?: string[]
          p_fecha_desde?: string
          p_fecha_hasta?: string
          p_localidades?: string[]
          p_numero_museo?: string
          p_provincias?: string[]
          p_taxon_ids?: number[]
        }
        Returns: {
          catalogo_museo: string
          cita_corta: string
          colectores: string
          elevacion: number
          fecha_coleccion: string
          id_coleccion: number
          latitud: number
          localidad: string
          longitud: number
          nombre_especie: string
          numero_museo: string
          origen: string
          provincia: string
          rank_id: number
          taxon_id: number
        }[]
      }
      get_colecciones_mapa_json: {
        Args: {
          p_catalogo_museo?: string
          p_elevacion_max?: number
          p_elevacion_min?: number
          p_especies?: string[]
          p_fecha_desde?: string
          p_fecha_hasta?: string
          p_localidades?: string[]
          p_numero_museo?: string
          p_provincias?: string[]
          p_taxon_ids?: number[]
        }
        Returns: Json
      }
      get_tabla_taxon_ids: {
        Args: {
          p_catalogos?: string[]
          p_elevacion_max?: number
          p_elevacion_min?: number
          p_especies?: string[]
          p_localidades?: string[]
          p_pisos?: string[]
          p_provincias?: string[]
          p_snaps?: string[]
        }
        Returns: {
          taxon_id: number
        }[]
      }
      get_taxon_geopolitica_hierarchy: {
        Args: { _taxon_id: number }
        Returns: {
          depth: number
          id_geopolitica: number
          nombre: string
          parent_id: number
          rank_geopolitica_id: number
          rank_id: number
          rank_nombre: string
        }[]
      }
      get_taxon_hierarchy: {
        Args: { taxon_ids: number[] }
        Returns: {
          familia: string
          genero: string
          id_taxon: number
          orden: string
        }[]
      }
      get_taxon_lineage: {
        Args: { p_id_taxon: number }
        Returns: {
          depth: number
          id_taxon: number
          parent_id: number
          rank: Json
          rank_id: number
          taxon: string
        }[]
      }
      refresh_mv_colecciones_mapa: { Args: never; Returns: undefined }
      refresh_mv_sapoteca_stats: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
