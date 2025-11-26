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

		// 验证文件类型 - 支持 Excel 和 CSV
		const validTypes = [
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"text/csv",
			"application/csv",
		];
		const fileName = selectedFile.name.toLowerCase();
		const isValidType = validTypes.includes(selectedFile.type) || 
			fileName.endsWith('.xlsx') || 
			fileName.endsWith('.xls') || 
			fileName.endsWith('.csv');
		
		if (!isValidType) {
			toast.error("请上传 Excel 文件（.xls 或 .xlsx）或 CSV 文件（.csv）");
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

				// 辅助函数：清理空值，将空字符串转为 undefined
				const cleanValue = (value: any): any => {
					if (value === "" || value === null || value === undefined) {
						return undefined;
					}
					return value;
				};

				// 映射字段名 - 支持完整字段
				const mappedData = jsonData.map((row: any) => {
					// 处理性别
					let gender = "other";
					if (row["性别"] === "男") gender = "male";
					else if (row["性别"] === "女") gender = "female";
					else if (row["性别"] === "其他") gender = "other";
					else if (row["gender"]) gender = row["gender"];
					
					// 处理学历
					const educationMap: Record<string, string> = {
						"小学": "elementary",
						"初中": "middle_school",
						"高中": "high_school",
						"中专": "technical_secondary",
						"专科": "associate",
						"本科": "bachelor",
						"硕士": "master",
						"博士": "doctor",
					};
					const educationValue = row["学历"] || row["education"];
					const education = educationValue ? (educationMap[educationValue] || educationValue) : undefined;
					
					// 处理宗教背景
					const religionMap: Record<string, string> = {
						"佛教": "upasaka",
						"无": "none",
					};
					const religionValue = row["宗教背景"] || row["religiousBackground"] || row["宗教信仰"];
					const religiousBackground = religionValue ? (religionMap[religionValue] || religionValue) : undefined;
					
					// 处理皈依状态
					const refugeMap: Record<string, string> = {
						"皈依": "took_refuge",
						"已皈依": "took_refuge",
						"无": "none",
						"未皈依": "none",
					};
					const refugeValue = row["皈依状态"] || row["refugeStatus"] || row["是否皈依"];
					const refugeStatus = refugeValue ? (refugeMap[refugeValue] || refugeValue) : undefined;
					
					// 处理健康状况
					const healthMap: Record<string, string> = {
						"很好": "healthy",
						"无疾病": "healthy",
						"健康": "healthy",
						"一般": "has_chronic_disease",
						"较差": "has_chronic_disease",
					};
					const healthValue = row["健康状况"] || row["healthConditions"];
					const healthConditions = healthValue ? (healthMap[healthValue] || healthValue) : undefined;
					
					// 构建数据对象，清理所有空值
					const data: any = {
						name: cleanValue(row["姓名"] || row["name"]),
						phone: cleanValue(row["手机号"] || row["phone"]),
						idNumber: cleanValue(row["身份证号"] || row["idNumber"]),
						gender,
					};

					// 只添加非空的可选字段
					const optionalFields = {
						birthDate: cleanValue(row["出生日期"] || row["birthDate"] || row["出生年月"]),
						email: cleanValue(row["邮箱"] || row["email"]),
						address: cleanValue(row["地址"] || row["address"] || row["住址"]),
						volunteerId: cleanValue(row["深圳义工号"] || row["volunteerId"]),
						wechat: cleanValue(row["微信号"] || row["wechat"]),
						dharmaName: cleanValue(row["法名"] || row["dharmaName"]),
						education,
						religiousBackground,
						refugeStatus,
						healthConditions,
						emergencyContact: cleanValue(row["紧急联系人"] || row["emergencyContact"]),
						emergencyPhone: cleanValue(row["紧急联系电话"] || row["emergencyPhone"]),
					};

					// 只添加有值的字段
					Object.entries(optionalFields).forEach(([key, value]) => {
						if (value !== undefined) {
							data[key] = value;
						}
					});

					return data;
				});

				// 调试：打印解析后的数据
				console.log("=== CSV解析结果 ===");
				console.log("原始数据:", jsonData);
				console.log("映射后数据:", mappedData);
				console.log("第一条数据详情:", JSON.stringify(mappedData[0], null, 2));
				
				setPreviewData(mappedData);
				toast.success(`成功解析 ${mappedData.length} 条数据`);
			} catch (error) {
				console.error("解析文件失败:", error);
				toast.error("解析文件失败，请检查文件格式");
			}
		};
		reader.readAsBinaryString(file);
	};

	const handleDownloadTemplate = (format: "excel" | "csv" = "excel") => {
		// 创建模板数据 - 包含所有重要字段
		const template = [
			{
				姓名: "张三",
				手机号: "13800138000",
				身份证号: "110101199001011234",
				性别: "男",
				出生日期: "1990-01-01",
				深圳义工号: "0000123456",
				微信号: "zhangsan_wx",
				邮箱: "zhangsan@example.com",
				地址: "北京市朝阳区某某街道",
				学历: "本科",
				宗教背景: "佛教",
				皈依状态: "皈依",
				健康状况: "很好",
				法名: "释某某",
				紧急联系人: "李四",
				紧急联系电话: "13900139000",
			},
		];

		// 创建工作簿
		const worksheet = XLSX.utils.json_to_sheet(template);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "义工导入模板");

		// 设置列宽
		worksheet["!cols"] = [
			{ wch: 10 },  // 姓名
			{ wch: 15 },  // 手机号
			{ wch: 20 },  // 身份证号
			{ wch: 8 },   // 性别
			{ wch: 12 },  // 出生日期
			{ wch: 15 },  // 深圳义工号
			{ wch: 15 },  // 微信号
			{ wch: 25 },  // 邮箱
			{ wch: 30 },  // 地址
			{ wch: 10 },  // 学历
			{ wch: 10 },  // 宗教背景
			{ wch: 10 },  // 皈依状态
			{ wch: 10 },  // 健康状况
			{ wch: 12 },  // 法名
			{ wch: 12 },  // 紧急联系人
			{ wch: 15 },  // 紧急联系电话
		];

		// 下载文件
		if (format === "csv") {
			XLSX.writeFile(workbook, "义工导入模板.csv", { bookType: "csv" });
			toast.success("CSV 模板下载成功");
		} else {
			XLSX.writeFile(workbook, "义工导入模板.xlsx");
			toast.success("Excel 模板下载成功");
		}
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
					<div className="grid grid-cols-2 gap-2">
						<Button
							variant="outline"
							onClick={() => handleDownloadTemplate("excel")}
						>
							<Download className="h-4 w-4 mr-2" />
							Excel 模板
						</Button>
						<Button
							variant="outline"
							onClick={() => handleDownloadTemplate("csv")}
						>
							<Download className="h-4 w-4 mr-2" />
							CSV 模板
						</Button>
					</div>
				</div>

				{/* 上传文件 */}
				<div className="space-y-2">
					<label className="text-sm font-medium">步骤 2-3: 上传填写好的文件</label>
					<div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
						<input
							type="file"
							accept=".xlsx,.xls,.csv"
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
									支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式
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
										<th className="px-3 py-2 text-left">深圳义工号</th>
										<th className="px-3 py-2 text-left">性别</th>
										<th className="px-3 py-2 text-left">出生日期</th>
										<th className="px-3 py-2 text-left">地址</th>
									</tr>
								</thead>
								<tbody>
									{previewData.slice(0, 10).map((row, index) => (
										<tr key={index} className="border-t">
											<td className="px-3 py-2">{row.name}</td>
											<td className="px-3 py-2">{row.phone}</td>
											<td className="px-3 py-2">{row.volunteerId || "-"}</td>
											<td className="px-3 py-2">
												{row.gender === "male"
													? "男"
													: row.gender === "female"
													? "女"
													: "其他"}
											</td>
											<td className="px-3 py-2">{row.birthDate || "-"}</td>
											<td className="px-3 py-2 max-w-xs truncate">{row.address || "-"}</td>
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
							<li>手机号、身份证号、深圳义工号不能重复</li>
							<li>性别填写：男、女、其他</li>
							<li>学历填写：小学、初中、高中、中专、专科、本科、硕士、博士</li>
							<li>宗教背景填写：佛教、无</li>
							<li>皈依状态填写：皈依、无</li>
							<li>健康状况填写：很好、一般、较差</li>
							<li>出生日期格式：YYYY-MM-DD（如：1990-01-01）</li>
							<li>支持 Excel 和 CSV 格式文件</li>
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
