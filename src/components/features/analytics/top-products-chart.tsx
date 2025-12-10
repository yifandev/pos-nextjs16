"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils/format";

interface TopProductsChartProps {
  data: Array<{
    productId: string;
    productName: string;
    categoryName: string;
    totalQuantity: number;
    totalRevenue: number;
    transactionCount: number;
  }>;
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const chartData = data.slice(0, 10).map(item => ({
    name: item.productName.length > 20 
      ? item.productName.substring(0, 20) + '...' 
      : item.productName,
    revenue: item.totalRevenue,
    quantity: item.totalQuantity,
  }));

  const chartConfig = {
    revenue: {
      label: "Pendapatan",
      color: "hsl(var(--chart-1))",
    },
    quantity: {
      label: "Kuantitas",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produk Terlaris</CardTitle>
        <CardDescription>Top 10 produk berdasarkan pendapatan</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number" 
                className="text-xs"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                className="text-xs"
                width={150}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => {
                      if (name === 'revenue') {
                        return formatCurrency(value as number);
                      }
                      return `${value} unit`;
                    }}
                  />
                }
              />
              <Bar 
                dataKey="revenue" 
                fill="hsl(var(--chart-1))" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
