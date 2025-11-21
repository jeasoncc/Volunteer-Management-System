import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import type { ChantingSchedule } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Users, Bell, BookOpen, UserPlus } from "lucide-react";
import { volunteerService } from "@/services/volunteer";
import { deceasedService } from "@/services/deceased";

interface ChantingScheduleFormProps {
	schedule?: ChantingSchedule;
	onSubmit: (data: Partial<ChantingSchedule>) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

export function ChantingScheduleForm({
	schedule,
	onSubmit,
	onCancel,
	isLoading = false,
}: ChantingScheduleFormProps) {
	// 获取义工列表用于选择
	const { data: volunteersData } = useQuery({
		queryKey: ["volunteers", "all"],
		queryFn: () => volunteerService.getList({ page: 1, pageSize: 100 }),
	});

	// 获取往生者列表用于选择
	const { data: deceasedData } = useQuery({
		queryKey: ["deceased", "all"],
		queryFn: () => deceasedService.getList({ page: 1, pageSize: 100 }),
	});

	const volunteers = Array.isArray(volunteersData?.data) ? volunteersData.data : [];
	const deceasedList = Array.isArray(deceasedData?.data) ? deceasedData.data : [];

	const form = useForm({
		defaultValues: {
			location: schedule?.location || "fuhuiyuan",
			date: schedule?.date || "",
			timeSlot: schedule?.timeSlot || "",
			bellVolunteerId: schedule?.bellVolunteerId || undefined,
			teachingVolunteerId: schedule?.teachingVolunteerId || undefined,
			backupVolunteerId: schedule?.backupVolunteerId || undefined,
			deceasedId: schedule?.deceasedId || undefined,
			status: schedule?.status || "pending",
			expectedParticipants: schedule?.expectedParticipants || undefined,
			specialRequirements: schedule?.specialRequirements || "",
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			<div className="max-h-[75vh] overflow-y-auto px-1 space-y-6">
				{/* 基本信息 */}
				<Card className="border-l-4 border-l-primary">
					<CardHeader className="pb-4 bg-muted/30">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-primary/10 rounded-lg">
								<Calendar className="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg">排班信息</CardTitle>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-muted-foreground" />
									地点 <span className="text-red-500">*</span>
								</Label>
								<form.Field name="location">
									{(field) => (
										<Select
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value as any)}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="fuhuiyuan">福慧园</SelectItem>
												<SelectItem value="waiqin">外勤</SelectItem>
											</SelectContent>
										</Select>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="date" className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									日期 <span className="text-red-500">*</span>
								</Label>
								<form.Field
									name="date"
									validators={{
										onChange: ({ value }) => {
											if (!value) return "请选择日期";
											return undefined;
										},
									}}
								>
									{(field) => (
										<>
											<Input
												id="date"
												type="date"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												required
												className={
													field.state.meta.errors.length > 0 ? "border-red-500" : ""
												}
											/>
											{field.state.meta.errors.length > 0 && (
												<p className="text-sm text-red-500 flex items-center gap-1">
													<span className="text-xs">⚠</span>
													{field.state.meta.errors[0]}
												</p>
											)}
										</>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="timeSlot" className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									时间段 <span className="text-red-500">*</span>
								</Label>
								<form.Field name="timeSlot">
									{(field) => (
										<Select
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="请选择时间段" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="00:00-02:00">00:00-02:00</SelectItem>
												<SelectItem value="02:00-04:00">02:00-04:00</SelectItem>
												<SelectItem value="04:00-06:00">04:00-06:00</SelectItem>
												<SelectItem value="06:00-08:00">06:00-08:00</SelectItem>
												<SelectItem value="08:00-10:00">08:00-10:00</SelectItem>
												<SelectItem value="10:00-12:00">10:00-12:00</SelectItem>
												<SelectItem value="12:00-14:00">12:00-14:00</SelectItem>
												<SelectItem value="14:00-16:00">14:00-16:00</SelectItem>
												<SelectItem value="16:00-18:00">16:00-18:00</SelectItem>
												<SelectItem value="18:00-20:00">18:00-20:00</SelectItem>
												<SelectItem value="20:00-22:00">20:00-22:00</SelectItem>
												<SelectItem value="22:00-24:00">22:00-24:00</SelectItem>
											</SelectContent>
										</Select>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label>
									状态 <span className="text-red-500">*</span>
								</Label>
								<form.Field name="status">
									{(field) => (
										<Select
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value as any)}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="pending">待确认</SelectItem>
												<SelectItem value="confirmed">已确认</SelectItem>
												<SelectItem value="in_progress">进行中</SelectItem>
												<SelectItem value="completed">已完成</SelectItem>
												<SelectItem value="cancelled">已取消</SelectItem>
											</SelectContent>
										</Select>
									)}
								</form.Field>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label>
									往生者 <span className="text-red-500">*</span>
								</Label>
								<form.Field
									name="deceasedId"
									validators={{
										onChange: ({ value }) => {
											if (!value) return "请选择往生者";
											return undefined;
										},
									}}
								>
									{(field) => (
										<>
											<Select
												value={field.state.value?.toString()}
												onValueChange={(value) =>
													field.handleChange(Number(value))
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="请选择往生者" />
												</SelectTrigger>
												<SelectContent>
													{deceasedList.map((deceased) => (
														<SelectItem
															key={deceased.id}
															value={deceased.id.toString()}
														>
															{deceased.name} - {deceased.title}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{field.state.meta.errors.length > 0 && (
												<p className="text-sm text-red-500 flex items-center gap-1">
													<span className="text-xs">⚠</span>
													{field.state.meta.errors[0]}
												</p>
											)}
										</>
									)}
								</form.Field>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 义工分配 */}
				<Card className="border-l-4 border-l-blue-500">
					<CardHeader className="pb-4 bg-blue-50/50 dark:bg-blue-950/20">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-blue-500/10 rounded-lg">
								<Users className="h-5 w-5 text-blue-500" />
							</div>
							<div>
								<CardTitle className="text-lg">义工分配</CardTitle>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label className="flex items-center gap-2">
									<Bell className="h-4 w-4 text-muted-foreground" />
									敲钟义工
								</Label>
								<form.Field name="bellVolunteerId">
									{(field) => (
										<Select
											value={field.state.value?.toString() || "none"}
											onValueChange={(value) =>
												field.handleChange(
													value === "none" ? undefined : Number(value),
												)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="请选择义工" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">未分配</SelectItem>
												{volunteers.map((volunteer) => (
													<SelectItem
														key={volunteer.id}
														value={volunteer.id.toString()}
													>
														{volunteer.name} ({volunteer.lotusId})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label className="flex items-center gap-2">
									<BookOpen className="h-4 w-4 text-muted-foreground" />
									领诵义工
								</Label>
								<form.Field name="teachingVolunteerId">
									{(field) => (
										<Select
											value={field.state.value?.toString() || "none"}
											onValueChange={(value) =>
												field.handleChange(
													value === "none" ? undefined : Number(value),
												)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="请选择义工" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">未分配</SelectItem>
												{volunteers.map((volunteer) => (
													<SelectItem
														key={volunteer.id}
														value={volunteer.id.toString()}
													>
														{volunteer.name} ({volunteer.lotusId})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label className="flex items-center gap-2">
									<UserPlus className="h-4 w-4 text-muted-foreground" />
									备用义工
								</Label>
								<form.Field name="backupVolunteerId">
									{(field) => (
										<Select
											value={field.state.value?.toString() || "none"}
											onValueChange={(value) =>
												field.handleChange(
													value === "none" ? undefined : Number(value),
												)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="请选择义工" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">未分配</SelectItem>
												{volunteers.map((volunteer) => (
													<SelectItem
														key={volunteer.id}
														value={volunteer.id.toString()}
													>
														{volunteer.name} ({volunteer.lotusId})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="expectedParticipants">预期参与人数</Label>
								<form.Field name="expectedParticipants">
									{(field) => (
										<Input
											id="expectedParticipants"
											type="number"
											value={field.state.value || ""}
											onChange={(e) =>
												field.handleChange(
													e.target.value ? Number(e.target.value) : undefined,
												)
											}
											placeholder="预期参与人数"
										/>
									)}
								</form.Field>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 其他信息 */}
				<Card className="border-l-4 border-l-orange-500">
					<CardHeader className="pb-4 bg-orange-50/50 dark:bg-orange-950/20">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-orange-500/10 rounded-lg">
								<svg
									className="h-5 w-5 text-orange-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</div>
							<div>
								<CardTitle className="text-lg">特殊要求</CardTitle>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="space-y-2">
							<Label htmlFor="specialRequirements">特殊要求</Label>
							<form.Field name="specialRequirements">
								{(field) => (
									<Textarea
										id="specialRequirements"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="请输入特殊要求..."
										className="min-h-[100px]"
									/>
								)}
							</form.Field>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* 按钮 */}
			<Separator />
			<div className="flex justify-end gap-3 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isLoading}
					className="min-w-[100px]"
				>
					取消
				</Button>
				<Button type="submit" disabled={isLoading} className="min-w-[100px]">
					{isLoading ? "处理中..." : schedule ? "保存更新" : "创建排班"}
				</Button>
			</div>
		</form>
	);
}
