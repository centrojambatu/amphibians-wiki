export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      animacion: {
        Row: {
          descripcion: string | null;
          enlace: string;
          id_animacion: number;
          nombre: string;
          taxon_id: number;
          thumbnail: string | null;
        };
        Insert: {
          descripcion?: string | null;
          enlace?: string;
          id_animacion?: number;
          nombre?: string;
          taxon_id: number;
          thumbnail?: string | null;
        };
        Update: {
          descripcion?: string | null;
          enlace?: string;
          id_animacion?: number;
          nombre?: string;
          taxon_id?: number;
          thumbnail?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "animacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      audio: {
        Row: {
          autor: string | null;
          descripcion: string | null;
          fecha: string | null;
          id_audio: number;
          nombre: string;
          numero_museo: string | null;
          taxon_id: number;
          traducciones: Json | null;
          url_audio: string;
          url_fotografia: string | null;
          url_oscilo_espetrograma: string | null;
          url_publicacion: string | null;
        };
        Insert: {
          autor?: string | null;
          descripcion?: string | null;
          fecha?: string | null;
          id_audio?: number;
          nombre?: string;
          numero_museo?: string | null;
          taxon_id: number;
          traducciones?: Json | null;
          url_audio?: string;
          url_fotografia?: string | null;
          url_oscilo_espetrograma?: string | null;
          url_publicacion?: string | null;
        };
        Update: {
          autor?: string | null;
          descripcion?: string | null;
          fecha?: string | null;
          id_audio?: number;
          nombre?: string;
          numero_museo?: string | null;
          taxon_id?: number;
          traducciones?: Json | null;
          url_audio?: string;
          url_fotografia?: string | null;
          url_oscilo_espetrograma?: string | null;
          url_publicacion?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "audio_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      autor: {
        Row: {
          apellidos: string;
          biografia_id: number | null;
          enlace_biografia: string | null;
          id_autor: number;
          nombres: string | null;
        };
        Insert: {
          apellidos: string;
          biografia_id?: number | null;
          enlace_biografia?: string | null;
          id_autor?: number;
          nombres?: string | null;
        };
        Update: {
          apellidos?: string;
          biografia_id?: number | null;
          enlace_biografia?: string | null;
          id_autor?: number;
          nombres?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "autor_biografia_id_fkey";
            columns: ["biografia_id"];
            isOneToOne: false;
            referencedRelation: "biografia";
            referencedColumns: ["id_biografia"];
          },
        ];
      };
      biografia: {
        Row: {
          ano_nacimiento: number | null;
          asociaciones_profesionales: string | null;
          email: string | null;
          experiencia_laboral: string | null;
          id_biografia: number;
          inicio_interes_estudio: string | null;
          interes_investigacion: string | null;
          lugar_nacimiento: string | null;
          posicion_actual: string | null;
          premios_reconocimientos: string | null;
          titulos_academicos: string | null;
          traducciones: Json | null;
        };
        Insert: {
          ano_nacimiento?: number | null;
          asociaciones_profesionales?: string | null;
          email?: string | null;
          experiencia_laboral?: string | null;
          id_biografia?: number;
          inicio_interes_estudio?: string | null;
          interes_investigacion?: string | null;
          lugar_nacimiento?: string | null;
          posicion_actual?: string | null;
          premios_reconocimientos?: string | null;
          titulos_academicos?: string | null;
          traducciones?: Json | null;
        };
        Update: {
          ano_nacimiento?: number | null;
          asociaciones_profesionales?: string | null;
          email?: string | null;
          experiencia_laboral?: string | null;
          id_biografia?: number;
          inicio_interes_estudio?: string | null;
          interes_investigacion?: string | null;
          lugar_nacimiento?: string | null;
          posicion_actual?: string | null;
          premios_reconocimientos?: string | null;
          titulos_academicos?: string | null;
          traducciones?: Json | null;
        };
        Relationships: [];
      };
      boletin: {
        Row: {
          catalogo_id: number;
          enlace: string;
          fecha: string;
          id_boletin: number;
          titulo: string | null;
        };
        Insert: {
          catalogo_id: number;
          enlace: string;
          fecha?: string;
          id_boletin?: number;
          titulo?: string | null;
        };
        Update: {
          catalogo_id?: number;
          enlace?: string;
          fecha?: string;
          id_boletin?: number;
          titulo?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "boletin_catalogo_id_fkey";
            columns: ["catalogo_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
        ];
      };
      catalogo_awe: {
        Row: {
          descripcion: string | null;
          id_catalogo_awe: number;
          nombre: string;
          orden: number | null;
          sigla: string | null;
          tipo_catalogo_awe_id: number | null;
          traducciones: Json | null;
        };
        Insert: {
          descripcion?: string | null;
          id_catalogo_awe?: number;
          nombre: string;
          orden?: number | null;
          sigla?: string | null;
          tipo_catalogo_awe_id?: number | null;
          traducciones?: Json | null;
        };
        Update: {
          descripcion?: string | null;
          id_catalogo_awe?: number;
          nombre?: string;
          orden?: number | null;
          sigla?: string | null;
          tipo_catalogo_awe_id?: number | null;
          traducciones?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "catalogo_awe_tipo_catalogo_awe_id_fkey";
            columns: ["tipo_catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "tipo_catalogo_awe";
            referencedColumns: ["id_tipo_catalogo_awe"];
          },
          {
            foreignKeyName: "catalogo_awe_tipo_catalogo_awe_id_fkey";
            columns: ["tipo_catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "vw_tipo_catalogo_lac";
            referencedColumns: ["id_tipo_catalogo_awe"];
          },
        ];
      };
      enlace_relacionado_manejo_ex_situ: {
        Row: {
          enlace: string;
          id_enlace_relacionado_manejo_ex_situ: number;
          manejo_ex_situ_id: number;
          manejo_ex_situ_taxon_id: number;
          nombre: string;
        };
        Insert: {
          enlace?: string;
          id_enlace_relacionado_manejo_ex_situ?: number;
          manejo_ex_situ_id: number;
          manejo_ex_situ_taxon_id: number;
          nombre?: string;
        };
        Update: {
          enlace?: string;
          id_enlace_relacionado_manejo_ex_situ?: number;
          manejo_ex_situ_id?: number;
          manejo_ex_situ_taxon_id?: number;
          nombre?: string;
        };
        Relationships: [];
      };
      enlace_relacionado_taxon: {
        Row: {
          enlace: string;
          id_enlace_relacionado_taxon: number;
          nombre: string;
          taxon_id: number;
        };
        Insert: {
          enlace?: string;
          id_enlace_relacionado_taxon?: number;
          nombre?: string;
          taxon_id: number;
        };
        Update: {
          enlace?: string;
          id_enlace_relacionado_taxon?: number;
          nombre?: string;
          taxon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "enlace_relacionado_taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      ficha_especie: {
        Row: {
          agradecimiento: string | null;
          area_distribucion: number | null;
          asw: string | null;
          autor_foto_ficha: string | null;
          autoria_compilador: string | null;
          autoria_editor: string | null;
          aw: string | null;
          blog: string | null;
          canto: string | null;
          colector: string | null;
          color_en_preservacion: string | null;
          color_en_vida: string | null;
          comentario_estatus_poblacional: string | null;
          compilador: string | null;
          descripcion: string | null;
          descubridor: string | null;
          diagnosis: string | null;
          dieta: string | null;
          distribucion: string | null;
          distribucion_global: string | null;
          editor: string | null;
          etimologia: string | null;
          fecha_actualizacion: string | null;
          fecha_compilacion: string | null;
          fecha_edicion: string | null;
          fotografia_ficha: string | null;
          fuente_lista_roja: string | null;
          genbank: string | null;
          habitat_biologia: string | null;
          herpnet: string | null;
          historial: string | null;
          id_ficha_especie: number;
          identificacion: string | null;
          inaturalist: string | null;
          informacion_adicional: string | null;
          larva: string | null;
          morfometria: string | null;
          observacion_zona_altitudinal: string | null;
          pluviocidad_max: number | null;
          pluviocidad_min: number | null;
          publicar: boolean;
          rango_altitudinal: string | null;
          rango_altitudinal_max: number | null;
          rango_altitudinal_min: number | null;
          referencia_area_protegida: string | null;
          reproduccion: string | null;
          sinonimia: string | null;
          svl_hembra: string | null;
          svl_macho: string | null;
          taxon_id: number;
          taxonomia: string | null;
          temperatura_max: number | null;
          temperatura_min: number | null;
          traducciones: Json | null;
          uicn: string | null;
          usos: string | null;
          wikipedia: string | null;
        };
        Insert: {
          agradecimiento?: string | null;
          area_distribucion?: number | null;
          asw?: string | null;
          autor_foto_ficha?: string | null;
          autoria_compilador?: string | null;
          autoria_editor?: string | null;
          aw?: string | null;
          blog?: string | null;
          canto?: string | null;
          colector?: string | null;
          color_en_preservacion?: string | null;
          color_en_vida?: string | null;
          comentario_estatus_poblacional?: string | null;
          compilador?: string | null;
          descripcion?: string | null;
          descubridor?: string | null;
          diagnosis?: string | null;
          dieta?: string | null;
          distribucion?: string | null;
          distribucion_global?: string | null;
          editor?: string | null;
          etimologia?: string | null;
          fecha_actualizacion?: string | null;
          fecha_compilacion?: string | null;
          fecha_edicion?: string | null;
          fotografia_ficha?: string | null;
          fuente_lista_roja?: string | null;
          genbank?: string | null;
          habitat_biologia?: string | null;
          herpnet?: string | null;
          historial?: string | null;
          id_ficha_especie?: number;
          identificacion?: string | null;
          inaturalist?: string | null;
          informacion_adicional?: string | null;
          larva?: string | null;
          morfometria?: string | null;
          observacion_zona_altitudinal?: string | null;
          pluviocidad_max?: number | null;
          pluviocidad_min?: number | null;
          publicar?: boolean;
          rango_altitudinal?: string | null;
          rango_altitudinal_max?: number | null;
          rango_altitudinal_min?: number | null;
          referencia_area_protegida?: string | null;
          reproduccion?: string | null;
          sinonimia?: string | null;
          svl_hembra?: string | null;
          svl_macho?: string | null;
          taxon_id: number;
          taxonomia?: string | null;
          temperatura_max?: number | null;
          temperatura_min?: number | null;
          traducciones?: Json | null;
          uicn?: string | null;
          usos?: string | null;
          wikipedia?: string | null;
        };
        Update: {
          agradecimiento?: string | null;
          area_distribucion?: number | null;
          asw?: string | null;
          autor_foto_ficha?: string | null;
          autoria_compilador?: string | null;
          autoria_editor?: string | null;
          aw?: string | null;
          blog?: string | null;
          canto?: string | null;
          colector?: string | null;
          color_en_preservacion?: string | null;
          color_en_vida?: string | null;
          comentario_estatus_poblacional?: string | null;
          compilador?: string | null;
          descripcion?: string | null;
          descubridor?: string | null;
          diagnosis?: string | null;
          dieta?: string | null;
          distribucion?: string | null;
          distribucion_global?: string | null;
          editor?: string | null;
          etimologia?: string | null;
          fecha_actualizacion?: string | null;
          fecha_compilacion?: string | null;
          fecha_edicion?: string | null;
          fotografia_ficha?: string | null;
          fuente_lista_roja?: string | null;
          genbank?: string | null;
          habitat_biologia?: string | null;
          herpnet?: string | null;
          historial?: string | null;
          id_ficha_especie?: number;
          identificacion?: string | null;
          inaturalist?: string | null;
          informacion_adicional?: string | null;
          larva?: string | null;
          morfometria?: string | null;
          observacion_zona_altitudinal?: string | null;
          pluviocidad_max?: number | null;
          pluviocidad_min?: number | null;
          publicar?: boolean;
          rango_altitudinal?: string | null;
          rango_altitudinal_max?: number | null;
          rango_altitudinal_min?: number | null;
          referencia_area_protegida?: string | null;
          reproduccion?: string | null;
          sinonimia?: string | null;
          svl_hembra?: string | null;
          svl_macho?: string | null;
          taxon_id?: number;
          taxonomia?: string | null;
          temperatura_max?: number | null;
          temperatura_min?: number | null;
          traducciones?: Json | null;
          uicn?: string | null;
          usos?: string | null;
          wikipedia?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      fotografia: {
        Row: {
          autor: string | null;
          catalogo_awe_id: number;
          descripcion: string | null;
          enlace: string;
          id_fotografia: number;
          nombre: string;
          numero_museo: string | null;
          orden: number | null;
          taxon_id: number;
          thumbnail: string | null;
        };
        Insert: {
          autor?: string | null;
          catalogo_awe_id: number;
          descripcion?: string | null;
          enlace?: string;
          id_fotografia?: number;
          nombre?: string;
          numero_museo?: string | null;
          orden?: number | null;
          taxon_id: number;
          thumbnail?: string | null;
        };
        Update: {
          autor?: string | null;
          catalogo_awe_id?: number;
          descripcion?: string | null;
          enlace?: string;
          id_fotografia?: number;
          nombre?: string;
          numero_museo?: string | null;
          orden?: number | null;
          taxon_id?: number;
          thumbnail?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fotografia_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "fotografia_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      geopolitica: {
        Row: {
          geopolitica_id: number | null;
          id_geopolitica: number;
          nombre: string;
          rank_geopolitica_id: number;
        };
        Insert: {
          geopolitica_id?: number | null;
          id_geopolitica?: number;
          nombre: string;
          rank_geopolitica_id: number;
        };
        Update: {
          geopolitica_id?: number | null;
          id_geopolitica?: number;
          nombre?: string;
          rank_geopolitica_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "geopolitica_geopolitica_id_fkey";
            columns: ["geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "geopolitica";
            referencedColumns: ["id_geopolitica"];
          },
          {
            foreignKeyName: "geopolitica_geopolitica_id_fkey";
            columns: ["geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_localidades";
            referencedColumns: ["id_geopolitica"];
          },
          {
            foreignKeyName: "geopolitica_rank_geopolitica_id_fkey";
            columns: ["rank_geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "rank_geopolitica";
            referencedColumns: ["id_rank_geopolitica"];
          },
        ];
      };
      imagen_pagina_intro: {
        Row: {
          autor: string | null;
          catalogo_id: number;
          descripcion: string | null;
          enlace: string;
          enlace_nota: string | null;
          id_imagen_pagina_intro: number;
          publicar: boolean;
        };
        Insert: {
          autor?: string | null;
          catalogo_id: number;
          descripcion?: string | null;
          enlace: string;
          enlace_nota?: string | null;
          id_imagen_pagina_intro?: number;
          publicar?: boolean;
        };
        Update: {
          autor?: string | null;
          catalogo_id?: number;
          descripcion?: string | null;
          enlace?: string;
          enlace_nota?: string | null;
          id_imagen_pagina_intro?: number;
          publicar?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "imagen_pagina_intro_catalogo_id_fkey";
            columns: ["catalogo_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
        ];
      };
      info_especie: {
        Row: {
          contenido: string;
          fecha: string;
          fotografia_id: number;
          id_info_especie: number;
          publicar: boolean;
          taxon_id: number;
          tipo: boolean;
          titulo: string | null;
        };
        Insert: {
          contenido: string;
          fecha?: string;
          fotografia_id: number;
          id_info_especie?: number;
          publicar?: boolean;
          taxon_id: number;
          tipo?: boolean;
          titulo?: string | null;
        };
        Update: {
          contenido?: string;
          fecha?: string;
          fotografia_id?: number;
          id_info_especie?: number;
          publicar?: boolean;
          taxon_id?: number;
          tipo?: boolean;
          titulo?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "info_especie_fotografia_id_fkey";
            columns: ["fotografia_id"];
            isOneToOne: false;
            referencedRelation: "fotografia";
            referencedColumns: ["id_fotografia"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "info_especie_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      manejo_ex_situ: {
        Row: {
          administracion_proyecto_recursos: string | null;
          antecedente: string | null;
          autor_foto_ex_situ: string | null;
          cita: string | null;
          comentarios: string | null;
          dieta_nutricion: string | null;
          diversidad_genetica: string | null;
          enlace_plan_manejo: string | null;
          fecha_actualizacion: string | null;
          fotografia_ex_situ: string | null;
          genetica_pie_parental: string | null;
          historial_ficha: string | null;
          id_manejo_ex_situ: number;
          mantenimiento: string | null;
          numero_adulto_hembra: number | null;
          numero_adulto_macho: number | null;
          numero_fundador_hembra: number | null;
          numero_fundador_macho: number | null;
          numero_fundador_nd: number | null;
          numero_fundador_renacuajo: number | null;
          numero_juvenil: number | null;
          numero_renacuajo: number | null;
          plan_manejo: string | null;
          procedencia_habitat: string | null;
          publicar: boolean;
          reintroduccion: string | null;
          reproduccion_comportamiento: string | null;
          taxon_id: number;
        };
        Insert: {
          administracion_proyecto_recursos?: string | null;
          antecedente?: string | null;
          autor_foto_ex_situ?: string | null;
          cita?: string | null;
          comentarios?: string | null;
          dieta_nutricion?: string | null;
          diversidad_genetica?: string | null;
          enlace_plan_manejo?: string | null;
          fecha_actualizacion?: string | null;
          fotografia_ex_situ?: string | null;
          genetica_pie_parental?: string | null;
          historial_ficha?: string | null;
          id_manejo_ex_situ?: number;
          mantenimiento?: string | null;
          numero_adulto_hembra?: number | null;
          numero_adulto_macho?: number | null;
          numero_fundador_hembra?: number | null;
          numero_fundador_macho?: number | null;
          numero_fundador_nd?: number | null;
          numero_fundador_renacuajo?: number | null;
          numero_juvenil?: number | null;
          numero_renacuajo?: number | null;
          plan_manejo?: string | null;
          procedencia_habitat?: string | null;
          publicar?: boolean;
          reintroduccion?: string | null;
          reproduccion_comportamiento?: string | null;
          taxon_id: number;
        };
        Update: {
          administracion_proyecto_recursos?: string | null;
          antecedente?: string | null;
          autor_foto_ex_situ?: string | null;
          cita?: string | null;
          comentarios?: string | null;
          dieta_nutricion?: string | null;
          diversidad_genetica?: string | null;
          enlace_plan_manejo?: string | null;
          fecha_actualizacion?: string | null;
          fotografia_ex_situ?: string | null;
          genetica_pie_parental?: string | null;
          historial_ficha?: string | null;
          id_manejo_ex_situ?: number;
          mantenimiento?: string | null;
          numero_adulto_hembra?: number | null;
          numero_adulto_macho?: number | null;
          numero_fundador_hembra?: number | null;
          numero_fundador_macho?: number | null;
          numero_fundador_nd?: number | null;
          numero_fundador_renacuajo?: number | null;
          numero_juvenil?: number | null;
          numero_renacuajo?: number | null;
          plan_manejo?: string | null;
          procedencia_habitat?: string | null;
          publicar?: boolean;
          reintroduccion?: string | null;
          reproduccion_comportamiento?: string | null;
          taxon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "manejo_ex_situ_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      manejo_ex_situ_geopolitica: {
        Row: {
          geopolitica_id: number;
          id_manejo_ex_situ_geopolitica: number;
          manejo_ex_situ_id: number | null;
          manejo_ex_situ_taxon_id: number;
          microhabitat: string | null;
        };
        Insert: {
          geopolitica_id: number;
          id_manejo_ex_situ_geopolitica?: number;
          manejo_ex_situ_id?: number | null;
          manejo_ex_situ_taxon_id: number;
          microhabitat?: string | null;
        };
        Update: {
          geopolitica_id?: number;
          id_manejo_ex_situ_geopolitica?: number;
          manejo_ex_situ_id?: number | null;
          manejo_ex_situ_taxon_id?: number;
          microhabitat?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_geopolitica_id_fkey";
            columns: ["geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "geopolitica";
            referencedColumns: ["id_geopolitica"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_geopolitica_id_fkey";
            columns: ["geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_localidades";
            referencedColumns: ["id_geopolitica"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_fkey";
            columns: ["manejo_ex_situ_id", "manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "manejo_ex_situ";
            referencedColumns: ["id_manejo_ex_situ", "taxon_id"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "manejo_ex_situ_geopolitica_manejo_ex_situ_taxon_id_fkey";
            columns: ["manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      manejo_ex_situ_protocolo: {
        Row: {
          catalogo_awe_id: number;
          id_manejo_ex_situ_protocolo: number;
          manejo_ex_situ_id: number;
          manejo_ex_situ_taxon_id: number;
          protocolo: string;
        };
        Insert: {
          catalogo_awe_id: number;
          id_manejo_ex_situ_protocolo?: number;
          manejo_ex_situ_id: number;
          manejo_ex_situ_taxon_id: number;
          protocolo: string;
        };
        Update: {
          catalogo_awe_id?: number;
          id_manejo_ex_situ_protocolo?: number;
          manejo_ex_situ_id?: number;
          manejo_ex_situ_taxon_id?: number;
          protocolo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "manejo_ex_situ_protocolo_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "manejo_ex_situ_protocolo_manejo_ex_situ_fkey";
            columns: ["manejo_ex_situ_id", "manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "manejo_ex_situ";
            referencedColumns: ["id_manejo_ex_situ", "taxon_id"];
          },
        ];
      };
      manejo_ex_situ_publicacion: {
        Row: {
          id_manejo_ex_situ_publicacion: number;
          manejo_ex_situ_id: number;
          manejo_ex_situ_taxon_id: number;
          publicacion_id: number;
        };
        Insert: {
          id_manejo_ex_situ_publicacion?: number;
          manejo_ex_situ_id: number;
          manejo_ex_situ_taxon_id: number;
          publicacion_id: number;
        };
        Update: {
          id_manejo_ex_situ_publicacion?: number;
          manejo_ex_situ_id?: number;
          manejo_ex_situ_taxon_id?: number;
          publicacion_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "manejo_ex_situ_publicacion_manejo_ex_situ_fkey";
            columns: ["manejo_ex_situ_id", "manejo_ex_situ_taxon_id"];
            isOneToOne: false;
            referencedRelation: "manejo_ex_situ";
            referencedColumns: ["id_manejo_ex_situ", "taxon_id"];
          },
          {
            foreignKeyName: "manejo_ex_situ_publicacion_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "manejo_ex_situ_publicacion_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
        ];
      };
      mapa: {
        Row: {
          descripcion: string | null;
          enlace: string;
          id_mapa: number;
          nombre: string;
          taxon_id: number;
          thumbnail: string | null;
        };
        Insert: {
          descripcion?: string | null;
          enlace?: string;
          id_mapa?: number;
          nombre?: string;
          taxon_id: number;
          thumbnail?: string | null;
        };
        Update: {
          descripcion?: string | null;
          enlace?: string;
          id_mapa?: number;
          nombre?: string;
          taxon_id?: number;
          thumbnail?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "mapa_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      marcador: {
        Row: {
          codigo: string | null;
          descripcion: string;
          id_marcador: number;
          marcador: string;
          pagina_id: number;
          timestamp_actualizar: string | null;
          valor_final: string | null;
          valor_temporal: string | null;
        };
        Insert: {
          codigo?: string | null;
          descripcion: string;
          id_marcador?: number;
          marcador: string;
          pagina_id: number;
          timestamp_actualizar?: string | null;
          valor_final?: string | null;
          valor_temporal?: string | null;
        };
        Update: {
          codigo?: string | null;
          descripcion?: string;
          id_marcador?: number;
          marcador?: string;
          pagina_id?: number;
          timestamp_actualizar?: string | null;
          valor_final?: string | null;
          valor_temporal?: string | null;
        };
        Relationships: [];
      };
      menu: {
        Row: {
          contenido: boolean;
          enlace: string | null;
          id_menu: number;
          nivel: number;
          nombre: string;
          orden: number;
          target: boolean | null;
        };
        Insert: {
          contenido?: boolean;
          enlace?: string | null;
          id_menu?: number;
          nivel?: number;
          nombre: string;
          orden?: number;
          target?: boolean | null;
        };
        Update: {
          contenido?: boolean;
          enlace?: string | null;
          id_menu?: number;
          nivel?: number;
          nombre?: string;
          orden?: number;
          target?: boolean | null;
        };
        Relationships: [];
      };
      menu_admin: {
        Row: {
          enlace: string | null;
          id_menu_admin: number;
          menu_admin_id: number;
          nivel: number;
          nombre: string | null;
          orden: number;
        };
        Insert: {
          enlace?: string | null;
          id_menu_admin?: number;
          menu_admin_id: number;
          nivel?: number;
          nombre?: string | null;
          orden?: number;
        };
        Update: {
          enlace?: string | null;
          id_menu_admin?: number;
          menu_admin_id?: number;
          nivel?: number;
          nombre?: string | null;
          orden?: number;
        };
        Relationships: [];
      };
      menu_admin_usuario: {
        Row: {
          activado: boolean;
          id_menu_admin_usuario: number;
          menu_admin_id: number;
          usuario_id: number;
        };
        Insert: {
          activado?: boolean;
          id_menu_admin_usuario?: number;
          menu_admin_id: number;
          usuario_id: number;
        };
        Update: {
          activado?: boolean;
          id_menu_admin_usuario?: number;
          menu_admin_id?: number;
          usuario_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "menu_admin_usuario_menu_admin_id_fkey";
            columns: ["menu_admin_id"];
            isOneToOne: false;
            referencedRelation: "menu_admin";
            referencedColumns: ["id_menu_admin"];
          },
          {
            foreignKeyName: "menu_admin_usuario_usuario_id_fkey";
            columns: ["usuario_id"];
            isOneToOne: false;
            referencedRelation: "usuario";
            referencedColumns: ["id_usuario"];
          },
        ];
      };
      menu_catalogo: {
        Row: {
          activo: boolean;
          catalogo_id: number;
          id_menu_catalogo: number;
          menu_id: number;
        };
        Insert: {
          activo?: boolean;
          catalogo_id: number;
          id_menu_catalogo?: number;
          menu_id: number;
        };
        Update: {
          activo?: boolean;
          catalogo_id?: number;
          id_menu_catalogo?: number;
          menu_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "menu_catalogo_catalogo_id_fkey";
            columns: ["catalogo_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "menu_catalogo_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "menu";
            referencedColumns: ["id_menu"];
          },
        ];
      };
      nombre_comun: {
        Row: {
          catalogo_awe_etnia_id: number | null;
          catalogo_awe_idioma_id: number | null;
          comentario: string | null;
          id_nombre_comun: number;
          nombre: string;
          principal: boolean;
          publicacion_id: number | null;
          taxon_id: number | null;
        };
        Insert: {
          catalogo_awe_etnia_id?: number | null;
          catalogo_awe_idioma_id?: number | null;
          comentario?: string | null;
          id_nombre_comun?: number;
          nombre: string;
          principal: boolean;
          publicacion_id?: number | null;
          taxon_id?: number | null;
        };
        Update: {
          catalogo_awe_etnia_id?: number | null;
          catalogo_awe_idioma_id?: number | null;
          comentario?: string | null;
          id_nombre_comun?: number;
          nombre?: string;
          principal?: boolean;
          publicacion_id?: number | null;
          taxon_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "nombre_comun_catalogo_awe_etnia_id_fkey";
            columns: ["catalogo_awe_etnia_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "nombre_comun_catalogo_awe_idioma_id_fkey";
            columns: ["catalogo_awe_idioma_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "nombre_comun_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "nombre_comun_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "nombre_comun_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      noticia: {
        Row: {
          catalogo_awe_id: number;
          enlace: string | null;
          fecha: string;
          fuente: string | null;
          id_noticia: number;
          resumen: string;
          texto: string;
          texto_enlace: string | null;
          titulo: string;
        };
        Insert: {
          catalogo_awe_id: number;
          enlace?: string | null;
          fecha: string;
          fuente?: string | null;
          id_noticia?: number;
          resumen: string;
          texto: string;
          texto_enlace?: string | null;
          titulo: string;
        };
        Update: {
          catalogo_awe_id?: number;
          enlace?: string | null;
          fecha?: string;
          fuente?: string | null;
          id_noticia?: number;
          resumen?: string;
          texto?: string;
          texto_enlace?: string | null;
          titulo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "noticia_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
        ];
      };
      noticia_enlace: {
        Row: {
          enlace: string;
          id_noticia_enlace: number;
          noticia_id: number;
          texto: string;
        };
        Insert: {
          enlace: string;
          id_noticia_enlace?: number;
          noticia_id: number;
          texto: string;
        };
        Update: {
          enlace?: string;
          id_noticia_enlace?: number;
          noticia_id?: number;
          texto?: string;
        };
        Relationships: [
          {
            foreignKeyName: "noticia_enlace_noticia_id_fkey";
            columns: ["noticia_id"];
            isOneToOne: false;
            referencedRelation: "noticia";
            referencedColumns: ["id_noticia"];
          },
          {
            foreignKeyName: "noticia_enlace_noticia_id_fkey";
            columns: ["noticia_id"];
            isOneToOne: false;
            referencedRelation: "vista_noticias_completa";
            referencedColumns: ["id_noticia"];
          },
        ];
      };
      pagina: {
        Row: {
          contenido: string;
          id_pagina: number;
          menu_id: number;
          orden: number | null;
          subtitulo: string | null;
          titulo: string;
        };
        Insert: {
          contenido: string;
          id_pagina?: number;
          menu_id: number;
          orden?: number | null;
          subtitulo?: string | null;
          titulo: string;
        };
        Update: {
          contenido?: string;
          id_pagina?: number;
          menu_id?: number;
          orden?: number | null;
          subtitulo?: string | null;
          titulo?: string;
        };
        Relationships: [];
      };
      personal: {
        Row: {
          apellido: string;
          celular: string | null;
          centro_jambatu: boolean;
          cumpleanos: string | null;
          cursos: string | null;
          email: string | null;
          estudios: string | null;
          id: string | null;
          id_personal: number;
          nombre: string | null;
          pagina_web: string | null;
          telefono_domicilio: string | null;
          telefono_trabajo: string | null;
          temas_interes: string | null;
          wikiri: boolean;
        };
        Insert: {
          apellido: string;
          celular?: string | null;
          centro_jambatu?: boolean;
          cumpleanos?: string | null;
          cursos?: string | null;
          email?: string | null;
          estudios?: string | null;
          id?: string | null;
          id_personal?: number;
          nombre?: string | null;
          pagina_web?: string | null;
          telefono_domicilio?: string | null;
          telefono_trabajo?: string | null;
          temas_interes?: string | null;
          wikiri?: boolean;
        };
        Update: {
          apellido?: string;
          celular?: string | null;
          centro_jambatu?: boolean;
          cumpleanos?: string | null;
          cursos?: string | null;
          email?: string | null;
          estudios?: string | null;
          id?: string | null;
          id_personal?: number;
          nombre?: string | null;
          pagina_web?: string | null;
          telefono_domicilio?: string | null;
          telefono_trabajo?: string | null;
          temas_interes?: string | null;
          wikiri?: boolean;
        };
        Relationships: [];
      };
      personal_autor: {
        Row: {
          autor_id: number;
          id_personal_autor: number;
          personal_id: number;
        };
        Insert: {
          autor_id: number;
          id_personal_autor?: number;
          personal_id: number;
        };
        Update: {
          autor_id?: number;
          id_personal_autor?: number;
          personal_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "personal_autor_personal_id_fkey";
            columns: ["personal_id"];
            isOneToOne: false;
            referencedRelation: "personal";
            referencedColumns: ["id_personal"];
          },
        ];
      };
      personal_publicacion: {
        Row: {
          borrado: boolean;
          id_personal_publicacion: number;
          personal_id: number;
          publicacion_id: number;
          publicar: boolean;
        };
        Insert: {
          borrado?: boolean;
          id_personal_publicacion?: number;
          personal_id: number;
          publicacion_id: number;
          publicar?: boolean;
        };
        Update: {
          borrado?: boolean;
          id_personal_publicacion?: number;
          personal_id?: number;
          publicacion_id?: number;
          publicar?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "personal_publicacion_personal_id_fkey";
            columns: ["personal_id"];
            isOneToOne: false;
            referencedRelation: "personal";
            referencedColumns: ["id_personal"];
          },
          {
            foreignKeyName: "personal_publicacion_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "personal_publicacion_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
        ];
      };
      publicacion: {
        Row: {
          categoria: boolean;
          cita: string | null;
          cita_corta: string | null;
          cita_larga: string | null;
          editor: boolean;
          editorial: string | null;
          fecha: string;
          id_publicacion: number;
          noticia: boolean;
          numero: string | null;
          numero_publicacion_ano: number | null;
          observaciones: string | null;
          pagina: string | null;
          palabras_clave: string | null;
          publica_en_web: boolean;
          publicacion_cj: boolean;
          resumen: string | null;
          titulo: string;
          titulo_secundario: string | null;
          volumen: string | null;
        };
        Insert: {
          categoria?: boolean;
          cita?: string | null;
          cita_corta?: string | null;
          cita_larga?: string | null;
          editor?: boolean;
          editorial?: string | null;
          fecha: string;
          id_publicacion?: number;
          noticia?: boolean;
          numero?: string | null;
          numero_publicacion_ano?: number | null;
          observaciones?: string | null;
          pagina?: string | null;
          palabras_clave?: string | null;
          publica_en_web?: boolean;
          publicacion_cj?: boolean;
          resumen?: string | null;
          titulo: string;
          titulo_secundario?: string | null;
          volumen?: string | null;
        };
        Update: {
          categoria?: boolean;
          cita?: string | null;
          cita_corta?: string | null;
          cita_larga?: string | null;
          editor?: boolean;
          editorial?: string | null;
          fecha?: string;
          id_publicacion?: number;
          noticia?: boolean;
          numero?: string | null;
          numero_publicacion_ano?: number | null;
          observaciones?: string | null;
          pagina?: string | null;
          palabras_clave?: string | null;
          publica_en_web?: boolean;
          publicacion_cj?: boolean;
          resumen?: string | null;
          titulo?: string;
          titulo_secundario?: string | null;
          volumen?: string | null;
        };
        Relationships: [];
      };
      publicacion_ano: {
        Row: {
          ano: number;
          id_publicacion_ano: number;
          publicacion_id: number;
        };
        Insert: {
          ano: number;
          id_publicacion_ano?: number;
          publicacion_id: number;
        };
        Update: {
          ano?: number;
          id_publicacion_ano?: number;
          publicacion_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "publicacion_ano_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "publicacion_ano_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
        ];
      };
      publicacion_autor: {
        Row: {
          autor_id: number;
          id_publicacion_autor: number;
          orden_autor: number;
          publicacion_id: number;
        };
        Insert: {
          autor_id: number;
          id_publicacion_autor?: number;
          orden_autor?: number;
          publicacion_id: number;
        };
        Update: {
          autor_id?: number;
          id_publicacion_autor?: number;
          orden_autor?: number;
          publicacion_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "publicacion_autor_autor_id_fkey";
            columns: ["autor_id"];
            isOneToOne: false;
            referencedRelation: "autor";
            referencedColumns: ["id_autor"];
          },
          {
            foreignKeyName: "publicacion_autor_autor_id_fkey";
            columns: ["autor_id"];
            isOneToOne: false;
            referencedRelation: "vw_autor";
            referencedColumns: ["id_autor"];
          },
          {
            foreignKeyName: "publicacion_autor_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "publicacion_autor_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
        ];
      };
      publicacion_catalogo_awe: {
        Row: {
          catalogo_awe_id: number;
          id_publicacion_catalogo_awe: number;
          publicacion_id: number;
        };
        Insert: {
          catalogo_awe_id: number;
          id_publicacion_catalogo_awe?: number;
          publicacion_id: number;
        };
        Update: {
          catalogo_awe_id?: number;
          id_publicacion_catalogo_awe?: number;
          publicacion_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "publicacion_catalogo_awe_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
        ];
      };
      publicacion_enlace: {
        Row: {
          enlace: string;
          exclusivo_cj: boolean;
          id_publicacion_enlace: number;
          publicacion_id: number;
          texto_enlace: string;
        };
        Insert: {
          enlace: string;
          exclusivo_cj?: boolean;
          id_publicacion_enlace?: number;
          publicacion_id: number;
          texto_enlace: string;
        };
        Update: {
          enlace?: string;
          exclusivo_cj?: boolean;
          id_publicacion_enlace?: number;
          publicacion_id?: number;
          texto_enlace?: string;
        };
        Relationships: [
          {
            foreignKeyName: "publicacion_enlace_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "publicacion_enlace_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
        ];
      };
      rank: {
        Row: {
          id_rank: number;
          orden: number;
          rank: string;
          rank_ingles: string | null;
        };
        Insert: {
          id_rank?: number;
          orden: number;
          rank: string;
          rank_ingles?: string | null;
        };
        Update: {
          id_rank?: number;
          orden?: number;
          rank?: string;
          rank_ingles?: string | null;
        };
        Relationships: [];
      };
      rank_geopolitica: {
        Row: {
          id_rank_geopolitica: number;
          nombre: string;
          orden: number;
        };
        Insert: {
          id_rank_geopolitica?: number;
          nombre: string;
          orden: number;
        };
        Update: {
          id_rank_geopolitica?: number;
          nombre?: string;
          orden?: number;
        };
        Relationships: [];
      };
      registro_ingreso: {
        Row: {
          fecha: string;
          id_registro_ingreso: number;
          ip_maquina: string | null;
          navegador: string | null;
          pais: string | null;
          usuario_id: number;
        };
        Insert: {
          fecha?: string;
          id_registro_ingreso?: number;
          ip_maquina?: string | null;
          navegador?: string | null;
          pais?: string | null;
          usuario_id: number;
        };
        Update: {
          fecha?: string;
          id_registro_ingreso?: number;
          ip_maquina?: string | null;
          navegador?: string | null;
          pais?: string | null;
          usuario_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "registro_ingreso_usuario_id_fkey";
            columns: ["usuario_id"];
            isOneToOne: false;
            referencedRelation: "usuario";
            referencedColumns: ["id_usuario"];
          },
        ];
      };
      spp_a_bordo: {
        Row: {
          enlace_dato_manejo: string | null;
          id_spp_a_bordo: number;
          taxon_id: number;
        };
        Insert: {
          enlace_dato_manejo?: string | null;
          id_spp_a_bordo?: number;
          taxon_id: number;
        };
        Update: {
          enlace_dato_manejo?: string | null;
          id_spp_a_bordo?: number;
          taxon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "spp_a_bordo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      spp_a_bordo_catalogo: {
        Row: {
          catalogo_id: number;
          hembras: number;
          id_spp_a_bordo_catalogo: number;
          machos: number;
          nivel_generacion: number;
          no_sexados: number;
          spp_a_bordo_id: number;
        };
        Insert: {
          catalogo_id: number;
          hembras?: number;
          id_spp_a_bordo_catalogo?: number;
          machos?: number;
          nivel_generacion?: number;
          no_sexados?: number;
          spp_a_bordo_id: number;
        };
        Update: {
          catalogo_id?: number;
          hembras?: number;
          id_spp_a_bordo_catalogo?: number;
          machos?: number;
          nivel_generacion?: number;
          no_sexados?: number;
          spp_a_bordo_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "spp_a_bordo_catalogo_catalogo_id_fkey";
            columns: ["catalogo_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "spp_a_bordo_catalogo_spp_a_bordo_id_fkey";
            columns: ["spp_a_bordo_id"];
            isOneToOne: false;
            referencedRelation: "spp_a_bordo";
            referencedColumns: ["id_spp_a_bordo"];
          },
        ];
      };
      taxon: {
        Row: {
          autor_ano: string | null;
          en_ecuador: boolean;
          endemica: boolean;
          eol: boolean | null;
          id_taxon: number;
          id_taxon_correcto: number | null;
          nombre_aceptado: boolean;
          nombre_comun: string | null;
          nombre_original: boolean;
          publicacion: string | null;
          rank_id: number | null;
          sinonimo: boolean;
          taxon: string;
          taxon_id: number | null;
        };
        Insert: {
          autor_ano?: string | null;
          en_ecuador?: boolean;
          endemica?: boolean;
          eol?: boolean | null;
          id_taxon?: number;
          id_taxon_correcto?: number | null;
          nombre_aceptado?: boolean;
          nombre_comun?: string | null;
          nombre_original?: boolean;
          publicacion?: string | null;
          rank_id?: number | null;
          sinonimo?: boolean;
          taxon: string;
          taxon_id?: number | null;
        };
        Update: {
          autor_ano?: string | null;
          en_ecuador?: boolean;
          endemica?: boolean;
          eol?: boolean | null;
          id_taxon?: number;
          id_taxon_correcto?: number | null;
          nombre_aceptado?: boolean;
          nombre_comun?: string | null;
          nombre_original?: boolean;
          publicacion?: string | null;
          rank_id?: number | null;
          sinonimo?: boolean;
          taxon?: string;
          taxon_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey";
            columns: ["rank_id"];
            isOneToOne: false;
            referencedRelation: "rank";
            referencedColumns: ["id_rank"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      taxon_catalogo_awe: {
        Row: {
          catalogo_awe_id: number;
          id_taxon_catalogo_awe: number;
          taxon_id: number;
        };
        Insert: {
          catalogo_awe_id: number;
          id_taxon_catalogo_awe?: number;
          taxon_id: number;
        };
        Update: {
          catalogo_awe_id?: number;
          id_taxon_catalogo_awe?: number;
          taxon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      taxon_catalogo_awe_region_biogeografica: {
        Row: {
          catalogo_awe_id: number;
          categoria: string;
          id_taxon_catalogo_awe_region_biogeografica: number;
          taxon_id: number;
        };
        Insert: {
          catalogo_awe_id: number;
          categoria: string;
          id_taxon_catalogo_awe_region_biogeografica?: number;
          taxon_id: number;
        };
        Update: {
          catalogo_awe_id?: number;
          categoria?: string;
          id_taxon_catalogo_awe_region_biogeografica?: number;
          taxon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      taxon_geopolitica: {
        Row: {
          geopolitica_id: number;
          id_taxon_geopolitica: number;
          principal: boolean;
          taxon_id: number;
        };
        Insert: {
          geopolitica_id: number;
          id_taxon_geopolitica?: number;
          principal?: boolean;
          taxon_id: number;
        };
        Update: {
          geopolitica_id?: number;
          id_taxon_geopolitica?: number;
          principal?: boolean;
          taxon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_geopolitica_geopolitica_id_fkey";
            columns: ["geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "geopolitica";
            referencedColumns: ["id_geopolitica"];
          },
          {
            foreignKeyName: "taxon_geopolitica_geopolitica_id_fkey";
            columns: ["geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_localidades";
            referencedColumns: ["id_geopolitica"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_geopolitica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      taxon_publicacion: {
        Row: {
          id_taxon_publicacion: number;
          principal: boolean;
          publicacion_id: number;
          svl_hembra: boolean;
          svl_macho: boolean;
          taxon_id: number;
        };
        Insert: {
          id_taxon_publicacion?: number;
          principal?: boolean;
          publicacion_id: number;
          svl_hembra?: boolean;
          svl_macho?: boolean;
          taxon_id: number;
        };
        Update: {
          id_taxon_publicacion?: number;
          principal?: boolean;
          publicacion_id?: number;
          svl_hembra?: boolean;
          svl_macho?: boolean;
          taxon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      tipo: {
        Row: {
          catalogo_awe_id: number;
          comentario: string | null;
          geopolitica_id: number | null;
          id_tipo: number;
          medidas: string | null;
          numero_museo: string;
          principal: boolean;
          publicacion_id: number | null;
          taxon_id: number;
        };
        Insert: {
          catalogo_awe_id: number;
          comentario?: string | null;
          geopolitica_id?: number | null;
          id_tipo?: number;
          medidas?: string | null;
          numero_museo: string;
          principal?: boolean;
          publicacion_id?: number | null;
          taxon_id: number;
        };
        Update: {
          catalogo_awe_id?: number;
          comentario?: string | null;
          geopolitica_id?: number | null;
          id_tipo?: number;
          medidas?: string | null;
          numero_museo?: string;
          principal?: boolean;
          publicacion_id?: number | null;
          taxon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "tipo_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "tipo_geopolitica_id_fkey";
            columns: ["geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "geopolitica";
            referencedColumns: ["id_geopolitica"];
          },
          {
            foreignKeyName: "tipo_geopolitica_id_fkey";
            columns: ["geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_localidades";
            referencedColumns: ["id_geopolitica"];
          },
          {
            foreignKeyName: "tipo_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "tipo_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "tipo_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      tipo_catalogo_awe: {
        Row: {
          descripcion: string | null;
          id_tipo_catalogo_awe: number;
          nombre: string;
        };
        Insert: {
          descripcion?: string | null;
          id_tipo_catalogo_awe?: number;
          nombre: string;
        };
        Update: {
          descripcion?: string | null;
          id_tipo_catalogo_awe?: number;
          nombre?: string;
        };
        Relationships: [];
      };
      usuario: {
        Row: {
          activo: boolean;
          administrador: boolean;
          clave: string;
          correo: string;
          fecha: string;
          id_usuario: number;
          nombre: string;
          respuesta1: string | null;
          respuesta2: string | null;
          respuesta3: string | null;
          usuario: string;
        };
        Insert: {
          activo?: boolean;
          administrador?: boolean;
          clave: string;
          correo: string;
          fecha?: string;
          id_usuario?: number;
          nombre: string;
          respuesta1?: string | null;
          respuesta2?: string | null;
          respuesta3?: string | null;
          usuario: string;
        };
        Update: {
          activo?: boolean;
          administrador?: boolean;
          clave?: string;
          correo?: string;
          fecha?: string;
          id_usuario?: number;
          nombre?: string;
          respuesta1?: string | null;
          respuesta2?: string | null;
          respuesta3?: string | null;
          usuario?: string;
        };
        Relationships: [];
      };
      video: {
        Row: {
          autor: string | null;
          descripcion: string | null;
          enlace: string;
          id_video: number;
          nombre: string;
          numero_museo: string | null;
          taxon_id: number;
          thumbnail: string | null;
        };
        Insert: {
          autor?: string | null;
          descripcion?: string | null;
          enlace?: string;
          id_video?: number;
          nombre?: string;
          numero_museo?: string | null;
          taxon_id: number;
          thumbnail?: string | null;
        };
        Update: {
          autor?: string | null;
          descripcion?: string | null;
          enlace?: string;
          id_video?: number;
          nombre?: string;
          numero_museo?: string | null;
          taxon_id?: number;
          thumbnail?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "video_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      video_web: {
        Row: {
          catalogo_id: number;
          enlace: string;
          fecha: string;
          id_video_web: number;
          titulo: string;
        };
        Insert: {
          catalogo_id: number;
          enlace: string;
          fecha?: string;
          id_video_web?: number;
          titulo: string;
        };
        Update: {
          catalogo_id?: number;
          enlace?: string;
          fecha?: string;
          id_video_web?: number;
          titulo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "video_web_catalogo_id_fkey";
            columns: ["catalogo_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
        ];
      };
      web_page_imagen: {
        Row: {
          autor: string | null;
          catalogo_awe_id: number;
          enlace: string;
          id_web_page_imagen: number;
        };
        Insert: {
          autor?: string | null;
          catalogo_awe_id: number;
          enlace: string;
          id_web_page_imagen?: number;
        };
        Update: {
          autor?: string | null;
          catalogo_awe_id?: number;
          enlace?: string;
          id_web_page_imagen?: number;
        };
        Relationships: [];
      };
      web_page_texto: {
        Row: {
          catalogo_awe_id: number;
          contenido: string;
          id_web_page_texto: number;
          titulo: string;
        };
        Insert: {
          catalogo_awe_id: number;
          contenido: string;
          id_web_page_texto?: number;
          titulo: string;
        };
        Update: {
          catalogo_awe_id?: number;
          contenido?: string;
          id_web_page_texto?: number;
          titulo?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      vista_noticias_completa: {
        Row: {
          catalogo_awe_id: number | null;
          catalogo_descripcion: string | null;
          catalogo_nombre: string | null;
          catalogo_sigla: string | null;
          enlace: string | null;
          fecha: string | null;
          fuente: string | null;
          id_noticia: number | null;
          resumen: string | null;
          texto: string | null;
          texto_enlace: string | null;
          tipo_catalogo_descripcion: string | null;
          tipo_catalogo_nombre: string | null;
          titulo: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "noticia_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
        ];
      };
      vw_autor: {
        Row: {
          apellidos: string | null;
          enlace_biografia: string | null;
          id_autor: number | null;
          nombre_completo: string | null;
          nombres: string | null;
        };
        Insert: {
          apellidos?: string | null;
          enlace_biografia?: string | null;
          id_autor?: number | null;
          nombre_completo?: never;
          nombres?: string | null;
        };
        Update: {
          apellidos?: string | null;
          enlace_biografia?: string | null;
          id_autor?: number | null;
          nombre_completo?: never;
          nombres?: string | null;
        };
        Relationships: [];
      };
      vw_ficha_especie_completa: {
        Row: {
          area_distribucion: number | null;
          awe_areas_protegidas_estado: string | null;
          awe_areas_protegidas_privadas: string | null;
          awe_bosques_protegidos: string | null;
          awe_cites: string | null;
          awe_distribucion_altitudinal: string | null;
          awe_ecosistemas: string | null;
          awe_estadio_animal: string | null;
          awe_estatus_nombre_cientifico: string | null;
          awe_estatus_tipologico: string | null;
          awe_etnia: string | null;
          awe_idioma: string | null;
          awe_lista_roja_coloma: string | null;
          awe_lista_roja_uicn: string | null;
          awe_regiones_biogeograficas: string | null;
          awe_regiones_biogeograficas_detalle: string | null;
          awe_reservas_biosfera: string | null;
          awe_tipo_generacional: string | null;
          clase: string | null;
          distribucion: string | null;
          distribucion_global: string | null;
          en_ecuador: boolean | null;
          endemica: boolean | null;
          especie: string | null;
          especie_autor: string | null;
          especie_taxon_id: number | null;
          familia: string | null;
          fuente_lista_roja: string | null;
          genero: string | null;
          id_ficha_especie: number | null;
          nombre_cientifico: string | null;
          nombre_comun: string | null;
          observacion_zona_altitudinal: string | null;
          orden: string | null;
          phylum: string | null;
          pluviocidad: number | null;
          publicar: boolean | null;
          rango_altitudinal: string | null;
          rango_altitudinal_max: number | null;
          rango_altitudinal_min: number | null;
          referencia_area_protegida: string | null;
          reino: string | null;
          temperatura: number | null;
          ubicaciones_geopoliticas: string | null;
          ubicaciones_principales: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "ficha_especie_taxon_id_fkey";
            columns: ["especie_taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_lista_especies: {
        Row: {
          autor_ano: string | null;
          en_ecuador: boolean | null;
          endemica: boolean | null;
          eol: boolean | null;
          especie: string | null;
          genero: string | null;
          id_genero: number | null;
          id_taxon: number | null;
          id_taxon_correcto: number | null;
          id_taxon_padre: number | null;
          nombre_aceptado: boolean | null;
          nombre_cientifico: string | null;
          nombre_comun: string | null;
          nombre_original: boolean | null;
          publicacion: string | null;
          rank_id: number | null;
          sinonimo: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey";
            columns: ["rank_id"];
            isOneToOne: false;
            referencedRelation: "rank";
            referencedColumns: ["id_rank"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_lista_especies_alejandro_arteaga: {
        Row: {
          autor_ano: string | null;
          en_ecuador: boolean | null;
          endemica: boolean | null;
          especie: string | null;
          genero: string | null;
          id_taxon: number | null;
          id_taxon_correcto: number | null;
          id_taxon_padre: number | null;
          nombre_cientifico: string | null;
          nombre_comun: string | null;
          publicacion: string | null;
          rank_id: number | null;
          sinonimo: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey";
            columns: ["rank_id"];
            isOneToOne: false;
            referencedRelation: "rank";
            referencedColumns: ["id_rank"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_lista_especies_george_fletcher: {
        Row: {
          autor_ano: string | null;
          en_ecuador: boolean | null;
          endemica: boolean | null;
          especie: string | null;
          genero: string | null;
          id_taxon: number | null;
          id_taxon_correcto: number | null;
          id_taxon_padre: number | null;
          nombre_cientifico: string | null;
          nombre_comun: string | null;
          publicacion: string | null;
          rank_id: number | null;
          sinonimo: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey";
            columns: ["rank_id"];
            isOneToOne: false;
            referencedRelation: "rank";
            referencedColumns: ["id_rank"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_lista_especies_jmg: {
        Row: {
          autor_ano: string | null;
          en_ecuador: boolean | null;
          endemica: boolean | null;
          especie: string | null;
          genero: string | null;
          id_taxon: number | null;
          id_taxon_correcto: number | null;
          id_taxon_padre: number | null;
          nombre_cientifico: string | null;
          nombre_comun: string | null;
          publicacion: string | null;
          rank_id: number | null;
          sinonimo: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey";
            columns: ["rank_id"];
            isOneToOne: false;
            referencedRelation: "rank";
            referencedColumns: ["id_rank"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_taxon_id_fkey";
            columns: ["id_taxon_padre"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_lista_familias: {
        Row: {
          autor_ano: string | null;
          en_ecuador: boolean | null;
          endemica: boolean | null;
          familia: string | null;
          id_familia: number | null;
          id_orden: number | null;
          id_taxon_correcto: number | null;
          nombre_aceptado: boolean | null;
          nombre_comun: string | null;
          nombre_original: boolean | null;
          orden: string | null;
          publicacion: string | null;
          rank: string | null;
          rank_id: number | null;
          sinonimo: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey";
            columns: ["rank_id"];
            isOneToOne: false;
            referencedRelation: "rank";
            referencedColumns: ["id_rank"];
          },
        ];
      };
      vw_lista_generos: {
        Row: {
          autor_ano: string | null;
          en_ecuador: boolean | null;
          endemica: boolean | null;
          familia: string | null;
          genero: string | null;
          id_familia: number | null;
          id_genero: number | null;
          id_orden: number | null;
          id_taxon_correcto: number | null;
          nombre_aceptado: boolean | null;
          nombre_comun: string | null;
          nombre_comun_familia: string | null;
          nombre_original: boolean | null;
          orden: string | null;
          publicacion: string | null;
          rank: string | null;
          rank_id: number | null;
          sinonimo: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_rank_id_fkey";
            columns: ["rank_id"];
            isOneToOne: false;
            referencedRelation: "rank";
            referencedColumns: ["id_rank"];
          },
        ];
      };
      vw_lista_localidades: {
        Row: {
          geopolitica_id: number | null;
          id_geopolitica: number | null;
          nombre: string | null;
          nombre_corto: string | null;
          rank_geopolitica_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "geopolitica_geopolitica_id_fkey";
            columns: ["geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "geopolitica";
            referencedColumns: ["id_geopolitica"];
          },
          {
            foreignKeyName: "geopolitica_geopolitica_id_fkey";
            columns: ["geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_localidades";
            referencedColumns: ["id_geopolitica"];
          },
          {
            foreignKeyName: "geopolitica_rank_geopolitica_id_fkey";
            columns: ["rank_geopolitica_id"];
            isOneToOne: false;
            referencedRelation: "rank_geopolitica";
            referencedColumns: ["id_rank_geopolitica"];
          },
        ];
      };
      vw_lista_spp: {
        Row: {
          autor_ano: string | null;
          cites: string | null;
          en_ecuador: boolean | null;
          endemica: boolean | null;
          eol: boolean | null;
          especie: string | null;
          familia: string | null;
          genero: string | null;
          id_especie: number | null;
          id_familia: number | null;
          id_genero: number | null;
          id_orden: number | null;
          id_taxon_correcto: number | null;
          lrcoloma: string | null;
          lruicn: string | null;
          nombre_aceptado: boolean | null;
          nombre_cientifico: string | null;
          nombre_comun: string | null;
          nombre_comun_familia: string | null;
          nombre_comun_genero: string | null;
          nombre_original: boolean | null;
          orden: string | null;
          publicacion: string | null;
          publicar: boolean | null;
          sinonimo: boolean | null;
        };
        Relationships: [];
      };
      vw_lista_spp_lrc: {
        Row: {
          autor_ano: string | null;
          cites: string | null;
          en_ecuador: boolean | null;
          endemica: boolean | null;
          eol: boolean | null;
          especie: string | null;
          familia: string | null;
          genero: string | null;
          id_especie: number | null;
          id_familia: number | null;
          id_genero: number | null;
          id_orden: number | null;
          id_taxon_correcto: number | null;
          lrcoloma: string | null;
          lruicn: string | null;
          nombre_aceptado: boolean | null;
          nombre_cientifico: string | null;
          nombre_comun: string | null;
          nombre_comun_familia: string | null;
          nombre_comun_genero: string | null;
          nombre_lrcoloma: string | null;
          nombre_original: boolean | null;
          orden: string | null;
          orden_lrcoloma: number | null;
          publicacion: string | null;
          publicar: boolean | null;
          sinonimo: boolean | null;
        };
        Relationships: [];
      };
      vw_nombres_comunes: {
        Row: {
          clase: string | null;
          especie: string | null;
          familia: string | null;
          genero: string | null;
          id_taxon: number | null;
          nombre_cientifico: string | null;
          nombre_comun_clase: string | null;
          nombre_comun_especie: string | null;
          nombre_comun_familia: string | null;
          nombre_comun_genero: string | null;
          nombre_comun_orden: string | null;
          nombre_comun_phylum: string | null;
          nombre_comun_reino: string | null;
          orden: string | null;
          phylum: string | null;
          reino: string | null;
        };
        Relationships: [];
      };
      vw_publicacion_categoria: {
        Row: {
          catalogo_awe_id: number | null;
          id_publicacion_catalogo_awe: number | null;
          publicacion_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "publicacion_catalogo_awe_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
        ];
      };
      vw_publicacion_sec_despliegue: {
        Row: {
          catalogo_awe_id: number | null;
          id_publicacion_catalogo_awe: number | null;
          publicacion_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "publicacion_catalogo_awe_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
        ];
      };
      vw_publicacion_slug: {
        Row: {
          cita_corta: string | null;
          fecha: string | null;
          id_publicacion: number | null;
          numero_publicacion_ano: number | null;
          slug: string | null;
          titulo: string | null;
        };
        Insert: {
          cita_corta?: string | null;
          fecha?: string | null;
          id_publicacion?: number | null;
          numero_publicacion_ano?: number | null;
          slug?: never;
          titulo?: string | null;
        };
        Update: {
          cita_corta?: string | null;
          fecha?: string | null;
          id_publicacion?: number | null;
          numero_publicacion_ano?: number | null;
          slug?: never;
          titulo?: string | null;
        };
        Relationships: [];
      };
      vw_publicacion_tipo: {
        Row: {
          catalogo_awe_id: number | null;
          id_publicacion_catalogo_awe: number | null;
          publicacion_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "publicacion_catalogo_awe_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "publicacion_catalogo_awe_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
        ];
      };
      vw_taxon_ar_pr_estado: {
        Row: {
          catalogo_awe_id: number | null;
          id_taxon_catalogo_awe: number | null;
          taxon_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_taxon_ar_pr_privada: {
        Row: {
          catalogo_awe_id: number | null;
          id_taxon_catalogo_awe: number | null;
          taxon_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_taxon_cites: {
        Row: {
          catalogo_awe_id: number | null;
          id_taxon_catalogo_awe: number | null;
          taxon_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_taxon_coloma: {
        Row: {
          catalogo_awe_id: number | null;
          id_taxon_catalogo_awe: number | null;
          taxon_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_taxon_dist_altitudinal: {
        Row: {
          catalogo_awe_id: number | null;
          id_taxon_catalogo_awe: number | null;
          taxon_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_taxon_lista_roja: {
        Row: {
          catalogo_awe_id: number | null;
          id_taxon_catalogo_awe: number | null;
          taxon_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_taxon_publicacion: {
        Row: {
          id_taxon_publicacion: number | null;
          principal: boolean | null;
          publicacion_id: number | null;
          svl_hembra: boolean | null;
          svl_macho: boolean | null;
          taxon_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "publicacion";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "taxon_publicacion_publicacion_id_fkey";
            columns: ["publicacion_id"];
            isOneToOne: false;
            referencedRelation: "vw_publicacion_slug";
            referencedColumns: ["id_publicacion"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_publicacion_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_taxon_region_biogeografica: {
        Row: {
          catalogo_awe_id: number | null;
          categoria: string | null;
          id_taxon_catalogo_awe_region_biogeografica: number | null;
          taxon_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_catalogo_awe_id_fkey";
            columns: ["catalogo_awe_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_awe";
            referencedColumns: ["id_catalogo_awe"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "taxon";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_alejandro_arteaga";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_george_fletcher";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_especies_jmg";
            referencedColumns: ["id_taxon"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_familias";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_generos";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp";
            referencedColumns: ["id_orden"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_especie"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_familia"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_genero"];
          },
          {
            foreignKeyName: "taxon_catalogo_awe_region_biogeografica_taxon_id_fkey";
            columns: ["taxon_id"];
            isOneToOne: false;
            referencedRelation: "vw_lista_spp_lrc";
            referencedColumns: ["id_orden"];
          },
        ];
      };
      vw_tipo_catalogo_lac: {
        Row: {
          descripcion: string | null;
          id_tipo_catalogo_awe: number | null;
          nombre: string | null;
        };
        Insert: {
          descripcion?: string | null;
          id_tipo_catalogo_awe?: number | null;
          nombre?: string | null;
        };
        Update: {
          descripcion?: string | null;
          id_tipo_catalogo_awe?: number | null;
          nombre?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      generate_publicacion_slug: {
        Args: {
          año_num: number;
          cita_corta_text: string;
          id_publicacion_num: number;
          titulo_text: string;
        };
        Returns: string;
      };
      get_taxon_geopolitica_hierarchy: {
        Args: { _taxon_id: number };
        Returns: {
          depth: number;
          id_geopolitica: number;
          nombre: string;
          parent_id: number;
          rank_geopolitica_id: number;
          rank_id: number;
          rank_nombre: string;
        }[];
      };
      get_taxon_lineage: {
        Args: { p_id_taxon: number };
        Returns: {
          depth: number;
          id_taxon: number;
          parent_id: number;
          rank: Json;
          rank_id: number;
          taxon: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
