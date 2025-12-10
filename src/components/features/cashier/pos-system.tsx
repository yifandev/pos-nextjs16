"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema } from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createSale } from "@/actions/sale.actions";
import { getProductByCode, getProducts } from "@/actions/product.actions";
import { getCustomers } from "@/actions/customer.actions";
import { SaleFormData, ProductWithRelations, CustomerWithSales } from "@/types";
import { formatCurrency } from "@/lib/utils/format";
import { Minus, Plus, Trash2, ShoppingCart, Scan, Package } from "lucide-react";
import { PaymentDialog } from "./payment-dialog";
import Image from "next/image";

export function POSSystemUpdated() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [customers, setCustomers] = React.useState<CustomerWithSales[]>([]);
  const [products, setProducts] = React.useState<ProductWithRelations[]>([]);
  const [cart, setCart] = React.useState<
    Array<{ product: ProductWithRelations; quantity: number }>
  >([]);
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [orderId, setOrderId] = React.useState("");

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

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;

    const result = await getProductByCode(barcodeInput);
    if (result.success && result.data) {
      addToCart(result.data);
      setBarcodeInput("");
    } else {
      toast.error(result.error || "Produk tidak ditemukan");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }

    // Generate unique order ID
    const newOrderId = `SALE-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setOrderId(newOrderId);
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
        toast.success("Pembayaran berhasil!");
        setCart([]);
        form.reset();
        setShowPaymentDialog(false);
        // Optionally print receipt or show success modal
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Barcode</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <Input
                  placeholder="Scan atau ketik SKU/Barcode"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Scan className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-muted">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="font-medium text-sm line-clamp-2 min-h-[40px]">
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Stok: {product.stock}
                    </div>
                    <div className="font-bold text-primary">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Keranjang ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Keranjang kosong
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-2 border p-2 rounded-md"
                    >
                      <div className="relative w-12 h-12 rounded bg-muted flex-shrink-0">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {item.product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(item.product.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="h-7 w-7 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.product.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pajak (PPN):</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>

              <Form {...form}>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pelanggan (Opsional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih pelanggan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    className="w-full"
                    disabled={isLoading || cart.length === 0}
                    size="lg"
                    onClick={handleCheckout}
                  >
                    {isLoading ? "Memproses..." : "Proses Pembayaran"}
                  </Button>
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
