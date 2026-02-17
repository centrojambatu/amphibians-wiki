"use client";

import {useState} from "react";
import {ChevronDown, ChevronRight} from "lucide-react";

import {
  NombresCompartidosPorFamilia,
  NombresCompartidosPorGenero,
  NombreCompartido,
} from "@/app/sapopedia/nombres/get-nombres-compartidos";

interface NombresCompartidosProps {
  readonly nombresPorFamilia: NombresCompartidosPorFamilia[];
  readonly nombresPorGenero: NombresCompartidosPorGenero[];
}

export default function NombresCompartidos({
  nombresPorFamilia,
  nombresPorGenero,
}: NombresCompartidosProps) {
  const [openFamilias, setOpenFamilias] = useState<Set<string>>(new Set());
  const [openGeneros, setOpenGeneros] = useState<Set<string>>(new Set());
  const [openNombres, setOpenNombres] = useState<Set<string>>(new Set());

  const toggleFamilia = (familiaKey: string) => {
    const newSet = new Set(openFamilias);

    if (newSet.has(familiaKey)) {
      newSet.delete(familiaKey);
    } else {
      newSet.add(familiaKey);
    }
    setOpenFamilias(newSet);
  };

  const toggleGenero = (generoKey: string) => {
    const newSet = new Set(openGeneros);

    if (newSet.has(generoKey)) {
      newSet.delete(generoKey);
    } else {
      newSet.add(generoKey);
    }
    setOpenGeneros(newSet);
  };

  const toggleNombre = (nombreKey: string) => {
    const newSet = new Set(openNombres);

    if (newSet.has(nombreKey)) {
      newSet.delete(nombreKey);
    } else {
      newSet.add(nombreKey);
    }
    setOpenNombres(newSet);
  };

  const renderNombreCompartido = (nombreCompartido: NombreCompartido, key: string) => {
    const isOpen = openNombres.has(key);

    return (
      <div key={key} className="mb-3 rounded-lg border border-gray-200 bg-white">
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
          onClick={() => toggleNombre(key)}
        >
          <div className="flex-1">
            <span className="font-semibold text-gray-800">{nombreCompartido.nombre}</span>
            <span className="ml-2 text-sm text-gray-500">
              ({nombreCompartido.especies.length} especies)
            </span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>
        {isOpen && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="space-y-2">
              {nombreCompartido.especies.map((especie) => (
                <div
                  key={especie.id_taxon}
                  className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-800">
                      {especie.nombre_cientifico || especie.taxon}
                    </span>
                    {especie.genero && (
                      <span className="ml-2 text-xs text-gray-500 italic">{especie.genero}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFamilia = (familia: NombresCompartidosPorFamilia) => {
    const familiaKey = `${familia.orden}-${familia.familia}`;
    const isOpen = openFamilias.has(familiaKey);

    return (
      <div key={familiaKey} className="mb-4 rounded-lg border border-gray-200 bg-white">
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
          onClick={() => toggleFamilia(familiaKey)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{familia.familia}</span>
              {familia.nombre_comun_familia && (
                <span className="text-sm text-gray-500">({familia.nombre_comun_familia})</span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {familia.orden} • {familia.nombres.length} nombres compartidos
            </p>
          </div>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {isOpen && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
            <div className="space-y-3">
              {familia.nombres.map((nombre, idx) =>
                renderNombreCompartido(nombre, `${familiaKey}-nombre-${idx}`),
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGenero = (genero: NombresCompartidosPorGenero) => {
    const generoKey = `${genero.orden}-${genero.familia}-${genero.genero}`;
    const isOpen = openGeneros.has(generoKey);

    return (
      <div key={generoKey} className="mb-4 rounded-lg border border-gray-200 bg-white">
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
          onClick={() => toggleGenero(generoKey)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800 italic">{genero.genero}</span>
              {genero.nombre_comun_genero && (
                <span className="text-sm text-gray-500">({genero.nombre_comun_genero})</span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {genero.familia} • {genero.orden} • {genero.nombres.length} nombres compartidos
            </p>
          </div>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {isOpen && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
            <div className="space-y-3">
              {genero.nombres.map((nombre, idx) =>
                renderNombreCompartido(nombre, `${generoKey}-nombre-${idx}`),
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return <div className="space-y-8">{/* Nombres compartidos por familia */}</div>;
}
