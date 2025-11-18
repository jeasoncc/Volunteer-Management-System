import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "./ui/card";

/**
 * 表格骨架屏
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
	return (
		<div className="space-y-3">
			{/* Table header */}
			<div className="flex gap-4">
				<Skeleton className="h-10 flex-1" />
				<Skeleton className="h-10 flex-1" />
				<Skeleton className="h-10 flex-1" />
				<Skeleton className="h-10 w-32" />
			</div>
			
			{/* Table rows */}
			{Array.from({ length: rows }).map((_, i) => (
				<div key={i} className="flex gap-4">
					<Skeleton className="h-12 flex-1" />
					<Skeleton className="h-12 flex-1" />
					<Skeleton className="h-12 flex-1" />
					<Skeleton className="h-12 w-32" />
				</div>
			))}
		</div>
	);
}

/**
 * 卡片骨架屏
 */
export function CardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-1/3" />
				<Skeleton className="h-4 w-2/3 mt-2" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-20 w-full" />
			</CardContent>
		</Card>
	);
}

/**
 * 统计卡片骨架屏
 */
export function StatsCardSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-4 rounded-full" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-8 w-16 mb-2" />
				<Skeleton className="h-3 w-32" />
			</CardContent>
		</Card>
	);
}

/**
 * 表单骨架屏
 */
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{Array.from({ length: fields }).map((_, i) => (
					<div key={i} className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
			</div>
			
			<div className="flex justify-end gap-4">
				<Skeleton className="h-10 w-24" />
				<Skeleton className="h-10 w-24" />
			</div>
		</div>
	);
}

/**
 * 页面骨架屏
 */
export function PageSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-4 w-96" />
			</div>
			
			{/* Stats cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatsCardSkeleton />
				<StatsCardSkeleton />
				<StatsCardSkeleton />
				<StatsCardSkeleton />
			</div>
			
			{/* Main content */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
				</CardHeader>
				<CardContent>
					<TableSkeleton rows={8} />
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * 详情页骨架屏
 */
export function DetailSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<Skeleton className="h-20 w-20 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-64" />
						<div className="flex gap-2">
							<Skeleton className="h-6 w-16" />
							<Skeleton className="h-6 w-16" />
						</div>
					</div>
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-24" />
				</div>
			</div>
			
			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<StatsCardSkeleton />
				<StatsCardSkeleton />
				<StatsCardSkeleton />
			</div>
			
			{/* Detail cards */}
			<div className="grid gap-6 md:grid-cols-2">
				<CardSkeleton />
				<CardSkeleton />
			</div>
		</div>
	);
}

/**
 * 列表骨架屏
 */
export function ListSkeleton({ items = 10 }: { items?: number }) {
	return (
		<div className="space-y-3">
			{Array.from({ length: items }).map((_, i) => (
				<div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
					<div className="flex items-center gap-4 flex-1">
						<Skeleton className="h-12 w-12 rounded-full" />
						<div className="space-y-2 flex-1">
							<Skeleton className="h-5 w-48" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
					<Skeleton className="h-8 w-24" />
				</div>
			))}
		</div>
	);
}
