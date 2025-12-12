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
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils/format";

interface CategoryPerformanceChartProps {
  data: Array<{
    categoryId: string;
    categoryName: string;
    totalRevenue: number;
    totalQuantity: number;
  }>;
}

export function CategoryPerformanceChart({
  data,
}: CategoryPerformanceChartProps) {
  const chartData = data.slice(0, 8).map((item) => ({
    name: item.categoryName,
    revenue: item.totalRevenue,
    quantity: item.totalQuantity,
    percentage: (
      (item.totalRevenue / data.reduce((sum, d) => sum + d.totalRevenue, 0)) *
      100
    ).toFixed(1),
  }));

  const chartConfig = {
    revenue: {
      label: "Pendapatan",
      color: "hsl(var(--coffee-espresso))",
      gradientId: "colorRevenue",
    },
    quantity: {
      label: "Jumlah Terjual",
      color: "hsl(var(--coffee-latte))",
      gradientId: "colorQuantity",
    },
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border border-sidebar-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center ">
          <div className="w-2 h-2 rounded-full bg-wood-dark"></div>
          Performa Kategori
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Top kategori berdasarkan pendapatan dan jumlah terjual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--coffee-espresso))"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--coffee-espresso))"
                    stopOpacity={0.5}
                  />
                </linearGradient>
                <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--coffee-latte))"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--coffee-latte))"
                    stopOpacity={0.5}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                className="text-xs text-muted-foreground"
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(value) =>
                  value.length > 12 ? `${value.substring(0, 12)}...` : value
                }
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                className="text-xs text-muted-foreground"
                yAxisId="left"
                tickFormatter={(value) =>
                  value >= 1000
                    ? `${(value / 1000).toFixed(0)}k`
                    : value.toString()
                }
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                className="text-xs text-muted-foreground"
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="bg-popover border border-border shadow-lg rounded-lg"
                    formatter={(value, name) => {
                      if (name === "revenue") {
                        return [formatCurrency(value as number), "Pendapatan"];
                      }
                      return [`${value} unit`, "Jumlah Terjual"];
                    }}
                    labelFormatter={(label, payload) => {
                      const data = payload[0]?.payload;
                      return (
                        <div className="space-y-1">
                          <div className="font-medium">{data.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {data.percentage}% dari total pendapatan
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                fill="url(#colorRevenue)"
                radius={[4, 4, 0, 0]}
                name="Pendapatan"
                maxBarSize={40}
              />
              <Bar
                yAxisId="right"
                dataKey="quantity"
                fill="url(#colorQuantity)"
                radius={[4, 4, 0, 0]}
                name="Jumlah Terjual"
                maxBarSize={40}
              />
              <Legend content={CustomLegend} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-6 p-4 rounded-lg bg-sidebar/30 border border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                Total Kategori
              </div>
              <div className="text-xl font-semibold text-foreground">
                {data.length}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                Total Pendapatan
              </div>
              <div className="text-xl font-semibold text-foreground">
                {formatCurrency(
                  chartData.reduce((sum, item) => sum + item.revenue, 0)
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Terjual</div>
              <div className="text-xl font-semibold text-foreground">
                {chartData
                  .reduce((sum, item) => sum + item.quantity, 0)
                  .toLocaleString()}{" "}
                unit
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                Kategori Teratas
              </div>
              <div className="text-xl font-semibold text-foreground">
                {chartData[0]?.name.split(" ")[0] || "-"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
