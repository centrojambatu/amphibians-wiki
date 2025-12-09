import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AmphibianStatsProps {
  totalSpecies: number;
  endemicSpecies: number;
  endangeredSpecies: number;
  extinctSpecies: number;
  dataInsufficient: number;
}

export function AmphibianStats({
  totalSpecies,
  endemicSpecies,
  endangeredSpecies,
  extinctSpecies,
  dataInsufficient,
}: AmphibianStatsProps) {
  const stats = [
    {
      title: "Total de Especies",
      value: totalSpecies.toLocaleString(),
      description: "Especies registradas en Ecuador",
      variant: "default" as const,
      icon: "🐸",
    },
    {
      title: "Especies Endémicas",
      value: endemicSpecies.toLocaleString(),
      description: "Solo encontradas en Ecuador",
      variant: "success" as const,
      icon: "🏔️",
    },
    {
      title: "En Peligro",
      value: endangeredSpecies.toLocaleString(),
      description: "Categorías de riesgo",
      variant: "warning" as const,
      icon: "⚠️",
    },
    {
      title: "Posiblemente Extintas",
      value: extinctSpecies.toLocaleString(),
      description: "No vistas en décadas",
      variant: "destructive" as const,
      icon: "💀",
    },
    {
      title: "Datos Insuficientes",
      value: dataInsufficient.toLocaleString(),
      description: "Requieren más investigación",
      variant: "info" as const,
      icon: "❓",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center">
          <CardHeader className="pb-2">
            <div className="mb-2 text-2xl">{stat.icon}</div>
            <CardTitle className="text-lg">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-3xl font-bold">{stat.value}</div>
            <Badge className="text-xs" variant="outline">
              {stat.description}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
