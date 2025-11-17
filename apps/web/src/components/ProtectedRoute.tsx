import { useAuth } from "../hooks/useAuth";
import { Navigate } from "@tanstack/react-router";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: "admin" | "volunteer";
}

export function ProtectedRoute({ children, requiredRole = "admin" }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading, user } = useAuth();

	// Show loading state while checking auth
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-muted-foreground">验证中...</div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	// Check role requirements
	if (requiredRole === "admin" && user?.lotusRole !== "admin") {
		return <Navigate to="/login" />;
	}

	return <>{children}</>;
}