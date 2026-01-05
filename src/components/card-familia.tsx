import { Card } from "./ui/card";
import { CardFamiliaHeader } from "./card-familia-header";
import { CardFamiliaContent } from "./card-familia-content";

interface CardFamiliaProps {
  fichaFamilia: any;
}

export const CardFamilia = ({ fichaFamilia }: CardFamiliaProps) => {
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
      <CardFamiliaHeader fichaFamilia={fichaFamilia} />
      <CardFamiliaContent fichaFamilia={fichaFamilia} />
    </Card>
  );
};
