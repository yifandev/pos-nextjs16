"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { Trophy, Medal, Award } from "lucide-react";

interface CashierPerformanceTableProps {
  data: Array<{
    cashierId: string;
    cashierName: string;
    totalSales: number;
    transactionCount: number;
    averageTransaction: number;
  }>;
}

export function CashierPerformanceTable({
  data,
}: CashierPerformanceTableProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 2:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performa Kasir</CardTitle>
        <CardDescription>Ranking berdasarkan total penjualan</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Nama Kasir</TableHead>
              <TableHead className="text-right">Transaksi</TableHead>
              <TableHead className="text-right">Total Penjualan</TableHead>
              <TableHead className="text-right">Rata-rata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cashier, index) => (
              <TableRow key={cashier.cashierId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRankIcon(index)}
                    <span className="font-medium">#{index + 1}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {cashier.cashierName}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{cashier.transactionCount}</Badge>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {formatCurrency(cashier.totalSales)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(cashier.averageTransaction)}
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
