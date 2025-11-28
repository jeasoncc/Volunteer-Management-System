import { useEffect, useRef, useCallback } from "react";

interface SyncProgress {
	total: number;
	sent: number;
	confirmed: number;
	failed: number;
	skipped: number;
	status: "idle" | "syncing" | "completed";
	logs: Array<{
		time: string;
		type: "info" | "success" | "error" | "warning";
		message: string;
	}>;
	failedUsers: Array<{ lotusId: string; name: string; reason: string }>;
	startTime?: number | null;
	estimatedTimeRemaining?: number | null;
	batchId?: string | null;
}

interface UserFeedback {
	batchId: string | null;
	lotusId: string;
	name: string;
	status: "success" | "failed";
	code: number;
	message: string;
	timestamp: string;
}

interface BatchInfo {
	batchId: string;
	total: number;
	strategy: string;
	photoFormat: string;
}

interface BatchResult {
	batchId: string;
	total: number;
	confirmed: number;
	failed: number;
	skipped: number;
	duration: number;
}

interface UseSyncWebSocketOptions {
	onProgressUpdate?: (progress: SyncProgress) => void;
	onUserFeedback?: (feedback: UserFeedback) => void;
	onBatchStart?: (batch: BatchInfo) => void;
	onBatchComplete?: (result: BatchResult) => void;
	enabled?: boolean;
}

export function useSyncWebSocket(options: UseSyncWebSocketOptions = {}) {
	const { 
		onProgressUpdate, 
		onUserFeedback,
		onBatchStart,
		onBatchComplete,
		enabled = true 
	} = options;
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const reconnectAttemptsRef = useRef<number>(0);
	const maxReconnectAttempts = 5;

	const connect = useCallback(() => {
		if (!enabled) return;

		// 从环境变量或配置获取后端地址
		const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
		const wsUrl = backendUrl.replace("http", "ws") + "/ws/sync-progress";

		try {
			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				console.log("✅ 同步进度 WebSocket 已连接");
				reconnectAttemptsRef.current = 0;
			};

			ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);
					
					// 处理不同类型的消息
					switch (message.type) {
						case "progress":
							if (onProgressUpdate) {
								onProgressUpdate(message.data);
							}
							break;
						
						case "user_feedback":
							if (onUserFeedback) {
								onUserFeedback(message.data);
							}
							break;
						
						case "batch_start":
							if (onBatchStart) {
								onBatchStart(message.data);
							}
							break;
						
						case "batch_complete":
							if (onBatchComplete) {
								onBatchComplete(message.data);
							}
							break;
						
						default:
							console.log("收到未知消息类型:", message.type);
					}
				} catch (error) {
					console.error("解析 WebSocket 消息失败:", error);
				}
			};

			ws.onerror = (error) => {
				console.error("WebSocket 错误:", error);
			};

			ws.onclose = () => {
				console.log("❌ 同步进度 WebSocket 已断开");

				// 如果还启用，尝试重连
				if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
					reconnectAttemptsRef.current += 1;
					const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
					console.log(
						`🔄 ${delay / 1000}秒后尝试重连 (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
					);
					reconnectTimeoutRef.current = setTimeout(connect, delay);
				}
			};
		} catch (error) {
			console.error("创建 WebSocket 连接失败:", error);
		}
	}, [enabled, onProgressUpdate]);

	useEffect(() => {
		connect();

		// 清理
		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			if (wsRef.current) {
				wsRef.current.close();
				wsRef.current = null;
			}
		};
	}, [connect]);

	// 发送心跳
	useEffect(() => {
		if (!enabled) return;

		const interval = setInterval(() => {
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.send(JSON.stringify({ type: "ping" }));
			}
		}, 30000); // 每30秒发送一次心跳

		return () => clearInterval(interval);
	}, [enabled]);

	return {
		isConnected: wsRef.current?.readyState === WebSocket.OPEN,
		reconnect: connect,
	};
}
