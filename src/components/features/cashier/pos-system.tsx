"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema } from "@/lib/validations";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createSale } from "@/actions/sale.actions";
import { getProductByCode, getProducts } from "@/actions/product.actions";
import { getCustomers } from "@/actions/customer.actions";
import { SaleFormData, ProductWithRelations, CustomerWithSales } from "@/types";

import { ShoppingCart, Scan, Package } from "lucide-react";
import { PaymentDialog } from "./payment/payment-dialog";
import { BarcodeScanner } from "./payment/barcode-scanner";
import { ProductCard } from "./product-card";
import { CartItem } from "./cart-item";
import { SummaryCard } from "./summary-card";
import { CustomerSelect } from "./customer-select";

export function POSSystem() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [customers, setCustomers] = React.useState<CustomerWithSales[]>([]);
  const [products, setProducts] = React.useState<ProductWithRelations[]>([]);
  const [cart, setCart] = React.useState<
    Array<{ product: ProductWithRelations; quantity: number }>
  >([]);
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [orderId] = React.useState(
    () => `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: undefined,
      paymentType: "cash",
      paid: 0,
      items: [],
    },
  });

  // Load customers and products
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [customersResult, productsResult] = await Promise.all([
          getCustomers(),
          getProducts(),
        ]);

        if (customersResult.success && customersResult.data) {
          setCustomers(customersResult.data);
        }

        if (productsResult.success && productsResult.data) {
          setProducts(productsResult.data.filter((p) => p.isActive));
        }
      } catch (error) {
        toast.error("Gagal memuat data");
      }
    };

    loadData();
  }, []);

  const addToCart = (product: ProductWithRelations) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        toast.error("Stok tidak cukup");
        return;
      }

      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (product.stock < 1) {
        toast.error("Stok habis");
        return;
      }

      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const item = cart.find((item) => item.product.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;

    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > item.product.stock) {
      toast.error("Stok tidak cukup");
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateSubtotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const calculateTax = () => {
    return cart.reduce(
      (sum, item) =>
        sum + item.product.price * item.quantity * item.product.taxRate,
      0
    );
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleBarcodeScan = async (barcode: string) => {
    if (!barcode.trim()) return;

    const result = await getProductByCode(barcode);

    if (result.success && result.data) {
      addToCart(result.data);
      toast.success(`${result.data.name} ditambahkan ke keranjang`);
    } else {
      toast.error(result.error || "Produk tidak ditemukan");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }

    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = async (paymentData: {
    method: "cash" | "qris" | "transfer";
    paid: number;
    change: number;
    reference?: string;
  }) => {
    setIsLoading(true);

    try {
      const saleData: SaleFormData = {
        customerId: form.getValues("customerId"),
        paymentType: paymentData.method,
        paid: paymentData.paid,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const result = await createSale(saleData);

      if (result.success) {
        toast.success("Transaksi berhasil diproses!");
        clearCart();
        form.reset();
        setShowPaymentDialog(false);
      } else {
        toast.error(result.error || "Gagal memproses transaksi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <BarcodeScanner onScan={handleBarcodeScan} />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Keranjang ({cart.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {cart.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Keranjang kosong</p>
                    <p className="text-sm">Tambahkan produk dari kiri</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <CartItem
                      key={item.product.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))
                )}
              </div>

              {/* Order Summary */}
              <SummaryCard
                subtotal={calculateSubtotal()}
                tax={calculateTax()}
                total={calculateTotal()}
              />

              {/* Customer Selection */}
              <Form {...form}>
                <div className="space-y-4 pt-2">
                  <CustomerSelect
                    control={form.control}
                    customers={customers}
                    disabled={isLoading}
                  />

                  <div className="flex gap-2">
                    {cart.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={clearCart}
                        disabled={isLoading}
                      >
                        Kosongkan
                      </Button>
                    )}

                    <Button
                      type="button"
                      className="flex-1"
                      disabled={isLoading || cart.length === 0}
                      size="lg"
                      onClick={handleCheckout}
                    >
                      {isLoading ? "Memproses..." : "Bayar Sekarang"}
                    </Button>
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        totalAmount={calculateTotal()}
        orderId={orderId}
        items={cart.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        }))}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
}
