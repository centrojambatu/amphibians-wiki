import Link from "next/link";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

interface Order {
  id: string;
  name: string;
  scientific_name: string;
  description: string;
  species_count: number;
}

interface AmphibianOrdersProps {
  orders: Order[];
}

export function AmphibianOrders({orders}: AmphibianOrdersProps) {
  const getOrderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "anura":
        return "🐸";
      case "caudata":
        return "🦎";
      case "gymnophiona":
        return "🐍";
      default:
        return "🐸";
    }
  };

  const getOrderColor = (name: string) => {
    switch (name.toLowerCase()) {
      case "anura":
        return "bg-green-50 border-green-200 hover:bg-green-100";
      case "caudata":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
      case "gymnophiona":
        return "bg-purple-50 border-purple-200 hover:bg-purple-100";
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {orders.map((order) => (
        <Card key={order.id} className={`transition-colors ${getOrderColor(order.name)}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="text-4xl">{getOrderIcon(order.name)}</div>
              <div className="text-right">
                <div className="text-primary text-2xl font-bold dark:text-black">
                  {order.species_count}
                </div>
                <div className="text-muted-foreground text-sm">especies</div>
              </div>
            </div>
            <CardTitle className="text-xl dark:text-black">{order.name}</CardTitle>
            <p className="text-muted-foreground text-sm italic">{order.scientific_name}</p>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">{order.description}</p>
            <Link href={`/sapopedia/order/${order.name.toLowerCase()}`}>
              <Button className="w-full" variant="outline">
                Ver Familias
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
