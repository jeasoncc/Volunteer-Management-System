/**
 * 键盘快捷键 Hook
 */

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

interface ShortcutConfig {
	key: string;
	ctrlKey?: boolean;
	shiftKey?: boolean;
	altKey?: boolean;
	metaKey?: boolean;
	action: () => void;
	description: string;
}

export function useKeyboardShortcuts(customShortcuts: ShortcutConfig[] = []) {
	const navigate = useNavigate();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// 忽略在输入框中的快捷键
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				// 但允许 ESC 键
				if (e.key !== "Escape") {
					return;
				}
			}

			// 全局快捷键
			const globalShortcuts: ShortcutConfig[] = [
				{
					key: "/",
					action: () => {
						// 聚焦搜索（如果有）
						const searchInput = document.querySelector<HTMLInputElement>(
							'input[type="search"], input[placeholder*="搜索"]'
						);
						if (searchInput) {
							e.preventDefault();
							searchInput.focus();
						}
					},
					description: "聚焦搜索",
				},
				{
					key: "?",
					shiftKey: true,
					action: () => {
						e.preventDefault();
						showShortcutsHelp();
					},
					description: "显示快捷键帮助",
				},
				{
					key: "h",
					action: () => {
						e.preventDefault();
						navigate({ to: "/" });
					},
					description: "返回首页",
				},
				{
					key: "r",
					action: () => {
						e.preventDefault();
						// 触发刷新按钮点击
						const refreshBtn = document.querySelector<HTMLButtonElement>(
							'button:has(svg[class*="RefreshCw"])'
						);
						if (refreshBtn) {
							refreshBtn.click();
						} else {
							window.location.reload();
						}
					},
					description: "刷新数据",
				},
				{
					key: "Escape",
					action: () => {
						// 关闭所有对话框
						const closeButtons = document.querySelectorAll<HTMLButtonElement>(
							'[role="dialog"] button[aria-label="Close"]'
						);
						closeButtons.forEach((btn) => btn.click());
					},
					description: "关闭对话框",
				},
			];

			// 合并自定义快捷键
			const allShortcuts = [...globalShortcuts, ...customShortcuts];

			// 检查快捷键匹配
			for (const shortcut of allShortcuts) {
				const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
				const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
				const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
				const altMatch = shortcut.altKey ? e.altKey : !e.altKey;

				if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
					shortcut.action();
					break;
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [navigate, customShortcuts]);
}

// 显示快捷键帮助
function showShortcutsHelp() {
	const shortcuts = [
		{ key: "?", description: "显示此帮助" },
		{ key: "/", description: "聚焦搜索" },
		{ key: "H", description: "返回首页" },
		{ key: "R", description: "刷新数据" },
		{ key: "ESC", description: "关闭对话框" },
	];

	const helpText = shortcuts
		.map((s) => `${s.key.padEnd(10)} - ${s.description}`)
		.join("\n");

	alert(`键盘快捷键：\n\n${helpText}`);
}
