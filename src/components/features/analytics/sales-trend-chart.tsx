"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils/format";
import { format } from "date-fns";

interface SalesTrendChartProps {
  data: Array<{ date: string; revenue: number; transactions: number }>;
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    dateFormatted: format(new Date(item.date), "dd MMM"),
  }));

  const chartConfig = {
    revenue: {
      label: "Pendapatan",
      color: "hsl(var(--coffee-espresso))",
      gradientId: "colorRevenue",
    },
    transactions: {
      label: "Transaksi",
      color: "hsl(var(--coffee-caramel))",
      gradientId: "colorTransactions",
    },
  };

  return (
    <Card className="border border-sidebar-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <div className="w-2 h-2 rounded-full bg-coffee-espresso"></div>
          Tren Penjualan
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Pendapatan harian dalam 30 hari terakhir
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--coffee-espresso))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--coffee-espresso))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient
                  id="colorTransactions"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--coffee-caramel))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--coffee-caramel))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="dateFormatted"
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  value >= 1000
                    ? `${(value / 1000).toFixed(0)}k`
                    : value.toString()
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="bg-popover border border-border shadow-lg rounded-lg "
                    formatter={(value, name) => {
                      if (name === "revenue") {
                        return [formatCurrency(value as number), "Pendapatan"];
                      }
                      return [`${value} transaksi`, "Transaksi"];
                    }}
                    labelFormatter={(label) => `Tanggal: ${label}`}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--coffee-espresso))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="transactions"
                stroke="hsl(var(--coffee-caramel))"
                strokeWidth={2}
                fillOpacity={0.3}
                fill="url(#colorTransactions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-coffee-espresso"> </div>
            <span className="text-muted-foreground ">Pendapatan</span>
            <span className="font-medium text-foreground">
              {formatCurrency(
                data.reduce((sum, item) => sum + item.revenue, 0)
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-coffee-caramel"></div>
            <span className="text-muted-foreground">Total Transaksi</span>
            <span className="font-medium text-foreground">
              {data.reduce((sum, item) => sum + item.transactions, 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
