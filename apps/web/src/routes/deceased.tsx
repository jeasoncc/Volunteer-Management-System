import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeceasedForm } from "@/components/DeceasedForm";
import { Pagination } from "@/components/Pagination";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deceasedService } from "@/services/deceased";
import type { Deceased } from "@/types";
import { Plus, Edit, Trash2, Users, Eye, Calendar as CalendarIcon, Search, Filter, X, MapPin, Phone } from "lucide-react";
import { toast } from "@/lib/toast";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/deceased")({
	component: DeceasedPage,
});

function DeceasedPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingDeceased, setEditingDeceased] = useState<Deceased | undefined>();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingDeceased, setDeletingDeceased] = useState<Deceased | null>(null);
	const [viewingDeceased, setViewingDeceased] = useState<Deceased | null>(null);
	
	// 筛选状态
	const [keyword, setKeyword] = useState("");
	const [genderFilter, setGenderFilter] = useState<string>("all");
	const [positionFilter, setPositionFilter] = useState<string>("all");
	const [date, setDate] = useState<Date | undefined>(undefined);

	const { data, isLoading } = useQuery({
		queryKey: [
			"deceased",
			page,
			pageSize,
			keyword,
			genderFilter,
			positionFilter,
			date,
		],
		queryFn: () =>
			deceasedService.getList({
				page,
				pageSize,
				keyword: keyword || undefined,
				gender: genderFilter === "all" ? undefined : genderFilter,
				chantPosition: positionFilter === "all" ? undefined : positionFilter,
				startDate: date ? format(date, "yyyy-MM-dd") : undefined,
				endDate: date ? format(date, "yyyy-MM-dd") : undefined,
			}),
		enabled: isAuthenticated,
	});

	const createMutation = useMutation({
		mutationFn: deceasedService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deceased"] });
			setIsDialogOpen(false);
			toast.success("创建成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "创建失败");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<Deceased> }) =>
			deceasedService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deceased"] });
			setIsDialogOpen(false);
			setEditingDeceased(undefined);
			toast.success("更新成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "更新失败");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deceasedService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deceased"] });
			toast.success("删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "删除失败");
		},
	});

	if (authLoading) {
		return (
			<div className="space-y-6 p-6">
				<div className="flex justify-between items-center">
					<div className="h-10 bg-muted rounded-md w-1/3 animate-pulse" />
					<div className="h-10 bg-muted rounded-md w-24 animate-pulse" />
				</div>
				<div className="h-96 bg-muted rounded-lg animate-pulse" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const deceasedList = Array.isArray(data?.data) ? data.data : [];
	const total = data?.data?.total || 0;

	const handleAdd = () => {
		setEditingDeceased(undefined);
		setIsDialogOpen(true);
	};

	const resetFilters = () => {
		setKeyword("");
		setGenderFilter("all");
		setPositionFilter("all");
		setDate(undefined);
		setPage(1);
	};

	const handleEdit = (deceased: Deceased) => {
		setEditingDeceased(deceased);
		setIsDialogOpen(true);
	};

	const handleDelete = (deceased: Deceased) => {
		setDeletingDeceased(deceased);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (deletingDeceased) {
			deleteMutation.mutate(deletingDeceased.id);
			setDeleteDialogOpen(false);
			setDeletingDeceased(null);
		}
	};

	const handleFormSubmit = async (data: Partial<Deceased>) => {
		if (editingDeceased) {
			await updateMutation.mutateAsync({ id: editingDeceased.id, data });
		} else {
			await createMutation.mutateAsync(data as any);
		}
	};

	const handleDialogClose = () => {
		setIsDialogOpen(false);
		setEditingDeceased(undefined);
	};

	const genderMap = {
		male: "男",
		female: "女",
		other: "其他",
	};

	const positionMap = {
		"room-one": "一号房",
		"room-two": "二号房",
		"room-three": "三号房",
		"room-four": "四号房",
		unknow: "未知",
	};

	// 生成一个基于名字的颜色
	const getAvatarColor = (name: string) => {
		const colors = [
			"bg-red-500",
			"bg-orange-500",
			"bg-amber-500",
			"bg-yellow-500",
			"bg-lime-500",
			"bg-green-500",
			"bg-emerald-500",
			"bg-teal-500",
			"bg-cyan-500",
			"bg-sky-500",
			"bg-blue-500",
			"bg-indigo-500",
			"bg-violet-500",
			"bg-purple-500",
			"bg-fuchsia-500",
			"bg-pink-500",
			"bg-rose-500",
		];
		const index = name.length % colors.length;
		return colors[index];
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">往生者管理</h1>
					<p className="text-muted-foreground mt-1">
						管理往生者信息，安排助念事宜，记录往生时刻
					</p>
				</div>
				<Button onClick={handleAdd} size="lg" className="shadow-sm">
					<Plus className="h-4 w-4 mr-2" />
					登记往生者
				</Button>
			</div>

			{/* 统计概览 */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-200/50 dark:border-purple-800/30">
					<CardContent className="p-6 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-purple-600 dark:text-purple-400">登记总数</p>
							<p className="text-3xl font-bold mt-2">{total}</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
							<Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">本月往生</p>
							<p className="text-3xl font-bold mt-2">-</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
							<CalendarIcon className="h-6 w-6 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">正在助念</p>
							<p className="text-3xl font-bold mt-2">-</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
							<MapPin className="h-6 w-6 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* 筛选与列表 */}
			<Card className="shadow-sm">
				<div className="p-4 border-b bg-muted/30 flex flex-col md:flex-row gap-4 items-center justify-between">
					<div className="flex flex-1 flex-col md:flex-row gap-3 w-full">
						<div className="relative w-full md:w-64">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="搜索姓名、家属、电话..."
								value={keyword}
								onChange={(e) => {
									setKeyword(e.target.value);
									setPage(1);
								}}
								className="pl-9 bg-background"
							/>
						</div>
						
						<Select
							value={positionFilter}
							onValueChange={(v) => {
								setPositionFilter(v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full md:w-40 bg-background">
								<SelectValue placeholder="助念房间" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">全部房间</SelectItem>
								<SelectItem value="room-one">一号房</SelectItem>
								<SelectItem value="room-two">二号房</SelectItem>
								<SelectItem value="room-three">三号房</SelectItem>
								<SelectItem value="room-four">四号房</SelectItem>
								<SelectItem value="unknow">未知</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={genderFilter}
							onValueChange={(v) => {
								setGenderFilter(v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full md:w-32 bg-background">
								<SelectValue placeholder="性别" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">全部性别</SelectItem>
								<SelectItem value="male">男</SelectItem>
								<SelectItem value="female">女</SelectItem>
							</SelectContent>
						</Select>

						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn(
										"w-full md:w-[200px] justify-start text-left font-normal bg-background",
										!date && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date ? format(date, "PPP", { locale: zhCN }) : <span>选择往生日期</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={date}
									onSelect={(d) => {
										setDate(d);
										setPage(1);
									}}
									initialFocus
								/>
							</PopoverContent>
						</Popover>

						{(keyword || genderFilter !== "all" || positionFilter !== "all" || date) && (
							<Button 
								variant="ghost" 
								onClick={resetFilters}
								className="px-2 lg:px-3 text-muted-foreground hover:text-primary"
							>
								<X className="h-4 w-4 mr-2" />
								重置
							</Button>
						)}
					</div>
				</div>

				<div className="p-0">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-4">
							<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							<p>正在加载往生者数据...</p>
						</div>
					) : deceasedList.length === 0 ? (
						<div className="py-12">
							<EmptyState
								type="no-data"
								onAction={handleAdd}
								actionLabel="添加第一个往生者"
							/>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/50">
									<TableHead className="w-[250px]">基本信息</TableHead>
									<TableHead>年龄/性别</TableHead>
									<TableHead>往生日期</TableHead>
									<TableHead>助念位置</TableHead>
									<TableHead>家属联系</TableHead>
									<TableHead className="text-right">操作</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{deceasedList.map((deceased) => (
									<TableRow key={deceased.id} className="group hover:bg-muted/50">
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-10 w-10 border-2 border-white shadow-sm">
													<AvatarFallback className={`${getAvatarColor(deceased.name)} text-white`}>
														{deceased.name.slice(0, 1)}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium">{deceased.name}</div>
													<div className="text-xs text-muted-foreground">{deceased.title || "无称谓"}</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Badge variant="secondary" className="font-normal">
													{genderMap[deceased.gender as keyof typeof genderMap]}
												</Badge>
												<span className="text-sm text-muted-foreground">{deceased.age ? `${deceased.age}岁` : "-"}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col text-sm">
												<span>{deceased.deathDate || "-"}</span>
												<span className="text-xs text-muted-foreground">{deceased.deathTime}</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge 
												variant="outline" 
												className={cn(
													"font-medium",
													deceased.chantPosition ? "bg-blue-50 text-blue-700 border-blue-200" : "text-muted-foreground"
												)}
											>
												<MapPin className="h-3 w-3 mr-1" />
												{positionMap[(deceased.chantPosition || "unknow") as keyof typeof positionMap]}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex flex-col text-sm">
												<span className="font-medium">{deceased.familyContact || "-"}</span>
												<div className="flex items-center text-xs text-muted-foreground">
													<Phone className="h-3 w-3 mr-1" />
													{deceased.familyPhone || "-"}
												</div>
											</div>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => setViewingDeceased(deceased)}
													className="h-8 w-8 text-muted-foreground hover:text-primary"
												>
													<Eye className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleEdit(deceased)}
													className="h-8 w-8 text-muted-foreground hover:text-blue-600"
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleDelete(deceased)}
													className="h-8 w-8 text-muted-foreground hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>

				{deceasedList.length > 0 && (
					<div className="border-t p-4">
						<Pagination
							currentPage={page}
							totalPages={Math.ceil(total / pageSize)}
							pageSize={pageSize}
							totalItems={total}
							onPageChange={(newPage) => setPage(newPage)}
							onPageSizeChange={(newPageSize) => {
								setPageSize(newPageSize);
								setPage(1);
							}}
						/>
					</div>
				)}
			</Card>

			{/* 添加/编辑对话框 */}
			<Dialog
				open={isDialogOpen}
				onClose={handleDialogClose}
				title={editingDeceased ? "编辑往生者" : "登记往生者"}
				maxWidth="xl"
			>
				<DeceasedForm
					deceased={editingDeceased}
					onSubmit={handleFormSubmit}
					onCancel={handleDialogClose}
					isLoading={createMutation.isPending || updateMutation.isPending}
				/>
			</Dialog>

			{/* 详情对话框 */}
			<Dialog
				open={!!viewingDeceased}
				onClose={() => setViewingDeceased(null)}
				title={viewingDeceased ? `往生者档案 - ${viewingDeceased.name}` : "往生者档案"}
				maxWidth="xl"
			>
				{viewingDeceased && (
					<div className="space-y-6">
						{/* 头部基本信息 */}
						<div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
							<Avatar className="h-16 w-16 border-4 border-background shadow-sm">
								<AvatarFallback className={`${getAvatarColor(viewingDeceased.name)} text-white text-xl`}>
									{viewingDeceased.name.slice(0, 1)}
								</AvatarFallback>
							</Avatar>
							<div className="space-y-1">
								<h3 className="text-xl font-bold flex items-center gap-2">
									{viewingDeceased.name}
									<Badge variant="secondary">{genderMap[viewingDeceased.gender as keyof typeof genderMap]}</Badge>
								</h3>
								<div className="text-sm text-muted-foreground flex gap-4">
									<span>{viewingDeceased.age ? `${viewingDeceased.age}岁` : "年龄未知"}</span>
									<span>{viewingDeceased.title || "无称谓"}</span>
								</div>
							</div>
						</div>

						<div className="grid gap-6 md:grid-cols-2">
							{/* 往生信息 */}
							<div className="space-y-3">
								<h4 className="text-sm font-medium text-muted-foreground border-b pb-2">往生信息</h4>
								<div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
									<span className="text-muted-foreground">往生日期</span>
									<span className="font-medium">{viewingDeceased.deathDate} {viewingDeceased.deathTime}</span>
									<span className="text-muted-foreground">往生原因</span>
									<span>{viewingDeceased.causeOfDeath || "-"}</span>
									<span className="text-muted-foreground">宗教信仰</span>
									<span>{viewingDeceased.religion || "-"}</span>
								</div>
							</div>

							{/* 助念安排 */}
							<div className="space-y-3">
								<h4 className="text-sm font-medium text-muted-foreground border-b pb-2">助念安排</h4>
								<div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
									<span className="text-muted-foreground">助念位置</span>
									<span className="font-medium text-primary">
										{positionMap[(viewingDeceased.chantPosition || "unknow") as keyof typeof positionMap]}
									</span>
									<span className="text-muted-foreground">助念编号</span>
									<span>{viewingDeceased.chantNumber || "-"}</span>
								</div>
							</div>

							{/* 家属联系 */}
							<div className="space-y-3">
								<h4 className="text-sm font-medium text-muted-foreground border-b pb-2">家属联系</h4>
								<div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
									<span className="text-muted-foreground">联系人</span>
									<span className="font-medium">{viewingDeceased.familyContact}</span>
									<span className="text-muted-foreground">关系</span>
									<span>{viewingDeceased.familyRelationship || "-"}</span>
									<span className="text-muted-foreground">电话</span>
									<span className="font-mono">{viewingDeceased.familyPhone}</span>
									<span className="text-muted-foreground">地址</span>
									<span>{viewingDeceased.address || "-"}</span>
								</div>
							</div>

							{/* 其他备注 */}
							<div className="space-y-3">
								<h4 className="text-sm font-medium text-muted-foreground border-b pb-2">其他备注</h4>
								<div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
									<span className="text-muted-foreground">特别说明</span>
									<span>{viewingDeceased.specialNotes || "-"}</span>
									<span className="text-muted-foreground">治丧安排</span>
									<span>{viewingDeceased.funeralArrangements || "-"}</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</Dialog>

			{/* 删除确认对话框 */}
			<ConfirmDialog
				open={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false);
					setDeletingDeceased(null);
				}}
				onConfirm={confirmDelete}
				title="删除往生者档案"
				description={
					deletingDeceased
						? `您确定要删除 "${deletingDeceased.name}" 的档案吗？此操作将永久删除该往生者的所有信息及助念记录，且不可恢复。`
						: ""
				}
				variant="destructive"
				items={deletingDeceased ? [deletingDeceased.name] : []}
				isLoading={deleteMutation.isPending}
			/>
		</div>
	);
}
