import api from './axios';
import type { StockLevel, StockAdjustmentRequest, InventoryTransaction } from '../types';

export const inventoryApi = {
  getStockByVariant: (variantId: string) =>
    api.get<StockLevel[]>(`/inventory/stock/${variantId}`).then((r) => r.data),
  getTransactions: (variantId: string) =>
    api.get<InventoryTransaction[]>(`/inventory/transactions/${variantId}`).then((r) => r.data),
  adjust: (data: StockAdjustmentRequest) =>
    api.post('/inventory/adjust', data).then((r) => r.data),
};
