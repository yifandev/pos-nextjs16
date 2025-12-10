"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { ShoppingCart, Clock } from "lucide-react";

interface RecentSalesListProps {
  data: Array<{
    id: string;
    invoice: string;
    total: number;
    items: number;
    createdAt: Date;
  }>;
}

export function RecentSalesList({ data }: RecentSalesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terbaru</CardTitle>
        <CardDescription>10 transaksi terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium font-mono text-sm">{sale.invoice}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(sale.createdAt)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">
                  {formatCurrency(sale.total)}
                </div>
                <Badge variant="secondary" className="mt-1">
                  {sale.items} item
                </Badge>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Tidak ada transaksi
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
