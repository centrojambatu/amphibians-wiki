export type Json = string | number | boolean | null | {[key: string]: Json | undefined} | Json[];

export interface Database {
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
          idanimacion: number;
          nombre: string;
          taxon_idtaxon: number;
          thumbnail: string | null;
        };
        Insert: {
          descripcion?: string | null;
          enlace?: string;
          idanimacion?: number;
          nombre?: string;
          taxon_idtaxon: number;
          thumbnail?: string | null;
        };
        Update: {
          descripcion?: string | null;
          enlace?: string;
          idanimacion?: number;
          nombre?: string;
          taxon_idtaxon?: number;
          thumbnail?: string | null;
        };
        Relationships: [];
      };
      audio: {
        Row: {
          autor: string | null;
          descripcion: string | null;
          fecha: string | null;
          idaudio: number;
          nombre: string;
          numeromuseo: string | null;
          taxon_idtaxon: number;
          urlaudio: string;
          urlfotografia: string | null;
          urlosciloespetrograma: string | null;
          urlpublicacion: string | null;
        };
        Insert: {
          autor?: string | null;
          descripcion?: string | null;
          fecha?: string | null;
          idaudio?: number;
          nombre?: string;
          numeromuseo?: string | null;
          taxon_idtaxon: number;
          urlaudio?: string;
          urlfotografia?: string | null;
          urlosciloespetrograma?: string | null;
          urlpublicacion?: string | null;
        };
        Update: {
          autor?: string | null;
          descripcion?: string | null;
          fecha?: string | null;
          idaudio?: number;
          nombre?: string;
          numeromuseo?: string | null;
          taxon_idtaxon?: number;
          urlaudio?: string;
          urlfotografia?: string | null;
          urlosciloespetrograma?: string | null;
          urlpublicacion?: string | null;
        };
        Relationships: [];
      };
      autor: {
        Row: {
          apellidos: string;
          biografia_idbiografia: number | null;
          enlacebiografia: string | null;
          idautor: number;
          nombres: string | null;
        };
        Insert: {
          apellidos: string;
          biografia_idbiografia?: number | null;
          enlacebiografia?: string | null;
          idautor?: number;
          nombres?: string | null;
        };
        Update: {
          apellidos?: string;
          biografia_idbiografia?: number | null;
          enlacebiografia?: string | null;
          idautor?: number;
          nombres?: string | null;
        };
        Relationships: [];
      };
      biografia: {
        Row: {
          anonacimiento: number | null;
          asociacionesprofesionales: string | null;
          email: string | null;
          experiencialaboral: string | null;
          idbiografia: number;
          iniciointeresestudio: string | null;
          interesinvestigacion: string | null;
          lugarnacimiento: string | null;
          posicionactual: string | null;
          premiosreconocimientos: string | null;
          titulosacademicos: string | null;
        };
        Insert: {
          anonacimiento?: number | null;
          asociacionesprofesionales?: string | null;
          email?: string | null;
          experiencialaboral?: string | null;
          idbiografia?: number;
          iniciointeresestudio?: string | null;
          interesinvestigacion?: string | null;
          lugarnacimiento?: string | null;
          posicionactual?: string | null;
          premiosreconocimientos?: string | null;
          titulosacademicos?: string | null;
        };
        Update: {
          anonacimiento?: number | null;
          asociacionesprofesionales?: string | null;
          email?: string | null;
          experiencialaboral?: string | null;
          idbiografia?: number;
          iniciointeresestudio?: string | null;
          interesinvestigacion?: string | null;
          lugarnacimiento?: string | null;
          posicionactual?: string | null;
          premiosreconocimientos?: string | null;
          titulosacademicos?: string | null;
        };
        Relationships: [];
      };
      boletin: {
        Row: {
          catalogo_idcatalogo: number;
          enlace: string;
          fecha: string;
          idboletin: number;
          titulo: string | null;
        };
        Insert: {
          catalogo_idcatalogo: number;
          enlace: string;
          fecha?: string;
          idboletin?: number;
          titulo?: string | null;
        };
        Update: {
          catalogo_idcatalogo?: number;
          enlace?: string;
          fecha?: string;
          idboletin?: number;
          titulo?: string | null;
        };
        Relationships: [];
      };
      catalogoawe: {
        Row: {
          descripcion: string | null;
          idcatalogoawe: number;
          nombre: string;
          orden: number | null;
          sigla: string | null;
          tipocatalogoawe_idtipocatalogoawe: number;
        };
        Insert: {
          descripcion?: string | null;
          idcatalogoawe?: number;
          nombre: string;
          orden?: number | null;
          sigla?: string | null;
          tipocatalogoawe_idtipocatalogoawe: number;
        };
        Update: {
          descripcion?: string | null;
          idcatalogoawe?: number;
          nombre?: string;
          orden?: number | null;
          sigla?: string | null;
          tipocatalogoawe_idtipocatalogoawe?: number;
        };
        Relationships: [];
      };
      enlacerelacionadomanejoexsitu: {
        Row: {
          enlace: string;
          idenlacerelacionadomanejoexsitu: number;
          manejoexsitu_idmanejoexsitu: number;
          manejoexsitu_taxon_idtaxon: number;
          nombre: string;
        };
        Insert: {
          enlace?: string;
          idenlacerelacionadomanejoexsitu?: number;
          manejoexsitu_idmanejoexsitu: number;
          manejoexsitu_taxon_idtaxon: number;
          nombre?: string;
        };
        Update: {
          enlace?: string;
          idenlacerelacionadomanejoexsitu?: number;
          manejoexsitu_idmanejoexsitu?: number;
          manejoexsitu_taxon_idtaxon?: number;
          nombre?: string;
        };
        Relationships: [];
      };
      enlacerelacionadotaxon: {
        Row: {
          enlace: string;
          idenlacerelacionadotaxon: number;
          nombre: string;
          taxon_idtaxon: number;
        };
        Insert: {
          enlace?: string;
          idenlacerelacionadotaxon?: number;
          nombre?: string;
          taxon_idtaxon: number;
        };
        Update: {
          enlace?: string;
          idenlacerelacionadotaxon?: number;
          nombre?: string;
          taxon_idtaxon?: number;
        };
        Relationships: [];
      };
      fichaespecie: {
        Row: {
          agradecimiento: string | null;
          asw: string | null;
          autorfotoficha: string | null;
          autoriacompilador: string | null;
          autoriaeditor: string | null;
          aw: string | null;
          blog: string | null;
          canto: string | null;
          colector: string | null;
          colorenpreservacion: string | null;
          colorenvida: string | null;
          comentarioestatuspoblacional: string | null;
          compilador: string | null;
          descripcion: string | null;
          descubridor: string | null;
          diagnosis: string | null;
          dieta: string | null;
          distribucion: string | null;
          distribucionglobal: string | null;
          editor: string | null;
          etimologia: string | null;
          fechaactualizacion: string | null;
          fechacompilacion: string | null;
          fechaedicion: string | null;
          fotografiaficha: string | null;
          fuentelistaroja: string | null;
          genbank: string | null;
          habitatbiologia: string | null;
          herpnet: string | null;
          historial: string | null;
          identificacion: string | null;
          idfichaespecie: number;
          inaturalist: string | null;
          informacionadicional: string | null;
          larva: string | null;
          morfometria: string | null;
          observacionzonaaltitudinal: string | null;
          publicar: boolean;
          rangoaltitudinal: string | null;
          referenciaareaprotegida: string | null;
          reproduccion: string | null;
          sinonimia: string | null;
          svlhembra: string | null;
          svlmacho: string | null;
          taxon_idtaxon: number;
          taxonomia: string | null;
          uicn: string | null;
          usos: string | null;
          wikipedia: string | null;
        };
        Insert: {
          agradecimiento?: string | null;
          asw?: string | null;
          autorfotoficha?: string | null;
          autoriacompilador?: string | null;
          autoriaeditor?: string | null;
          aw?: string | null;
          blog?: string | null;
          canto?: string | null;
          colector?: string | null;
          colorenpreservacion?: string | null;
          colorenvida?: string | null;
          comentarioestatuspoblacional?: string | null;
          compilador?: string | null;
          descripcion?: string | null;
          descubridor?: string | null;
          diagnosis?: string | null;
          dieta?: string | null;
          distribucion?: string | null;
          distribucionglobal?: string | null;
          editor?: string | null;
          etimologia?: string | null;
          fechaactualizacion?: string | null;
          fechacompilacion?: string | null;
          fechaedicion?: string | null;
          fotografiaficha?: string | null;
          fuentelistaroja?: string | null;
          genbank?: string | null;
          habitatbiologia?: string | null;
          herpnet?: string | null;
          historial?: string | null;
          identificacion?: string | null;
          idfichaespecie?: number;
          inaturalist?: string | null;
          informacionadicional?: string | null;
          larva?: string | null;
          morfometria?: string | null;
          observacionzonaaltitudinal?: string | null;
          publicar?: boolean;
          rangoaltitudinal?: string | null;
          referenciaareaprotegida?: string | null;
          reproduccion?: string | null;
          sinonimia?: string | null;
          svlhembra?: string | null;
          svlmacho?: string | null;
          taxon_idtaxon: number;
          taxonomia?: string | null;
          uicn?: string | null;
          usos?: string | null;
          wikipedia?: string | null;
        };
        Update: {
          agradecimiento?: string | null;
          asw?: string | null;
          autorfotoficha?: string | null;
          autoriacompilador?: string | null;
          autoriaeditor?: string | null;
          aw?: string | null;
          blog?: string | null;
          canto?: string | null;
          colector?: string | null;
          colorenpreservacion?: string | null;
          colorenvida?: string | null;
          comentarioestatuspoblacional?: string | null;
          compilador?: string | null;
          descripcion?: string | null;
          descubridor?: string | null;
          diagnosis?: string | null;
          dieta?: string | null;
          distribucion?: string | null;
          distribucionglobal?: string | null;
          editor?: string | null;
          etimologia?: string | null;
          fechaactualizacion?: string | null;
          fechacompilacion?: string | null;
          fechaedicion?: string | null;
          fotografiaficha?: string | null;
          fuentelistaroja?: string | null;
          genbank?: string | null;
          habitatbiologia?: string | null;
          herpnet?: string | null;
          historial?: string | null;
          identificacion?: string | null;
          idfichaespecie?: number;
          inaturalist?: string | null;
          informacionadicional?: string | null;
          larva?: string | null;
          morfometria?: string | null;
          observacionzonaaltitudinal?: string | null;
          publicar?: boolean;
          rangoaltitudinal?: string | null;
          referenciaareaprotegida?: string | null;
          reproduccion?: string | null;
          sinonimia?: string | null;
          svlhembra?: string | null;
          svlmacho?: string | null;
          taxon_idtaxon?: number;
          taxonomia?: string | null;
          uicn?: string | null;
          usos?: string | null;
          wikipedia?: string | null;
        };
        Relationships: [];
      };
      fotografia: {
        Row: {
          autor: string | null;
          catalogoawe_idcatalogoawe: number;
          descripcion: string | null;
          enlace: string;
          idfotografia: number;
          nombre: string;
          numeromuseo: string | null;
          orden: number | null;
          taxon_idtaxon: number;
          thumbnail: string | null;
        };
        Insert: {
          autor?: string | null;
          catalogoawe_idcatalogoawe: number;
          descripcion?: string | null;
          enlace?: string;
          idfotografia?: number;
          nombre?: string;
          numeromuseo?: string | null;
          orden?: number | null;
          taxon_idtaxon: number;
          thumbnail?: string | null;
        };
        Update: {
          autor?: string | null;
          catalogoawe_idcatalogoawe?: number;
          descripcion?: string | null;
          enlace?: string;
          idfotografia?: number;
          nombre?: string;
          numeromuseo?: string | null;
          orden?: number | null;
          taxon_idtaxon?: number;
          thumbnail?: string | null;
        };
        Relationships: [];
      };
      geopolitica: {
        Row: {
          geopolitica_idgeopolitica: number | null;
          idgeopolitica: number;
          nombre: string;
          rankgeopolitica_idrankgeopolitica: number;
        };
        Insert: {
          geopolitica_idgeopolitica?: number | null;
          idgeopolitica?: number;
          nombre: string;
          rankgeopolitica_idrankgeopolitica: number;
        };
        Update: {
          geopolitica_idgeopolitica?: number | null;
          idgeopolitica?: number;
          nombre?: string;
          rankgeopolitica_idrankgeopolitica?: number;
        };
        Relationships: [];
      };
      imagenpagintro: {
        Row: {
          autor: string | null;
          catalogo_idcatalogo: number;
          descripcion: string | null;
          enlace: string;
          enlacenota: string | null;
          idimagenpagintro: number;
          publicar: boolean;
        };
        Insert: {
          autor?: string | null;
          catalogo_idcatalogo: number;
          descripcion?: string | null;
          enlace: string;
          enlacenota?: string | null;
          idimagenpagintro?: number;
          publicar?: boolean;
        };
        Update: {
          autor?: string | null;
          catalogo_idcatalogo?: number;
          descripcion?: string | null;
          enlace?: string;
          enlacenota?: string | null;
          idimagenpagintro?: number;
          publicar?: boolean;
        };
        Relationships: [];
      };
      infoespecie: {
        Row: {
          contenido: string;
          fecha: string;
          fotografia_idfotografia: number;
          idinfoespecie: number;
          publicar: boolean;
          taxon_idtaxon: number;
          tipo: boolean;
          titulo: string | null;
        };
        Insert: {
          contenido: string;
          fecha?: string;
          fotografia_idfotografia: number;
          idinfoespecie?: number;
          publicar?: boolean;
          taxon_idtaxon: number;
          tipo?: boolean;
          titulo?: string | null;
        };
        Update: {
          contenido?: string;
          fecha?: string;
          fotografia_idfotografia?: number;
          idinfoespecie?: number;
          publicar?: boolean;
          taxon_idtaxon?: number;
          tipo?: boolean;
          titulo?: string | null;
        };
        Relationships: [];
      };
      manejoexsitu: {
        Row: {
          administracionproyectorecursos: string | null;
          antecedente: string | null;
          autorfotoexsitu: string | null;
          cita: string | null;
          comentarios: string | null;
          dietanutricion: string | null;
          diversidadgenetica: string | null;
          enlaceplanmenajo: string | null;
          fechaactualizacion: string | null;
          fotografiaexsitu: string | null;
          geneticapieparental: string | null;
          historialficha: string | null;
          idmanejoexsitu: number;
          mantenimiento: string | null;
          numeroadultohembra: number | null;
          numeroadultomacho: number | null;
          numerofundadorhembra: number | null;
          numerofundadormacho: number | null;
          numerofundadornd: number | null;
          numerofundadorrenacuajo: number | null;
          numerojuvenil: number | null;
          numerorenacuajo: number | null;
          planmanejo: string | null;
          procedenciahabitat: string | null;
          publicar: boolean;
          reintroduccion: string | null;
          reproduccioncomportamiento: string | null;
          taxon_idtaxon: number;
        };
        Insert: {
          administracionproyectorecursos?: string | null;
          antecedente?: string | null;
          autorfotoexsitu?: string | null;
          cita?: string | null;
          comentarios?: string | null;
          dietanutricion?: string | null;
          diversidadgenetica?: string | null;
          enlaceplanmenajo?: string | null;
          fechaactualizacion?: string | null;
          fotografiaexsitu?: string | null;
          geneticapieparental?: string | null;
          historialficha?: string | null;
          idmanejoexsitu?: number;
          mantenimiento?: string | null;
          numeroadultohembra?: number | null;
          numeroadultomacho?: number | null;
          numerofundadorhembra?: number | null;
          numerofundadormacho?: number | null;
          numerofundadornd?: number | null;
          numerofundadorrenacuajo?: number | null;
          numerojuvenil?: number | null;
          numerorenacuajo?: number | null;
          planmanejo?: string | null;
          procedenciahabitat?: string | null;
          publicar?: boolean;
          reintroduccion?: string | null;
          reproduccioncomportamiento?: string | null;
          taxon_idtaxon: number;
        };
        Update: {
          administracionproyectorecursos?: string | null;
          antecedente?: string | null;
          autorfotoexsitu?: string | null;
          cita?: string | null;
          comentarios?: string | null;
          dietanutricion?: string | null;
          diversidadgenetica?: string | null;
          enlaceplanmenajo?: string | null;
          fechaactualizacion?: string | null;
          fotografiaexsitu?: string | null;
          geneticapieparental?: string | null;
          historialficha?: string | null;
          idmanejoexsitu?: number;
          mantenimiento?: string | null;
          numeroadultohembra?: number | null;
          numeroadultomacho?: number | null;
          numerofundadorhembra?: number | null;
          numerofundadormacho?: number | null;
          numerofundadornd?: number | null;
          numerofundadorrenacuajo?: number | null;
          numerojuvenil?: number | null;
          numerorenacuajo?: number | null;
          planmanejo?: string | null;
          procedenciahabitat?: string | null;
          publicar?: boolean;
          reintroduccion?: string | null;
          reproduccioncomportamiento?: string | null;
          taxon_idtaxon?: number;
        };
        Relationships: [];
      };
      manejoexsitugeopolitica: {
        Row: {
          geopolitica_idgeopolitica: number;
          idmanejoexsitugeopolitica: number;
          manejoexsitu_idmanejoexsitu: number;
          manejoexsitu_taxon_idtaxon: number;
          microhabitat: string | null;
        };
        Insert: {
          geopolitica_idgeopolitica: number;
          idmanejoexsitugeopolitica?: number;
          manejoexsitu_idmanejoexsitu: number;
          manejoexsitu_taxon_idtaxon: number;
          microhabitat?: string | null;
        };
        Update: {
          geopolitica_idgeopolitica?: number;
          idmanejoexsitugeopolitica?: number;
          manejoexsitu_idmanejoexsitu?: number;
          manejoexsitu_taxon_idtaxon?: number;
          microhabitat?: string | null;
        };
        Relationships: [];
      };
      manejoexsituprotocolo: {
        Row: {
          catalogoawe_idcatalogoawe: number;
          idmanejoexsituprotocolo: number;
          manejoexsitu_idmanejoexsitu: number;
          manejoexsitu_taxon_idtaxon: number;
          protocolo: string;
        };
        Insert: {
          catalogoawe_idcatalogoawe: number;
          idmanejoexsituprotocolo?: number;
          manejoexsitu_idmanejoexsitu: number;
          manejoexsitu_taxon_idtaxon: number;
          protocolo: string;
        };
        Update: {
          catalogoawe_idcatalogoawe?: number;
          idmanejoexsituprotocolo?: number;
          manejoexsitu_idmanejoexsitu?: number;
          manejoexsitu_taxon_idtaxon?: number;
          protocolo?: string;
        };
        Relationships: [];
      };
      manejoexsitupublicacion: {
        Row: {
          idmanejoexsitupublicacion: number;
          manejoexsitu_idmanejoexsitu: number;
          manejoexsitu_taxon_idtaxon: number;
          publicacion_idpublicacion: number;
        };
        Insert: {
          idmanejoexsitupublicacion?: number;
          manejoexsitu_idmanejoexsitu: number;
          manejoexsitu_taxon_idtaxon: number;
          publicacion_idpublicacion: number;
        };
        Update: {
          idmanejoexsitupublicacion?: number;
          manejoexsitu_idmanejoexsitu?: number;
          manejoexsitu_taxon_idtaxon?: number;
          publicacion_idpublicacion?: number;
        };
        Relationships: [];
      };
      mapa: {
        Row: {
          descripcion: string | null;
          enlace: string;
          idmapa: number;
          nombre: string;
          taxon_idtaxon: number;
          thumbnail: string | null;
        };
        Insert: {
          descripcion?: string | null;
          enlace?: string;
          idmapa?: number;
          nombre?: string;
          taxon_idtaxon: number;
          thumbnail?: string | null;
        };
        Update: {
          descripcion?: string | null;
          enlace?: string;
          idmapa?: number;
          nombre?: string;
          taxon_idtaxon?: number;
          thumbnail?: string | null;
        };
        Relationships: [];
      };
      marcador: {
        Row: {
          codigo: string | null;
          descripcion: string;
          idmarcador: number;
          marcador: string;
          pagina_idpagina: number;
          timestampactualizar: string | null;
          valorfinal: string | null;
          valortemporal: string | null;
        };
        Insert: {
          codigo?: string | null;
          descripcion: string;
          idmarcador?: number;
          marcador: string;
          pagina_idpagina: number;
          timestampactualizar?: string | null;
          valorfinal?: string | null;
          valortemporal?: string | null;
        };
        Update: {
          codigo?: string | null;
          descripcion?: string;
          idmarcador?: number;
          marcador?: string;
          pagina_idpagina?: number;
          timestampactualizar?: string | null;
          valorfinal?: string | null;
          valortemporal?: string | null;
        };
        Relationships: [];
      };
      menu: {
        Row: {
          contenido: boolean;
          enlace: string | null;
          idmenu: number;
          nivel: number;
          nombre: string;
          orden: number;
          target: boolean | null;
        };
        Insert: {
          contenido?: boolean;
          enlace?: string | null;
          idmenu?: number;
          nivel?: number;
          nombre: string;
          orden?: number;
          target?: boolean | null;
        };
        Update: {
          contenido?: boolean;
          enlace?: string | null;
          idmenu?: number;
          nivel?: number;
          nombre?: string;
          orden?: number;
          target?: boolean | null;
        };
        Relationships: [];
      };
      menuadmin: {
        Row: {
          enlace: string | null;
          idmenuadmin: number;
          menuadmin_idmenuadmin: number;
          nivel: number;
          nombre: string | null;
          orden: number;
        };
        Insert: {
          enlace?: string | null;
          idmenuadmin?: number;
          menuadmin_idmenuadmin: number;
          nivel?: number;
          nombre?: string | null;
          orden?: number;
        };
        Update: {
          enlace?: string | null;
          idmenuadmin?: number;
          menuadmin_idmenuadmin?: number;
          nivel?: number;
          nombre?: string | null;
          orden?: number;
        };
        Relationships: [];
      };
      menuadminusuario: {
        Row: {
          activado: boolean;
          idmenuadminusuario: number;
          menuadmin_idmenuadmin: number;
          usuario_idusuario: number;
        };
        Insert: {
          activado?: boolean;
          idmenuadminusuario?: number;
          menuadmin_idmenuadmin: number;
          usuario_idusuario: number;
        };
        Update: {
          activado?: boolean;
          idmenuadminusuario?: number;
          menuadmin_idmenuadmin?: number;
          usuario_idusuario?: number;
        };
        Relationships: [];
      };
      menucatalogo: {
        Row: {
          activo: boolean;
          catalogo_idcatalogo: number;
          idmenucatalogo: number;
          menu_idmenu: number;
        };
        Insert: {
          activo?: boolean;
          catalogo_idcatalogo: number;
          idmenucatalogo?: number;
          menu_idmenu: number;
        };
        Update: {
          activo?: boolean;
          catalogo_idcatalogo?: number;
          idmenucatalogo?: number;
          menu_idmenu?: number;
        };
        Relationships: [];
      };
      nombrecomun: {
        Row: {
          catalogoawe_idcatalogoaweetnia: number | null;
          catalogoawe_idcatalogoaweidioma: number | null;
          comentario: string | null;
          idnombrecomun: number;
          nombre: string;
          principal: boolean;
          publicacion_idpublicacion: number | null;
          taxon_idtaxon: number;
        };
        Insert: {
          catalogoawe_idcatalogoaweetnia?: number | null;
          catalogoawe_idcatalogoaweidioma?: number | null;
          comentario?: string | null;
          idnombrecomun?: number;
          nombre: string;
          principal: boolean;
          publicacion_idpublicacion?: number | null;
          taxon_idtaxon: number;
        };
        Update: {
          catalogoawe_idcatalogoaweetnia?: number | null;
          catalogoawe_idcatalogoaweidioma?: number | null;
          comentario?: string | null;
          idnombrecomun?: number;
          nombre?: string;
          principal?: boolean;
          publicacion_idpublicacion?: number | null;
          taxon_idtaxon?: number;
        };
        Relationships: [];
      };
      noticia: {
        Row: {
          catalogoawe_idcatalogoawe: number;
          enlace: string | null;
          fecha: string;
          fuente: string | null;
          idnoticia: number;
          resumen: string;
          texto: string;
          textoenlace: string | null;
          titulo: string;
        };
        Insert: {
          catalogoawe_idcatalogoawe: number;
          enlace?: string | null;
          fecha: string;
          fuente?: string | null;
          idnoticia?: number;
          resumen: string;
          texto: string;
          textoenlace?: string | null;
          titulo: string;
        };
        Update: {
          catalogoawe_idcatalogoawe?: number;
          enlace?: string | null;
          fecha?: string;
          fuente?: string | null;
          idnoticia?: number;
          resumen?: string;
          texto?: string;
          textoenlace?: string | null;
          titulo?: string;
        };
        Relationships: [];
      };
      noticiaenlace: {
        Row: {
          enlace: string;
          idnoticiaenlace: number;
          noticia_idnoticia: number;
          texto: string;
        };
        Insert: {
          enlace: string;
          idnoticiaenlace?: number;
          noticia_idnoticia: number;
          texto: string;
        };
        Update: {
          enlace?: string;
          idnoticiaenlace?: number;
          noticia_idnoticia?: number;
          texto?: string;
        };
        Relationships: [];
      };
      pagina: {
        Row: {
          contenido: string;
          idpagina: number;
          menu_idmenu: number;
          orden: number | null;
          subtitulo: string | null;
          titulo: string;
        };
        Insert: {
          contenido: string;
          idpagina?: number;
          menu_idmenu: number;
          orden?: number | null;
          subtitulo?: string | null;
          titulo: string;
        };
        Update: {
          contenido?: string;
          idpagina?: number;
          menu_idmenu?: number;
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
          centrojambatu: boolean;
          cumpleanos: string | null;
          cursos: string | null;
          email: string | null;
          estudios: string | null;
          id: string | null;
          idpersonal: number;
          nombre: string | null;
          paginaweb: string | null;
          telefonodomicilio: string | null;
          telefonotrabajo: string | null;
          temasinteres: string | null;
          wikiri: boolean;
        };
        Insert: {
          apellido: string;
          celular?: string | null;
          centrojambatu?: boolean;
          cumpleanos?: string | null;
          cursos?: string | null;
          email?: string | null;
          estudios?: string | null;
          id?: string | null;
          idpersonal?: number;
          nombre?: string | null;
          paginaweb?: string | null;
          telefonodomicilio?: string | null;
          telefonotrabajo?: string | null;
          temasinteres?: string | null;
          wikiri?: boolean;
        };
        Update: {
          apellido?: string;
          celular?: string | null;
          centrojambatu?: boolean;
          cumpleanos?: string | null;
          cursos?: string | null;
          email?: string | null;
          estudios?: string | null;
          id?: string | null;
          idpersonal?: number;
          nombre?: string | null;
          paginaweb?: string | null;
          telefonodomicilio?: string | null;
          telefonotrabajo?: string | null;
          temasinteres?: string | null;
          wikiri?: boolean;
        };
        Relationships: [];
      };
      personalautor: {
        Row: {
          autor_idautor: number;
          idpersonalautor: number;
          personal_idpersonal: number;
        };
        Insert: {
          autor_idautor: number;
          idpersonalautor?: number;
          personal_idpersonal: number;
        };
        Update: {
          autor_idautor?: number;
          idpersonalautor?: number;
          personal_idpersonal?: number;
        };
        Relationships: [];
      };
      personalpublicacion: {
        Row: {
          borrado: boolean;
          idpersonalpublicacion: number;
          personal_idpersonal: number;
          publicacion_idpublicacion: number;
          publicar: boolean;
        };
        Insert: {
          borrado?: boolean;
          idpersonalpublicacion?: number;
          personal_idpersonal: number;
          publicacion_idpublicacion: number;
          publicar?: boolean;
        };
        Update: {
          borrado?: boolean;
          idpersonalpublicacion?: number;
          personal_idpersonal?: number;
          publicacion_idpublicacion?: number;
          publicar?: boolean;
        };
        Relationships: [];
      };
      publicacion: {
        Row: {
          categoria: boolean;
          cita: string | null;
          citacorta: string | null;
          citalarga: string | null;
          editor: boolean;
          editorial: string | null;
          fecha: string;
          idpublicacion: number;
          noticia: boolean;
          numero: string | null;
          numeropublicacionano: number | null;
          observaciones: string | null;
          pagina: string | null;
          palabrasclave: string | null;
          publicacioncj: boolean;
          publicaenweb: boolean;
          resumen: string | null;
          titulo: string;
          titulosecundario: string | null;
          volumen: string | null;
        };
        Insert: {
          categoria?: boolean;
          cita?: string | null;
          citacorta?: string | null;
          citalarga?: string | null;
          editor?: boolean;
          editorial?: string | null;
          fecha: string;
          idpublicacion?: number;
          noticia?: boolean;
          numero?: string | null;
          numeropublicacionano?: number | null;
          observaciones?: string | null;
          pagina?: string | null;
          palabrasclave?: string | null;
          publicacioncj?: boolean;
          publicaenweb?: boolean;
          resumen?: string | null;
          titulo: string;
          titulosecundario?: string | null;
          volumen?: string | null;
        };
        Update: {
          categoria?: boolean;
          cita?: string | null;
          citacorta?: string | null;
          citalarga?: string | null;
          editor?: boolean;
          editorial?: string | null;
          fecha?: string;
          idpublicacion?: number;
          noticia?: boolean;
          numero?: string | null;
          numeropublicacionano?: number | null;
          observaciones?: string | null;
          pagina?: string | null;
          palabrasclave?: string | null;
          publicacioncj?: boolean;
          publicaenweb?: boolean;
          resumen?: string | null;
          titulo?: string;
          titulosecundario?: string | null;
          volumen?: string | null;
        };
        Relationships: [];
      };
      publicacionano: {
        Row: {
          ano: number;
          idpublicacionano: number;
          publicacion_idpublicacion: number;
        };
        Insert: {
          ano: number;
          idpublicacionano?: number;
          publicacion_idpublicacion: number;
        };
        Update: {
          ano?: number;
          idpublicacionano?: number;
          publicacion_idpublicacion?: number;
        };
        Relationships: [];
      };
      publicacionautor: {
        Row: {
          autor_idautor: number;
          idpublicacionautor: number;
          ordenautor: number;
          publicacion_idpublicacion: number;
        };
        Insert: {
          autor_idautor: number;
          idpublicacionautor?: number;
          ordenautor?: number;
          publicacion_idpublicacion: number;
        };
        Update: {
          autor_idautor?: number;
          idpublicacionautor?: number;
          ordenautor?: number;
          publicacion_idpublicacion?: number;
        };
        Relationships: [];
      };
      publicacioncatalogoawe: {
        Row: {
          catalogoawe_idcatalogoawe: number;
          idpublicacioncatalogoawe: number;
          publicacion_idpublicacion: number;
        };
        Insert: {
          catalogoawe_idcatalogoawe: number;
          idpublicacioncatalogoawe?: number;
          publicacion_idpublicacion: number;
        };
        Update: {
          catalogoawe_idcatalogoawe?: number;
          idpublicacioncatalogoawe?: number;
          publicacion_idpublicacion?: number;
        };
        Relationships: [];
      };
      publicacionenlace: {
        Row: {
          enlace: string;
          exclusivocj: boolean;
          idpublicacionenlace: number;
          publicacion_idpublicacion: number;
          textoenlace: string;
        };
        Insert: {
          enlace: string;
          exclusivocj?: boolean;
          idpublicacionenlace?: number;
          publicacion_idpublicacion: number;
          textoenlace: string;
        };
        Update: {
          enlace?: string;
          exclusivocj?: boolean;
          idpublicacionenlace?: number;
          publicacion_idpublicacion?: number;
          textoenlace?: string;
        };
        Relationships: [];
      };
      rank: {
        Row: {
          idrank: number;
          orden: number;
          rank: string;
          rankingles: string | null;
        };
        Insert: {
          idrank?: number;
          orden: number;
          rank: string;
          rankingles?: string | null;
        };
        Update: {
          idrank?: number;
          orden?: number;
          rank?: string;
          rankingles?: string | null;
        };
        Relationships: [];
      };
      rankgeopolitica: {
        Row: {
          idrankgeopolitica: number;
          nombre: string;
          orden: number;
        };
        Insert: {
          idrankgeopolitica?: number;
          nombre: string;
          orden: number;
        };
        Update: {
          idrankgeopolitica?: number;
          nombre?: string;
          orden?: number;
        };
        Relationships: [];
      };
      registroingreso: {
        Row: {
          fecha: string;
          idregistroingreso: number;
          ipmaquina: string | null;
          navegador: string | null;
          pais: string | null;
          usuario_idusuario: number;
        };
        Insert: {
          fecha?: string;
          idregistroingreso?: number;
          ipmaquina?: string | null;
          navegador?: string | null;
          pais?: string | null;
          usuario_idusuario: number;
        };
        Update: {
          fecha?: string;
          idregistroingreso?: number;
          ipmaquina?: string | null;
          navegador?: string | null;
          pais?: string | null;
          usuario_idusuario?: number;
        };
        Relationships: [];
      };
      sppabordo: {
        Row: {
          enlacedatomanejo: string | null;
          idsppabordo: number;
          taxon_idtaxon: number;
        };
        Insert: {
          enlacedatomanejo?: string | null;
          idsppabordo?: number;
          taxon_idtaxon: number;
        };
        Update: {
          enlacedatomanejo?: string | null;
          idsppabordo?: number;
          taxon_idtaxon?: number;
        };
        Relationships: [];
      };
      sppabordocatalogo: {
        Row: {
          catalogo_idcatalogo: number;
          hembras: number;
          idsppabordocatalogo: number;
          machos: number;
          nivelgeneracion: number;
          nosexados: number;
          sppabordo_idsppabordo: number;
        };
        Insert: {
          catalogo_idcatalogo: number;
          hembras?: number;
          idsppabordocatalogo?: number;
          machos?: number;
          nivelgeneracion?: number;
          nosexados?: number;
          sppabordo_idsppabordo: number;
        };
        Update: {
          catalogo_idcatalogo?: number;
          hembras?: number;
          idsppabordocatalogo?: number;
          machos?: number;
          nivelgeneracion?: number;
          nosexados?: number;
          sppabordo_idsppabordo?: number;
        };
        Relationships: [];
      };
      taxon: {
        Row: {
          autorano: string | null;
          endemica: boolean;
          enecuador: boolean;
          eol: boolean | null;
          idtaxon: number;
          idtaxoncorrecto: number | null;
          nombreaceptado: boolean;
          nombrecomun: string | null;
          nombreoriginal: boolean;
          publicacion: string | null;
          rank_idrank: number | null;
          sinonimo: boolean;
          taxon: string;
          taxon_idtaxon: number | null;
        };
        Insert: {
          autorano?: string | null;
          endemica?: boolean;
          enecuador?: boolean;
          eol?: boolean | null;
          idtaxon?: number;
          idtaxoncorrecto?: number | null;
          nombreaceptado?: boolean;
          nombrecomun?: string | null;
          nombreoriginal?: boolean;
          publicacion?: string | null;
          rank_idrank?: number | null;
          sinonimo?: boolean;
          taxon: string;
          taxon_idtaxon?: number | null;
        };
        Update: {
          autorano?: string | null;
          endemica?: boolean;
          enecuador?: boolean;
          eol?: boolean | null;
          idtaxon?: number;
          idtaxoncorrecto?: number | null;
          nombreaceptado?: boolean;
          nombrecomun?: string | null;
          nombreoriginal?: boolean;
          publicacion?: string | null;
          rank_idrank?: number | null;
          sinonimo?: boolean;
          taxon?: string;
          taxon_idtaxon?: number | null;
        };
        Relationships: [];
      };
      taxoncatalogoawe: {
        Row: {
          catalogoawe_idcatalogoawe: number;
          idtaxoncatalogoawe: number;
          taxon_idtaxon: number;
        };
        Insert: {
          catalogoawe_idcatalogoawe: number;
          idtaxoncatalogoawe?: number;
          taxon_idtaxon: number;
        };
        Update: {
          catalogoawe_idcatalogoawe?: number;
          idtaxoncatalogoawe?: number;
          taxon_idtaxon?: number;
        };
        Relationships: [];
      };
      taxoncatalogoaweregionbiogeografica: {
        Row: {
          catalogoawe_idcatalogoawe: number;
          categoria: string;
          idtaxoncatalogoaweregionbiogeografica: number;
          taxon_idtaxon: number;
        };
        Insert: {
          catalogoawe_idcatalogoawe: number;
          categoria: string;
          idtaxoncatalogoaweregionbiogeografica?: number;
          taxon_idtaxon: number;
        };
        Update: {
          catalogoawe_idcatalogoawe?: number;
          categoria?: string;
          idtaxoncatalogoaweregionbiogeografica?: number;
          taxon_idtaxon?: number;
        };
        Relationships: [];
      };
      taxongeopolitica: {
        Row: {
          geopolitica_idgeopolitica: number;
          idtaxongeopolitica: number;
          principal: boolean;
          taxon_idtaxon: number;
        };
        Insert: {
          geopolitica_idgeopolitica: number;
          idtaxongeopolitica?: number;
          principal?: boolean;
          taxon_idtaxon: number;
        };
        Update: {
          geopolitica_idgeopolitica?: number;
          idtaxongeopolitica?: number;
          principal?: boolean;
          taxon_idtaxon?: number;
        };
        Relationships: [];
      };
      taxonpublicacion: {
        Row: {
          idtaxonpublicacion: number;
          principal: boolean;
          publicacion_idpublicacion: number;
          svlhembra: boolean;
          svlmacho: boolean;
          taxon_idtaxon: number;
        };
        Insert: {
          idtaxonpublicacion?: number;
          principal?: boolean;
          publicacion_idpublicacion: number;
          svlhembra?: boolean;
          svlmacho?: boolean;
          taxon_idtaxon: number;
        };
        Update: {
          idtaxonpublicacion?: number;
          principal?: boolean;
          publicacion_idpublicacion?: number;
          svlhembra?: boolean;
          svlmacho?: boolean;
          taxon_idtaxon?: number;
        };
        Relationships: [];
      };
      tipo: {
        Row: {
          catalogoawe_idcatalogoawe: number;
          comentario: string | null;
          geopolitica_idgeopolitica: number | null;
          idtipo: number;
          medidas: string | null;
          numeromuseo: string;
          principal: boolean;
          publicacion_idpublicacion: number | null;
          taxon_idtaxon: number;
        };
        Insert: {
          catalogoawe_idcatalogoawe: number;
          comentario?: string | null;
          geopolitica_idgeopolitica?: number | null;
          idtipo?: number;
          medidas?: string | null;
          numeromuseo: string;
          principal?: boolean;
          publicacion_idpublicacion?: number | null;
          taxon_idtaxon: number;
        };
        Update: {
          catalogoawe_idcatalogoawe?: number;
          comentario?: string | null;
          geopolitica_idgeopolitica?: number | null;
          idtipo?: number;
          medidas?: string | null;
          numeromuseo?: string;
          principal?: boolean;
          publicacion_idpublicacion?: number | null;
          taxon_idtaxon?: number;
        };
        Relationships: [];
      };
      tipocatalogoawe: {
        Row: {
          descripcion: string | null;
          idtipocatalogoawe: number;
          nombre: string;
        };
        Insert: {
          descripcion?: string | null;
          idtipocatalogoawe?: number;
          nombre: string;
        };
        Update: {
          descripcion?: string | null;
          idtipocatalogoawe?: number;
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
          idusuario: number;
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
          idusuario?: number;
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
          idusuario?: number;
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
          idvideo: number;
          nombre: string;
          numeromuseo: string | null;
          taxon_idtaxon: number;
          thumbnail: string | null;
        };
        Insert: {
          autor?: string | null;
          descripcion?: string | null;
          enlace?: string;
          idvideo?: number;
          nombre?: string;
          numeromuseo?: string | null;
          taxon_idtaxon: number;
          thumbnail?: string | null;
        };
        Update: {
          autor?: string | null;
          descripcion?: string | null;
          enlace?: string;
          idvideo?: number;
          nombre?: string;
          numeromuseo?: string | null;
          taxon_idtaxon?: number;
          thumbnail?: string | null;
        };
        Relationships: [];
      };
      videoweb: {
        Row: {
          catalogo_idcatalogo: number;
          enlace: string;
          fecha: string;
          idvideoweb: number;
          titulo: string;
        };
        Insert: {
          catalogo_idcatalogo: number;
          enlace: string;
          fecha?: string;
          idvideoweb?: number;
          titulo: string;
        };
        Update: {
          catalogo_idcatalogo?: number;
          enlace?: string;
          fecha?: string;
          idvideoweb?: number;
          titulo?: string;
        };
        Relationships: [];
      };
      webpageimagen: {
        Row: {
          autor: string | null;
          catalogoawe_idcatalogoawe: number;
          enlace: string;
          idwebpageimagen: number;
        };
        Insert: {
          autor?: string | null;
          catalogoawe_idcatalogoawe: number;
          enlace: string;
          idwebpageimagen?: number;
        };
        Update: {
          autor?: string | null;
          catalogoawe_idcatalogoawe?: number;
          enlace?: string;
          idwebpageimagen?: number;
        };
        Relationships: [];
      };
      webpagtexto: {
        Row: {
          catalogoawe_idcatalogoawe: number;
          contenido: string;
          idwebpagtexto: number;
          titulo: string;
        };
        Insert: {
          catalogoawe_idcatalogoawe: number;
          contenido: string;
          idwebpagtexto?: number;
          titulo: string;
        };
        Update: {
          catalogoawe_idcatalogoawe?: number;
          contenido?: string;
          idwebpagtexto?: number;
          titulo?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | {schema: keyof DatabaseWithoutInternals},
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | {schema: keyof DatabaseWithoutInternals},
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
    | {schema: keyof DatabaseWithoutInternals},
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
    | {schema: keyof DatabaseWithoutInternals},
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
    | {schema: keyof DatabaseWithoutInternals},
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
