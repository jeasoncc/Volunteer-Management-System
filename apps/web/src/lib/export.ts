import * as XLSX from "xlsx";

export interface ExportColumn {
	key: string;
	label: string;
	format?: (value: any) => string | number;
}

export interface ExportOptions {
	filename: string;
	sheetName?: string;
	columns: ExportColumn[];
	data: any[];
}

/**
 * 导出数据为 Excel 文件
 */
export function exportToExcel({
	filename,
	sheetName = "Sheet1",
	columns,
	data,
}: ExportOptions) {
	// 准备表头
	const headers = columns.map((col) => col.label);

	// 准备数据行
	const rows = data.map((item) =>
		columns.map((col) => {
			const value = item[col.key];
			return col.format ? col.format(value) : value ?? "";
		}),
	);

	// 创建工作表
	const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

	// 设置列宽
	const columnWidths = columns.map((col) => {
		const maxLength = Math.max(
			col.label.length,
			...data.map((item) => {
				const value = item[col.key];
				const formatted = col.format ? col.format(value) : value;
				return String(formatted ?? "").length;
			}),
		);
		return { wch: Math.min(maxLength + 2, 50) };
	});
	worksheet["!cols"] = columnWidths;

	// 创建工作簿
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

	// 导出文件
	const timestamp = new Date().toISOString().split("T")[0];
	XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);
}

/**
 * 导出数据为 CSV 文件
 */
export function exportToCSV({
	filename,
	columns,
	data,
}: Omit<ExportOptions, "sheetName">) {
	// 准备表头
	const headers = columns.map((col) => col.label).join(",");

	// 准备数据行
	const rows = data.map((item) =>
		columns
			.map((col) => {
				const value = item[col.key];
				const formatted = col.format ? col.format(value) : value ?? "";
				// CSV 转义：如果包含逗号、引号或换行符，需要用引号包裹
				const str = String(formatted);
				if (str.includes(",") || str.includes('"') || str.includes("\n")) {
					return `"${str.replace(/"/g, '""')}"`;
				}
				return str;
			})
			.join(","),
	);

	// 组合内容
	const csvContent = [headers, ...rows].join("\n");

	// 创建 Blob 并下载
	const blob = new Blob(["\ufeff" + csvContent], {
		type: "text/csv;charset=utf-8;",
	});
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);
	link.href = url;
	const timestamp = new Date().toISOString().split("T")[0];
	link.download = `${filename}_${timestamp}.csv`;
	link.click();
	URL.revokeObjectURL(url);
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: string | Date | undefined): string {
	if (!date) return "";
	const d = new Date(date);
	return d.toLocaleString("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date | undefined): string {
	if (!date) return "";
	const d = new Date(date);
	return d.toLocaleDateString("zh-CN");
}
