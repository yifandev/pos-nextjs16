/**
 * Export Utilities
 * Provides functions to export data to Excel and PDF formats
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDateTime } from './format';

export interface ExportColumn {
  header: string;
  key: string;
  format?: (value: any) => string;
}

/**
 * Export data to Excel file
 */
export function exportToExcel(
  data: any[],
  filename: string,
  sheetName: string = 'Sheet1'
) {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(data[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet['!cols'] = colWidths;
    
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
}

/**
 * Export data to PDF file
 */
export function exportToPDF(
  data: any[],
  columns: ExportColumn[],
  filename: string,
  title?: string
) {
  try {
    const doc = new jsPDF();
    
    // Add title
    if (title) {
      doc.setFontSize(16);
      doc.text(title, 14, 15);
    }
    
    // Prepare table data
    const headers = columns.map(col => col.header);
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col.key];
        return col.format ? col.format(value) : String(value || '-');
      })
    );
    
    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: title ? 25 : 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
}

/**
 * Export sales data to Excel
 */
export function exportSalesToExcel(sales: any[]) {
  const exportData = sales.map(sale => ({
    'Invoice': sale.invoice,
    'Tanggal': formatDateTime(sale.createdAt),
    'Kasir': sale.cashier.name,
    'Pelanggan': sale.customer?.name || '-',
    'Total Item': sale.items.length,
    'Subtotal': formatCurrency(sale.subtotal),
    'Pajak': formatCurrency(sale.tax),
    'Total': formatCurrency(sale.total),
    'Metode Pembayaran': sale.paymentType,
    'Dibayar': formatCurrency(sale.paid),
    'Kembalian': formatCurrency(sale.change),
  }));
  
  return exportToExcel(
    exportData,
    `sales-report-${new Date().toISOString().split('T')[0]}`,
    'Penjualan'
  );
}

/**
 * Export sales data to PDF
 */
export function exportSalesToPDF(sales: any[]) {
  const columns: ExportColumn[] = [
    { header: 'Invoice', key: 'invoice' },
    { header: 'Tanggal', key: 'createdAt', format: formatDateTime },
    { header: 'Kasir', key: 'cashier', format: (v) => v?.name || '-' },
    { header: 'Total', key: 'total', format: formatCurrency },
    { header: 'Pembayaran', key: 'paymentType' },
  ];
  
  return exportToPDF(
    sales,
    columns,
    `sales-report-${new Date().toISOString().split('T')[0]}`,
    'Laporan Penjualan'
  );
}
