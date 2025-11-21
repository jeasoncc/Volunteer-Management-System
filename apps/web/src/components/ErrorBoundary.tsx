import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
	children: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error caught by boundary:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
					<Card className="max-w-md w-full border-destructive">
						<CardHeader>
							<div className="flex items-center gap-2 text-destructive">
								<AlertTriangle className="h-6 w-6" />
								<CardTitle>出错了</CardTitle>
							</div>
							<CardDescription>
								应用程序遇到了一个错误，请刷新页面重试
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{this.state.error && (
								<div className="bg-muted p-4 rounded-lg">
									<p className="text-sm font-mono text-destructive">
										{this.state.error.message}
									</p>
								</div>
							)}
							<div className="flex gap-2">
								<Button onClick={this.handleReset} className="flex-1">
									<RefreshCw className="h-4 w-4 mr-2" />
									刷新页面
								</Button>
								<Button
									variant="outline"
									onClick={() => (window.location.href = "/")}
									className="flex-1"
								>
									返回首页
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}
