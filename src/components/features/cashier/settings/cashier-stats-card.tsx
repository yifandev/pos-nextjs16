"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart, TrendingUp, Calendar, Clock } from "lucide-react";

interface CashierStatsProps {
  totalSales: number;
  totalTransactions: number;
  accountAge: string;
  lastActive: Date | null;
}

/**
 * Cashier statistics card component
 * Displays activity and account metrics
 */
export function CashierStatsCard({
  totalSales,
  totalTransactions,
  accountAge,
  lastActive,
}: CashierStatsProps) {
  // Format last active date
  const formatLastActive = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours === 0) return "Just now";
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    return new Date(date).toLocaleDateString("id-ID");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Statistics</CardTitle>
        <CardDescription>Your activity and account information</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Sales */}
          <div className="rounded-lg bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  Total Sales
                </p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                  {totalSales.toLocaleString()}
                </p>
              </div>
              <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
            </div>
          </div>

          {/* Total Transactions */}
          <div className="rounded-lg bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {totalTransactions.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
            </div>
          </div>

          {/* Account Age */}
          <div className="rounded-lg bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                  Account Age
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {accountAge}
                </p>
              </div>
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-1" />
            </div>
          </div>

          {/* Last Active */}
          <div className="rounded-lg bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                  Last Active
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                  {formatLastActive(lastActive)}
                </p>
              </div>
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
