"use client";

import {SpeciesListItem} from "@/app/sapopedia/get-all-especies";

interface RedListSummaryCardsProps {
  readonly especies: SpeciesListItem[];
  readonly onCategoryClick?: (categoria: string) => void;
}

export default function RedListSummaryCards({especies, onCategoryClick}: RedListSummaryCardsProps) {
  // Función helper para detectar si es PE
  const isPE = (sigla: string | null): boolean => {
    if (!sigla) return false;

    return sigla === "PE" || sigla.includes("PE") || sigla.includes("Posiblemente extinta");
  };

  // Categorías amenazadas: CR, EN, VU, CR (PE)
  const categoriasAmenazadas = ["CR", "EN", "VU"];
  const especiesAmenazadas = especies.filter((e) => {
    const sigla = e.lista_roja_iucn;

    if (!sigla) return false;
    // Incluir CR (PE) también
    if (isPE(sigla)) return true;

    return categoriasAmenazadas.includes(sigla);
  });

  // Categorías no amenazadas: NT, LC
  const categoriasNoAmenazadas = ["NT", "LC"];
  const especiesNoAmenazadas = especies.filter((e) => {
    const sigla = e.lista_roja_iucn;

    if (!sigla) return false;

    return categoriasNoAmenazadas.includes(sigla);
  });

  const totalEspecies = especies.length;
  const especiesConCategoria = especies.filter((e) => e.lista_roja_iucn).length;

  const totalAmenazadas = especiesAmenazadas.length;
  const porcentajeAmenazadas =
    especiesConCategoria > 0 ? ((totalAmenazadas / especiesConCategoria) * 100).toFixed(1) : "0";

  const totalNoAmenazadas = especiesNoAmenazadas.length;
  const porcentajeNoAmenazadas =
    especiesConCategoria > 0 ? ((totalNoAmenazadas / especiesConCategoria) * 100).toFixed(1) : "0";

  // Función para obtener el color de cada categoría (mismos colores que RedListStatus)
  const getColor = (sigla: string) => {
    if (sigla === "PE" || isPE(sigla)) {
      return "#b71c1c"; // Rojo intenso para Posiblemente extinta
    }
    switch (sigla) {
      case "CR":
        return "#d81e05";
      case "EN":
        return "#fc7f3f";
      case "VU":
        return "#f9e814";
      case "NT":
        return "#cce226";
      case "LC":
        return "#60c659";
      case "DD":
        return "#9e9e9e";
      default:
        return "#9e9e9e";
    }
  };

  // Función para obtener el color del texto según el fondo (mismos que RedListStatus)
  const getTextColor = (sigla: string) => {
    if (isPE(sigla) || sigla === "CR" || sigla === "EN") {
      return "#ffffff";
    }

    return "#000000";
  };

  // Función para obtener el nombre completo de cada categoría
  const getFullName = (sigla: string) => {
    if (isPE(sigla)) {
      return "Posiblemente Extinta";
    }
    switch (sigla) {
      case "CR":
        return "Críticamente Amenazado";
      case "EN":
        return "En Peligro";
      case "VU":
        return "Vulnerable";
      case "NT":
        return "Casi Amenazado";
      case "LC":
        return "Preocupación Menor";
      case "DD":
        return "Datos insuficientes";
      default:
        return sigla;
    }
  };

  // 7 categorías para las cards superiores: PE, CR, EN, VU, NT, LC, DD
  const categoriasListaRoja: {sigla: string; etiqueta: string}[] = [
    {sigla: "PE", etiqueta: "Posiblemente extintas"},
    {sigla: "CR", etiqueta: "Peligro Crítico"},
    {sigla: "EN", etiqueta: "En peligro"},
    {sigla: "VU", etiqueta: "Vulnerables"},
    {sigla: "NT", etiqueta: "Casi amenazadas"},
    {sigla: "LC", etiqueta: "Preocupación menor"},
    {sigla: "DD", etiqueta: "Datos insuficientes"},
  ];

  const contarPorCategoria = (sigla: string): number => {
    if (sigla === "PE") {
      return especies.filter((e) => isPE(e.lista_roja_iucn)).length;
    }

    return especies.filter((e) => e.lista_roja_iucn === sigla).length;
  };

  const labelStyle = { color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "400" as const };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Card de especies amenazadas + no amenazadas + enlaces */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Card de enlaces externos Lista Roja */}
        <div
          className="flex flex-col justify-center rounded-md border p-2"
          style={{ borderColor: "#dddddd" }}
        >
          <a
            className="hover:text-gray-900"
            style={labelStyle}
            href="https://deepskyblue-beaver-511675.hostingersite.com/lista-roja/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Lista Roja Ecuador
          </a>
          <a
            className="hover:text-gray-900"
            style={labelStyle}
            href="https://www.iucnredlist.org/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Lista Roja IUCN
          </a>
        </div>

        {/* Card de especies amenazadas */}
        <button
          type="button"
          className="flex flex-col items-center justify-center rounded-md border p-2 cursor-pointer transition-shadow hover:shadow-md"
          style={{ borderColor: "#dddddd" }}
          onClick={() => onCategoryClick?.("AMENAZADAS")}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{totalAmenazadas}</span>
            <span className="text-xs font-semibold" style={{ color: "#666666" }}>{porcentajeAmenazadas}%</span>
          </div>
          <h4 className="mt-1 text-center" style={labelStyle}>Especies amenazadas</h4>
          <span className="mt-1 inline-flex flex-wrap items-center justify-center gap-1.5">
            <div
              className="inline-flex items-center justify-center text-[11px] font-semibold"
              style={{
                backgroundColor: getColor("CR (PE)"),
                color: getTextColor("CR (PE)"),
                borderRadius: "100% 0% 100% 100%",
                width: "32px",
                height: "32px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              PE
            </div>
            {["CR", "EN", "VU"].map((sigla) => (
              <div
                key={sigla}
                className="inline-flex items-center justify-center text-[11px] font-semibold"
                style={{
                  backgroundColor: getColor(sigla),
                  color: getTextColor(sigla),
                  borderRadius: "100% 0% 100% 100%",
                  width: "32px",
                  height: "32px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                }}
              >
                {sigla}
              </div>
            ))}
          </span>
        </button>

        {/* Card de especies no amenazadas */}
        <button
          type="button"
          className="flex flex-col items-center justify-center rounded-md border p-2 cursor-pointer transition-shadow hover:shadow-md"
          style={{ borderColor: "#dddddd" }}
          onClick={() => onCategoryClick?.("NO_AMENAZADAS")}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{totalNoAmenazadas}</span>
            <span className="text-xs font-semibold" style={{ color: "#666666" }}>{porcentajeNoAmenazadas}%</span>
          </div>
          <h4 className="mt-1 text-center" style={labelStyle}>Especies no amenazadas</h4>
          <span className="mt-1 inline-flex flex-wrap items-center justify-center gap-1.5">
            {["NT", "LC"].map((sigla) => (
              <div
                key={sigla}
                className="inline-flex items-center justify-center text-[11px] font-semibold"
                style={{
                  backgroundColor: getColor(sigla),
                  color: getTextColor(sigla),
                  borderRadius: "100% 0% 100% 100%",
                  width: "32px",
                  height: "32px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                }}
              >
                {sigla}
              </div>
            ))}
          </span>
        </button>
      </div>

      {/* 7 cards por categoría de lista roja */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {categoriasListaRoja.map(({sigla, etiqueta}) => {
          const count = contarPorCategoria(sigla);
          const pct =
            especiesConCategoria > 0 ? ((count / especiesConCategoria) * 100).toFixed(1) : "0";

          const esPE = sigla === "PE";
          const colorPE = getColor("PE");

          return (
            <button
              key={sigla}
              type="button"
              className="flex flex-col items-center justify-center rounded-md border p-2 cursor-pointer transition-shadow hover:shadow-md"
              style={{ borderColor: "#dddddd" }}
              onClick={() => onCategoryClick?.(sigla)}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold sm:text-4xl" style={{ color: esPE ? colorPE : "#000000" }}>{count}</span>
                <span className="text-xs font-semibold" style={{ color: "#666666" }}>{pct}%</span>
              </div>
              <h4 className="mt-1 text-center" style={labelStyle}>{etiqueta}</h4>
            </button>
          );
        })}
      </div>
    </div>
  );
}
