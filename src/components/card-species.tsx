import {Card} from "./ui/card";
import {CardSpeciesHeader} from "./card-species-header";
import {CardSpeciesContent} from "./card-species-content";

export const CardSpecies = ({fichaEspecie}) => {
  return (
    <Card
      className="flex flex-col gap-0 overflow-hidden rounded-none border-0 p-0"
      style={{boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: 0, border: "none"}}
    >
      {/* Encabezado */}
      <CardSpeciesHeader />
      <CardSpeciesContent fichaEspecie={fichaEspecie} />
    </Card>
  );
};
