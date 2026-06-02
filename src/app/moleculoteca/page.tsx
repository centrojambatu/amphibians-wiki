import type {ReactNode} from "react";

import {getMoleculotecaTaxa, MUESTRA_FIELDS, type MuestrasTaxon} from "./get-moleculoteca-taxa";
import MoleculotecaListClient from "./MoleculotecaListClient";

interface SearchParams {
  busqueda?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

function renderMuestraLabel(label: string): ReactNode {
  const idx = label.indexOf(" ");

  if (idx === -1 || label.slice(0, idx) !== "Piel") return label;
  const first = label.slice(0, idx);
  const rest = label.slice(idx + 1);

  return (
    <>
      {first}
      <span className="mx-0.5" style={{color: "#f07304"}}>
        |
      </span>
      {rest}
    </>
  );
}

function StatCard({label, value}: {label: ReactNode; value: number}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-md border p-2"
      style={{borderColor: "#dddddd"}}
    >
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold sm:text-4xl text-black">
          {value.toLocaleString()}
        </span>
        <span className="text-xs font-semibold" style={{color: "#666666"}}>
          especies
        </span>
      </div>
      <h4
        className="mt-1 text-center"
        style={{
          color: "#666666",
          fontSize: "13px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
          fontWeight: "400",
        }}
      >
        {label}
      </h4>
    </div>
  );
}

export default async function MoleculotecaPage({searchParams}: PageProps) {
  const params = await searchParams;
  const taxa = await getMoleculotecaTaxa(params.busqueda);

  const counts = MUESTRA_FIELDS.map((f) => ({
    key: f.key,
    label: f.label,
    total: taxa.filter((t: MuestrasTaxon) => (t[f.count as keyof MuestrasTaxon] as number) > 0)
      .length,
  }));

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Moleculoteca</h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div
          className="flex flex-col justify-center rounded-md border p-2"
          style={{borderColor: "#dddddd"}}
        >
          <a
            className="hover:text-gray-900"
            href="https://deepskyblue-beaver-511675.hostingersite.com/diversidad-molecular/"
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
            Diversidad molecular
          </a>
          <a
            className="hover:text-gray-900"
            href="https://www.ncbi.nlm.nih.gov/nuccore/?term=amphibia+ecuador"
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
            GenBank ADN <span style={{color: "#f07304"}}>|</span> ARN
          </a>
          <a
            className="hover:text-gray-900"
            href="https://www.ncbi.nlm.nih.gov/protein/?term=amphibia%20ecuador"
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
            GenBank proteínas
          </a>
          <a
            className="hover:text-gray-900"
            href="https://www.ncbi.nlm.nih.gov/bioproject/?term=amphibia%20ecuador"
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
            GenBank bioproyectos
          </a>
        </div>
        {counts.map((c) => (
          <StatCard key={c.key} label={renderMuestraLabel(c.label)} value={c.total} />
        ))}
      </div>

      <MoleculotecaListClient taxa={taxa} />
    </main>
  );
}
