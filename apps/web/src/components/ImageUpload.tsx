import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { X, User, Camera, Image as ImageIcon, Smartphone } from "lucide-react";
import { toast } from "@/lib/toast";
import { MobileUploadDialog } from "./MobileUploadDialog";
import { getAvatarUrl } from "@/lib/image";

interface ImageUploadProps {
	value?: string;
	onChange: (url: string) => void;
	onRemove?: () => void;
	disabled?: boolean;
	maxSize?: number; // MB
	accept?: string;
	allowCamera?: boolean; // 是否允许直接拍照
}

export function ImageUpload({
	value,
	onChange,
	onRemove,
	disabled = false,
	maxSize = 5,
	accept = "image/jpeg,image/png,image/jpg,image/webp",
	allowCamera = true,
}: ImageUploadProps) {
	const [uploading, setUploading] = useState(false);
	const [preview, setPreview] = useState<string | undefined>(value);
	const [showMobileDialog, setShowMobileDialog] = useState(false);
	const [uploadToken, setUploadToken] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const cameraInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// 验证文件类型
		if (!file.type.startsWith("image/")) {
			toast.error("请选择图片文件");
			return;
		}

		// 验证文件大小
		if (file.size > maxSize * 1024 * 1024) {
			toast.error(`图片大小不能超过 ${maxSize}MB`);
			return;
		}

		try {
			setUploading(true);

			// 创建预览
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);

			// 上传到服务器
			const { uploadService } = await import("@/services/upload");
			const response = await uploadService.uploadAvatar(file);

			const imageUrl = response.data?.url;

			if (!imageUrl) {
				throw new Error("未获取到图片URL");
			}

			onChange(imageUrl);
			toast.success("上传成功");
		} catch (error: any) {
			console.error("上传失败:", error);
			toast.error(error.message || "上传失败，请重试");
			setPreview(value);
		} finally {
			setUploading(false);
			// 清空 input，允许重新选择同一文件
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleRemove = () => {
		setPreview(undefined);
		if (onRemove) {
			onRemove();
		} else {
			onChange("");
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleCameraClick = () => {
		cameraInputRef.current?.click();
	};

	const handleMobileUpload = async () => {
		try {
			// 生成上传令牌
			const { api } = await import("@/lib/api");
			const data: any = await api.post("/api/upload/token");

			if (!data.data?.token) {
				throw new Error("获取上传令牌失败");
			}

			setUploadToken(data.data.token);
			setShowMobileDialog(true);
		} catch (error: any) {
			console.error("手机上传失败:", error);
			toast.error(error.message || "打开手机上传失败，请确保已登录");
		}
	};

	const handleMobileUploadComplete = (url: string) => {
		setPreview(url);
		onChange(url);
		setShowMobileDialog(false);
		toast.success("照片已接收！");
	};

	return (
		<div className="flex flex-col items-center gap-4">
			{/* 预览区域 */}
			<div className="relative group">
				<Avatar className="h-32 w-32 border-2 border-dashed border-muted-foreground/25">
					{preview ? (
						<AvatarImage src={getAvatarUrl(preview) || preview} alt="预览" className="object-cover" />
					) : (
						<AvatarFallback className="bg-muted">
							<User className="h-16 w-16 text-muted-foreground" />
						</AvatarFallback>
					)}
				</Avatar>

				{/* 悬停时显示的操作按钮 */}
				{preview && !disabled && (
					<div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
						<div className="flex gap-2">
							<Button
								type="button"
								size="sm"
								variant="secondary"
								className="h-8 w-8 p-0 rounded-full"
								onClick={handleClick}
								disabled={uploading}
							>
								<ImageIcon className="h-4 w-4" />
							</Button>
							{allowCamera && (
								<Button
									type="button"
									size="sm"
									variant="secondary"
									className="h-8 w-8 p-0 rounded-full"
									onClick={handleCameraClick}
									disabled={uploading}
								>
									<Camera className="h-4 w-4" />
								</Button>
							)}
							<Button
								type="button"
								size="sm"
								variant="destructive"
								className="h-8 w-8 p-0 rounded-full"
								onClick={handleRemove}
								disabled={uploading}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* 上传按钮 */}
			<div className="flex flex-col items-center gap-3">
				{/* 从相册选择的input */}
				<input
					ref={fileInputRef}
					type="file"
					accept={accept}
					onChange={handleFileSelect}
					className="hidden"
					disabled={disabled || uploading}
				/>

				{/* 拍照的input - 移动端会直接调用相机 */}
				{allowCamera && (
					<input
						ref={cameraInputRef}
						type="file"
						accept="image/*"
						capture="environment"
						onChange={handleFileSelect}
						className="hidden"
						disabled={disabled || uploading}
					/>
				)}

				<div className="flex flex-col gap-2 w-full">
					{!preview && (
						<div className="flex flex-col sm:flex-row gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleClick}
								disabled={disabled || uploading}
								className="min-w-[120px]"
							>
								<ImageIcon className="h-4 w-4 mr-2" />
								{uploading ? "上传中..." : "选择照片"}
							</Button>
							
							{allowCamera && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleCameraClick}
									disabled={disabled || uploading}
									className="min-w-[120px]"
								>
									<Camera className="h-4 w-4 mr-2" />
									拍照上传
								</Button>
							)}
						</div>
					)}
					
					{/* 手机上传按钮 - 始终显示 */}
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={handleMobileUpload}
						disabled={disabled || uploading}
						className="w-full"
					>
						<Smartphone className="h-4 w-4 mr-2" />
						手机扫码上传
					</Button>
				</div>

				<p className="text-xs text-muted-foreground text-center">
					支持 JPG、PNG、WEBP 格式
					<br />
					文件大小不超过 {maxSize}MB
					<br />
					<span className="text-primary">📱 可使用手机扫码上传</span>
				</p>
			</div>

			{/* 手机上传对话框 */}
			<MobileUploadDialog
				open={showMobileDialog}
				onClose={() => setShowMobileDialog(false)}
				onUploadComplete={handleMobileUploadComplete}
				uploadToken={uploadToken}
			/>
		</div>
	);
}
