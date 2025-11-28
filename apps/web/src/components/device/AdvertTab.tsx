import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "@/lib/toast";
import { api } from "@/lib/api";

export function AdvertTab() {
	const [adId, setAdId] = useState("ad1");
	const [duration, setDuration] = useState("3000");
	const [imageUrl, setImageUrl] = useState("");

	const addAdMutation = useMutation({
		mutationFn: (data: { id: string; duration: string; imageUrl: string }) =>
			api.post("/send/addImageAd", data),
		onSuccess: () => {
			toast.success("广告设置成功");
		},
		onError: (error: any) => {
			toast.error(error.message || "设置失败");
		},
	});

	const handleSubmit = () => {
		if (!imageUrl) {
			toast.error("请输入图片地址");
			return;
		}
		addAdMutation.mutate({ id: adId, duration, imageUrl });
	};

	return (
		<div className="space-y-6">
			<Card className="p-6">
				<h3 className="text-lg font-semibold mb-4">设置图片广告</h3>
				<div className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="ad-id">广告ID</Label>
							<Input
								id="ad-id"
								value={adId}
								onChange={(e) => setAdId(e.target.value)}
								placeholder="例如: ad1"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="duration">显示时长（毫秒）</Label>
							<Input
								id="duration"
								type="number"
								value={duration}
								onChange={(e) => setDuration(e.target.value)}
								placeholder="例如: 3000"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="image-url">图片地址</Label>
						<Input
							id="image-url"
							value={imageUrl}
							onChange={(e) => setImageUrl(e.target.value)}
							placeholder="输入图片URL或选择本地图片"
						/>
						<p className="text-xs text-muted-foreground">
							支持HTTP/HTTPS地址，图片将在设备屏幕上显示
						</p>
					</div>

					<Button
						onClick={handleSubmit}
						disabled={addAdMutation.isPending}
						className="w-full"
					>
						{addAdMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						<ImageIcon className="h-4 w-4 mr-2" />
						设置广告
					</Button>
				</div>
			</Card>

			<Card className="p-6 bg-muted/30">
				<h4 className="font-medium mb-2">使用说明</h4>
				<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
					<li>广告ID用于标识不同的广告内容</li>
					<li>显示时长单位为毫秒，3000表示3秒</li>
					<li>图片地址需要设备能够访问</li>
					<li>建议图片尺寸与设备屏幕匹配</li>
				</ul>
			</Card>
		</div>
	);
}
