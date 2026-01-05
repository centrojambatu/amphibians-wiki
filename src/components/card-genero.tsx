import { Card } from "./ui/card";
import { CardGeneroHeader } from "./card-genero-header";
import { CardGeneroContent } from "./card-genero-content";

interface CardGeneroProps {
  fichaGenero: any;
}

export const CardGenero = ({ fichaGenero }: CardGeneroProps) => {
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
      <CardGeneroHeader fichaGenero={fichaGenero} />
      <CardGeneroContent fichaGenero={fichaGenero} />
    </Card>
  );
};
