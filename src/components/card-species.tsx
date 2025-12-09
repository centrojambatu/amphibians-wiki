import { Card } from "./ui/card";
import { CardSpeciesHeader } from "./card-species-header";
import { CardSpeciesContent } from "./card-species-content";

interface CardSpeciesProps {
  fichaEspecie: any;
}

export const CardSpecies = ({ fichaEspecie }: CardSpeciesProps) => {
  return (
    <Card
      className="flex flex-col gap-0 overflow-hidden rounded-none border-0 p-0"
      style={{
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: 0,
        border: "none",
      }}
    >
      {/* Encabezado */}
      <CardSpeciesHeader fichaEspecie={fichaEspecie} />
      <CardSpeciesContent fichaEspecie={fichaEspecie} />
    </Card>
  );
};
