import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";

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
	uploadToken,
}: MobileUploadDialogProps) {
	const [copied, setCopied] = useState(false);
	const [checking, setChecking] = useState(false);

	// 生成手机上传链接
	const uploadUrl = `${window.location.origin}/mobile-upload?token=${uploadToken}`;

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
		if (!open) return;

		const checkUploadStatus = async () => {
			try {
				setChecking(true);
				const { api } = await import("@/lib/api");
				const data: any = await api.get(`/api/upload/status/${uploadToken}`);

				if (data.data?.url) {
					onUploadComplete(data.data.url);
					toast.success("照片上传成功！");
					onClose();
				}
			} catch (error) {
				console.error("检查上传状态失败:", error);
			} finally {
				setChecking(false);
			}
		};

		// 每3秒检查一次
		const interval = setInterval(checkUploadStatus, 3000);

		return () => clearInterval(interval);
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
						<div className="p-4 bg-white rounded-lg border-2 border-dashed">
							<QRCodeSVG value={uploadUrl} size={200} level="H" />
						</div>
						<p className="text-sm text-muted-foreground text-center">
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
					</div>

				{/* 关闭按钮 */}
				<Button type="button" variant="outline" onClick={onClose} className="w-full">
					取消
				</Button>
			</div>
		</Dialog>
	);
}
