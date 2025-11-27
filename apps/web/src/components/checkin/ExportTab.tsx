import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { checkinService } from "@/services/checkin";
import { toast } from "@/lib/toast";
import dayjs from "dayjs";

export function ExportTab() {
	const [startDate, setStartDate] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
	const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		if (!startDate || !endDate) {
			toast.error("请选择日期范围");
			return;
		}

		setIsExporting(true);
		try {
			const blob = await checkinService.exportVolunteerService(startDate, endDate);

			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `志愿者服务时间统计表_${startDate}_${endDate}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			toast.success("导出成功！");
		} catch (error: any) {
			toast.error(error.message || "导出失败");
		} finally {
			setIsExporting(false);
		}
	};

	const quickExport = async (type: "current" | "last") => {
		const today = dayjs();
		let start, end;

		if (type === "current") {
			start = today.startOf("month").format("YYYY-MM-DD");
			end = today.format("YYYY-MM-DD");
		} else {
			start = today.subtract(1, "month").startOf("month").format("YYYY-MM-DD");
			end = today.subtract(1, "month").endOf("month").format("YYYY-MM-DD");
		}

		setStartDate(start);
		setEndDate(end);
		
		// 自动触发导出
		setTimeout(() => {
			handleExport();
		}, 100);
	};

	return (
		<div className="space-y-6">
			{/* 快速导出 */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => quickExport("current")}>
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
								<FileSpreadsheet className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<CardTitle className="text-lg">本月统计表</CardTitle>
								<CardDescription>导出本月义工服务时间</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Button className="w-full" disabled={isExporting}>
							<FileDown className="h-4 w-4 mr-2" />
							导出本月 Excel
						</Button>
					</CardContent>
				</Card>

				<Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => quickExport("last")}>
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
								<FileSpreadsheet className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<CardTitle className="text-lg">上月统计表</CardTitle>
								<CardDescription>导出上月义工服务时间</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Button className="w-full" disabled={isExporting}>
							<FileDown className="h-4 w-4 mr-2" />
							导出上月 Excel
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* 自定义导出 */}
			<Card>
				<CardHeader>
					<CardTitle>自定义导出</CardTitle>
					<CardDescription>选择日期范围导出考勤数据</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">开始日期</label>
							<Input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">结束日期</label>
							<Input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
							/>
						</div>
					</div>

					<Button onClick={handleExport} disabled={isExporting} className="w-full">
						<FileDown className="h-4 w-4 mr-2" />
						{isExporting ? "导出中..." : "导出 Excel"}
					</Button>
				</CardContent>
			</Card>

			{/* 导出说明 */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">导出说明</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground space-y-2">
					<p>• Excel 表格包含：姓名、莲花斋ID、打卡天数、总工时、平均工时</p>
					<p>• 数据按义工姓名排序</p>
					<p>• 仅包含选定日期范围内的考勤记录</p>
					<p>• 导出的文件可直接用于报表提交</p>
				</CardContent>
			</Card>
		</div>
	);
}
