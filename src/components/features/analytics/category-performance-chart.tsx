"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils/format";

interface CategoryPerformanceChartProps {
  data: Array<{
    categoryId: string;
    categoryName: string;
    totalRevenue: number;
    totalQuantity: number;
  }>;
}

export function CategoryPerformanceChart({ data }: CategoryPerformanceChartProps) {
  const chartData = data.slice(0, 8).map(item => ({
    name: item.categoryName.length > 15 
      ? item.categoryName.substring(0, 15) + '...' 
      : item.categoryName,
    revenue: item.totalRevenue,
    quantity: item.totalQuantity,
  }));

  const chartConfig = {
    revenue: {
      label: "Pendapatan",
      color: "hsl(var(--chart-1))",
    },
    quantity: {
      label: "Terjual",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performa Kategori</CardTitle>
        <CardDescription>Top kategori berdasarkan pendapatan</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-xs"
                yAxisId="left"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                className="text-xs"
                yAxisId="right"
                orientation="right"
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
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="revenue" 
                fill="hsl(var(--chart-1))" 
                radius={[4, 4, 0, 0]}
                name="Pendapatan"
              />
              <Bar 
                yAxisId="right"
                dataKey="quantity" 
                fill="hsl(var(--chart-2))" 
                radius={[4, 4, 0, 0]}
                name="Jumlah Terjual"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
