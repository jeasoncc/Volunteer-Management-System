import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useAppearance } from "./AppearanceProvider";
import { useTheme } from "./ThemeProvider";
import { 
	Type, 
	Square, 
	LayoutGrid, 
	Sparkles, 
	Layers, 
	Zap, 
	Eye,
	RotateCcw,
	Palette,
	Sun,
	Moon,
	Monitor
} from "lucide-react";
import { toast } from "@/lib/toast";

export function AppearanceSettings() {
	const { settings, updateSettings, resetSettings } = useAppearance();
	const { mode, setMode, colorTheme, setColorTheme } = useTheme();

	const handleReset = () => {
		resetSettings();
		toast.success("已重置为默认设置");
	};

	// 主题颜色映射
	const themeColors: Record<string, string> = {
		"theme-lotus": "bg-pink-800",
		"theme-land": "bg-amber-700",
		"theme-lapis": "bg-indigo-700",
		"theme-gold": "bg-yellow-600",
		"theme-red": "bg-red-700",
		"theme-orange": "bg-orange-600",
		"theme-green": "bg-green-700",
		"theme-white": "bg-gray-400",
		"theme-purple": "bg-purple-700",
		"theme-ink": "bg-gray-800",
		"theme-tea": "bg-amber-900",
		"theme-sky": "bg-sky-500",
		"theme-coral": "bg-rose-500",
		"theme-sapphire": "bg-blue-800",
		"theme-ivory": "bg-stone-300",
		"theme-cinnabar": "bg-red-800",
		"theme-amber": "bg-amber-500",
		"theme-jade": "bg-emerald-600",
	};

	const themeNames: Record<string, string> = {
		"theme-lotus": "莲池海会 (默认)",
		"theme-land": "极乐国土 (金褐)",
		"theme-lapis": "七宝琉璃 (青蓝)",
		"theme-gold": "金色庄严 (金)",
		"theme-red": "红莲吉祥 (红)",
		"theme-orange": "橙光慈悲 (橙)",
		"theme-green": "翠竹清心 (绿)",
		"theme-white": "白莲清净 (白)",
		"theme-purple": "紫气东来 (紫)",
		"theme-ink": "禅意墨色 (墨)",
		"theme-tea": "禅茶一味 (茶)",
		"theme-sky": "天青如洗 (天青)",
		"theme-coral": "珊瑚温润 (珊瑚)",
		"theme-sapphire": "智慧深蓝 (深蓝)",
		"theme-ivory": "象牙温雅 (象牙)",
		"theme-cinnabar": "朱砂传统 (朱砂)",
		"theme-amber": "琥珀暖阳 (琥珀)",
		"theme-jade": "翡翠珍贵 (翡翠)",
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Palette className="h-5 w-5" />
						<CardTitle>美化设置</CardTitle>
					</div>
					<Button variant="outline" size="sm" onClick={handleReset}>
						<RotateCcw className="h-4 w-4 mr-2" />
						重置默认
					</Button>
				</div>
				<CardDescription>自定义界面外观和交互体验</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* 主题设置 */}
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Sun className="h-4 w-4" />
						<Label className="text-base font-semibold">主题设置</Label>
					</div>
					
					<div className="space-y-4 pl-6">
						{/* 显示模式 */}
						<div className="space-y-2">
							<Label htmlFor="theme-mode">显示模式</Label>
							<Select
								value={mode}
								onValueChange={(value) => setMode(value as any)}
							>
								<SelectTrigger id="theme-mode">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="light">
										<Sun className="h-4 w-4 mr-2 inline" />
										浅色
									</SelectItem>
									<SelectItem value="dark">
										<Moon className="h-4 w-4 mr-2 inline" />
										深色
									</SelectItem>
									<SelectItem value="system">
										<Monitor className="h-4 w-4 mr-2 inline" />
										跟随系统
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* 主题色调 */}
						<div className="space-y-2">
							<Label htmlFor="color-theme">主题色调</Label>
							<Select
								value={colorTheme}
								onValueChange={(value) => setColorTheme(value as any)}
							>
								<SelectTrigger id="color-theme">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="max-h-[300px]">
									{Object.entries(themeNames).map(([value, name]) => (
										<SelectItem key={value} value={value}>
											<span className="inline-flex items-center gap-2">
												<span className={`w-3 h-3 rounded-full ${themeColors[value]} border border-border inline-block`} />
												{name}
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				<Separator />

				{/* 字体大小 */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Type className="h-4 w-4" />
						<Label htmlFor="font-size" className="text-base font-semibold">字体大小</Label>
					</div>
					<div className="pl-6">
						<Select
							value={settings.fontSize}
							onValueChange={(value) => updateSettings({ fontSize: value as any })}
						>
							<SelectTrigger id="font-size">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="small">小 (14px)</SelectItem>
								<SelectItem value="medium">中 (16px) - 默认</SelectItem>
								<SelectItem value="large">大 (18px)</SelectItem>
								<SelectItem value="xlarge">特大 (20px)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Separator />

				{/* 圆角大小 */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Square className="h-4 w-4" />
						<Label htmlFor="border-radius" className="text-base font-semibold">圆角大小</Label>
					</div>
					<div className="pl-6">
						<Select
							value={settings.borderRadius}
							onValueChange={(value) => updateSettings({ borderRadius: value as any })}
						>
							<SelectTrigger id="border-radius">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">无圆角</SelectItem>
								<SelectItem value="small">小 (2px)</SelectItem>
								<SelectItem value="medium">中 (4px) - 默认</SelectItem>
								<SelectItem value="large">大 (8px)</SelectItem>
								<SelectItem value="xlarge">特大 (12px)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Separator />

				{/* 间距密度 */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<LayoutGrid className="h-4 w-4" />
						<Label htmlFor="spacing-density" className="text-base font-semibold">间距密度</Label>
					</div>
					<div className="pl-6">
						<Select
							value={settings.spacingDensity}
							onValueChange={(value) => updateSettings({ spacingDensity: value as any })}
						>
							<SelectTrigger id="spacing-density">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="compact">紧凑 (75%)</SelectItem>
								<SelectItem value="comfortable">舒适 (100%) - 默认</SelectItem>
								<SelectItem value="spacious">宽松 (125%)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Separator />

				{/* 动画效果 */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Sparkles className="h-4 w-4" />
						<Label htmlFor="animation-level" className="text-base font-semibold">动画效果</Label>
					</div>
					<div className="pl-6">
						<Select
							value={settings.animationLevel}
							onValueChange={(value) => updateSettings({ animationLevel: value as any })}
						>
							<SelectTrigger id="animation-level">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">无动画</SelectItem>
								<SelectItem value="reduced">减少 (50%)</SelectItem>
								<SelectItem value="normal">正常 (100%) - 默认</SelectItem>
								<SelectItem value="enhanced">增强 (150%)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Separator />

				{/* 阴影效果 */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Layers className="h-4 w-4" />
						<Label htmlFor="shadow-level" className="text-base font-semibold">阴影效果</Label>
					</div>
					<div className="pl-6">
						<Select
							value={settings.shadowLevel}
							onValueChange={(value) => updateSettings({ shadowLevel: value as any })}
						>
							<SelectTrigger id="shadow-level">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">无阴影</SelectItem>
								<SelectItem value="subtle">轻微</SelectItem>
								<SelectItem value="normal">正常 - 默认</SelectItem>
								<SelectItem value="elevated">增强</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Separator />

				{/* 过渡速度 */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Zap className="h-4 w-4" />
						<Label htmlFor="transition-speed" className="text-base font-semibold">过渡速度</Label>
					</div>
					<div className="pl-6">
						<Select
							value={settings.transitionSpeed}
							onValueChange={(value) => updateSettings({ transitionSpeed: value as any })}
						>
							<SelectTrigger id="transition-speed">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="fast">快速 (150ms)</SelectItem>
								<SelectItem value="normal">正常 (300ms) - 默认</SelectItem>
								<SelectItem value="slow">缓慢 (500ms)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Separator />

				{/* 其他选项 */}
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Eye className="h-4 w-4" />
						<Label className="text-base font-semibold">其他选项</Label>
					</div>
					<div className="pl-6 space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="compact-mode">紧凑模式</Label>
								<p className="text-sm text-muted-foreground">
									减少界面元素间距，显示更多内容
								</p>
							</div>
							<Switch
								id="compact-mode"
								checked={settings.compactMode}
								onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
							/>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="reduced-motion">减少动画</Label>
								<p className="text-sm text-muted-foreground">
									为有运动敏感的用户减少动画效果（无障碍选项）
								</p>
							</div>
							<Switch
								id="reduced-motion"
								checked={settings.reducedMotion}
								onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

