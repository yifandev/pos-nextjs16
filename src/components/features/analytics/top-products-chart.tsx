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
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
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
  const chartData = data.slice(0, 10).map((item) => ({
    name: item.productName,
    fullName: item.productName,
    category: item.categoryName,
    revenue: item.totalRevenue,
    quantity: item.totalQuantity,
    transactions: item.transactionCount,
  }));

  const chartConfig = {
    revenue: {
      label: "Pendapatan",
      color: "hsl(var(--coffee-mocha))",
      gradientId: "colorRevenue",
    },
    quantity: {
      label: "Kuantitas",
      color: "hsl(var(--coffee-caramel))",
      gradientId: "colorQuantity",
    },
  };

  return (
    <Card className="border border-sidebar-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-coffee-mocha"></div>
          Produk Terlaris
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Top 10 produk berdasarkan pendapatan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--coffee-mocha))"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--coffee-mocha))"
                    stopOpacity={0.7}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                className="text-xs text-muted-foreground"
                tickFormatter={(value) =>
                  value >= 1000
                    ? `${(value / 1000).toFixed(0)}k`
                    : value.toString()
                }
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                className="text-xs text-muted-foreground"
                width={120}
                tickFormatter={(value) =>
                  value.length > 20 ? `${value.substring(0, 20)}...` : value
                }
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="bg-popover border border-border shadow-lg rounded-lg"
                    formatter={(value, name, props: any) => {
                      if (name === "revenue") {
                        return [formatCurrency(value as number), "Pendapatan"];
                      }
                      return [`${value} unit`, "Jumlah Terjual"];
                    }}
                    labelFormatter={(label, payload) => {
                      const data = payload[0]?.payload;
                      return (
                        <div className="space-y-1">
                          <div className="font-medium">{data.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            Kategori: {data.category}
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="url(#colorRevenue)"
                radius={[0, 4, 4, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Total Pendapatan
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(
                chartData.reduce((sum, item) => sum + item.revenue, 0)
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Total Terjual</div>
            <div className="text-2xl font-bold text-foreground">
              {chartData
                .reduce((sum, item) => sum + item.quantity, 0)
                .toLocaleString()}{" "}
              unit
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
