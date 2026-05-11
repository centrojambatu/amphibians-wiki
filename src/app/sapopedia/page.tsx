import type {OrdenesNombresLookup} from "@/lib/organize-taxonomy";

import {SapopediaContent} from "@/components/sapopedia-content";
import MapotecaStats from "@/components/mapoteca/mapoteca-stats";
import MapotecaPrefetch from "@/components/MapotecaPrefetch";

import getAllEspecies from "./get-all-especies";
import getFilterCatalogs from "./get-filter-catalogs";
import getMapotecaStats from "./get-mapoteca-stats";
import getTaxonNombres from "./nombres/get-taxon-nombres";

export default async function SapopediaPage() {
  const [especies, filterCatalogs, ordenesNombres, mapotecaStats] = await Promise.all([
    getAllEspecies(),
    getFilterCatalogs(),
    getTaxonNombres(),
    getMapotecaStats(),
  ]);

  // Estadísticas generales
  const totalEspecies = especies.length;
  const totalAnura = especies.filter((e) => e.orden === "Anura").length;
  const totalCaudata = especies.filter((e) => e.orden === "Caudata").length;
  const totalGymnophiona = especies.filter((e) => e.orden === "Gymnophiona").length;
  const totalEndemicas = especies.filter((e) => e.endemica).length;
  const pctEndemicas =
    totalEspecies > 0 ? ((totalEndemicas / totalEspecies) * 100).toFixed(1) : "0";

  return (
    <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
      {/* Prefetch de datos de Mapoteca en background */}
      <MapotecaPrefetch />
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="text-primary mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl lg:text-4xl">
          Anfibios Ecuador
        </h1>
      </div>

      {/* Cards de resumen */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-4 lg:grid-cols-8">
        {/* Links temáticos */}
        <div
          className="flex flex-col justify-center rounded-md border p-2"
          style={{borderColor: "#dddddd"}}
        >
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/historia/"
            rel="noopener noreferrer"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
            target="_blank"
          >
            Historia
          </a>
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/arqueologia/"
            rel="noopener noreferrer"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
            target="_blank"
          >
            Arqueología
          </a>
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/cultura/"
            rel="noopener noreferrer"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
            target="_blank"
          >
            Cultura
          </a>
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/biocomercio/"
            rel="noopener noreferrer"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
            target="_blank"
          >
            Biocomercio
          </a>
        </div>

        {/* Links temáticos adicionales */}
        <div
          className="flex flex-col justify-center rounded-md border p-2"
          style={{borderColor: "#dddddd"}}
        >
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/bioprospeccion/"
            rel="noopener noreferrer"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
            target="_blank"
          >
            Bioprospección
          </a>
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/diversidad/"
            rel="noopener noreferrer"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
            target="_blank"
          >
            Diversidad
          </a>
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/especies-introducidas/"
            rel="noopener noreferrer"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
            target="_blank"
          >
            Especies introducidas
          </a>
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/incertae-sedis/"
            rel="noopener noreferrer"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
            target="_blank"
          >
            Incertae sedis
          </a>
        </div>

        {/* Links temáticos: Distribución / Extinción / Conservación */}
        <div
          className="flex flex-col justify-start rounded-md border p-2"
          style={{borderColor: "#dddddd"}}
        >
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/distribucion/"
            rel="noopener noreferrer"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
            target="_blank"
          >
            Distribución
          </a>
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/extincion/"
            rel="noopener noreferrer"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
            target="_blank"
          >
            Extinción
          </a>
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/conservacion/"
            rel="noopener noreferrer"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
            target="_blank"
          >
            Conservación
          </a>
        </div>

        {/* Especies */}
        <div
          className="flex flex-col items-center justify-center rounded-md border p-2"
          style={{borderColor: "#dddddd"}}
        >
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{color: "#f07304"}}>
            {totalEspecies.toLocaleString()}
          </span>
          <h4
            className="mt-1"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
          >
            Especies
          </h4>
        </div>

        {/* Anura */}
        <div
          className="flex flex-col items-center justify-center rounded-md border p-2"
          style={{borderColor: "#dddddd"}}
        >
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{color: "#000000"}}>
            {totalAnura.toLocaleString()}
          </span>
          <h4
            className="mt-1"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
          >
            Anura
          </h4>
        </div>

        {/* Caudata */}
        <div
          className="flex flex-col items-center justify-center rounded-md border p-2"
          style={{borderColor: "#dddddd"}}
        >
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{color: "#000000"}}>
            {totalCaudata.toLocaleString()}
          </span>
          <h4
            className="mt-1"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
          >
            Caudata
          </h4>
        </div>

        {/* Gymnophiona */}
        <div
          className="flex flex-col items-center justify-center rounded-md border p-2"
          style={{borderColor: "#dddddd"}}
        >
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{color: "#000000"}}>
            {totalGymnophiona.toLocaleString()}
          </span>
          <h4
            className="mt-1"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
          >
            Gymnophiona
          </h4>
        </div>

        {/* Endémicas */}
        <div
          className="flex flex-col items-center justify-center rounded-md border p-2"
          style={{borderColor: "#dddddd"}}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold sm:text-4xl" style={{color: "#000000"}}>
              {totalEndemicas.toLocaleString()}
            </span>
            <span className="text-base font-semibold sm:text-lg" style={{color: "#f07304"}}>
              {pctEndemicas}%
            </span>
          </div>
          <h4
            className="mt-1"
            style={{
              color: "#666666",
              fontSize: "13px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
            }}
          >
            Endémicas
          </h4>
        </div>
      </div>

      {/* Histograma */}
      <div className="mb-6 sm:mb-8">
        <MapotecaStats initialStats={mapotecaStats} />
      </div>

      <div className="mb-6 sm:mb-8">
        <SapopediaContent
          especies={especies}
          filterCatalogs={filterCatalogs}
          ordenesNombres={ordenesNombres as OrdenesNombresLookup[]}
        />
      </div>
    </main>
  );
}
