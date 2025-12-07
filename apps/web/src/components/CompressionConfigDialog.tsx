import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Settings2 } from "lucide-react";
import { deviceService } from "@/services/device";
import { toast } from "@/lib/toast";

interface CompressionConfigDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentConfig: any;
}

// 预设配置
const PRESETS = {
	high: {
		name: "高质量（推荐）",
		description: "不容易失败，适合大部分场景",
		quality: 95,
		maxWidth: 2560,
		example: "2MB → 约 800KB",
	},
	balanced: {
		name: "平衡",
		description: "质量和大小的平衡",
		quality: 90,
		maxWidth: 1920,
		example: "2MB → 约 500KB",
	},
	small: {
		name: "小文件",
		description: "网络较慢时使用",
		quality: 85,
		maxWidth: 1280,
		example: "2MB → 约 300KB",
	},
};

export function CompressionConfigDialog({
	open,
	onOpenChange,
	currentConfig,
}: CompressionConfigDialogProps) {
	const queryClient = useQueryClient();
	const [threshold, setThreshold] = useState(800);
	const [quality, setQuality] = useState(90);
	const [maxWidth, setMaxWidth] = useState(1920);
	const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

	// 初始化配置
	useEffect(() => {
		if (currentConfig) {
			setThreshold(currentConfig.thresholdKB || 800);
			setQuality(currentConfig.quality || 90);
			setMaxWidth(currentConfig.maxWidth || 1920);
		}
	}, [currentConfig]);

	const updateMutation = useMutation({
		mutationFn: (config: any) => deviceService.updateCompressionConfig(config),
		onSuccess: () => {
			toast.success("压缩配置已更新");
			queryClient.invalidateQueries({ queryKey: ["compression", "config"] });
			onOpenChange(false);
		},
		onError: (error: any) => {
			toast.error(error.message || "更新失败");
		},
	});

	const handleSave = () => {
		updateMutation.mutate({
			threshold,
			quality,
			maxWidth,
		});
	};

	const applyPreset = (presetKey: keyof typeof PRESETS) => {
		const preset = PRESETS[presetKey];
		setQuality(preset.quality);
		setMaxWidth(preset.maxWidth);
		setSelectedPreset(presetKey);
	};



	return (
		<Dialog
			open={open}
			onClose={() => onOpenChange(false)}
			title="压缩配置"
			maxWidth="2xl"
		>
			<div className="space-y-6">
				<p className="text-sm text-muted-foreground">
					选择预设或自定义压缩参数
				</p>

				<div className="space-y-6">
					{/* 快速预设 */}
					<div className="space-y-3">
						<h3 className="text-sm font-medium">快速预设</h3>
						<div className="grid grid-cols-3 gap-3">
							{Object.entries(PRESETS).map(([key, preset]) => (
								<button
									key={key}
									onClick={() => applyPreset(key as keyof typeof PRESETS)}
									className={`p-4 rounded-lg border text-left transition-all ${
										selectedPreset === key
											? "border-primary bg-primary/10"
											: "border-border hover:border-primary/50"
									}`}
								>
									<div className="font-medium text-sm mb-1">{preset.name}</div>
									<div className="text-xs text-muted-foreground mb-2">
										{preset.description}
									</div>
									<div className="text-xs font-mono text-green-600">
										{preset.example}
									</div>
								</button>
							))}
						</div>
					</div>

					{/* 自定义配置 */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium">自定义配置</h3>
						
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="threshold">
									压缩阈值 (KB)
									<span className="text-xs text-muted-foreground ml-2">
										超过此大小才压缩
									</span>
								</Label>
								<Input
									id="threshold"
									type="number"
									min={100}
									max={5000}
									value={threshold}
									onChange={(e) => {
										setThreshold(Number(e.target.value));
										setSelectedPreset(null);
									}}
								/>
								<p className="text-xs text-muted-foreground">
									推荐：800-1200KB
								</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="quality">
										压缩质量 (%)
										<span className="text-xs text-muted-foreground ml-2">
											越高质量越好
										</span>
									</Label>
									<Input
										id="quality"
										type="number"
										min={70}
										max={100}
										value={quality}
										onChange={(e) => {
											setQuality(Number(e.target.value));
											setSelectedPreset(null);
										}}
									/>
									<p className="text-xs text-muted-foreground">
										推荐：85-95
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="maxWidth">
										最大宽度 (px)
										<span className="text-xs text-muted-foreground ml-2">
											超过会缩小
										</span>
									</Label>
									<Input
										id="maxWidth"
										type="number"
										min={1024}
										max={4096}
										value={maxWidth}
										onChange={(e) => {
											setMaxWidth(Number(e.target.value));
											setSelectedPreset(null);
										}}
									/>
									<p className="text-xs text-muted-foreground">
										推荐：1280-2560
									</p>
								</div>
							</div>

							{/* 实时示例 */}
							<div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
								<div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
									压缩效果预览
								</div>
								<div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
									<div className="flex justify-between">
										<span>500KB 照片：</span>
										<span className="font-mono">不压缩（小于阈值）</span>
									</div>
									<div className="flex justify-between">
										<span>1.5MB 照片：</span>
										<span className="font-mono">
											压缩至约 {Math.round(1500 * (quality / 100) * 0.5)}KB
										</span>
									</div>
									<div className="flex justify-between">
										<span>2.5MB 照片：</span>
										<span className="font-mono">
											压缩至约 {Math.round(2500 * (quality / 100) * 0.4)}KB
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-2 pt-4 border-t">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={updateMutation.isPending}
					>
						取消
					</Button>
					<Button
						onClick={handleSave}
						disabled={updateMutation.isPending}
					>
						{updateMutation.isPending && (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						)}
						保存配置
					</Button>
				</div>
			</div>
		</Dialog>
	);
}
