"use client";

import SpeciesTechnicalSheet from "./SpeciesTechnicalSheet";

// import {FrogSpecies, FrogOrder, FrogFamily, FrogGenus} from "@/data/frogsData";

interface SpeciesContentProps {
  readonly species: any; // FrogSpecies;
  readonly order: any; // FrogOrder;
  readonly family: any; // FrogFamily;
  readonly genus: any; // FrogGenus;
}

export default function SpeciesContent({
  species,
  order,
  family,
  genus,
}: SpeciesContentProps) {
  // Extraer solo el nombre del orden sin el texto entre paréntesis
  const orderName = order.name.split(" (")[0];

  return (
    <div className="flex flex-col">
      {/* Ficha técnica científica con layout fijo + scroll */}
      <div className="overflow-hidden">
        <SpeciesTechnicalSheet
          altitudinalRange={species.altitudinalRange}
          climaticFloors={species.climaticFloors}
          collectors={`${species.discoverers}, ${species.discoveryYear}`}
          commonName={species.commonName}
          conservation={`Estado: ${species.redListStatus}`}
          distribution={species.distributionText}
          etymology={species.etymology}
          family={family.name}
          familyId={family.id}
          genus={genus.name}
          genusId={genus.id}
          identification={species.definition}
          isEndemic={species.isEndemic}
          naturalHistory={species.content}
          order={orderName}
          orderId={order.id}
          redListStatus={species.redListStatus}
          scientificName={species.scientificName}
        />
      </div>
    </div>
  );
}
