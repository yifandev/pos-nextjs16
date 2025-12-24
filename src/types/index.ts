// Type definitions untuk seluruh aplikasi
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { productSchema } from "@/lib/validations";

// Payment types
export type PaymentMethod = "cash" | "qris" | "transfer";
export type PaymentStatus = "idle" | "processing" | "success" | "failed";

export type PaymentData = {
  method: PaymentMethod;
  paid: number;
  change: number;
  reference?: string;
};

export type DigitalPaymentResponse = {
  success: boolean;
  data?: {
    qrisUrl?: string;
    qrisString?: string;
    vaNumber?: string;
    bank?: string;
    grossAmount: number;
    transactionId: string;
    expiryTime?: Date;
  };
  error?: string;
};

// User types
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    sessions: true;
  };
}>;

// Category types
export type CategoryWithProducts = Prisma.CategoryGetPayload<{
  include: {
    products: true;
    creator: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

// Product types
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: {
      select: {
        id: true;
        name: true;
        description: true;
        createdAt: true;
        updatedAt: true;
        createdBy: true;
      };
    };
    creator: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

// Customer types
export type CustomerWithSales = Prisma.CustomerGetPayload<{
  include: {
    sales: {
      select: {
        id: true;
        invoice: true;
        total: true;
        createdAt: true;
      };
    };
  };
}>;

// Supplier types
export type SupplierWithPurchases = Prisma.SupplierGetPayload<{
  include: {
    purchases: {
      select: {
        id: true;
        invoice: true;
        total: true;
        createdAt: true;
      };
    };
  };
}>;

// Purchase types
export type PurchaseOrderWithDetails = Prisma.PurchaseOrderGetPayload<{
  include: {
    supplier: {
      select: {
        id: true;
        name: true;
        phone: true;
        email: true;
      };
    };
    creator: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    items: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            sku: true;
            price: true;
          };
        };
      };
    };
  };
}>;

export type SaleWithDetails = Prisma.SaleGetPayload<{
  include: {
    cashier: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    customer: {
      select: {
        id: true;
        name: true;
        phone: true;
        email: true;
      };
    };
    items: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            sku: true;
            price: true;
          };
        };
      };
    };
    payments: true;
  };
}>;

// Shift types
export type ShiftWithUser = Prisma.ShiftGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

// Form types
export type CategoryFormData = {
  name: string;
  description?: string;
};

export type ProductFormData = z.infer<typeof productSchema>;

export type CustomerFormData = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type SupplierFormData = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type PurchaseOrderFormData = {
  supplierId: string;
  items: {
    productId: string;
    quantity: number;
    cost: number;
  }[];
};

// UPDATE: Gunakan PaymentMethod type
export type SaleFormData = {
  customerId?: string;
  paymentType: PaymentMethod;
  paid: number;
  items: {
    productId: string;
    quantity: number;
  }[];
};

// Response types
export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Bank config types
export interface BankConfig {
  value: string;
  label: string;
  fullName: string;
  icon?: string;
}
