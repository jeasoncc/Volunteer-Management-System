import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import { Palette, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeSettings() {
	const { mode, setMode, colorTheme, setColorTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" title="外观设置">
					<Palette className="h-5 w-5" />
					<span className="sr-only">外观设置</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>外观设置</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{/* 模式切换子菜单 */}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<div className="flex items-center">
							<Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
							<span>显示模式</span>
						</div>
						<span className="ml-auto text-xs text-muted-foreground">
							{mode === "system" ? "系统" : mode === "light" ? "浅色" : "深色"}
						</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup value={mode} onValueChange={(val) => setMode(val as any)}>
							<DropdownMenuRadioItem value="light">
								<Sun className="mr-2 h-4 w-4" /> 浅色
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="dark">
								<Moon className="mr-2 h-4 w-4" /> 深色
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="system">
								<Monitor className="mr-2 h-4 w-4" /> 跟随系统
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuSeparator />
				<DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
					主题色调
				</DropdownMenuLabel>

				{/* 颜色切换 */}
				<DropdownMenuRadioGroup value={colorTheme} onValueChange={(val) => setColorTheme(val as any)}>
					<DropdownMenuRadioItem value="theme-lotus" className="cursor-pointer">
						<div className="w-3 h-3 rounded-full bg-pink-800 mr-2 border border-border" />
						莲池海会 (默认)
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="theme-land" className="cursor-pointer">
						<div className="w-3 h-3 rounded-full bg-amber-700 mr-2 border border-border" />
						极乐国土 (金褐)
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="theme-lapis" className="cursor-pointer">
						<div className="w-3 h-3 rounded-full bg-indigo-700 mr-2 border border-border" />
						七宝琉璃 (青蓝)
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
