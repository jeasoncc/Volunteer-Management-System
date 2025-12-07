import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";
import { isLocalhost } from "@/config/network";

interface MobileUploadDialogProps {
	open: boolean;
	onClose: () => void;
	onUploadComplete: (url: string) => void;
	uploadToken: string;
}

export function MobileUploadDialog({
	open,
	onClose,
	onUploadComplete,
	uploadToken: initialToken,
}: MobileUploadDialogProps) {
	const [copied, setCopied] = useState(false);
	const [checking, setChecking] = useState(false);
	const [uploadToken, setUploadToken] = useState(initialToken);
	const [uploadUrl, setUploadUrl] = useState<string>(''); // 从后端获取
	const [regenerating, setRegenerating] = useState(false);

	// 初始化时从后端获取完整的上传URL
	useEffect(() => {
		const fetchUploadUrl = async () => {
			try {
				const { api } = await import("@/lib/api");
				const data: any = await api.post("/api/upload/token");
				
				if (data.data?.token && data.data?.uploadUrl) {
					setUploadToken(data.data.token);
					setUploadUrl(data.data.uploadUrl);
					console.log('✅ 获取上传URL:', data.data.uploadUrl);
				}
			} catch (error) {
				console.error('获取上传URL失败:', error);
			}
		};
		
		if (open && !uploadUrl) {
			fetchUploadUrl();
		}
	}, [open, uploadUrl]);

	const isLocal = isLocalhost();

	// 重新生成令牌
	const handleRegenerate = async () => {
		try {
			setRegenerating(true);
			const { api } = await import("@/lib/api");
			const data: any = await api.post("/api/upload/token");

			if (!data.data?.token || !data.data?.uploadUrl) {
				throw new Error("获取上传令牌失败");
			}

			setUploadToken(data.data.token);
			setUploadUrl(data.data.uploadUrl);
			toast.success("二维码已刷新");
		} catch (error: any) {
			console.error("重新生成令牌失败:", error);
			toast.error(error.message || "刷新失败，请重试");
		} finally {
			setRegenerating(false);
		}
	};

	// 复制链接
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(uploadUrl);
			setCopied(true);
			toast.success("链接已复制");
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			toast.error("复制失败");
		}
	};

	// 轮询检查上传状态
	useEffect(() => {
		if (!open || !uploadToken) return;

		// 初始显示等待状态
		setChecking(true);

		const checkUploadStatus = async () => {
			try {
				const { api } = await import("@/lib/api");
				const data: any = await api.get(`/api/upload/status/${uploadToken}`);

				if (data.data?.url) {
					onUploadComplete(data.data.url);
					toast.success("照片上传成功！");
					onClose();
				}
			} catch (error) {
				console.error("检查上传状态失败:", error);
			}
			// 不要在这里设置 checking 状态，避免抖动
		};

		// 每 5 秒检查一次（降低频率）
		const interval = setInterval(checkUploadStatus, 5000);

		return () => {
			clearInterval(interval);
			setChecking(false);
		};
	}, [open, uploadToken, onUploadComplete, onClose]);

	return (
		<Dialog open={open} onClose={onClose} title="手机扫码上传" maxWidth="md">
			<div className="space-y-6">
				<div className="flex items-center gap-2 text-muted-foreground">
					<Smartphone className="h-5 w-5" />
					<span className="text-sm">使用手机扫描二维码上传照片</span>
				</div>

				{/* 二维码 */}
					<div className="flex flex-col items-center gap-4">
						<div className="relative">
							<div className="p-4 bg-white rounded-lg border-2 border-dashed">
								<QRCodeSVG value={uploadUrl} size={200} level="H" />
							</div>
							{/* 刷新按钮 */}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleRegenerate}
								disabled={regenerating}
								className="absolute -bottom-3 left-1/2 -translate-x-1/2 shadow-md"
								title="如果二维码过期，点击刷新"
							>
								<RefreshCw className={`h-4 w-4 mr-1 ${regenerating ? 'animate-spin' : ''}`} />
								{regenerating ? '刷新中...' : '刷新二维码'}
							</Button>
						</div>
						<p className="text-sm text-muted-foreground text-center mt-2">
							使用手机微信或浏览器扫描二维码
							<br />
							即可打开上传页面
						</p>
					</div>

					{/* 或者复制链接 */}
					<div className="space-y-2">
						<p className="text-sm font-medium">或复制链接发送到手机：</p>
						<div className="flex gap-2">
							<input
								type="text"
								value={uploadUrl}
								readOnly
								className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleCopy}
								className="shrink-0"
							>
								{copied ? (
									<>
										<Check className="h-4 w-4 mr-1" />
										已复制
									</>
								) : (
									<>
										<Copy className="h-4 w-4 mr-1" />
										复制
									</>
								)}
							</Button>
						</div>
					</div>

					{/* 状态提示 */}
					<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
						{checking && (
							<>
								<RefreshCw className="h-4 w-4 animate-spin" />
								等待手机上传...
							</>
						)}
					</div>

					{/* 说明 */}
					<div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-xs text-muted-foreground space-y-1">
						<p className="font-medium text-foreground">📱 使用说明：</p>
						<ol className="list-decimal list-inside space-y-1 ml-2">
							<li>用手机扫描上方二维码</li>
							<li>在手机上选择或拍摄照片</li>
							<li>上传完成后，电脑端自动接收</li>
						</ol>
						<p className="mt-2 text-orange-600 dark:text-orange-400">
							⚠️ 链接10分钟内有效，请尽快上传
						</p>
						<p className="mt-1 text-blue-600 dark:text-blue-400">
							💡 如果提示"令牌过期"，点击上方"刷新二维码"按钮
						</p>
						{uploadUrl && (
							<p className="mt-2 text-green-600 dark:text-green-400 font-medium">
								✅ 已自动使用局域网IP
								<br />
								请确保手机和电脑在同一WiFi网络
							</p>
						)}
					</div>

				{/* 关闭按钮 */}
				<Button type="button" variant="outline" onClick={onClose} className="w-full">
					取消
				</Button>
			</div>
		</Dialog>
	);
}
