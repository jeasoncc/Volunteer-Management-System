import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Users, AlertCircle } from "lucide-react";
import type { Volunteer } from "@/types";

interface VolunteerInput {
	id: string;
	name: string;
	phone: string;
	idNumber: string;
	gender: "male" | "female" | "other";
	email?: string;
	wechat?: string;
	address?: string;
	dharmaName?: string;
	education?: string;
	errors?: {
		name?: string;
		phone?: string;
		idNumber?: string;
	};
}

interface BatchAddVolunteersProps {
	onSubmit: (data: Partial<Volunteer>[]) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

export function BatchAddVolunteers({
	onSubmit,
	onCancel,
	isLoading = false,
}: BatchAddVolunteersProps) {
	const [volunteers, setVolunteers] = useState<VolunteerInput[]>([
		createEmptyVolunteer(),
		createEmptyVolunteer(),
		createEmptyVolunteer(),
	]);

	function createEmptyVolunteer(): VolunteerInput {
		return {
			id: Math.random().toString(36).substring(2, 11),
			name: "",
			phone: "",
			idNumber: "",
			gender: "male",
			email: "",
			wechat: "",
			address: "",
			dharmaName: "",
			education: "",
		};
	}

	const addVolunteer = () => {
		setVolunteers([...volunteers, createEmptyVolunteer()]);
	};

	const removeVolunteer = (id: string) => {
		if (volunteers.length <= 1) return;
		setVolunteers(volunteers.filter((v) => v.id !== id));
	};

	const updateVolunteer = (id: string, field: keyof VolunteerInput, value: any) => {
		setVolunteers(
			volunteers.map((v) => {
				if (v.id === id) {
					const updated = { ...v, [field]: value };
					// 清除该字段的错误
					if (updated.errors) {
						delete updated.errors[field as keyof typeof updated.errors];
					}
					return updated;
				}
				return v;
			})
		);
	};

	const validateVolunteer = (volunteer: VolunteerInput): boolean => {
		const errors: VolunteerInput["errors"] = {};

		if (!volunteer.name || volunteer.name.trim().length === 0) {
			errors.name = "请输入姓名";
		} else if (volunteer.name.length < 2 || volunteer.name.length > 20) {
			errors.name = "姓名长度应为2-20个字符";
		}

		if (!volunteer.phone || volunteer.phone.trim().length === 0) {
			errors.phone = "请输入手机号";
		} else {
			const phoneRegex = /^1[3-9]\d{9}$/;
			if (!phoneRegex.test(volunteer.phone)) {
				errors.phone = "请输入有效的手机号";
			}
		}

		if (!volunteer.idNumber || volunteer.idNumber.trim().length === 0) {
			errors.idNumber = "请输入身份证号";
		} else {
			const idRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
			if (!idRegex.test(volunteer.idNumber)) {
				errors.idNumber = "请输入有效的身份证号";
			}
		}

		if (Object.keys(errors).length > 0) {
			setVolunteers(
				volunteers.map((v) => (v.id === volunteer.id ? { ...v, errors } : v))
			);
			return false;
		}

		return true;
	};

	const handleSubmit = async () => {
		// 验证所有义工
		let hasErrors = false;
		for (const volunteer of volunteers) {
			if (!validateVolunteer(volunteer)) {
				hasErrors = true;
			}
		}

		if (hasErrors) {
			return;
		}

		// 转换为提交格式
		const data = volunteers.map((v) => ({
			name: v.name,
			phone: v.phone,
			idNumber: v.idNumber,
			gender: v.gender,
			email: v.email || undefined,
			wechat: v.wechat || undefined,
			address: v.address || undefined,
			dharmaName: v.dharmaName || undefined,
			education: v.education || undefined,
		}));

		await onSubmit(data);
	};

	const filledCount = volunteers.filter(
		(v) => v.name && v.phone && v.idNumber
	).length;

	return (
		<div className="space-y-6">
			{/* 头部信息 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-primary/10 rounded-lg">
						<Users className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h3 className="text-lg font-semibold">批量添加义工</h3>
						<p className="text-sm text-muted-foreground">
							一次添加多个义工，提高录入效率
						</p>
					</div>
				</div>
				<Badge variant="secondary" className="text-base px-3 py-1">
					{filledCount} / {volunteers.length}
				</Badge>
			</div>

			<Separator />

			{/* 义工列表 */}
			<ScrollArea className="h-[60vh] pr-4">
				<div className="space-y-4">
					{volunteers.map((volunteer, index) => (
						<Card
							key={volunteer.id}
							className={`border-l-4 ${
								volunteer.errors && Object.keys(volunteer.errors).length > 0
									? "border-l-red-500"
									: "border-l-primary"
							}`}
						>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Badge variant="outline">#{index + 1}</Badge>
										<CardTitle className="text-base">
											{volunteer.name || `义工 ${index + 1}`}
										</CardTitle>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => removeVolunteer(volunteer.id)}
										disabled={volunteers.length <= 1 || isLoading}
										className="h-8 w-8 p-0"
									>
										<Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
									</Button>
								</div>
								{volunteer.errors && Object.keys(volunteer.errors).length > 0 && (
									<div className="flex items-center gap-2 text-sm text-red-500 mt-2">
										<AlertCircle className="h-4 w-4" />
										<span>请修正错误后再提交</span>
									</div>
								)}
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* 姓名 */}
									<div className="space-y-2">
										<Label>
											姓名 <span className="text-red-500">*</span>
										</Label>
										<Input
											value={volunteer.name}
											onChange={(e) =>
												updateVolunteer(volunteer.id, "name", e.target.value)
											}
											placeholder="请输入姓名"
											className={volunteer.errors?.name ? "border-red-500" : ""}
										/>
										{volunteer.errors?.name && (
											<p className="text-sm text-red-500 flex items-center gap-1">
												<span className="text-xs">⚠</span>
												{volunteer.errors.name}
											</p>
										)}
									</div>

									{/* 手机号 */}
									<div className="space-y-2">
										<Label>
											手机号 <span className="text-red-500">*</span>
										</Label>
										<Input
											value={volunteer.phone}
											onChange={(e) =>
												updateVolunteer(volunteer.id, "phone", e.target.value)
											}
											placeholder="请输入手机号"
											className={volunteer.errors?.phone ? "border-red-500" : ""}
										/>
										{volunteer.errors?.phone && (
											<p className="text-sm text-red-500 flex items-center gap-1">
												<span className="text-xs">⚠</span>
												{volunteer.errors.phone}
											</p>
										)}
									</div>

									{/* 身份证号 */}
									<div className="space-y-2">
										<Label>
											身份证号 <span className="text-red-500">*</span>
										</Label>
										<Input
											value={volunteer.idNumber}
											onChange={(e) =>
												updateVolunteer(volunteer.id, "idNumber", e.target.value)
											}
											placeholder="请输入身份证号"
											className={volunteer.errors?.idNumber ? "border-red-500" : ""}
										/>
										{volunteer.errors?.idNumber && (
											<p className="text-sm text-red-500 flex items-center gap-1">
												<span className="text-xs">⚠</span>
												{volunteer.errors.idNumber}
											</p>
										)}
									</div>

									{/* 性别 */}
									<div className="space-y-2">
										<Label>
											性别 <span className="text-red-500">*</span>
										</Label>
										<Select
											value={volunteer.gender}
											onValueChange={(value) =>
												updateVolunteer(volunteer.id, "gender", value)
											}
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
									</div>

									{/* 邮箱 */}
									<div className="space-y-2">
										<Label>邮箱</Label>
										<Input
											type="email"
											value={volunteer.email}
											onChange={(e) =>
												updateVolunteer(volunteer.id, "email", e.target.value)
											}
											placeholder="请输入邮箱"
										/>
									</div>

									{/* 微信号 */}
									<div className="space-y-2">
										<Label>微信号</Label>
										<Input
											value={volunteer.wechat}
											onChange={(e) =>
												updateVolunteer(volunteer.id, "wechat", e.target.value)
											}
											placeholder="请输入微信号"
										/>
									</div>

									{/* 地址 */}
									<div className="space-y-2 md:col-span-2">
										<Label>地址</Label>
										<Input
											value={volunteer.address}
											onChange={(e) =>
												updateVolunteer(volunteer.id, "address", e.target.value)
											}
											placeholder="请输入地址"
										/>
									</div>

									{/* 法名 */}
									<div className="space-y-2">
										<Label>法名</Label>
										<Input
											value={volunteer.dharmaName}
											onChange={(e) =>
												updateVolunteer(volunteer.id, "dharmaName", e.target.value)
											}
											placeholder="请输入法名"
										/>
									</div>

									{/* 学历 */}
									<div className="space-y-2">
										<Label>学历</Label>
										<Input
											value={volunteer.education}
											onChange={(e) =>
												updateVolunteer(volunteer.id, "education", e.target.value)
											}
											placeholder="请输入学历"
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</ScrollArea>

			{/* 添加更多按钮 */}
			<Button
				type="button"
				variant="outline"
				onClick={addVolunteer}
				disabled={isLoading}
				className="w-full border-dashed"
			>
				<Plus className="h-4 w-4 mr-2" />
				添加更多义工
			</Button>

			<Separator />

			{/* 底部按钮 */}
			<div className="flex justify-between items-center">
				<p className="text-sm text-muted-foreground">
					已填写 <span className="font-semibold text-primary">{filledCount}</span> 个义工信息
				</p>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isLoading}
						className="min-w-[100px]"
					>
						取消
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isLoading || filledCount === 0}
						className="min-w-[100px]"
					>
						{isLoading ? "处理中..." : `批量创建 (${filledCount})`}
					</Button>
				</div>
			</div>
		</div>
	);
}
