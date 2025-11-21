import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Upload, X, User, Camera } from "lucide-react";
import { toast } from "@/lib/toast";

interface ImageUploadProps {
	value?: string;
	onChange: (url: string) => void;
	onRemove?: () => void;
	disabled?: boolean;
	maxSize?: number; // MB
	accept?: string;
}

export function ImageUpload({
	value,
	onChange,
	onRemove,
	disabled = false,
	maxSize = 5,
	accept = "image/jpeg,image/png,image/jpg,image/webp",
}: ImageUploadProps) {
	const [uploading, setUploading] = useState(false);
	const [preview, setPreview] = useState<string | undefined>(value);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	return (
		<div className="flex flex-col items-center gap-4">
			{/* 预览区域 */}
			<div className="relative group">
				<Avatar className="h-32 w-32 border-2 border-dashed border-muted-foreground/25">
					{preview ? (
						<AvatarImage src={preview} alt="预览" className="object-cover" />
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
								<Camera className="h-4 w-4" />
							</Button>
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
			<div className="flex flex-col items-center gap-2">
				<input
					ref={fileInputRef}
					type="file"
					accept={accept}
					onChange={handleFileSelect}
					className="hidden"
					disabled={disabled || uploading}
				/>

				{!preview && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleClick}
						disabled={disabled || uploading}
					>
						<Upload className="h-4 w-4 mr-2" />
						{uploading ? "上传中..." : "上传照片"}
					</Button>
				)}

				<p className="text-xs text-muted-foreground text-center">
					支持 JPG、PNG、WEBP 格式
					<br />
					文件大小不超过 {maxSize}MB
				</p>
			</div>
		</div>
	);
}
