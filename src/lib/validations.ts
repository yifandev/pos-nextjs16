// Zod schemas untuk validasi
import { z } from "zod";

// Category validation
export const categorySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  description: z.string().optional(),
});

// Product validation
// Product validation - PERBAIKI
export const productSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(200),
  description: z.string().default(""),
  price: z.number().positive("Harga harus positif").default(0),
  taxRate: z.number().min(0).max(1).default(0.11),
  stock: z.number().int().min(0, "Stok tidak boleh negatif").default(0),
  sku: z.string().min(1, "SKU wajib diisi").default(""),
  barcode: z.string().default(""),
  image: z.string().optional().or(z.literal("")).default(""),
  categoryId: z.string().min(1, "Kategori wajib dipilih").default(""),
  isActive: z.boolean().default(true),
});

// Customer validation
export const customerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(200),
  phone: z.string().optional(),
  email: z.email("Email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
});

// Supplier validation
export const supplierSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(200),
  phone: z.string().optional(),
  email: z.email("Email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
});

// Purchase Order validation
export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier wajib dipilih"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive("Quantity harus positif"),
        cost: z.number().positive("Harga beli harus positif"),
      })
    )
    .min(1, "Minimal 1 item"),
});

// Sale validation
export const saleSchema = z.object({
  customerId: z.string().optional(),
  paymentType: z.enum(["cash", "qris", "transfer"]),
  paid: z.number().positive("Jumlah bayar harus positif"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive("Quantity harus positif"),
      })
    )
    .min(1, "Minimal 1 item"),
});

// User validation
export const userUpdateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(200),
  email: z.email("Email tidak valid"),
  role: z.enum(["admin", "cashier"]),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.date().optional().nullable(),
});

// Shift validation
export const shiftOpenSchema = z.object({
  openingCash: z.number().min(0, "Kas awal tidak boleh negatif"),
});

export const shiftCloseSchema = z.object({
  shiftId: z.string().min(1),
  closingCash: z.number().min(0, "Kas akhir tidak boleh negatif"),
});
