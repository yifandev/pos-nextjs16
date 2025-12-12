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

const COLOR_SCHEME = {
  cash: "hsl(var(--coffee-espresso))",
  qris: "hsl(var(--coffee-caramel))",
  transfer: "hsl(var(--coffee-mocha))",
  debit: "hsl(var(--chart-4))",
  credit: "hsl(var(--chart-5))",
};

const GRADIENT_SCHEME = {
  cash: { start: "hsl(var(--coffee-espresso))", end: "hsl(var(--wood-dark))" },
  qris: {
    start: "hsl(var(--coffee-caramel))",
    end: "hsl(var(--coffee-latte))",
  },
  transfer: { start: "hsl(var(--coffee-mocha))", end: "hsl(var(--chart-3))" },
};

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const chartData = data.map((item) => ({
    name: item.method.toUpperCase(),
    label:
      item.method === "cash"
        ? "Tunai"
        : item.method === "qris"
        ? "QRIS"
        : item.method === "transfer"
        ? "Transfer"
        : item.method,
    value: item.count,
    total: item.total,
    percentage: item.percentage,
    color:
      COLOR_SCHEME[item.method as keyof typeof COLOR_SCHEME] ||
      "hsl(var(--chart-4))",
  }));

  const chartConfig = chartData.reduce(
    (config, item) => ({
      ...config,
      [item.name.toLowerCase()]: {
        label: item.label,
        color: item.color,
      },
    }),
    {}
  );

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
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
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-coffee-caramel"></div>
          Metode Pembayaran
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Distribusi metode pembayaran berdasarkan transaksi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[250px]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) =>
                      `${percentage.toFixed(1)}%`
                    }
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="bg-popover border border-border shadow-lg rounded-lg"
                        formatter={(value, name, props: any) => {
                          const data = props.payload;
                          return [
                            `${value} transaksi`,
                            <div
                              key="details"
                              className="text-xs text-muted-foreground"
                            >
                              {data.percentage.toFixed(1)}% dari total
                            </div>,
                          ];
                        }}
                        labelFormatter={(label, payload) => {
                          const data = payload[0]?.payload;
                          return (
                            <div className="font-medium capitalize">
                              {data?.label || label.toLowerCase()}
                            </div>
                          );
                        }}
                      />
                    }
                  />
                  <Legend content={renderLegend} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Statistik Pembayaran
              </div>
              <div className="text-2xl font-bold text-foreground">
                {chartData
                  .reduce((sum, item) => sum + item.value, 0)
                  .toLocaleString()}{" "}
                Transaksi
              </div>
            </div>

            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 rounded-lg bg-sidebar/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <div className="font-medium capitalize">{item.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}% dari total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(item.total)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.value} transaksi
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
