"use client";

import React, {useState} from "react";
import {ArrowLeft, Eye, X} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {FotoData} from "@/app/fototeca/fotos-data";

interface SpeciesFotosClientProps {
  nombreCientifico: string;
  especieUrl: string;
  fromFototeca: boolean;
  fototecaUrl: string;
  fotosExternos: FotoData[];
  fotosPropios: FotoData[];
}

export default function SpeciesFotosClient({
  nombreCientifico,
  especieUrl,
  fromFototeca,
  fototecaUrl,
  fotosExternos,
  fotosPropios,
}: SpeciesFotosClientProps) {
  const [selectedImage, setSelectedImage] = useState<FotoData | null>(null);

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {fromFototeca ? (
                <Link
                  className="fototeca-back-link inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary no-underline"
                  href={fototecaUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Fototeca
                </Link>
              ) : (
                <Link
                  className="fototeca-back-link inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary no-underline"
                  href={especieUrl}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la ficha de la especie
                </Link>
              )}
            </div>
            <Link
              className="fototeca-view-species-link inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary no-underline"
              href={especieUrl}
            >
              <Eye className="h-4 w-4" />
              Ver ficha
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Fotos de <span className="italic">{nombreCientifico}</span>
          </h1>
        </div>

        {/* Sección Fotos Externas */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Fotos externas</h2>
            <p className="mt-1 text-sm text-gray-600">Fotografías de fuentes externas relacionadas con esta especie</p>
          </div>

          {fotosExternos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {fotosExternos.map((foto) => (
                <FotoCardWithModal key={foto.id} foto={foto} onImageClick={() => setSelectedImage(foto)} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">No hay fotos externas disponibles para esta especie.</p>
            </div>
          )}
        </section>

        {/* Sección Fotos Propias */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Fotos Centro Jambatu</h2>
            <p className="mt-1 text-sm text-gray-600">Fotografías producidas por el Centro Jambatu</p>
          </div>

          {fotosPropios.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {fotosPropios.map((foto) => (
                <FotoCardWithModal key={foto.id} foto={foto} onImageClick={() => setSelectedImage(foto)} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">No hay fotos del Centro Jambatu disponibles para esta especie.</p>
            </div>
          )}
        </section>
      </main>

      {/* Modal de imagen */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative">
              <Image
                alt={selectedImage.title}
                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                height={800}
                src={selectedImage.url}
                width={1200}
              />
              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/70 p-4 text-white">
                <h3 className="text-lg font-semibold">{selectedImage.title}</h3>
                {selectedImage.source && <p className="text-sm opacity-90">Fuente: {selectedImage.source}</p>}
                {selectedImage.photographer && <p className="text-sm opacity-90">Fotógrafo: {selectedImage.photographer}</p>}
                {selectedImage.description && <p className="mt-2 text-sm opacity-80">{selectedImage.description}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de foto con modal
function FotoCardWithModal({foto, onImageClick}: {foto: FotoData; onImageClick: () => void}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-primary hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <Image
          alt={foto.title}
          className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
          height={300}
          onClick={onImageClick}
          src={foto.thumbnailUrl || foto.url}
          width={300}
        />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-primary">
          {foto.title}
        </h3>
        <p className="mt-1 text-xs text-gray-600">{foto.source}</p>
      </div>
    </div>
  );
}
