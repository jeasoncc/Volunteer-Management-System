import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Palette, Check } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const themes = [
	{ value: "light", label: "浅色", color: "bg-white", border: "border-gray-200" },
	{ value: "dark", label: "深色", color: "bg-gray-900", border: "border-gray-700" },
	{ value: "blue", label: "海洋蓝", color: "bg-blue-500", border: "border-blue-600" },
	{ value: "green", label: "森林绿", color: "bg-green-500", border: "border-green-600" },
	{ value: "purple", label: "优雅紫", color: "bg-purple-500", border: "border-purple-600" },
	{ value: "orange", label: "活力橙", color: "bg-orange-500", border: "border-orange-600" },
];

export function ThemeSettings() {
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<Palette className="h-5 w-5" />
					<span className="sr-only">主题设置</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuLabel>选择主题</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{themes.map((t) => (
					<DropdownMenuItem
						key={t.value}
						onClick={() => setTheme(t.value as any)}
						className="flex items-center justify-between cursor-pointer"
					>
						<div className="flex items-center gap-2">
							<div
								className={`w-4 h-4 rounded-full border-2 ${t.color} ${t.border}`}
							/>
							<span>{t.label}</span>
						</div>
						{theme === t.value && <Check className="h-4 w-4" />}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
