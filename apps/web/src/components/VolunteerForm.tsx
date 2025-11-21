import { useForm } from "@tanstack/react-form";
import type { Volunteer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ImageUpload";
import { User, Phone, Mail, MapPin, GraduationCap, Heart, CreditCard, Users } from "lucide-react";

interface VolunteerFormProps {
	volunteer?: Volunteer;
	onSubmit: (data: Partial<Volunteer>) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

export function VolunteerForm({
	volunteer,
	onSubmit,
	onCancel,
	isLoading = false,
}: VolunteerFormProps) {
	const form = useForm({
		defaultValues: {
			name: volunteer?.name || "",
			phone: volunteer?.phone || "",
			idNumber: volunteer?.idNumber || "",
			gender: volunteer?.gender || "male",
			email: volunteer?.email || "",
			wechat: volunteer?.wechat || "",
			address: volunteer?.address || "",
			dharmaName: volunteer?.dharmaName || "",
			education: volunteer?.education || "",
			joinReason: volunteer?.joinReason || "",
			avatar: volunteer?.avatar || "",
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
				{/* 照片上传 */}
				<Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
					<CardContent className="flex justify-center pt-6">
						<form.Field name="avatar">
							{(field) => (
								<ImageUpload
									value={field.state.value}
									onChange={(url) => field.handleChange(url)}
									onRemove={() => field.handleChange("")}
									disabled={isLoading}
								/>
							)}
						</form.Field>
					</CardContent>
				</Card>

				{/* 基本信息 */}
				<Card className="border-l-4 border-l-primary">
					<CardHeader className="pb-4 bg-muted/30">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-primary/10 rounded-lg">
								<User className="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg">基本信息</CardTitle>
								<CardDescription className="text-xs">必填项标有 * 号</CardDescription>
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
											if (value.length < 2 || value.length > 20) {
												return "姓名长度应为2-20个字符";
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
													field.state.meta.errors.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""
												}
											/>
											{field.state.meta.errors.length > 0 && (
												<p className="text-sm text-red-500 mt-1 flex items-center gap-1">
													<span className="text-xs">⚠</span>
													{field.state.meta.errors[0]}
												</p>
											)}
										</>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone" className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									手机号 <span className="text-red-500">*</span>
								</Label>
								<form.Field
									name="phone"
									validators={{
										onChange: ({ value }) => {
											if (!value || value.trim().length === 0) {
												return "请输入手机号";
											}
											const phoneRegex = /^1[3-9]\d{9}$/;
											if (!phoneRegex.test(value)) {
												return "请输入有效的手机号";
											}
											return undefined;
										},
									}}
								>
									{(field) => (
										<>
											<Input
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="请输入手机号"
												required
												className={field.state.meta.errors.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
											/>
											{field.state.meta.errors.length > 0 && (
												<p className="text-sm text-red-500 mt-1 flex items-center gap-1">
													<span className="text-xs">⚠</span>
													{field.state.meta.errors[0]}
												</p>
											)}
										</>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label className="flex items-center gap-2">
									<CreditCard className="h-4 w-4 text-muted-foreground" />
									身份证号 <span className="text-red-500">*</span>
								</Label>
								<form.Field
									name="idNumber"
									validators={{
										onChange: ({ value }) => {
											if (!value || value.trim().length === 0) {
												return "请输入身份证号";
											}
											const idRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
											if (!idRegex.test(value)) {
												return "请输入有效的身份证号";
											}
											return undefined;
										},
									}}
								>
									{(field) => (
										<>
											<Input
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="请输入身份证号"
												required
												className={field.state.meta.errors.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
											/>
											{field.state.meta.errors.length > 0 && (
												<p className="text-sm text-red-500 mt-1 flex items-center gap-1">
													<span className="text-xs">⚠</span>
													{field.state.meta.errors[0]}
												</p>
											)}
										</>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label className="flex items-center gap-2">
									<Users className="h-4 w-4 text-muted-foreground" />
									性别 <span className="text-red-500">*</span>
								</Label>
								<form.Field name="gender">
									{(field) => (
										<Select
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value as any)}
										>
											<SelectTrigger>
												<SelectValue placeholder="请选择性别" />
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
								<Label className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									邮箱
								</Label>
								<form.Field name="email">
									{(field) => (
										<Input
											type="email"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入邮箱"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label className="flex items-center gap-2">
									<svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
										<path d="M8.691 2.188C7.82 2.188 7.12 2.89 7.12 3.758v16.484c0 .868.7 1.569 1.571 1.569h6.618c.868 0 1.569-.7 1.569-1.569V3.758c0-.868-.7-1.57-1.569-1.57H8.691zm.746 1.5h4.126c.414 0 .75.336.75.75s-.336.75-.75.75H9.437c-.414 0-.75-.336-.75-.75s.336-.75.75-.75zm2.063 14.438a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25z"/>
									</svg>
									微信号
								</Label>
								<form.Field name="wechat">
									{(field) => (
										<Input
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入微信号"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-muted-foreground" />
									地址
								</Label>
								<form.Field name="address">
									{(field) => (
										<Input
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入地址"
										/>
									)}
								</form.Field>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 其他信息 */}
				<Card className="border-l-4 border-l-blue-500">
					<CardHeader className="pb-4 bg-blue-50/50 dark:bg-blue-950/20">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-blue-500/10 rounded-lg">
								<Heart className="h-5 w-5 text-blue-500" />
							</div>
							<div>
								<CardTitle className="text-lg">其他信息</CardTitle>
								<CardDescription className="text-xs">选填项</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label className="flex items-center gap-2">
									<Heart className="h-4 w-4 text-muted-foreground" />
									法名
								</Label>
								<form.Field name="dharmaName">
									{(field) => (
										<Input
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入法名"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label className="flex items-center gap-2">
									<GraduationCap className="h-4 w-4 text-muted-foreground" />
									学历
								</Label>
								<form.Field name="education">
									{(field) => (
										<Input
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入学历"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2 md:col-span-2">
								<Label className="flex items-center gap-2">
									<svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
									加入原因
								</Label>
								<form.Field name="joinReason">
									{(field) => (
										<Textarea
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="请输入加入原因..."
											className="min-h-[100px] resize-none"
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
				<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="min-w-[100px]">
					取消
				</Button>
				<Button type="submit" disabled={isLoading} className="min-w-[100px]">
					{isLoading ? "处理中..." : (volunteer ? "保存更新" : "创建义工")}
				</Button>
			</div>
		</form>
	);
}
