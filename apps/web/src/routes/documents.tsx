import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CareRecordForm } from "@/components/CareRecordForm";
import { useAuth } from "@/hooks/useAuth";
import { checkinService } from "@/services/checkin";
import { documentService, type CareRecordData } from "@/services/document";
import { Download, FileSpreadsheet, Calendar, FileText } from "lucide-react";
import { toast } from "@/lib/toast";
import dayjs from "dayjs";

export const Route = createFileRoute("/documents")({
	component: DocumentsPage,
} as any);

function DocumentsPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [startDate, setStartDate] = useState(
		dayjs().startOf("month").format("YYYY-MM-DD")
	);
	const [endDate, setEndDate] = useState(
		dayjs().endOf("month").format("YYYY-MM-DD")
	);
	const [isExporting, setIsExporting] = useState(false);
	const [isCareRecordDialogOpen, setIsCareRecordDialogOpen] = useState(false);

	// 生成助念记录表 mutation
	const createCareRecordMutation = useMutation({
		mutationFn: documentService.createCareRecord,
		onSuccess: async (result) => {
			toast.success("助念记录表生成成功！");
			setIsCareRecordDialogOpen(false);
			// 自动下载
			await documentService.downloadCareRecord(result.downloadUrl);
		},
		onError: (error: any) => {
			toast.error(error.message || "生成失败");
		},
	});

	if (authLoading) {
		return (
			<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "文档管理" }]}>
				<div className="flex items-center justify-center h-64">
					<div className="text-muted-foreground">加载中...</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const handleCareRecordSubmit = (data: CareRecordData) => {
		createCareRecordMutation.mutate(data);
	};

	// 生成关怀登记表（示例数据）
	const handleGenerateCareRegistration = async () => {
		try {
			setIsExporting(true);
			const response = await fetch(
				`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/document/care-registration`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({
						projectDate: "2025年11月17日",
						serialNumber: "了缘 生根之床",
						name: "柯景金",
						gender: "男",
						age: 69,
						religion: "佛",
						address: "深圳市罗湖区布心路东乐花园4A栋5A",
						familyStatus: "柯锦燕",
						familyPhone: "13602504789",
						illness: "尿毒症",
						careDate: "参加莲友",
						patientCondition: "同意义工关怀\n同意助念流程\n家属们助念配合",
						notes: "身高172cm，体重50斤",
					}),
				},
			);

			if (!response.ok) {
				throw new Error("生成失败");
			}

			const result = await response.json();
			
			// 下载文件
			const downloadResponse = await fetch(
				`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${result.downloadUrl}`,
			);
			const blob = await downloadResponse.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = result.fileName;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			alert("关怀登记表生成成功！");
		} catch (error: any) {
			alert(error.message || "生成失败");
		} finally {
			setIsExporting(false);
		}
	};

	// 生成助念邀请承诺书（示例数据）
	const handleGenerateInvitationLetter = async () => {
		try {
			setIsExporting(true);
			const response = await fetch(
				`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/document/invitation-letter`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({
						teamName: "莲花生命关怀团",
						deceasedName: "柯景金",
						familyName: "柯锦燕",
					}),
				},
			);

			if (!response.ok) {
				throw new Error("生成失败");
			}

			const result = await response.json();
			
			// 下载文件
			const downloadResponse = await fetch(
				`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${result.downloadUrl}`,
			);
			const blob = await downloadResponse.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = result.fileName;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			alert("助念邀请承诺书生成成功！");
		} catch (error: any) {
			alert(error.message || "生成失败");
		} finally {
			setIsExporting(false);
		}
	};

	const handleExport = async () => {
		try {
			setIsExporting(true);
			const blob = await checkinService.exportVolunteerService(
				startDate,
				endDate
			);

			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `志愿者服务时间统计表_${startDate}_${endDate}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			alert("导出成功！");
		} catch (error: any) {
			alert(error.message || "导出失败");
		} finally {
			setIsExporting(false);
		}
	};

	const handleQuickExport = async (months: number) => {
		const start = dayjs()
			.subtract(months, "month")
			.startOf("month")
			.format("YYYY-MM-DD");
		const end = dayjs()
			.subtract(months, "month")
			.endOf("month")
			.format("YYYY-MM-DD");

		try {
			setIsExporting(true);
			const blob = await checkinService.exportVolunteerService(start, end);

			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			const monthName = dayjs().subtract(months, "month").format("YYYY年MM月");
			a.download = `志愿者服务时间统计表_${monthName}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			alert("导出成功！");
		} catch (error: any) {
			alert(error.message || "导出失败");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<DashboardLayout breadcrumbs={[{ label: "首页", href: "/" }, { label: "文档管理" }]}>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">文档管理</h1>
					<p className="mt-2 text-muted-foreground">
						导出各类统计报表和文档
					</p>
				</div>

				{/* 快捷导出 */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<FileSpreadsheet className="h-5 w-5" />
							<CardTitle>快捷导出</CardTitle>
						</div>
						<CardDescription>快速导出常用月份的统计表</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<Button
								variant="outline"
								onClick={() => handleQuickExport(0)}
								disabled={isExporting}
							>
								<Calendar className="h-4 w-4 mr-2" />
								本月
							</Button>
							<Button
								variant="outline"
								onClick={() => handleQuickExport(1)}
								disabled={isExporting}
							>
								<Calendar className="h-4 w-4 mr-2" />
								上月
							</Button>
							<Button
								variant="outline"
								onClick={() => handleQuickExport(2)}
								disabled={isExporting}
							>
								<Calendar className="h-4 w-4 mr-2" />
								上上月
							</Button>
							<Button
								variant="outline"
								onClick={() => handleQuickExport(3)}
								disabled={isExporting}
							>
								<Calendar className="h-4 w-4 mr-2" />
								三个月前
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* 自定义导出 */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Download className="h-5 w-5" />
							<CardTitle>自定义导出</CardTitle>
						</div>
						<CardDescription>
							选择自定义日期范围导出志愿者服务时间统计表
						</CardDescription>
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
						<Button
							onClick={handleExport}
							disabled={isExporting}
							className="w-full md:w-auto"
						>
							<Download className="h-4 w-4 mr-2" />
							{isExporting ? "导出中..." : "导出 Excel"}
						</Button>
					</CardContent>
				</Card>

				{/* LaTeX 表格生成 */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							<CardTitle>表格文档生成</CardTitle>
						</div>
						<CardDescription>
							使用 LaTeX 生成专业的 PDF 文档
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button
							onClick={handleGenerateCareRegistration}
							disabled={isExporting}
							className="w-full"
							variant="outline"
						>
							<FileText className="h-4 w-4 mr-2" />
							生成关怀登记表
						</Button>
						<Button
							onClick={handleGenerateInvitationLetter}
							disabled={isExporting}
							className="w-full"
							variant="outline"
						>
							<FileText className="h-4 w-4 mr-2" />
							生成助念邀请承诺书
						</Button>
					</CardContent>
				</Card>

				{/* 助念记录表 */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							<CardTitle>助念记录表</CardTitle>
						</div>
						<CardDescription>
							生成深圳莲花关怀团助念记录表（Excel格式）
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={() => setIsCareRecordDialogOpen(true)}
							className="w-full md:w-auto"
						>
							<FileText className="h-4 w-4 mr-2" />
							创建助念记录表
						</Button>
					</CardContent>
				</Card>

				{/* 导出说明 */}
				<Card>
					<CardHeader>
						<CardTitle>导出说明</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>• 导出文件格式：符合深圳志愿者管理系统要求的 Excel 格式</p>
						<p>• 工时计算：自动计算签到签退时间差，单次打卡默认1小时</p>
						<p>• 时长限制：单日服务时长最多8小时</p>
						<p>• 数据来源：基于原始打卡记录实时计算</p>
						<p>• 适用场景：用于向深圳志愿者管理系统上报月度数据</p>
					</CardContent>
				</Card>
			</div>

			{/* 助念记录表对话框 */}
			<Dialog
				open={isCareRecordDialogOpen}
				onClose={() => setIsCareRecordDialogOpen(false)}
				title="创建助念记录表"
				maxWidth="4xl"
			>
				<CareRecordForm
					onSubmit={handleCareRecordSubmit}
					onCancel={() => setIsCareRecordDialogOpen(false)}
				/>
			</Dialog>
		</DashboardLayout>
	);
}
