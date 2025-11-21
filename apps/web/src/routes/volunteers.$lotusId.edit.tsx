import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { volunteerService } from "@/services/volunteer";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VolunteerForm } from "@/components/VolunteerForm";
import { Card, CardContent } from "@/components/ui/card";
import type { Volunteer } from "@/types";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/volunteers/$lotusId/edit")({
	component: VolunteerEditPage,
} as any);

function VolunteerEditPage() {
	const { lotusId } = Route.useParams();
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { data: volunteerData, isLoading } = useQuery({
		queryKey: ["volunteer", lotusId],
		queryFn: () => volunteerService.getByLotusId(lotusId),
		enabled: isAuthenticated,
	});

	const updateMutation = useMutation({
		mutationFn: (data: Partial<Volunteer>) =>
			volunteerService.update(lotusId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["volunteer", lotusId] });
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			toast.success("更新成功！");
			navigate({ to: "/volunteers/$lotusId", params: { lotusId } });
		},
		onError: (error: any) => {
			toast.error(error.message || "更新失败");
		},
	});

	if (authLoading || isLoading) {
		return (
			<DashboardLayout
				breadcrumbs={[
					{ label: "首页", href: "/" },
					{ label: "义工管理", href: "/volunteers" },
					{ label: "编辑" },
				]}
			>
				<div className="flex items-center justify-center h-64">
					<div className="text-muted-foreground">加载中...</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	const volunteer = volunteerData?.data;

	if (!volunteer) {
		return (
			<DashboardLayout
				breadcrumbs={[
					{ label: "首页", href: "/" },
					{ label: "义工管理", href: "/volunteers" },
					{ label: "编辑" },
				]}
			>
				<div className="text-center py-12">
					<p className="text-muted-foreground">义工不存在</p>
				</div>
			</DashboardLayout>
		);
	}

	const handleSubmit = async (data: Partial<Volunteer>) => {
		await updateMutation.mutateAsync(data);
	};

	const handleCancel = () => {
		navigate({ to: "/volunteers/$lotusId", params: { lotusId } });
	};

	return (
		<DashboardLayout
			breadcrumbs={[
				{ label: "首页", href: "/" },
				{ label: "义工管理", href: "/volunteers" },
				{ label: volunteer.name, href: `/volunteers/${lotusId}` },
				{ label: "编辑" },
			]}
		>
			<div className="max-w-4xl mx-auto space-y-6">
				<div>
					<h1 className="text-3xl font-bold">编辑义工信息</h1>
					<p className="mt-2 text-muted-foreground">
						修改 {volunteer.name} 的个人信息
					</p>
				</div>

				<Card>
					<CardContent className="pt-6">
						<VolunteerForm
							volunteer={volunteer}
							onSubmit={handleSubmit}
							onCancel={handleCancel}
							isLoading={updateMutation.isPending}
						/>
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}
