import { cn } from "@/lib/utils";
import * as React from "react";

interface LotusLogoProps extends React.ComponentProps<"svg"> {
	className?: string;
}

export function LotusLogo({ className, ...props }: LotusLogoProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 100 100" // 使用更大的视图以便绘制细节
			fill="currentColor" // 使用 fill 而不是 stroke，可以做更实心的图标，或者 fill="none" stroke="..." 做线条
			stroke="none"
			className={cn("h-6 w-6", className)}
			{...props}
		>
			{/* 这是一个更具装饰性的莲花 SVG 路径 */}
			<path d="M50 10c0 0-15 25-15 35 0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15 0-10-15-35-15-35zm0 0c0 0 5 20 5 30 0 2.761-2.239 5-5 5s-5-2.239-5-5c0-10 5-30 5-30z" opacity="0.9" />
			<path d="M32 45c0 0-18-5-18-15 0-5.523 4.477-10 10-10 10 0 25 15 25 15s-5 10-17 10z" opacity="0.7" />
			<path d="M68 45c0 0 18-5 18-15 0-5.523-4.477-10-10-10-10 0-25 15-25 15s5 10 17 10z" opacity="0.7" />
			<path d="M28 55c0 0-20 5-20 15 0 5.523 4.477 10 10 10 15 0 30-15 30-15s-2-10-20-10z" opacity="0.6" />
			<path d="M72 55c0 0 20 5 20 15 0 5.523-4.477 10-10 10-15 0-30-15-30-15s2-10 20-10z" opacity="0.6" />
			<path d="M50 65c-15 0-25 15-25 15h50c0 0-10-15-25-15z" opacity="0.8" />
		</svg>
	);
}
