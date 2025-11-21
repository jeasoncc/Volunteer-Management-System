import type { ReactNode } from "react";
import { usePermission, type Permission } from "@/hooks/usePermission";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface PermissionGuardProps {
	permission: Permission | Permission[];
	requireAll?: boolean;
	fallback?: ReactNode;
	children: ReactNode;
}

export function PermissionGuard({
	permission,
	requireAll = false,
	fallback,
	children,
}: PermissionGuardProps) {
	const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

	const hasAccess = Array.isArray(permission)
		? requireAll
			? hasAllPermissions(permission)
			: hasAnyPermission(permission)
		: hasPermission(permission);

	if (!hasAccess) {
		if (fallback) {
			return <>{fallback}</>;
		}

		return (
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertTitle>权限不足</AlertTitle>
				<AlertDescription>
					您没有权限访问此功能，请联系管理员
				</AlertDescription>
			</Alert>
		);
	}

	return <>{children}</>;
}
