// Application constants

export const APP_NAME = "POS System";
export const APP_DESCRIPTION = "Modern Point of Sale System";

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Stock
export const LOW_STOCK_THRESHOLD = 10;
export const OUT_OF_STOCK_THRESHOLD = 0;

// Tax
export const DEFAULT_TAX_RATE = 0.11; // 11% PPN

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  QRIS: "qris",
  TRANSFER: "transfer",
} as const;

export const PAYMENT_METHOD_LABELS = {
  cash: "Cash",
  qris: "QRIS",
  transfer: "Transfer Bank",
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  CASHIER: "cashier",
} as const;

export const USER_ROLE_LABELS = {
  admin: "Admin",
  cashier: "Kasir",
} as const;

// Currency
export const CURRENCY_CODE = "IDR";
export const CURRENCY_LOCALE = "id-ID";

// Date Format
export const DATE_FORMAT = "dd MMM yyyy";
export const DATETIME_FORMAT = "dd MMM yyyy HH:mm";

// Invoice Prefix
export const INVOICE_PREFIX = {
  SALE: "INV",
  PURCHASE: "PO",
} as const;

// Status
export const PRODUCT_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const;

export const USER_STATUS = {
  ACTIVE: false,
  BANNED: true,
} as const;

// Regex Patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\+\(\)]+$/,
  SKU: /^[A-Z0-9\-]+$/,
  BARCODE: /^[0-9]+$/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Anda tidak memiliki akses",
  NOT_FOUND: "Data tidak ditemukan",
  VALIDATION_ERROR: "Data tidak valid",
  SERVER_ERROR: "Terjadi kesalahan server",
  INSUFFICIENT_STOCK: "Stok tidak mencukupi",
  INSUFFICIENT_PAYMENT: "Jumlah bayar kurang",
  DUPLICATE_ENTRY: "Data sudah ada",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: "Data berhasil dibuat",
  UPDATED: "Data berhasil diupdate",
  DELETED: "Data berhasil dihapus",
  SAVED: "Data berhasil disimpan",
} as const;
