/**
 * Toast 通知工具
 * 简单的 Toast 通知实现，可以替换为更完善的库如 react-hot-toast
 */

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
	message: string;
	type?: ToastType;
	duration?: number;
}

class ToastService {
	private toastContainer: HTMLDivElement | null = null;

	private ensureContainer() {
		if (!this.toastContainer) {
			this.toastContainer = document.createElement("div");
			this.toastContainer.id = "toast-container";
			this.toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
			document.body.appendChild(this.toastContainer);
		}
		return this.toastContainer;
	}

	show({ message, type = "info", duration = 3000 }: ToastOptions) {
		const container = this.ensureContainer();

		const toast = document.createElement("div");
		toast.style.cssText = `
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      color: white;
      font-size: 14px;
      line-height: 1.5;
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 250px;
    `;

		// 设置背景颜色
		const bgColors = {
			success: "#10b981",
			error: "#ef4444",
			info: "#3b82f6",
			warning: "#f59e0b",
		};
		toast.style.backgroundColor = bgColors[type];

		// 添加图标
		const icons = {
			success: "✓",
			error: "✕",
			info: "ℹ",
			warning: "⚠",
		};

		toast.innerHTML = `
      <span style="font-weight: bold; font-size: 16px;">${icons[type]}</span>
      <span style="flex: 1;">${message}</span>
    `;

		// 添加样式表（如果还没有）
		if (!document.getElementById("toast-styles")) {
			const style = document.createElement("style");
			style.id = "toast-styles";
			style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
			document.head.appendChild(style);
		}

		container.appendChild(toast);

		// 自动移除
		setTimeout(() => {
			toast.style.animation = "slideOut 0.3s ease-in";
			setTimeout(() => {
				container.removeChild(toast);
				if (container.children.length === 0 && container.parentNode) {
					container.parentNode.removeChild(container);
					this.toastContainer = null;
				}
			}, 300);
		}, duration);
	}

	success(message: string, duration?: number) {
		this.show({ message, type: "success", duration });
	}

	error(message: string, duration?: number) {
		this.show({ message, type: "error", duration });
	}

	info(message: string, duration?: number) {
		this.show({ message, type: "info", duration });
	}

	warning(message: string, duration?: number) {
		this.show({ message, type: "warning", duration });
	}
}

export const toast = new ToastService();
