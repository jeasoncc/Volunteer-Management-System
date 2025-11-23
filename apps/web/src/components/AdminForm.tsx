import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

interface AdminData {
	id?: number;
	lotusId?: string;
	name: string;
	phone: string;
	idNumber?: string;
	gender?: "male" | "female" | "other";
	birthDate?: string;
	email?: string;
	address?: string;
	role: "super" | "admin" | "operator";
	department: string;
	permissions?: string[];
}

interface AdminFormProps {
	admin?: AdminData;
	onSubmit: (data: AdminData) => Promise<void>;
	onCancel: () => void;
}

export function AdminForm({ admin, onSubmit, onCancel }: AdminFormProps) {
	const form = useForm({
		defaultValues: {
			// 基本信息
			name: admin?.name || "",
			phone: admin?.phone || "",
			idNumber: admin?.idNumber || "",
			gender: admin?.gender || "male",
			birthDate: admin?.birthDate || "",
			email: admin?.email || "",
			address: admin?.address || "",
			
			// 管理员信息
			role: admin?.role || "admin",
			department: admin?.department || "",
			permissions: admin?.permissions || [],
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
					<form.Field name="name">
						{(field) => (
							<Input
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="请输入姓名"
								required
							/>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">
						手机号 <span className="text-red-500">*</span>
					</label>
					<form.Field name="phone">
						{(field) => (
							<Input
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="请输入手机号"
								required
							/>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">
						身份证号 <span className="text-red-500">*</span>
					</label>
					<form.Field name="idNumber">
						{(field) => (
							<Input
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="请输入身份证号"
								required
							/>
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
					<label className="text-sm font-medium">出生日期</label>
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

				{/* 管理员信息 */}
				<div className="space-y-2">
					<label className="text-sm font-medium">
						角色 <span className="text-red-500">*</span>
					</label>
					<form.Field name="role">
						{(field) => (
							<select
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value as any)}
								className="w-full px-3 py-2 border rounded-md"
								required
							>
								<option value="admin">管理员</option>
								<option value="operator">操作员</option>
								<option value="super">超级管理员</option>
							</select>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">
						部门 <span className="text-red-500">*</span>
					</label>
					<form.Field name="department">
						{(field) => (
							<Input
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="请输入部门"
								required
							/>
						)}
					</form.Field>
				</div>
			</div>

			{/* 按钮 */}
			<div className="flex justify-end gap-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					取消
				</Button>
				<Button type="submit">{admin ? "更新" : "创建"}</Button>
			</div>
		</form>
	);
}