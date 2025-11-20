import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CareRecordData } from "@/services/document";

interface CareRecordFormProps {
	onSubmit: (data: CareRecordData) => void;
	onCancel: () => void;
	initialData?: Partial<CareRecordData>;
}

export function CareRecordForm({
	onSubmit,
	onCancel,
	initialData,
}: CareRecordFormProps) {
	const [formData, setFormData] = useState<CareRecordData>({
		name: initialData?.name || "",
		gender: initialData?.gender || "男",
		age: initialData?.age || 0,
		education: initialData?.education || "",
		address: initialData?.address || "",
		workplace: initialData?.workplace || "",
		reportDate: initialData?.reportDate || "",
		reportReason: initialData?.reportReason || "",
		hasInsurance: initialData?.hasInsurance || false,
		assistantStartTime: initialData?.assistantStartTime || "",
		assistantDuration: initialData?.assistantDuration || "",
		hasFamily: initialData?.hasFamily || false,
		familyCount: initialData?.familyCount || 0,
		dharmaName: initialData?.dharmaName || "",
		hasTakingRefuge: initialData?.hasTakingRefuge || false,
		hasFivePrecepts: initialData?.hasFivePrecepts || false,
		hasBodhisattvaPrecepts: initialData?.hasBodhisattvaPrecepts || false,
		hasOtherPrecepts: initialData?.hasOtherPrecepts || false,
		deathCondition: initialData?.deathCondition || "安详",
		hasFamily2: initialData?.hasFamily2 || false,
		hasChanting: initialData?.hasChanting || false,
		hasSuffering: initialData?.hasSuffering || false,
		hasMovement: initialData?.hasMovement || false,
		burialTime: initialData?.burialTime || "",
		hasLawyer: initialData?.hasLawyer || false,
		hobbies: initialData?.hobbies || [],
		personality: initialData?.personality || "",
		childrenAttitude: initialData?.childrenAttitude || [],
		goodDeeds: initialData?.goodDeeds || [],
		unfinishedWishes: initialData?.unfinishedWishes || "",
		lifeSummary: initialData?.lifeSummary || "",
		mainFamily: initialData?.mainFamily || {
			name: "",
			phone: "",
			relationship: "女",
		},
		familyAddress: initialData?.familyAddress || "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	const updateField = <K extends keyof CareRecordData>(
		field: K,
		value: CareRecordData[K],
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
			{/* 基本信息 */}
			<Card>
				<CardHeader>
					<CardTitle>基本信息</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">姓名 *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => updateField("name", e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label>性别 *</Label>
							<RadioGroup
								value={formData.gender}
								onValueChange={(value) =>
									updateField("gender", value as "男" | "女")
								}
							>
								<div className="flex gap-4">
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="男" id="male" />
										<Label htmlFor="male">男</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="女" id="female" />
										<Label htmlFor="female">女</Label>
									</div>
								</div>
							</RadioGroup>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="age">年龄 *</Label>
							<Input
								id="age"
								type="number"
								value={formData.age}
								onChange={(e) => updateField("age", Number(e.target.value))}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="education">学历</Label>
							<Input
								id="education"
								value={formData.education}
								onChange={(e) => updateField("education", e.target.value)}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="address">籍贯住址 *</Label>
						<Input
							id="address"
							value={formData.address}
							onChange={(e) => updateField("address", e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="workplace">职业/单位</Label>
						<Input
							id="workplace"
							value={formData.workplace}
							onChange={(e) => updateField("workplace", e.target.value)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* 报损信息 */}
			<Card>
				<CardHeader>
					<CardTitle>报损信息</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="reportDate">会损时间 *</Label>
							<Input
								id="reportDate"
								type="datetime-local"
								value={formData.reportDate}
								onChange={(e) => updateField("reportDate", e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="reportReason">会损原因</Label>
							<Input
								id="reportReason"
								value={formData.reportReason}
								onChange={(e) => updateField("reportReason", e.target.value)}
							/>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="hasInsurance"
							checked={formData.hasInsurance}
							onCheckedChange={(checked) =>
								updateField("hasInsurance", checked as boolean)
							}
						/>
						<Label htmlFor="hasInsurance">是否准备心脏起搏器</Label>
					</div>
				</CardContent>
			</Card>

			{/* 助念信息 */}
			<Card>
				<CardHeader>
					<CardTitle>助念信息</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="assistantStartTime">助念开始时间</Label>
							<Input
								id="assistantStartTime"
								type="datetime-local"
								value={formData.assistantStartTime}
								onChange={(e) =>
									updateField("assistantStartTime", e.target.value)
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="assistantDuration">助念时长（小时）</Label>
							<Input
								id="assistantDuration"
								value={formData.assistantDuration}
								onChange={(e) =>
									updateField("assistantDuration", e.target.value)
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="hasFamily"
								checked={formData.hasFamily}
								onCheckedChange={(checked) =>
									updateField("hasFamily", checked as boolean)
								}
							/>
							<Label htmlFor="hasFamily">是否有家属</Label>
						</div>
						<div className="space-y-2">
							<Label htmlFor="familyCount">家属人数</Label>
							<Input
								id="familyCount"
								type="number"
								value={formData.familyCount}
								onChange={(e) =>
									updateField("familyCount", Number(e.target.value))
								}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 法名和受戒 */}
			<Card>
				<CardHeader>
					<CardTitle>法名和受戒</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="dharmaName">法名</Label>
						<Input
							id="dharmaName"
							value={formData.dharmaName}
							onChange={(e) => updateField("dharmaName", e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label>受戒情形</Label>
						<div className="flex flex-wrap gap-4">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="hasTakingRefuge"
									checked={formData.hasTakingRefuge}
									onCheckedChange={(checked) =>
										updateField("hasTakingRefuge", checked as boolean)
									}
								/>
								<Label htmlFor="hasTakingRefuge">皈依</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="hasFivePrecepts"
									checked={formData.hasFivePrecepts}
									onCheckedChange={(checked) =>
										updateField("hasFivePrecepts", checked as boolean)
									}
								/>
								<Label htmlFor="hasFivePrecepts">五戒</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="hasBodhisattvaPrecepts"
									checked={formData.hasBodhisattvaPrecepts}
									onCheckedChange={(checked) =>
										updateField("hasBodhisattvaPrecepts", checked as boolean)
									}
								/>
								<Label htmlFor="hasBodhisattvaPrecepts">菩萨戒</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="hasOtherPrecepts"
									checked={formData.hasOtherPrecepts}
									onCheckedChange={(checked) =>
										updateField("hasOtherPrecepts", checked as boolean)
									}
								/>
								<Label htmlFor="hasOtherPrecepts">其他</Label>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="baptismType">修行情形</Label>
						<Select
							value={formData.baptismType}
							onValueChange={(value) =>
								updateField(
									"baptismType",
									value as CareRecordData["baptismType"],
								)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="选择修行情形" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="修行打坐">修行打坐</SelectItem>
								<SelectItem value="听经">听经</SelectItem>
								<SelectItem value="诵经">诵经</SelectItem>
								<SelectItem value="念佛">念佛</SelectItem>
								<SelectItem value="拜忏">拜忏</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="religion">平生信仰</Label>
						<Select
							value={formData.religion}
							onValueChange={(value) =>
								updateField("religion", value as CareRecordData["religion"])
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="选择宗教信仰" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="佛教教">佛教</SelectItem>
								<SelectItem value="天主教">天主教</SelectItem>
								<SelectItem value="回教">回教</SelectItem>
								<SelectItem value="其它">其它</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* 临终状态 */}
			<Card>
				<CardHeader>
					<CardTitle>临终状态</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label>临终状态 *</Label>
						<RadioGroup
							value={formData.deathCondition}
							onValueChange={(value) =>
								updateField("deathCondition", value as "安详" | "疾苦")
							}
						>
							<div className="flex gap-4">
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="安详" id="peaceful" />
									<Label htmlFor="peaceful">安详</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="疾苦" id="suffering" />
									<Label htmlFor="suffering">疾苦</Label>
								</div>
							</div>
						</RadioGroup>
					</div>

					<div className="flex flex-wrap gap-4">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="hasFamily2"
								checked={formData.hasFamily2}
								onCheckedChange={(checked) =>
									updateField("hasFamily2", checked as boolean)
								}
							/>
							<Label htmlFor="hasFamily2">临终家人是否愿意</Label>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="hasChanting"
								checked={formData.hasChanting}
								onCheckedChange={(checked) =>
									updateField("hasChanting", checked as boolean)
								}
							/>
							<Label htmlFor="hasChanting">亡者临终是否念佛</Label>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="hasSuffering"
								checked={formData.hasSuffering}
								onCheckedChange={(checked) =>
									updateField("hasSuffering", checked as boolean)
								}
							/>
							<Label htmlFor="hasSuffering">时内是否痛苦</Label>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="hasMovement"
								checked={formData.hasMovement}
								onCheckedChange={(checked) =>
									updateField("hasMovement", checked as boolean)
								}
							/>
							<Label htmlFor="hasMovement">助念期间是否移动遗体</Label>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="burialTime">入殓时间</Label>
							<Input
								id="burialTime"
								type="datetime-local"
								value={formData.burialTime}
								onChange={(e) => updateField("burialTime", e.target.value)}
							/>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="hasLawyer"
								checked={formData.hasLawyer}
								onCheckedChange={(checked) =>
									updateField("hasLawyer", checked as boolean)
								}
							/>
							<Label htmlFor="hasLawyer">有否法师居士开示</Label>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 其他信息 */}
			<Card>
				<CardHeader>
					<CardTitle>其他信息</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="personality">个性习性</Label>
						<Input
							id="personality"
							value={formData.personality}
							onChange={(e) => updateField("personality", e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="unfinishedWishes">有何心愿未了</Label>
						<Textarea
							id="unfinishedWishes"
							value={formData.unfinishedWishes}
							onChange={(e) => updateField("unfinishedWishes", e.target.value)}
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="lifeSummary">生平事迹总结</Label>
						<Textarea
							id="lifeSummary"
							value={formData.lifeSummary}
							onChange={(e) => updateField("lifeSummary", e.target.value)}
							rows={4}
						/>
					</div>
				</CardContent>
			</Card>

			{/* 主事家属 */}
			<Card>
				<CardHeader>
					<CardTitle>主事家属</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="mainFamilyName">姓名 *</Label>
							<Input
								id="mainFamilyName"
								value={formData.mainFamily.name}
								onChange={(e) =>
									updateField("mainFamily", {
										...formData.mainFamily,
										name: e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="mainFamilyPhone">电话 *</Label>
							<Input
								id="mainFamilyPhone"
								value={formData.mainFamily.phone}
								onChange={(e) =>
									updateField("mainFamily", {
										...formData.mainFamily,
										phone: e.target.value,
									})
								}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label>与往生者关系 *</Label>
						<RadioGroup
							value={formData.mainFamily.relationship}
							onValueChange={(value) =>
								updateField("mainFamily", {
									...formData.mainFamily,
									relationship: value as CareRecordData["mainFamily"]["relationship"],
								})
							}
						>
							<div className="flex gap-4">
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="夫" id="husband" />
									<Label htmlFor="husband">夫</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="妻" id="wife" />
									<Label htmlFor="wife">妻</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="儿" id="son" />
									<Label htmlFor="son">儿</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="女" id="daughter" />
									<Label htmlFor="daughter">女</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="其它" id="other" />
									<Label htmlFor="other">其它</Label>
								</div>
							</div>
						</RadioGroup>
					</div>

					<div className="space-y-2">
						<Label htmlFor="familyAddress">家属现住址 *</Label>
						<Input
							id="familyAddress"
							value={formData.familyAddress}
							onChange={(e) => updateField("familyAddress", e.target.value)}
							required
						/>
					</div>
				</CardContent>
			</Card>

			{/* 操作按钮 */}
			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel}>
					取消
				</Button>
				<Button type="submit">生成记录表</Button>
			</div>
		</form>
	);
}
