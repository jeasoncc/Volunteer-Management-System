import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/checkin")({
	component: CheckinLayout,
});

function CheckinLayout() {
	return <Outlet />;
}
