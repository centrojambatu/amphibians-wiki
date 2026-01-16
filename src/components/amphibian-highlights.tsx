import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AmphibianHighlights() {
  const highlights = [
    {
      title: "Diversidad Extraordinaria",
      description:
        "Ecuador ocupa el cuarto lugar mundial en diversidad de anfibios con 690 especies registradas.",
      icon: "🌍",
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Densidad Única",
      description:
        "3 veces más especies por km² que Colombia y 21 veces más que Brasil.",
      icon: "📊",
      color: "bg-green-50 border-green-200",
    },
    {
      title: "Endemismo Alto",
      description:
        "353 especies endémicas, lo que representa más del 50% de la diversidad total.",
      icon: "🏔️",
      color: "bg-purple-50 border-purple-200",
    },
    {
      title: "Conservación Urgente",
      description:
        "28% de las especies están en categorías de riesgo de extinción.",
      icon: "⚠️",
      color: "bg-red-50 border-red-200",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      {highlights.map((highlight, index) => (
        <Card key={index} className={`transition-colors ${highlight.color}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{highlight.icon}</div>
              <CardTitle className="text-lg">
                {highlight.title}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {highlight.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
