import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { VolunteerForm } from "@/components/VolunteerForm";
import { VolunteerDetails } from "@/components/VolunteerDetails";
import { BatchAddVolunteers } from "@/components/BatchAddVolunteers";
import { VolunteerDataTable } from "@/components/VolunteerDataTable";
import { AdvancedFilter, type ActiveFilter } from "@/components/AdvancedFilter";
import { FilterTags } from "@/components/FilterTags";
import { BatchActionBar } from "@/components/BatchActionBar";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { BatchImportDialog } from "@/components/BatchImportDialog";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { useAuth } from "@/hooks/useAuth";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { volunteerService } from "@/services/volunteer";
import { approvalService } from "@/services/approval";
import type { Volunteer } from "@/types";
import { 
	CheckCircle, 
	XCircle, 
	AlertCircle, 
	Trash2, 
	Download, 
	Plus, 
	Users,
	UserPlus,
	FileUp,
	UserCheck,
	Clock
} from "lucide-react";
import { toast } from "@/lib/toast";
import { exportToExcel, formatDateTime, type ExportColumn } from "@/lib/export";

export const Route = createFileRoute("/volunteers")({
	component: VolunteersPage,
} as any);

function VolunteersPage() {
	const { isAuthenticated, isLoading: authLoading, isSuperAdmin } = useAuth();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("all");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isBatchAddDialogOpen, setIsBatchAddDialogOpen] = useState(false);
	const [editingVolunteer, setEditingVolunteer] = useState<
		Volunteer | undefined
	>();
	const [viewingVolunteer, setViewingVolunteer] = useState<Volunteer | undefined>();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);  // 修改为每页10条
	const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
	const [approvalDialog, setApprovalDialog] = useState<{
		open: boolean;
		volunteer?: Volunteer;
		action?: "approve" | "reject";
	}>({ open: false });
	const [approvalNotes, setApprovalNotes] = useState("");
	const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		title: string;
		description: string;
		onConfirm: () => void;
		variant?: "default" | "destructive" | "warning";
		items?: string[];
	}>({
		open: false,
		title: "",
		description: "",
		onConfirm: () => {},
	});
	const [importDialogOpen, setImportDialogOpen] = useState(false);
	const [dateRange, setDateRange] = useState<{
		start: string | null;
		end: string | null;
	}>({ start: null, end: null });
	const [searchKeyword, setSearchKeyword] = useState("");
	const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState("");
	const [isSearching, setIsSearching] = useState(false);

	// 搜索防抖
	useEffect(() => {
		setIsSearching(true);
		const timer = setTimeout(() => {
			setDebouncedSearchKeyword(searchKeyword);
			setIsSearching(false);
			if (searchKeyword !== debouncedSearchKeyword) {
				setPage(1); // 重置到第一页
			}
		}, 300); // 300ms 防抖延迟

		return () => clearTimeout(timer);
	}, [searchKeyword, debouncedSearchKeyword]);

	// 搜索时重置页码
	const handleSearchChange = (value: string) => {
		setSearchKeyword(value);
	};

	// 获取所有义工（前端分页方案：一次性获取全部数据）
	const { data, isLoading } = useQuery({
		queryKey: ["volunteers", "all"],  // 移除 page 和 pageSize 依赖
		queryFn: () => volunteerService.getAll(),  // 使用 getAll 接口
		enabled: isAuthenticated,
	});

	// 获取待审批义工
	const [pendingPage, setPendingPage] = useState(1);
	const [pendingPageSize, setPendingPageSize] = useState(10);  // 修改为每页10条
	const { data: pendingData, isLoading: pendingLoading } = useQuery({
		queryKey: ["approval", "pending", pendingPage, pendingPageSize],
		queryFn: () => approvalService.getPendingList({ page: pendingPage, pageSize: pendingPageSize }),
		enabled: isAuthenticated,
	});

	const createMutation = useMutation({
		mutationFn: volunteerService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setIsDialogOpen(false);
			toast.success("创建成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "创建失败");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			lotusId,
			data,
		}: {
			lotusId: string;
			data: Partial<Volunteer>;
		}) => volunteerService.update(lotusId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setIsDialogOpen(false);
			setEditingVolunteer(undefined);
			toast.success("更新成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "更新失败");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: volunteerService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			toast.success("删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "删除失败");
		},
	});

	const batchDeleteMutation = useMutation({
		mutationFn: volunteerService.batchDelete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setSelectedVolunteers([]);
			toast.success("批量删除成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "批量删除失败");
		},
	});

	const batchImportMutation = useMutation({
		mutationFn: volunteerService.batchImport,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setImportDialogOpen(false);
			toast.success("批量导入成功！");
		},
		onError: (error: any) => {
			toast.error(error.message || "批量导入失败");
		},
	});

	const batchCreateMutation = useMutation({
		mutationFn: async (data: Partial<Volunteer>[]) => {
			// 逐个创建义工
			const results = await Promise.allSettled(
				data.map((volunteer) => volunteerService.create(volunteer as any))
			);
			
			const successful = results.filter((r) => r.status === "fulfilled").length;
			const failed = results.filter((r) => r.status === "rejected").length;
			
			return { successful, failed, total: data.length };
		},
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			setIsBatchAddDialogOpen(false);
			
			if (result.failed === 0) {
				toast.success(`成功创建 ${result.successful} 个义工！`);
			} else {
				toast.warning(`成功创建 ${result.successful} 个，失败 ${result.failed} 个`);
			}
		},
		onError: (error: any) => {
			toast.error(error.message || "批量创建失败");
		},
	});

	// 审批 mutation
	const approveMutation = useMutation({
		mutationFn: ({
			lotusId,
			action,
			notes,
		}: {
			lotusId: string;
			action: "approve" | "reject";
			notes?: string;
		}) => approvalService.approve(lotusId, { action, notes }),
		onSuccess: (_result, variables) => {
			queryClient.invalidateQueries({ queryKey: ["approval", "pending"] });
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			queryClient.invalidateQueries({ queryKey: ["approval", "pending", "count"] });
			setApprovalDialog({ open: false });
			setApprovalNotes("");
			const actionText = variables.action === "approve" ? "通过" : "拒绝";
			toast.success(`审批${actionText}成功！`);
		},
		onError: (error: any) => {
			console.error("审批失败:", error);
			const message =
				error?.response?.data?.message || error?.message || "审批失败";
			toast.error(`审批失败: ${message}`);
		},
	});

	// 批量审批 mutation
	const batchApproveMutation = useMutation({
		mutationFn: ({
			lotusIds,
			action,
			notes,
		}: {
			lotusIds: string[];
			action: "approve" | "reject";
			notes?: string;
		}) => approvalService.batchApprove({ lotusIds, action, notes }),
		onSuccess: (_result, variables) => {
			queryClient.invalidateQueries({ queryKey: ["approval", "pending"] });
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			queryClient.invalidateQueries({ queryKey: ["approval", "pending", "count"] });
			setSelectedVolunteers([]);
			setApprovalNotes("");
			const actionText = variables.action === "approve" ? "通过" : "拒绝";
			const count = variables.lotusIds.length;
			toast.success(`批量审批${actionText}成功！共处理 ${count} 个申请`);
		},
		onError: (error: any) => {
			console.error("批量审批失败:", error);
			const message =
				error?.response?.data?.message || error?.message || "批量审批失败";
			toast.error(`批量审批失败: ${message}`);
		},
	});

	// 准备数据（在条件渲染之前）
	// 前端分页：allVolunteers 包含所有数据
	const allVolunteers = Array.isArray(data?.data) ? data.data : [];
	const pendingVolunteers = Array.isArray(pendingData?.data)
		? pendingData.data
		: [];
	const pendingCount = (pendingData as any)?.total || 0;

	// 筛选配置
	const filterOptions = [
		{
			id: "volunteerStatus",
			label: "状态",
			options: [
				{ value: "registered", label: "已注册" },
				{ value: "trainee", label: "培训中" },
				{ value: "applicant", label: "申请中" },
				{ value: "inactive", label: "未激活" },
				{ value: "suspended", label: "已暂停" },
			],
		},
		{
			id: "lotusRole",
			label: "角色",
			options: [
				{ value: "admin", label: "管理员" },
				{ value: "volunteer", label: "义工" },
			],
		},
		{
			id: "gender",
			label: "性别",
			options: [
				{ value: "male", label: "男" },
				{ value: "female", label: "女" },
				{ value: "other", label: "其他" },
			],
		},
		{
			id: "hasAvatar",
			label: "头像",
			options: [
				{ value: "yes", label: "有头像" },
				{ value: "no", label: "无头像" },
			],
		},
	];

	// 应用筛选（useMemo 必须在条件渲染之前）
	const filteredVolunteers = useMemo((): Volunteer[] => {
		let result: Volunteer[] = allVolunteers;

		// 应用搜索关键词（使用防抖后的值）
		if (debouncedSearchKeyword.trim()) {
			const keyword = debouncedSearchKeyword.toLowerCase().trim();
			result = result.filter((volunteer) => {
				return (
					volunteer.name?.toLowerCase().includes(keyword) ||
					volunteer.lotusId?.toLowerCase().includes(keyword) ||
					volunteer.phone?.toLowerCase().includes(keyword) ||
					volunteer.email?.toLowerCase().includes(keyword)
				);
			});
		}

		// 应用筛选条件
		if (activeFilters.length > 0) {
			result = result.filter((volunteer) => {
				return activeFilters.every((filter) => {
					if (filter.values.length === 0) return true;
					
					// 特殊处理：头像筛选
					if (filter.id === 'hasAvatar') {
						const hasAvatar = volunteer.avatar && volunteer.avatar.trim() !== '';
						return filter.values.some(value => {
							if (value === 'yes') return hasAvatar;
							if (value === 'no') return !hasAvatar;
							return false;
						});
					}
					
					// 普通字段筛选
					const value = volunteer[filter.id as keyof Volunteer];
					return filter.values.includes(String(value));
				});
			});
		}

		// 应用日期范围筛选
		if (dateRange.start || dateRange.end) {
			result = result.filter((volunteer) => {
				if (!volunteer.createdAt) return false;
				const createdDate = new Date(volunteer.createdAt);
				const start = dateRange.start ? new Date(dateRange.start) : null;
				const end = dateRange.end ? new Date(dateRange.end) : null;

				if (start && createdDate < start) return false;
				if (end && createdDate > end) return false;
				return true;
			});
		}

		return result;
	}, [allVolunteers, debouncedSearchKeyword, activeFilters, dateRange]);

	// 前端分页：从筛选后的数据中取当前页
	const paginatedVolunteers = useMemo((): Volunteer[] => {
		const start = (page - 1) * pageSize;
		const end = start + pageSize;
		return filteredVolunteers.slice(start, end);
	}, [filteredVolunteers, page, pageSize]);

	const filteredPendingVolunteers = useMemo((): Volunteer[] => {
		let result: Volunteer[] = pendingVolunteers;

		// 应用搜索关键词（使用防抖后的值）
		if (debouncedSearchKeyword.trim()) {
			const keyword = debouncedSearchKeyword.toLowerCase().trim();
			result = result.filter((volunteer) => {
				return (
					volunteer.name?.toLowerCase().includes(keyword) ||
					volunteer.lotusId?.toLowerCase().includes(keyword) ||
					volunteer.phone?.toLowerCase().includes(keyword) ||
					volunteer.email?.toLowerCase().includes(keyword)
				);
			});
		}

		// 应用筛选条件
		if (activeFilters.length > 0) {
			result = result.filter((volunteer) => {
				return activeFilters.every((filter) => {
					if (filter.values.length === 0) return true;
					
					// 特殊处理：头像筛选
					if (filter.id === 'hasAvatar') {
						const hasAvatar = volunteer.avatar && volunteer.avatar.trim() !== '';
						return filter.values.some(value => {
							if (value === 'yes') return hasAvatar;
							if (value === 'no') return !hasAvatar;
							return false;
						});
					}
					
					// 普通字段筛选
					const value = volunteer[filter.id as keyof Volunteer];
					return filter.values.includes(String(value));
				});
			});
		}

		// 应用日期范围筛选
		if (dateRange.start || dateRange.end) {
			result = result.filter((volunteer) => {
				if (!volunteer.createdAt) return false;
				const createdDate = new Date(volunteer.createdAt);
				const start = dateRange.start ? new Date(dateRange.start) : null;
				const end = dateRange.end ? new Date(dateRange.end) : null;

				if (start && createdDate < start) return false;
				if (end && createdDate > end) return false;
				return true;
			});
		}

		return result;
	}, [pendingVolunteers, debouncedSearchKeyword, activeFilters, dateRange]);

	// 计算统计数据（基于全部数据）
	const stats = useMemo(() => {
		const now = new Date();
		const thisMonth = now.getMonth();
		const thisYear = now.getFullYear();

		const newThisMonth = allVolunteers.filter((v) => {
			if (!v.createdAt) return false;
			const createdDate = new Date(v.createdAt);
			return (
				createdDate.getMonth() === thisMonth &&
				createdDate.getFullYear() === thisYear
			);
		}).length;

		const activeVolunteers = allVolunteers.filter(
			(v) => v.volunteerStatus === "registered",
		).length;

		return {
			totalVolunteers: allVolunteers.length,  // 全部数据的总数
			newThisMonth,  // 基于全部数据计算
			pendingApproval: pendingCount,
			activeVolunteers,  // 基于全部数据计算
		};
	}, [allVolunteers, pendingCount]);

	// 快捷键支持（必须在条件渲染之前）
	useKeyboardShortcuts([
		{
			key: "a",
			ctrl: true,
			callback: () => {
				if (activeTab === "all") {
					// 全选当前页的数据
					setSelectedVolunteers(paginatedVolunteers.map((v: Volunteer) => v.lotusId));
				}
			},
			description: "全选",
		},
		{
			key: "Escape",
			callback: () => {
				if (selectedVolunteers.length > 0) {
					setSelectedVolunteers([]);
				}
			},
			description: "取消选择",
		},
		{
			key: "Delete",
			callback: () => {
				if (selectedVolunteers.length > 0 && activeTab === "all") {
					const selectedNames = filteredVolunteers
						.filter((v) => selectedVolunteers.includes(v.lotusId))
						.map((v) => v.name);

					setConfirmDialog({
						open: true,
						title: "批量删除义工",
						description: `确定要删除选中的 ${selectedVolunteers.length} 个义工吗？此操作不可恢复。`,
						variant: "destructive",
						items: selectedNames,
						onConfirm: () => {
							batchDeleteMutation.mutate(selectedVolunteers);
							setConfirmDialog((prev) => ({ ...prev, open: false }));
						},
					});
				}
			},
			description: "删除选中项",
		},
	]);

	// 条件渲染必须在所有 hooks 之后
	if (authLoading) {
		return (
			<div className="space-y-6">
				{/* Skeleton 加载状态 */}
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

	const handleView = (volunteer: Volunteer) => {
		setViewingVolunteer(volunteer);
	};

	const handleEdit = (volunteer: Volunteer) => {
		setEditingVolunteer(volunteer);
		setIsDialogOpen(true);
	};

	const handleDelete = (volunteer: Volunteer) => {
		setConfirmDialog({
			open: true,
			title: "删除义工",
			description: `确定要删除义工"${volunteer.name}"吗？此操作不可恢复。`,
			variant: "destructive",
			items: [volunteer.name],
			onConfirm: () => {
				deleteMutation.mutate(volunteer.lotusId);
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	const handlePromote = (volunteer: Volunteer, newRole: "admin" | "volunteer") => {
		const roleActions = {
			admin: {
				title: "升为管理员",
				description: `确定要将「${volunteer.name}」升级为管理员吗？该用户将拥有系统管理权限。`,
				variant: "warning" as const,
			},
			volunteer: {
				title: "降为义工",
				description: `确定要将「${volunteer.name}」降级为普通义工吗？该用户将失去管理权限。`,
				variant: "destructive" as const,
			},
		};

		const action = roleActions[newRole];
		
		setConfirmDialog({
			open: true,
			title: action.title,
			description: action.description,
			variant: action.variant,
			items: [volunteer.name],
			onConfirm: () => {
				volunteerService.updateRole(volunteer.lotusId, newRole)
					.then(() => {
						queryClient.invalidateQueries({ queryKey: ["volunteers"] });
						toast.success(`${volunteer.name} 已变更为${newRole === "admin" ? "管理员" : "义工"}`);
					})
					.catch((error: any) => {
						toast.error(error.message || "角色变更失败");
					});
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	const handleAdd = () => {
		setEditingVolunteer(undefined);
		setIsDialogOpen(true);
	};

	const handleFormSubmit = async (data: Partial<Volunteer>) => {
		if (editingVolunteer) {
			await updateMutation.mutateAsync({
				lotusId: editingVolunteer.lotusId,
				data,
			});
		} else {
			await createMutation.mutateAsync(data as any);
		}
	};

	const handleDialogClose = () => {
		setIsDialogOpen(false);
		setEditingVolunteer(undefined);
	};

	const handleBatchDelete = () => {
		if (selectedVolunteers.length === 0) {
			toast.error("请选择要删除的义工");
			return;
		}

		const selectedNames = filteredVolunteers
			.filter((v) => selectedVolunteers.includes(v.lotusId))
			.map((v) => v.name);

		setConfirmDialog({
			open: true,
			title: "批量删除义工",
			description: `确定要删除选中的 ${selectedVolunteers.length} 个义工吗？此操作不可恢复。`,
			variant: "destructive",
			items: selectedNames,
			onConfirm: () => {
				batchDeleteMutation.mutate(selectedVolunteers);
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	const handleSelectionChange = (lotusIds: string[]) => {
		setSelectedVolunteers(lotusIds);
	};

	const handleFilterChange = (filterId: string, values: string[]) => {
		setActiveFilters((prev) => {
			const existing = prev.find((f) => f.id === filterId);
			if (values.length === 0) {
				return prev.filter((f) => f.id !== filterId);
			}

			const filter = filterOptions.find((f) => f.id === filterId);
			if (!filter) return prev;

			const valueLabels = values.map(
				(v) => filter.options.find((o) => o.value === v)?.label || v,
			);

			const newFilter: ActiveFilter = {
				id: filterId,
				label: filter.label,
				values,
				valueLabels,
			};

			if (existing) {
				return prev.map((f) => (f.id === filterId ? newFilter : f));
			}
			return [...prev, newFilter];
		});
	};

	const handleClearAllFilters = () => {
		setActiveFilters([]);
	};

	const handleSelectAll = () => {
		const currentData = activeTab === "all" ? filteredVolunteers : filteredPendingVolunteers;
		setSelectedVolunteers(currentData.map((v) => v.lotusId));
	};

	const handleClearSelection = () => {
		setSelectedVolunteers([]);
	};

	const handleRemoveFilter = (filterId: string) => {
		setActiveFilters((prev) => prev.filter((f) => f.id !== filterId));
	};

	const handleDateRangeChange = (start: string | null, end: string | null) => {
		setDateRange({ start, end });
	};

	const handleBatchImport = async (data: any[]) => {
		await batchImportMutation.mutateAsync(data);
	};

	const handleBatchAdd = () => {
		setIsBatchAddDialogOpen(true);
	};

	const handleBatchCreate = async (data: Partial<Volunteer>[]) => {
		await batchCreateMutation.mutateAsync(data);
	};

	// 审批相关处理函数
	const handleApprove = (volunteer: Volunteer) => {
		setApprovalDialog({
			open: true,
			volunteer,
			action: "approve",
		});
	};

	const handleReject = (volunteer: Volunteer) => {
		setApprovalDialog({
			open: true,
			volunteer,
			action: "reject",
		});
	};

	const handleApprovalSubmit = () => {
		if (!approvalDialog.volunteer || !approvalDialog.action) return;

		approveMutation.mutate({
			lotusId: approvalDialog.volunteer.lotusId,
			action: approvalDialog.action,
			notes: approvalNotes,
		});
	};

	const handleBatchApprove = () => {
		if (selectedVolunteers.length === 0) {
			toast.error("请选择要审批的义工");
			return;
		}

		const selectedNames = filteredPendingVolunteers
			.filter((v) => selectedVolunteers.includes(v.lotusId))
			.map((v) => v.name);

		setConfirmDialog({
			open: true,
			title: "批量通过审批",
			description: `确定要批量通过选中的 ${selectedVolunteers.length} 个义工申请吗？`,
			variant: "default",
			items: selectedNames,
			onConfirm: () => {
				batchApproveMutation.mutate({
					lotusIds: selectedVolunteers,
					action: "approve",
					notes: approvalNotes,
				});
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	const handleBatchReject = () => {
		if (selectedVolunteers.length === 0) {
			toast.error("请选择要审批的义工");
			return;
		}

		const selectedNames = filteredPendingVolunteers
			.filter((v) => selectedVolunteers.includes(v.lotusId))
			.map((v) => v.name);

		setConfirmDialog({
			open: true,
			title: "批量拒绝审批",
			description: `确定要批量拒绝选中的 ${selectedVolunteers.length} 个义工申请吗？`,
			variant: "warning",
			items: selectedNames,
			onConfirm: () => {
				batchApproveMutation.mutate({
					lotusIds: selectedVolunteers,
					action: "reject",
					notes: approvalNotes,
				});
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* 顶部标题与主要操作 */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">义工管理</h1>
					<p className="text-muted-foreground mt-1">
						管理义工档案、审批新申请及记录考勤
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setImportDialogOpen(true)} className="shadow-sm">
						<FileUp className="h-4 w-4 mr-2" />
						导入
					</Button>
					<Button variant="outline" onClick={handleBatchAdd} className="shadow-sm">
						<UserPlus className="h-4 w-4 mr-2" />
						批量
					</Button>
					<Button onClick={handleAdd} className="shadow-sm">
						<Plus className="h-4 w-4 mr-2" />
						添加义工
					</Button>
				</div>
			</div>

			{/* 统计概览 */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow" title="系统中所有义工的总数">
					<CardContent className="p-6 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">义工总数</p>
							<p className="text-3xl font-bold mt-2 text-blue-600">{stats.totalVolunteers}</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
							<Users className="h-6 w-6 text-blue-600" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow" title="本月新注册的义工数量">
					<CardContent className="p-6 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">本月新增</p>
							<p className="text-3xl font-bold mt-2 text-green-600">{stats.newThisMonth}</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
							<UserCheck className="h-6 w-6 text-green-600" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow" title={stats.pendingApproval > 0 ? `有 ${stats.pendingApproval} 个义工申请待审批` : "当前无待审批申请"}>
					<CardContent className="p-6 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">待审批</p>
							<p className="text-3xl font-bold mt-2 text-orange-600">{stats.pendingApproval}</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
							<AlertCircle className="h-6 w-6 text-orange-600" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow" title="状态为已注册的活跃义工数量">
					<CardContent className="p-6 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">活跃义工</p>
							<p className="text-3xl font-bold mt-2 text-purple-600">{stats.activeVolunteers}</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
							<Clock className="h-6 w-6 text-purple-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* 高级筛选 */}
			<div className="space-y-2 bg-muted/20 p-4 rounded-lg border">
				<div className="flex items-center gap-3 flex-wrap">
					<AdvancedFilter
						filters={filterOptions}
						activeFilters={activeFilters}
						onFilterChange={handleFilterChange}
						onClearAll={handleClearAllFilters}
					/>
					<DateRangeFilter
						onApply={handleDateRangeChange}
						label="创建时间"
					/>
				</div>
				<FilterTags
					activeFilters={activeFilters}
					onRemoveFilter={handleRemoveFilter}
					onClearAll={handleClearAllFilters}
				/>
			</div>

			{/* 标签页 */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="bg-muted/50 p-1">
					<TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
						全部义工
						<Badge variant="secondary" className="ml-2">
							{filteredVolunteers.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="pending" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
						<div className="flex items-center gap-2">
							待审批
							{pendingCount > 0 && (
								<Badge variant="destructive" className="h-5 px-1.5">{pendingCount}</Badge>
							)}
						</div>
					</TabsTrigger>
				</TabsList>

				{/* 全部义工标签页 */}
				<TabsContent value="all" className="space-y-4">
					<Card className="shadow-sm border-t-4 border-t-primary/20">
						<div className="p-6">
							<VolunteerDataTable
								data={filteredVolunteers}
								exportData={filteredVolunteers}
								isLoading={isLoading}
								onView={handleView}
								onEdit={handleEdit}
								onDelete={handleDelete}
								onPromote={handlePromote}
								showRoleManagement={isSuperAdmin}
								enableSelection={true}
								onSelectionChange={handleSelectionChange}
								searchValue={searchKeyword}
								onSearchChange={handleSearchChange}
								isSearching={isSearching}
								emptyState={
									<EmptyState
										type="no-data"
										onAction={handleAdd}
										actionLabel="添加第一个义工"
									/>
								}
								noResultsState={
									<EmptyState
										type="no-results"
										onAction={handleClearAllFilters}
									/>
								}
							/>
						</div>
					</Card>

					{/* 批量操作栏 */}
					<BatchActionBar
						selectedCount={selectedVolunteers.length}
						totalCount={filteredVolunteers.length}
						onClearSelection={handleClearSelection}
						onSelectAll={handleSelectAll}
						actions={[
							{
								label: "导出选中 (Excel)",
								icon: <Download className="h-4 w-4 mr-1" />,
								variant: "secondary",
								onClick: () => {
									const selectedData = filteredVolunteers.filter((v) =>
										selectedVolunteers.includes(v.lotusId),
									);
									const columns: ExportColumn[] = [
										{ key: "lotusId", label: "莲花斋ID" },
										{ key: "name", label: "姓名" },
										{
											key: "gender",
											label: "性别",
											format: (v) =>
												v === "male" ? "男" : v === "female" ? "女" : "其他",
										},
										{ key: "phone", label: "手机号" },
										{ key: "email", label: "邮箱" },
										{
											key: "volunteerStatus",
											label: "状态",
											format: (v) => {
												const map: Record<string, string> = {
													registered: "已注册",
													trainee: "培训中",
													applicant: "申请中",
													inactive: "未激活",
													suspended: "已暂停",
												};
												return map[v] || v;
											},
										},
										{
											key: "lotusRole",
											label: "角色",
											format: (v) => (v === "admin" ? "管理员" : "义工"),
										},
										{ key: "createdAt", label: "创建时间", format: formatDateTime },
									];
									exportToExcel({
										filename: "选中义工",
										sheetName: "义工列表",
										columns,
										data: selectedData,
									});
									toast.success(`已导出 ${selectedData.length} 条记录`);
								},
							},
							{
								label: "批量删除",
								icon: <Trash2 className="h-4 w-4 mr-1" />,
								variant: "destructive",
								onClick: handleBatchDelete,
								disabled: batchDeleteMutation.isPending,
							},
						]}
					/>
				</TabsContent>

				{/* 待审批标签页 */}
				<TabsContent value="pending" className="space-y-4">
					<Card className="shadow-sm border-t-4 border-t-orange-500/20">
						<div className="p-6">
							<VolunteerDataTable
								data={filteredPendingVolunteers}
								exportData={filteredPendingVolunteers}
								isLoading={pendingLoading}
								onView={handleView}
								onApprove={handleApprove}
								onReject={handleReject}
								enableSelection={true}
								onSelectionChange={handleSelectionChange}
								showApprovalActions={true}
								searchValue={searchKeyword}
								onSearchChange={handleSearchChange}
								isSearching={isSearching}
								pagination={{
									pageIndex: pendingPage - 1,
									pageSize: pendingPageSize,
									pageCount: Math.ceil(((pendingData as any)?.total || 0) / pendingPageSize),
									total: (pendingData as any)?.total || 0,
									onPageChange: (newPage) => {
										setPendingPage(newPage + 1);
										setSelectedVolunteers([]);
									},
									onPageSizeChange: (newSize) => {
										setPendingPageSize(newSize);
										setPendingPage(1);
										setSelectedVolunteers([]);
									},
								}}
								emptyState={
									<EmptyState
										type="no-data"
										onAction={undefined}
										actionLabel=""
									/>
								}
								noResultsState={
									<EmptyState
										type="no-results"
										onAction={handleClearAllFilters}
									/>
								}
							/>
						</div>
					</Card>

					{/* 批量操作栏 */}
					<BatchActionBar
						selectedCount={selectedVolunteers.length}
						totalCount={filteredPendingVolunteers.length}
						onClearSelection={handleClearSelection}
						onSelectAll={handleSelectAll}
						actions={[
							{
								label: "批量通过",
								icon: <CheckCircle className="h-4 w-4 mr-1" />,
								variant: "default",
								onClick: handleBatchApprove,
								disabled: batchApproveMutation.isPending,
							},
							{
								label: "批量拒绝",
								icon: <XCircle className="h-4 w-4 mr-1" />,
								variant: "destructive",
								onClick: handleBatchReject,
								disabled: batchApproveMutation.isPending,
							},
							{
								label: "导出选中 (Excel)",
								icon: <Download className="h-4 w-4 mr-1" />,
								variant: "secondary",
								onClick: () => {
									const selectedData = filteredPendingVolunteers.filter((v) =>
										selectedVolunteers.includes(v.lotusId),
									);
									const columns: ExportColumn[] = [
										{ key: "lotusId", label: "莲花斋ID" },
										{ key: "name", label: "姓名" },
										{
											key: "gender",
											label: "性别",
											format: (v) =>
												v === "male" ? "男" : v === "female" ? "女" : "其他",
										},
										{ key: "phone", label: "手机号" },
										{ key: "email", label: "邮箱" },
										{ key: "createdAt", label: "申请时间", format: formatDateTime },
									];
									exportToExcel({
										filename: "待审批义工",
										sheetName: "待审批",
										columns,
										data: selectedData,
									});
									toast.success(`已导出 ${selectedData.length} 条记录`);
								},
							},
						]}
					/>
				</TabsContent>
			</Tabs>

			{/* 查看详情对话框 */}
			<Dialog
				open={!!viewingVolunteer}
				onClose={() => setViewingVolunteer(undefined)}
				title="义工档案详情"
				maxWidth="3xl"
			>
				{viewingVolunteer && (
					<div className="space-y-6">
						<VolunteerDetails volunteer={viewingVolunteer} />
						<div className="flex justify-end gap-3 border-t pt-6 mt-2">
							<Button variant="outline" onClick={() => setViewingVolunteer(undefined)} className="min-w-[100px]">
								关闭
							</Button>
							<Button onClick={() => {
								const v = viewingVolunteer;
								setViewingVolunteer(undefined);
								handleEdit(v);
							}} className="min-w-[100px]">
								编辑档案
							</Button>
						</div>
					</div>
				)}
			</Dialog>

			{/* 添加/编辑对话框 */}
			<Dialog
				open={isDialogOpen}
				onClose={handleDialogClose}
				title={editingVolunteer ? "编辑义工" : "添加义工"}
				maxWidth="lg"
			>
				<VolunteerForm
					volunteer={editingVolunteer}
					onSubmit={handleFormSubmit}
					onCancel={handleDialogClose}
				/>
			</Dialog>

			{/* 审批对话框 */}
			<Dialog
				open={approvalDialog.open}
				onClose={() => {
					setApprovalDialog({ open: false });
					setApprovalNotes("");
				}}
				title={
					approvalDialog.action === "approve" ? "审批通过" : "审批拒绝"
				}
				maxWidth="md"
			>
				<div className="space-y-4">
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">
							义工信息：
						</p>
						<div className="bg-muted p-4 rounded-lg space-y-1">
							<p>
								<span className="font-medium">姓名：</span>
								{approvalDialog.volunteer?.name}
							</p>
							<p>
								<span className="font-medium">ID：</span>
								{approvalDialog.volunteer?.lotusId}
							</p>
							<p>
								<span className="font-medium">手机：</span>
								{approvalDialog.volunteer?.phone}
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">备注（可选）</label>
						<Textarea
							value={approvalNotes}
							onChange={(e) => setApprovalNotes(e.target.value)}
							placeholder="请输入审批备注..."
							rows={4}
						/>
					</div>

					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setApprovalDialog({ open: false });
								setApprovalNotes("");
							}}
						>
							取消
						</Button>
						<Button
							variant={
								approvalDialog.action === "approve" ? "default" : "destructive"
							}
							onClick={handleApprovalSubmit}
							disabled={approveMutation.isPending}
						>
							{approveMutation.isPending
								? "处理中..."
								: approvalDialog.action === "approve"
								? "确认通过"
								: "确认拒绝"}
						</Button>
					</div>
				</div>
			</Dialog>

			{/* 确认对话框 */}
			<ConfirmDialog
				open={confirmDialog.open}
				onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
				onConfirm={confirmDialog.onConfirm}
				title={confirmDialog.title}
				description={confirmDialog.description}
				variant={confirmDialog.variant}
				items={confirmDialog.items}
				isLoading={
					deleteMutation.isPending ||
					batchDeleteMutation.isPending ||
					batchApproveMutation.isPending
				}
			/>

			{/* 批量导入对话框 */}
			<BatchImportDialog
				open={importDialogOpen}
				onClose={() => setImportDialogOpen(false)}
				onImport={handleBatchImport}
				isLoading={batchImportMutation.isPending}
			/>

			{/* 批量添加对话框 */}
			<Dialog
				open={isBatchAddDialogOpen}
				onClose={() => setIsBatchAddDialogOpen(false)}
				title="批量添加义工"
				maxWidth="xl"
			>
				<BatchAddVolunteers
					onSubmit={handleBatchCreate}
					onCancel={() => setIsBatchAddDialogOpen(false)}
					isLoading={batchCreateMutation.isPending}
				/>
			</Dialog>
		</div>
	);
}
