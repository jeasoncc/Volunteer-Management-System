import { useAuth } from "./useAuth";

export type Permission =
	| "volunteer:view"
	| "volunteer:create"
	| "volunteer:edit"
	| "volunteer:delete"
	| "volunteer:approve"
	| "checkin:view"
	| "checkin:manage"
	| "admin:manage"
	| "document:export";

const rolePermissions: Record<string, Permission[]> = {
	admin: [
		"volunteer:view",
		"volunteer:create",
		"volunteer:edit",
		"volunteer:delete",
		"volunteer:approve",
		"checkin:view",
		"checkin:manage",
		"admin:manage",
		"document:export",
	],
	volunteer: [
		"volunteer:view",
		"checkin:view",
	],
	resident: [],
};

export function usePermission() {
	const { user } = useAuth();

	const hasPermission = (permission: Permission): boolean => {
		if (!user) return false;
		const permissions = rolePermissions[user.lotusRole] || [];
		return permissions.includes(permission);
	};

	const hasAnyPermission = (permissions: Permission[]): boolean => {
		return permissions.some((permission) => hasPermission(permission));
	};

	const hasAllPermissions = (permissions: Permission[]): boolean => {
		return permissions.every((permission) => hasPermission(permission));
	};

	const isAdmin = user?.lotusRole === "admin";
	const isVolunteer = user?.lotusRole === "volunteer";
	const isResident = user?.lotusRole === "resident";

	return {
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		isAdmin,
		isVolunteer,
		isResident,
	};
}
