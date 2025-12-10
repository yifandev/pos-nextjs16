"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { TrendingUp, ShoppingCart, DollarSign, Receipt } from "lucide-react";

interface OverviewCardsProps {
  data: {
    totalRevenue: number;
    totalSales: number;
    totalTransactions: number;
    averageTransaction: number;
    totalTax: number;
  };
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const cards = [
    {
      title: "Total Pendapatan",
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      description: "Pendapatan sebelum pajak",
      color: "text-green-600",
    },
    {
      title: "Total Penjualan",
      value: formatCurrency(data.totalSales),
      icon: TrendingUp,
      description: "Total penjualan + pajak",
      color: "text-blue-600",
    },
    {
      title: "Total Transaksi",
      value: data.totalTransactions.toString(),
      icon: ShoppingCart,
      description: "Jumlah transaksi",
      color: "text-purple-600",
    },
    {
      title: "Rata-rata Transaksi",
      value: formatCurrency(data.averageTransaction),
      icon: Receipt,
      description: "Per transaksi",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
