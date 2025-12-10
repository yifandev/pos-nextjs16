"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Cell, Pie, PieChart, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils/format";

interface PaymentMethodsChartProps {
  data: Array<{
    method: string;
    count: number;
    total: number;
    percentage: number;
  }>;
}

const COLORS = {
  cash: 'hsl(var(--chart-1))',
  qris: 'hsl(var(--chart-2))',
  transfer: 'hsl(var(--chart-3))',
};

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const chartData = data.map(item => ({
    name: item.method.toUpperCase(),
    value: item.count,
    total: item.total,
    percentage: item.percentage,
  }));

  const chartConfig = {
    cash: {
      label: "Tunai",
      color: "hsl(var(--chart-1))",
    },
    qris: {
      label: "QRIS",
      color: "hsl(var(--chart-2))",
    },
    transfer: {
      label: "Transfer",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metode Pembayaran</CardTitle>
        <CardDescription>Distribusi metode pembayaran</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || 'hsl(var(--chart-4))'} 
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props: any) => {
                      const data = props.payload;
                      return [
                        `${value} transaksi (${data.percentage.toFixed(1)}%)`,
                        formatCurrency(data.total)
                      ];
                    }}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[item.method as keyof typeof COLORS] }}
                />
                <span className="capitalize">{item.method}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">{item.count} transaksi</span>
                <span className="font-medium">{formatCurrency(item.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
