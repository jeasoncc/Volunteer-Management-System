import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Image as ImageIcon, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import { getApiEndpoint } from "@/config/network";

export const Route = createFileRoute("/mobile-upload")({
	component: MobileUploadPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			token: (search.token as string) || "",
		};
	},
});

function MobileUploadPage() {
	const { token } = Route.useSearch();
	const [preview, setPreview] = useState<string>();
	const [uploading, setUploading] = useState(false);
	const [uploaded, setUploaded] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const cameraInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!token) {
			toast.error("无效的上传链接");
		}
	}, [token]);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// 验证文件
		if (!file.type.startsWith("image/")) {
			toast.error("请选择图片文件");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error("图片大小不能超过 5MB");
			return;
		}

		// 创建预览
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreview(reader.result as string);
		};
		reader.readAsDataURL(file);

		// 上传
		await uploadFile(file);
	};

	const uploadFile = async (file: File) => {
		try {
			setUploading(true);

			const formData = new FormData();
			formData.append("file", file);
			formData.append("token", token);

			// 使用全局配置的API地址
			const apiUrl = getApiEndpoint('/api/upload/mobile', true);

			const response = await fetch(apiUrl, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "上传失败");
			}

			setUploaded(true);
			toast.success("上传成功！");
		} catch (error: any) {
			console.error("上传失败:", error);
			toast.error(error.message || "上传失败，请重试");
			setPreview(undefined);
		} finally {
			setUploading(false);
		}
	};

	if (!token) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="text-center space-y-4">
							<AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
							<h2 className="text-xl font-bold">无效的上传链接</h2>
							<p className="text-muted-foreground">
								请重新扫描二维码或检查链接是否正确
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (uploaded) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="text-center space-y-4">
							<CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
							<h2 className="text-xl font-bold">上传成功！</h2>
							<p className="text-muted-foreground">
								照片已成功上传，请返回电脑端查看
							</p>
							{preview && (
								<div className="mt-4">
									<img
										src={preview}
										alt="已上传"
										className="w-full max-w-xs mx-auto rounded-lg border-2 border-green-500"
									/>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center">📸 上传照片</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* 预览 */}
					{preview && (
						<div className="relative">
							<img
								src={preview}
								alt="预览"
								className="w-full rounded-lg border-2 border-dashed"
							/>
							{uploading && (
								<div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
									<div className="text-white text-center">
										<Upload className="h-8 w-8 animate-bounce mx-auto mb-2" />
										<p>上传中...</p>
									</div>
								</div>
							)}
						</div>
					)}

					{/* 上传按钮 */}
					{!preview && (
						<div className="space-y-4">
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleFileSelect}
								className="hidden"
								disabled={uploading}
							/>
							<input
								ref={cameraInputRef}
								type="file"
								accept="image/*"
								capture="environment"
								onChange={handleFileSelect}
								className="hidden"
								disabled={uploading}
							/>

							<Button
								type="button"
								size="lg"
								className="w-full h-20 text-lg"
								onClick={() => cameraInputRef.current?.click()}
								disabled={uploading}
							>
								<Camera className="h-6 w-6 mr-2" />
								拍照上传
							</Button>

							<Button
								type="button"
								variant="outline"
								size="lg"
								className="w-full h-20 text-lg"
								onClick={() => fileInputRef.current?.click()}
								disabled={uploading}
							>
								<ImageIcon className="h-6 w-6 mr-2" />
								从相册选择
							</Button>
						</div>
					)}

					{/* 说明 */}
					<div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg text-sm text-muted-foreground space-y-2">
						<p className="font-medium text-foreground">📝 注意事项：</p>
						<ul className="list-disc list-inside space-y-1 ml-2">
							<li>支持 JPG、PNG、WEBP 格式</li>
							<li>文件大小不超过 5MB</li>
							<li>上传后请返回电脑端查看</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
