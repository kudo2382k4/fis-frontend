// ==================== AUTH ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
}

// ==================== PRODUCT ====================
export interface ProductVariant {
  id: string;
  sku: string;
  color?: string;
  size?: string;
  price: number;
  cost: number;
  totalStock: number;
  availableStock: number;
  lowStockThreshold: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  variants: ProductVariant[];
  createdAt: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  categoryId?: string;
  variants: VariantRequest[];
}

export interface VariantRequest {
  sku: string;
  color?: string;
  size?: string;
  price: number;
  cost: number;
  lowStockThreshold?: number;
  imageUrl?: string;
}

// ==================== SUPPLIER ====================
export interface Supplier {
  id: string;
  name: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
}

export interface SupplierDto {
  name: string;
  phoneNumber?: string;
  address?: string;
}

// ==================== CUSTOMER ====================
export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  address?: string;
  createdAt: string;
}

export interface CustomerDto {
  fullName: string;
  phoneNumber: string;
  address?: string;
}

// ==================== STORAGE LOCATION ====================
export interface StorageLocation {
  id: string;
  code: string;
  name: string;
  address?: string;
  createdAt: string;
}

// ==================== INVENTORY ====================
export interface StockLevel {
  variantId: string;
  storageLocationId: string;
  storageLocationName: string;
  quantity: number;
}

export interface StockAdjustmentRequest {
  variantId: string;
  storageLocationId: string;
  actualQuantity: number;
  reason?: string;
}

export interface InventoryTransaction {
  id: string;
  variantId: string;
  storageLocationId: string;
  transactionType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantityChanged: number;
  referenceId?: string;
  performedBy: string;
  createdAt: string;
}

export interface LowStockAlert {
  variantId: string;
  sku: string;
  productName: string;
  color?: string;
  size?: string;
  availableStock: number;
  lowStockThreshold: number;
}

// ==================== SALES ORDER ====================
export interface SalesOrderItem {
  id: string;
  variantId: string;
  variantSku: string;
  variantColor?: string;
  variantSize?: string;
  storageLocationId: string;
  storageLocationName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SalesOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELED';
  totalAmount: number;
  notes?: string;
  createdByEmail: string;
  createdAt: string;
  items: SalesOrderItem[];
}

export interface SalesOrderItemRequest {
  variantId: string;
  storageLocationId: string;
  quantity: number;
  unitPrice: number;
}

export interface SalesOrderRequest {
  customerId: string;
  notes?: string;
  items: SalesOrderItemRequest[];
}

// ==================== PURCHASE ORDER ====================
export interface PurchaseOrderItem {
  id: string;
  variantId: string;
  variantSku: string;
  variantColor?: string;
  variantSize?: string;
  storageLocationId: string;
  storageLocationName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: 'PENDING' | 'RECEIVED' | 'CANCELED';
  totalAmount: number;
  notes?: string;
  expectedDate?: string;
  createdByEmail: string;
  createdAt: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItemRequest {
  variantId: string;
  storageLocationId: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrderRequest {
  supplierId: string;
  notes?: string;
  expectedDate?: string;
  items: PurchaseOrderItemRequest[];
}

// ==================== REPORTS ====================
export interface DailyRevenue {
  date: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface StockMovementSummary {
  variantSku: string;
  productName: string;
  totalIn: number;
  totalOut: number;
  netChange: number;
  estimatedRevenue: number;
}

// ==================== COMMON ====================
export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  details?: string[];
}
