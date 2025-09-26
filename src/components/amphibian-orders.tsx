import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export function AmphibianOrders({ orders }: AmphibianOrdersProps) {
  const getOrderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'anura':
        return '🐸';
      case 'caudata':
        return '🦎';
      case 'gymnophiona':
        return '🐍';
      default:
        return '🐸';
    }
  };

  const getOrderColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'anura':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'caudata':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'gymnophiona':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {orders.map((order) => (
        <Card key={order.id} className={`transition-colors ${getOrderColor(order.name)}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="text-4xl">{getOrderIcon(order.name)}</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {order.species_count}
                </div>
                <div className="text-sm text-muted-foreground">especies</div>
              </div>
            </div>
            <CardTitle className="text-xl">{order.name}</CardTitle>
            <p className="text-sm text-muted-foreground italic">
              {order.scientific_name}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">{order.description}</p>
            <Link href={`/sapopedia/order/${order.id}`}>
              <Button variant="outline" className="w-full">
                Ver Especies
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
