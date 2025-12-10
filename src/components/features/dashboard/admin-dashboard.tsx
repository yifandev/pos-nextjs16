"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSalesAnalytics } from "@/actions/sale.actions";
import { getProducts } from "@/actions/product.actions";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package,
  AlertTriangle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminDashboard() {
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [lowStockProducts, setLowStockProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load analytics
      const analyticsResult = await getSalesAnalytics();
      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics(analyticsResult.data);
      }

      // Load products with low stock
      const productsResult = await getProducts();
      if (productsResult.success && productsResult.data) {
        const lowStock = productsResult.data
          .filter((p) => p.stock <= 10 && p.isActive)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 5);
        setLowStockProducts(lowStock);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Penjualan
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics?.totalSales || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue keseluruhan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transaksi
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics?.salesCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Jumlah transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pajak
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics?.totalTax || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              PPN terkumpul
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stok Rendah
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lowStockProducts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Produk perlu restock
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topProducts && analytics.topProducts.length > 0 ? (
              <div className="space-y-3">
                {analytics.topProducts.map((item: any, index: number) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.totalQuantity} terjual
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(item.totalRevenue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Belum ada data penjualan
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-l-4 border-yellow-600 pl-3 py-2"
                  >
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.category.name}
                      </div>
                    </div>
                    <Badge
                      variant={
                        product.stock === 0 ? "destructive" : "secondary"
                      }
                    >
                      {product.stock} unit
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Semua produk stok aman
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
