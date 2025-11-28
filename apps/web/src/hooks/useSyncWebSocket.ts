import { useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { getBackendUrl } from "@/config/network";

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

interface ClearDeviceResult {
	success: boolean;
	code: number;
	message: string;
}

interface UseSyncWebSocketOptions {
	onProgressUpdate?: (progress: SyncProgress) => void;
	onUserFeedback?: (feedback: UserFeedback) => void;
	onBatchStart?: (batch: BatchInfo) => void;
	onBatchComplete?: (result: BatchResult) => void;
	onClearDeviceComplete?: (result: ClearDeviceResult) => void;
	enabled?: boolean;
}

export function useSyncWebSocket(options: UseSyncWebSocketOptions = {}) {
	const {
		onProgressUpdate,
		onUserFeedback,
		onBatchStart,
		onBatchComplete,
		onClearDeviceComplete,
		enabled = true,
	} = options;

	// 使用 ref 存储回调函数，避免依赖变化导致重复触发
	const callbacksRef = useRef({
		onProgressUpdate,
		onUserFeedback,
		onBatchStart,
		onBatchComplete,
		onClearDeviceComplete,
	});

	// 更新 ref 中的回调函数
	useEffect(() => {
		callbacksRef.current = {
			onProgressUpdate,
			onUserFeedback,
			onBatchStart,
			onBatchComplete,
			onClearDeviceComplete,
		};
	}, [onProgressUpdate, onUserFeedback, onBatchStart, onBatchComplete, onClearDeviceComplete]);

	// 获取 WebSocket URL
	const backendUrl = getBackendUrl();
	const socketUrl = enabled
		? backendUrl.replace("http", "ws") + "/ws/sync-progress"
		: null;

	// 使用 react-use-websocket
	const { lastJsonMessage, readyState } = useWebSocket(socketUrl, {
		shouldReconnect: () => true, // 自动重连
		reconnectAttempts: 10, // 最多重连 10 次
		reconnectInterval: 3000, // 重连间隔 3 秒
		share: false, // 不共享连接
	});

	// 处理接收到的消息 - 只依赖 lastJsonMessage
	useEffect(() => {
		if (!lastJsonMessage) return;

		const message = lastJsonMessage as any;
		const callbacks = callbacksRef.current;

		switch (message.type) {
			case "progress":
				callbacks.onProgressUpdate?.(message.data);
				break;

			case "user_feedback":
				callbacks.onUserFeedback?.(message.data);
				break;

			case "batch_start":
				callbacks.onBatchStart?.(message.data);
				break;

			case "batch_complete":
				callbacks.onBatchComplete?.(message.data);
				break;

			case "clear_device_complete":
				callbacks.onClearDeviceComplete?.(message.data);
				break;
		}
	}, [lastJsonMessage]); // 只依赖 lastJsonMessage

	// 连接状态
	const connectionStatus = {
		[ReadyState.CONNECTING]: "连接中",
		[ReadyState.OPEN]: "已连接",
		[ReadyState.CLOSING]: "断开中",
		[ReadyState.CLOSED]: "已断开",
		[ReadyState.UNINSTANTIATED]: "未初始化",
	}[readyState];

	return {
		isConnected: readyState === ReadyState.OPEN,
		connectionStatus,
		readyState,
	};
}
