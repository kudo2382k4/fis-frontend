import * as XLSX from 'xlsx';
import type { DailyRevenue, Product, SalesOrder, StockMovementSummary } from '../types';
import dayjs from 'dayjs';

/** Helper: tạo workbook và download */
function download(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, `${filename}_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`);
}

/** 1. Xuất báo cáo doanh thu */
export function exportRevenue(data: DailyRevenue[], from: string, to: string) {
  const rows = data.map((r) => ({
    'Ngày': dayjs(r.date).format('DD/MM/YYYY'),
    'Số Đơn Hoàn Thành': r.totalOrders,
    'Doanh Thu (₫)': r.totalRevenue,
  }));

  // Dòng tổng
  const totalRevenue = data.reduce((s, r) => s + r.totalRevenue, 0);
  const totalOrders = data.reduce((s, r) => s + r.totalOrders, 0);
  rows.push({
    'Ngày': 'TỔNG CỘNG',
    'Số Đơn Hoàn Thành': totalOrders,
    'Doanh Thu (₫)': totalRevenue,
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Định dạng cột
  ws['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 20 }];

  // Header metadata
  const wb = XLSX.utils.book_new();
  XLSX.utils.sheet_add_aoa(ws, [
    [`BÁO CÁO DOANH THU TỪ ${from} ĐẾN ${to}`],
    [],
  ], { origin: 'A1' });
  XLSX.utils.sheet_add_json(ws, rows, { origin: 'A3' });
  ws['!cols'] = [{ wch: 16 }, { wch: 24 }, { wch: 22 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Doanh Thu');
  download(wb, 'BaoCaoDoanh Thu');
}

/** 2. Xuất danh sách tồn kho sản phẩm */
export function exportInventory(products: Product[]) {
  const rows: Record<string, unknown>[] = [];

  products.forEach((p) => {
    p.variants.forEach((v) => {
      rows.push({
        'Sản Phẩm': p.name,
        'SKU': v.sku,
        'Màu Sắc': v.color ?? '—',
        'Kích Cỡ': v.size ?? '—',
        'Giá Bán (₫)': v.price,
        'Giá Nhập (₫)': v.cost,
        'Lợi Nhuận (₫)': v.price - v.cost,
        'Tổng Tồn Kho': v.totalStock,
        'Có Thể Bán': v.availableStock,
        'Ngưỡng Cảnh Báo': v.lowStockThreshold,
        'Tình Trạng': v.availableStock <= 0 ? 'HẾT HÀNG' : v.availableStock <= v.lowStockThreshold ? 'SẮP HẾT' : 'CÒN HÀNG',
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 24 }, { wch: 16 }, { wch: 12 }, { wch: 10 },
    { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tồn Kho');
  download(wb, 'TonKhoSanPham');
}

/** 3. Xuất danh sách đơn hàng */
export function exportOrders(orders: SalesOrder[]) {
  const STATUS_LABEL: Record<string, string> = {
    PENDING:   'Chờ Xử Lý',
    COMPLETED: 'Hoàn Thành',
    CANCELED:  'Đã Hủy',
  };

  // Sheet 1: Danh sách đơn hàng
  const orderRows = orders.map((o) => ({
    'Mã Đơn': o.id,
    'Khách Hàng': o.customerName,
    'Số Điện Thoại': o.customerPhone,
    'Trạng Thái': STATUS_LABEL[o.status] ?? o.status,
    'Tổng Tiền (₫)': o.totalAmount,
    'Nhân Viên Tạo': o.createdByEmail,
    'Ngày Tạo': dayjs(o.createdAt).format('DD/MM/YYYY HH:mm'),
    'Ghi Chú': o.notes ?? '',
  }));

  // Sheet 2: Chi tiết từng sản phẩm trong đơn
  const itemRows: Record<string, unknown>[] = [];
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      itemRows.push({
        'Mã Đơn': o.id,
        'Khách Hàng': o.customerName,
        'Trạng Thái Đơn': STATUS_LABEL[o.status] ?? o.status,
        'SKU': item.variantSku,
        'Màu': item.variantColor ?? '—',
        'Size': item.variantSize ?? '—',
        'Kho': item.storageLocationName,
        'Số Lượng': item.quantity,
        'Đơn Giá (₫)': item.unitPrice,
        'Thành Tiền (₫)': item.subtotal,
        'Ngày Tạo': dayjs(o.createdAt).format('DD/MM/YYYY'),
      });
    });
  });

  const ws1 = XLSX.utils.json_to_sheet(orderRows);
  ws1['!cols'] = [
    { wch: 38 }, { wch: 20 }, { wch: 16 }, { wch: 14 },
    { wch: 16 }, { wch: 26 }, { wch: 18 }, { wch: 20 },
  ];

  const ws2 = XLSX.utils.json_to_sheet(itemRows);
  ws2['!cols'] = [
    { wch: 38 }, { wch: 20 }, { wch: 14 }, { wch: 14 },
    { wch: 10 }, { wch: 10 }, { wch: 16 },
    { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Danh Sách Đơn');
  XLSX.utils.book_append_sheet(wb, ws2, 'Chi Tiết Sản Phẩm');
  download(wb, 'DanhSachDonHang');
}

/** 4. Xuất chi tiết một đơn hàng */
export function exportSingleOrder(order: SalesOrder) {
  const STATUS_LABEL: Record<string, string> = {
    PENDING:   'Chờ Xử Lý',
    COMPLETED: 'Hoàn Thành',
    CANCELED:  'Đã Hủy',
  };

  // ── Phần header đơn hàng ──────────────────────────────────────────
  const headerRows = [
    ['CHI TIẾT ĐƠN HÀNG'],
    [],
    ['Mã Đơn Hàng',    order.id],
    ['Khách Hàng',     order.customerName],
    ['Số Điện Thoại',  order.customerPhone],
    ['Trạng Thái',     STATUS_LABEL[order.status] ?? order.status],
    ['Nhân Viên Tạo',  order.createdByEmail],
    ['Ngày Tạo',       dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')],
    ['Ghi Chú',        order.notes ?? '—'],
    [],
  ];

  // ── Phần bảng sản phẩm ───────────────────────────────────────────
  const itemHeader = [['STT', 'SKU', 'Màu Sắc', 'Kích Cỡ', 'Kho', 'Số Lượng', 'Đơn Giá (₫)', 'Thành Tiền (₫)']];

  const itemRows = (order.items ?? []).map((item, idx) => [
    idx + 1,
    item.variantSku,
    item.variantColor ?? '—',
    item.variantSize  ?? '—',
    item.storageLocationName,
    item.quantity,
    item.unitPrice,
    item.subtotal,
  ]);

  const totalRow = [['', '', '', '', '', '', 'TỔNG CỘNG', order.totalAmount]];

  // ── Ghép tất cả vào 1 sheet ───────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet([
    ...headerRows,
    ...itemHeader,
    ...itemRows,
    ...totalRow,
  ]);

  ws['!cols'] = [
    { wch: 6 }, { wch: 18 }, { wch: 12 }, { wch: 10 },
    { wch: 20 }, { wch: 10 }, { wch: 16 }, { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Chi Tiết Đơn Hàng');
  download(wb, `DonHang_${order.id.slice(0, 8)}`);
}

/** 5. Xuất báo cáo biến động kho */
export function exportStockMovements(data: StockMovementSummary[], from: string, to: string) {
  const rows = data.map((r) => ({
    'SKU': r.variantSku,
    'Sản Phẩm': r.productName,
    'Tổng Nhập': r.totalIn,
    'Tổng Xuất': r.totalOut,
    'Biến Động Ròng': r.netChange,
    'Doanh Thu Ước Tính (₫)': r.estimatedRevenue,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 16 }, { wch: 26 }, { wch: 12 },
    { wch: 12 }, { wch: 16 }, { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Biến Động Kho');
  download(wb, 'BaoCaoBienDongKho');
}
