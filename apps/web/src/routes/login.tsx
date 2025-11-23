import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/login-form";
import { LotusLogo } from "@/components/ui/lotus-logo";

export const Route = createFileRoute("/login")({
	component: LoginPage,
} as any);

function LoginPage() {
	return (
		<div className="w-full min-h-svh grid lg:grid-cols-2 overflow-hidden">
			{/* 左侧：视觉展示区 */}
			<div className="hidden lg:flex flex-col relative bg-sidebar text-sidebar-foreground border-r border-border">
				{/* 背景纹理 */}
				<div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/shattered-island.png')] opacity-10 mix-blend-overlay"></div>
				
				{/* 装饰性背景光 - 使用主题色 */}
				<div className="absolute inset-0 bg-gradient-to-b from-sidebar via-sidebar/95 to-sidebar opacity-90"></div>
				<div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>

				{/* 内容容器 */}
				<div className="relative z-10 h-full flex flex-col justify-between p-12">
					<div className="flex justify-start">
						<div className="flex items-center gap-2 text-sidebar-primary-foreground/90">
							<div className="p-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<LotusLogo className="h-8 w-8" />
							</div>
							<span className="text-xl font-serif font-bold tracking-wide">生命关怀</span>
						</div>
					</div>

					<div className="flex flex-row-reverse items-center justify-center flex-1 gap-12">
						{/* 竖排文字 - 添加仙风仙骨的动画效果 */}
						<div className="writing-vertical-rl text-4xl font-serif tracking-[0.5em] font-bold text-sidebar-foreground/90 drop-shadow-lg border-l border-sidebar-foreground/10 pl-8 py-8 animate-float">
							<span className="inline-block animate-glow-pulse">清</span>
							<span className="inline-block animate-glow-pulse animation-delay-100">净</span>
							<span className="inline-block animate-glow-pulse animation-delay-200">庄</span>
							<span className="inline-block animate-glow-pulse animation-delay-300">严</span>
							<span className="inline-block mx-2">•</span>
							<span className="inline-block animate-glow-pulse animation-delay-400">觉</span>
							<span className="inline-block animate-glow-pulse animation-delay-500">悟</span>
							<span className="inline-block animate-glow-pulse animation-delay-600">人</span>
							<span className="inline-block animate-glow-pulse animation-delay-700">生</span>
						</div>
						<div className="writing-vertical-rl text-2xl font-serif tracking-[0.3em] text-sidebar-foreground/60 pt-12 animate-float animation-delay-1000">
							<span className="inline-block animate-shimmer">奉</span>
							<span className="inline-block animate-shimmer animation-delay-200">献</span>
							<span className="inline-block mx-1">•</span>
							<span className="inline-block animate-shimmer animation-delay-400">友</span>
							<span className="inline-block animate-shimmer animation-delay-600">爱</span>
							<span className="inline-block mx-1">•</span>
							<span className="inline-block animate-shimmer animation-delay-800">互</span>
							<span className="inline-block animate-shimmer animation-delay-1000">助</span>
							<span className="inline-block mx-1">•</span>
							<span className="inline-block animate-shimmer animation-delay-1200">进</span>
							<span className="inline-block animate-shimmer animation-delay-1400">步</span>
						</div>
					</div>

					{/* 底部装饰 */}
					<div className="flex items-center gap-4 text-sidebar-foreground/40 text-sm font-serif">
						<div className="h-px w-12 bg-sidebar-foreground/20"></div>
						<span>不忘初心 方得始终</span>
						<div className="h-px flex-1 bg-sidebar-foreground/20"></div>
					</div>
				</div>
			</div>

			{/* 右侧：登录表单区 */}
			<div className="flex items-center justify-center py-12 px-6 sm:px-12 bg-background text-foreground">
				<div className="mx-auto grid w-full max-w-[400px] gap-6">
					<div className="flex flex-col gap-2 text-center sm:text-left mb-4">
						{/* 移动端显示的 Logo */}
						<div className="flex lg:hidden items-center gap-2 self-center sm:self-start mb-2 text-primary">
							<div className="p-2 rounded-lg bg-primary text-primary-foreground">
								<LotusLogo className="h-8 w-8" />
							</div>
							<span className="text-xl font-serif font-bold tracking-wide">生命关怀</span>
						</div>
						
						<h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
							义工管理系统
						</h1>
						<p className="text-balance text-muted-foreground">
							请使用管理员账号登录以继续
						</p>
					</div>
					<LoginForm />
					
					<div className="mt-4 text-center text-xs text-muted-foreground font-serif">
						<p>© 2024 深圳市莲花生命关怀志愿者协会 • 慈悲喜舍 历事炼心</p>
					</div>
				</div>
			</div>
		</div>
	);
}
