import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { VolunteerForm } from "@/components/VolunteerForm";
import { useAuth } from "@/hooks/useAuth";
import { volunteerService } from "@/services/volunteer";
import type { Volunteer } from "@/types";

export const Route = createFileRoute("/volunteers/$lotusId/edit")({
	component: VolunteerEditPage,
} as any);

function VolunteerEditPage() {
	const { lotusId } = Route.useParams();
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(true);

	const { data: volunteerData, isLoading } = useQuery({
		queryKey: ["volunteer", lotusId],
		queryFn: () => volunteerService.getByLotusId(lotusId),
		enabled: isAuthenticated,
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
			queryClient.invalidateQueries({ queryKey: ["volunteer", lotusId] });
			queryClient.invalidateQueries({ queryKey: ["volunteers"] });
			alert("更新成功！");
			// Navigate back to detail page
			window.location.hash = `#/volunteers/${lotusId}`;
		},
		onError: (error: any) => {
			alert(error.message || "更新失败");
		},
	});

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

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
					<Link to="/volunteers">
						<Button className="mt-4">返回列表</Button>
					</Link>
				</div>
			</DashboardLayout>
		);
	}

	const handleFormSubmit = async (data: Partial<Volunteer>) => {
		await updateMutation.mutateAsync({
			lotusId: volunteer.lotusId,
			data,
		});
	};

	const handleDialogClose = () => {
		// Navigate back to detail page
		window.location.hash = `#/volunteers/${lotusId}`;
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
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">编辑义工</h1>
				</div>

				{/* 编辑表单 */}
				<div className="bg-card rounded-lg border p-6">
					<VolunteerForm
						volunteer={volunteer}
						onSubmit={handleFormSubmit}
						onCancel={handleDialogClose}
					/>
				</div>
			</div>
		</DashboardLayout>
	);
}