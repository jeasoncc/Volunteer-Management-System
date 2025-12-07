import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/volunteers")({
	component: VolunteersLayout,
});

function VolunteersLayout() {
	return <Outlet />;
}
