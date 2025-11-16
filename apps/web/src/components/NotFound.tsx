import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
			<div className="text-center">
				{/* 404 动画图标 */}
				<div className="mb-8">
					<div className="relative inline-block">
						<div className="text-9xl font-bold text-gray-200 select-none">404</div>
						<div className="absolute inset-0 flex items-center justify-center">
							<svg
								className="w-32 h-32 text-blue-500 animate-bounce"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* 错误信息 */}
				<h1 className="text-4xl font-bold text-gray-800 mb-4">页面未找到</h1>
				<p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
					抱歉，您访问的页面不存在或已被移除。
					<br />
					请检查 URL 是否正确，或返回首页。
				</p>

				{/* 操作按钮 */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<Link to="/">
						<Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200">
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
								/>
							</svg>
							返回首页
						</Button>
					</Link>

					<Button
						variant="outline"
						onClick={() => window.history.back()}
						className="px-8 py-2.5"
					>
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						返回上一页
					</Button>
				</div>

				{/* 快捷链接 */}
				<div className="mt-12 pt-8 border-t border-gray-200">
					<p className="text-sm text-gray-500 mb-4">您可能想访问：</p>
					<div className="flex flex-wrap gap-4 justify-center">
						<Link
							to="/volunteers"
							className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
						>
							义工管理
						</Link>
						<Link
							to="/checkin"
							className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
						>
							考勤管理
						</Link>
						<Link
							to="/login"
							className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
						>
							登录
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
