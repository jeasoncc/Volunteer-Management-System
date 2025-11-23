import { useForm } from "@tanstack/react-form";
import type { Deceased } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { User, Phone, MapPin, Calendar, Heart, Users } from "lucide-react";

interface DeceasedFormProps {
	deceased?: Deceased;
	onSubmit: (data: Partial<Deceased>) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

export function DeceasedForm({
	deceased,
	onSubmit,
	onCancel,
	isLoading = false,
}: DeceasedFormProps) {
	const form = useForm({
		defaultValues: {
			name: deceased?.name || "",
			title: deceased?.title || "",
			chantNumber: deceased?.chantNumber || "",
			chantPosition: deceased?.chantPosition || "unknow",
			gender: deceased?.gender || "male",
			deathDate: deceased?.deathDate || "",
			deathTime: deceased?.deathTime || "",
			age: deceased?.age || undefined,
			birthDate: deceased?.birthDate || "",
			religion: deceased?.religion || "",
			isOrdained: deceased?.isOrdained || false,
			address: deceased?.address || "",
			causeOfDeath: deceased?.causeOfDeath || "",
			familyContact: deceased?.familyContact || "",
			familyRelationship: deceased?.familyRelationship || "",
			familyPhone: deceased?.familyPhone || "",
			specialNotes: deceased?.specialNotes || "",
			funeralArrangements: deceased?.funeralArrangements || "",
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
			<div className="px-1 space-y-6">
				{/* 基本信息 */}
				<Card className="border-l-4 border-l-primary">
					<CardHeader className="pb-4 bg-muted/30">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-primary/10 rounded-lg">
								<User className="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg">基本信息</CardTitle>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label htmlFor="name" className="flex items-center gap-2">
									<User className="h-4 w-4 text-muted-foreground" />
									姓名 <span className="text-red-500">*</span>
								</Label>
								<form.Field
									name="name"
									validators={{
										onChange: ({ value }) => {
											if (!value || value.trim().length === 0) {
												return "请输入姓名";
											}
											return undefined;
										},
									}}
								>
									{(field) => (
										<>
											<Input
												id="name"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="请输入姓名"
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
								<Label htmlFor="title">
									称谓 <span className="text-red-500">*</span>
								</Label>
								<form.Field name="title">
									{(field) => (
										<Input
											id="title"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="如：老菩萨、居士等"
											required
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label>
									性别 <span className="text-red-500">*</span>
								</Label>
								<form.Field name="gender">
									{(field) => (
										<Select
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value as any)}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">男</SelectItem>
												<SelectItem value="female">女</SelectItem>
												<SelectItem value="other">其他</SelectItem>
											</SelectContent>
										</Select>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="age">年龄</Label>
								<form.Field name="age">
									{(field) => (
										<Input
											id="age"
											type="number"
											value={field.state.value || ""}
											onChange={(e) =>
												field.handleChange(
													e.target.value ? Number(e.target.value) : undefined,
												)
											}
											placeholder="请输入年龄"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="birthDate">
									<Calendar className="h-4 w-4 inline mr-1" />
									出生日期
								</Label>
								<form.Field name="birthDate">
									{(field) => (
										<DatePicker
											value={field.state.value}
											onChange={(date) => {
												field.handleChange(date ? format(date, "yyyy-MM-dd") : "");
											}}
											placeholder="选择出生日期"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="deathDate">
									往生日期 <span className="text-red-500">*</span>
								</Label>
								<form.Field name="deathDate">
									{(field) => (
										<DatePicker
											value={field.state.value}
											onChange={(date) => {
												field.handleChange(date ? format(date, "yyyy-MM-dd") : "");
											}}
											placeholder="选择往生日期"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="deathTime">往生时间</Label>
								<form.Field name="deathTime">
									{(field) => (
										<Input
											id="deathTime"
											type="time"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="chantNumber">助念编号</Label>
								<form.Field name="chantNumber">
									{(field) => (
										<Input
											id="chantNumber"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="助念编号"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label>助念位置</Label>
								<form.Field name="chantPosition">
									{(field) => (
										<Select
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value as any)}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="room-one">一号房</SelectItem>
												<SelectItem value="room-two">二号房</SelectItem>
												<SelectItem value="room-three">三号房</SelectItem>
												<SelectItem value="room-four">四号房</SelectItem>
												<SelectItem value="unknow">未知</SelectItem>
											</SelectContent>
										</Select>
									)}
								</form.Field>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 宗教信息 */}
				<Card className="border-l-4 border-l-blue-500">
					<CardHeader className="pb-4 bg-blue-50/50 dark:bg-blue-950/20">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-blue-500/10 rounded-lg">
								<Heart className="h-5 w-5 text-blue-500" />
							</div>
							<div>
								<CardTitle className="text-lg">宗教信息</CardTitle>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label htmlFor="religion">宗教信仰</Label>
								<form.Field name="religion">
									{(field) => (
										<Input
											id="religion"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="如：佛教、基督教等"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label>是否出家</Label>
								<form.Field name="isOrdained">
									{(field) => (
										<Select
											value={field.state.value ? "true" : "false"}
											onValueChange={(value) =>
												field.handleChange(value === "true")
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="false">否</SelectItem>
												<SelectItem value="true">是</SelectItem>
											</SelectContent>
										</Select>
									)}
								</form.Field>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="causeOfDeath">往生原因</Label>
								<form.Field name="causeOfDeath">
									{(field) => (
										<Textarea
											id="causeOfDeath"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入往生原因"
											className="min-h-[80px]"
										/>
									)}
								</form.Field>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 联系信息 */}
				<Card className="border-l-4 border-l-green-500">
					<CardHeader className="pb-4 bg-green-50/50 dark:bg-green-950/20">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-green-500/10 rounded-lg">
								<Users className="h-5 w-5 text-green-500" />
							</div>
							<div>
								<CardTitle className="text-lg">家属联系信息</CardTitle>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label htmlFor="familyContact">家属联系人</Label>
								<form.Field name="familyContact">
									{(field) => (
										<Input
											id="familyContact"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入联系人姓名"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="familyRelationship">与往生者关系</Label>
								<form.Field name="familyRelationship">
									{(field) => (
										<Input
											id="familyRelationship"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="如：儿子、女儿等"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="familyPhone" className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									联系电话 <span className="text-red-500">*</span>
								</Label>
								<form.Field name="familyPhone">
									{(field) => (
										<Input
											id="familyPhone"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入联系电话"
											required
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="address" className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-muted-foreground" />
									地址 <span className="text-red-500">*</span>
								</Label>
								<form.Field name="address">
									{(field) => (
										<Textarea
											id="address"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入地址"
											required
											className="min-h-[60px]"
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
								<CardTitle className="text-lg">其他信息</CardTitle>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="specialNotes">特殊备注</Label>
								<form.Field name="specialNotes">
									{(field) => (
										<Textarea
											id="specialNotes"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入特殊备注"
											className="min-h-[80px]"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="funeralArrangements">丧葬安排</Label>
								<form.Field name="funeralArrangements">
									{(field) => (
										<Textarea
											id="funeralArrangements"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入丧葬安排"
											className="min-h-[80px]"
										/>
									)}
								</form.Field>
							</div>
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
					{isLoading ? "处理中..." : deceased ? "保存更新" : "创建往生者"}
				</Button>
			</div>
		</form>
	);
}
