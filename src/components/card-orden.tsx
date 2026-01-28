import { Card } from "./ui/card";
import { CardOrdenHeader } from "./card-orden-header";
import { CardOrdenContent } from "./card-orden-content";

interface CardOrdenProps {
  fichaOrden: any;
}

export const CardOrden = ({ fichaOrden }: CardOrdenProps) => {
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
      <CardOrdenHeader fichaOrden={fichaOrden} />
      <CardOrdenContent fichaOrden={fichaOrden} />
    </Card>
  );
};
