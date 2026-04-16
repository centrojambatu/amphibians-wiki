import Link from "next/link";

import { SapopediaContent } from "@/components/sapopedia-content";
import MapotecaStats from "@/components/mapoteca/mapoteca-stats";
import type { OrdenesNombresLookup } from "@/lib/organize-taxonomy";

import getAllEspecies from "./get-all-especies";
import getFilterCatalogs from "./get-filter-catalogs";
import getTaxonNombres from "./nombres/get-taxon-nombres";

export default async function SapopediaPage() {
  const [especies, filterCatalogs, ordenesNombres] = await Promise.all([
    getAllEspecies(),
    getFilterCatalogs(),
    getTaxonNombres(),
  ]);

  // Estadísticas generales
  const totalEspecies = especies.length;
  const totalAnura = especies.filter((e) => e.orden === "Anura").length;
  const totalCaudata = especies.filter((e) => e.orden === "Caudata").length;
  const totalGymnophiona = especies.filter((e) => e.orden === "Gymnophiona").length;
  const totalEndemicas = especies.filter((e) => e.endemica).length;
  const pctEndemicas = totalEspecies > 0 ? ((totalEndemicas / totalEspecies) * 100).toFixed(1) : "0";
  const totalPosExtintas = especies.filter(
    (e) => e.lista_roja_iucn === "CR (PE)" || e.lista_roja_iucn === "CR(PE)",
  ).length;
  const pctPosExtintas = totalEspecies > 0 ? ((totalPosExtintas / totalEspecies) * 100).toFixed(1) : "0";

  return (
    <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
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
          style={{ borderColor: "#dddddd" }}
        >
          <Link href="/sapopedia" className="hover:text-gray-900" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Historia</Link>
          <Link href="/sapopedia" className="hover:text-gray-900" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Arqueología</Link>
          <Link href="/sapopedia" className="hover:text-gray-900" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Cultura</Link>
          <Link href="/sapopedia" className="hover:text-gray-900" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Biocomercio</Link>
        </div>
        <div
          className="flex flex-col justify-center rounded-md border p-2"
          style={{ borderColor: "#dddddd" }}
        >
          <Link href="/sapopedia" className="hover:text-gray-900" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Diversidad</Link>
          <Link href="/sapopedia" className="hover:text-gray-900" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Distribución</Link>
          <Link href="/sapopedia" className="hover:text-gray-900" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Extinción</Link>
          <Link href="/sapopedia" className="hover:text-gray-900" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Conservación</Link>
        </div>

        {/* Especies */}
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{ color: "#f07304" }}>{totalEspecies.toLocaleString()}</span>
          <h4 className="mt-1" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Especies</h4>
        </div>

        {/* Anura */}
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{totalAnura.toLocaleString()}</span>
          <h4 className="mt-1" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Anura</h4>
        </div>

        {/* Caudata */}
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{totalCaudata.toLocaleString()}</span>
          <h4 className="mt-1" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Caudata</h4>
        </div>

        {/* Gymnophiona */}
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <span className="text-center text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{totalGymnophiona.toLocaleString()}</span>
          <h4 className="mt-1" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Gymnophiona</h4>
        </div>

        {/* Endémicas */}
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{totalEndemicas.toLocaleString()}</span>
            <span className="text-xs font-semibold" style={{ color: "#666666" }}>{pctEndemicas}%</span>
          </div>
          <h4 className="mt-1" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Endémicas</h4>
        </div>

        {/* Posiblemente extintas */}
        <div className="flex flex-col items-center justify-center rounded-md border p-2" style={{ borderColor: "#dddddd" }}>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold sm:text-4xl" style={{ color: "#000000" }}>{totalPosExtintas.toLocaleString()}</span>
            <span className="text-xs font-semibold" style={{ color: "#666666" }}>{pctPosExtintas}%</span>
          </div>
          <h4 className="mt-1 text-center" style={{ color: "#666666", fontSize: "13px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', fontWeight: "600" }}>Posiblemente extintas</h4>
        </div>
      </div>

      {/* Histograma */}
      <div className="mb-6 sm:mb-8">
        <MapotecaStats />
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
