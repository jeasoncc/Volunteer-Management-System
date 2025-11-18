import { useForm } from "@tanstack/react-form";
import type { Volunteer } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* 基本信息 */}
				<div className="space-y-2">
					<label className="text-sm font-medium">
						姓名 <span className="text-red-500">*</span>
					</label>
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
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="请输入姓名"
									required
									className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-red-500 mt-1">
										{field.state.meta.errors[0]}
									</p>
								)}
							</>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">
						手机号 <span className="text-red-500">*</span>
					</label>
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
									className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-red-500 mt-1">
										{field.state.meta.errors[0]}
									</p>
								)}
							</>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">
						身份证号 <span className="text-red-500">*</span>
					</label>
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
									className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-red-500 mt-1">
										{field.state.meta.errors[0]}
									</p>
								)}
							</>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">
						性别 <span className="text-red-500">*</span>
					</label>
					<form.Field name="gender">
						{(field) => (
							<select
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value as any)}
								className="w-full px-3 py-2 border rounded-md"
								required
							>
								<option value="male">男</option>
								<option value="female">女</option>
								<option value="other">其他</option>
							</select>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">邮箱</label>
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
					<label className="text-sm font-medium">微信号</label>
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
					<label className="text-sm font-medium">地址</label>
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

				{/* 佛教信息 */}
				<div className="space-y-2">
					<label className="text-sm font-medium">法名</label>
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
					<label className="text-sm font-medium">学历</label>
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
					<label className="text-sm font-medium">加入原因</label>
					<form.Field name="joinReason">
						{(field) => (
							<textarea
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="请输入加入原因"
								className="w-full px-3 py-2 border rounded-md min-h-[100px]"
							/>
						)}
					</form.Field>
				</div>
			</div>

			{/* 按钮 */}
			<div className="flex justify-end gap-4">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
					取消
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? "处理中..." : (volunteer ? "更新" : "创建")}
				</Button>
			</div>
		</form>
	);
}
