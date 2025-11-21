import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "@/lib/toast";

interface ImportResult {
	success: number;
	failed: number;
	errors: { row: number; error: string }[];
}

interface BatchImportDialogProps {
	open: boolean;
	onClose: () => void;
	onImport: (data: any[]) => Promise<void>;
	isLoading?: boolean;
}

export function BatchImportDialog({
	open,
	onClose,
	onImport,
	isLoading = false,
}: BatchImportDialogProps) {
	const [file, setFile] = useState<File | null>(null);
	const [previewData, setPreviewData] = useState<any[]>([]);
	const [importResult, setImportResult] = useState<ImportResult | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;

		// 验证文件类型
		const validTypes = [
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		];
		if (!validTypes.includes(selectedFile.type)) {
			toast.error("请上传 Excel 文件（.xls 或 .xlsx）");
			return;
		}

		setFile(selectedFile);
		parseExcelFile(selectedFile);
	};

	const parseExcelFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = e.target?.result;
				const workbook = XLSX.read(data, { type: "binary" });
				const sheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[sheetName];
				const jsonData = XLSX.utils.sheet_to_json(worksheet);

				// 映射字段名
				const mappedData = jsonData.map((row: any) => ({
					name: row["姓名"] || row["name"],
					phone: row["手机号"] || row["phone"],
					idNumber: row["身份证号"] || row["idNumber"],
					gender:
						row["性别"] === "男"
							? "male"
							: row["性别"] === "女"
							? "female"
							: row["gender"] || "other",
					email: row["邮箱"] || row["email"],
					address: row["地址"] || row["address"],
					dharmaName: row["法名"] || row["dharmaName"],
					education: row["学历"] || row["education"],
					emergencyContact: row["紧急联系人"] || row["emergencyContact"],
				}));

				setPreviewData(mappedData);
				toast.success(`成功解析 ${mappedData.length} 条数据`);
			} catch (error) {
				console.error("解析文件失败:", error);
				toast.error("解析文件失败，请检查文件格式");
			}
		};
		reader.readAsBinaryString(file);
	};

	const handleDownloadTemplate = () => {
		// 创建模板数据
		const template = [
			{
				姓名: "张三",
				手机号: "13800138000",
				身份证号: "110101199001011234",
				性别: "男",
				邮箱: "zhangsan@example.com",
				地址: "北京市朝阳区",
				法名: "释某某",
				学历: "本科",
				紧急联系人: "李四 13900139000",
			},
		];

		// 创建工作簿
		const worksheet = XLSX.utils.json_to_sheet(template);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "义工导入模板");

		// 设置列宽
		worksheet["!cols"] = [
			{ wch: 10 },
			{ wch: 15 },
			{ wch: 20 },
			{ wch: 8 },
			{ wch: 25 },
			{ wch: 30 },
			{ wch: 12 },
			{ wch: 10 },
			{ wch: 25 },
		];

		// 下载文件
		XLSX.writeFile(workbook, "义工导入模板.xlsx");
		toast.success("模板下载成功");
	};

	const handleImport = async () => {
		if (previewData.length === 0) {
			toast.error("请先选择文件");
			return;
		}

		try {
			await onImport(previewData);
			setImportResult({
				success: previewData.length,
				failed: 0,
				errors: [],
			});
			toast.success(`成功导入 ${previewData.length} 条数据`);
			setTimeout(() => {
				handleClose();
			}, 2000);
		} catch (error: any) {
			console.error("导入失败:", error);
			toast.error(error.message || "导入失败");
		}
	};

	const handleClose = () => {
		setFile(null);
		setPreviewData([]);
		setImportResult(null);
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} title="批量导入义工" maxWidth="2xl">
			<div className="space-y-6">
				{/* 步骤指引 */}
				<div className="flex items-center justify-between p-4 bg-muted rounded-lg">
					<div className="flex items-center gap-2">
						<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
							1
						</div>
						<span className="text-sm font-medium">下载模板</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
							2
						</div>
						<span className="text-sm font-medium">填写数据</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
							3
						</div>
						<span className="text-sm font-medium">上传文件</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
							4
						</div>
						<span className="text-sm font-medium">确认导入</span>
					</div>
				</div>

				{/* 下载模板 */}
				<div className="space-y-2">
					<label className="text-sm font-medium">步骤 1: 下载导入模板</label>
					<Button
						variant="outline"
						className="w-full"
						onClick={handleDownloadTemplate}
					>
						<Download className="h-4 w-4 mr-2" />
						下载 Excel 模板
					</Button>
				</div>

				{/* 上传文件 */}
				<div className="space-y-2">
					<label className="text-sm font-medium">步骤 2-3: 上传填写好的文件</label>
					<div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
						<input
							type="file"
							accept=".xlsx,.xls"
							onChange={handleFileChange}
							className="hidden"
							id="file-upload"
						/>
						<label
							htmlFor="file-upload"
							className="cursor-pointer flex flex-col items-center gap-2"
						>
							<Upload className="h-12 w-12 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">
									点击上传或拖拽文件到此处
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									支持 .xlsx 和 .xls 格式
								</p>
							</div>
						</label>
					</div>
					{file && (
						<div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
							<FileSpreadsheet className="h-5 w-5 text-green-600" />
							<span className="text-sm flex-1">{file.name}</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setFile(null);
									setPreviewData([]);
								}}
							>
								<XCircle className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>

				{/* 数据预览 */}
				{previewData.length > 0 && (
					<div className="space-y-2">
						<label className="text-sm font-medium">
							数据预览（共 {previewData.length} 条）
						</label>
						<div className="max-h-64 overflow-auto border rounded-lg">
							<table className="w-full text-sm">
								<thead className="bg-muted sticky top-0">
									<tr>
										<th className="px-3 py-2 text-left">姓名</th>
										<th className="px-3 py-2 text-left">手机号</th>
										<th className="px-3 py-2 text-left">性别</th>
										<th className="px-3 py-2 text-left">邮箱</th>
									</tr>
								</thead>
								<tbody>
									{previewData.slice(0, 10).map((row, index) => (
										<tr key={index} className="border-t">
											<td className="px-3 py-2">{row.name}</td>
											<td className="px-3 py-2">{row.phone}</td>
											<td className="px-3 py-2">
												{row.gender === "male"
													? "男"
													: row.gender === "female"
													? "女"
													: "其他"}
											</td>
											<td className="px-3 py-2">{row.email || "-"}</td>
										</tr>
									))}
								</tbody>
							</table>
							{previewData.length > 10 && (
								<div className="p-2 text-center text-xs text-muted-foreground border-t">
									...还有 {previewData.length - 10} 条数据
								</div>
							)}
						</div>
					</div>
				)}

				{/* 导入结果 */}
				{importResult && (
					<div className="space-y-2">
						<label className="text-sm font-medium">导入结果</label>
						<div className="p-4 bg-muted rounded-lg space-y-2">
							<div className="flex items-center gap-2 text-green-600">
								<CheckCircle className="h-5 w-5" />
								<span>成功导入 {importResult.success} 条</span>
							</div>
							{importResult.failed > 0 && (
								<div className="flex items-center gap-2 text-red-600">
									<XCircle className="h-5 w-5" />
									<span>失败 {importResult.failed} 条</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* 注意事项 */}
				<div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
					<AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
					<div className="text-sm text-orange-900 dark:text-orange-100">
						<p className="font-medium mb-1">注意事项：</p>
						<ul className="list-disc list-inside space-y-1 text-xs">
							<li>姓名、手机号、身份证号为必填项</li>
							<li>手机号和身份证号不能重复</li>
							<li>性别只能填写：男、女、其他</li>
							<li>建议每次导入不超过 100 条数据</li>
						</ul>
					</div>
				</div>

				{/* 操作按钮 */}
				<div className="flex justify-end gap-2 pt-4 border-t">
					<Button variant="outline" onClick={handleClose} disabled={isLoading}>
						取消
					</Button>
					<Button
						onClick={handleImport}
						disabled={previewData.length === 0 || isLoading}
					>
						{isLoading ? "导入中..." : `确认导入 (${previewData.length})`}
					</Button>
				</div>
			</div>
		</Dialog>
	);
}
