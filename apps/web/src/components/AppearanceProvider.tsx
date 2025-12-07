import { createContext, useContext, useEffect, useState } from "react";

// 字体大小选项
export type FontSize = "small" | "medium" | "large" | "xlarge";

// 圆角大小选项
export type BorderRadius = "none" | "small" | "medium" | "large" | "xlarge";

// 间距密度选项
export type SpacingDensity = "compact" | "comfortable" | "spacious";

// 动画效果选项
export type AnimationLevel = "none" | "reduced" | "normal" | "enhanced";

// 阴影效果选项
export type ShadowLevel = "none" | "subtle" | "normal" | "elevated";

// 过渡速度选项
export type TransitionSpeed = "fast" | "normal" | "slow";

// 美化设置类型
export interface AppearanceSettings {
	fontSize: FontSize;
	borderRadius: BorderRadius;
	spacingDensity: SpacingDensity;
	animationLevel: AnimationLevel;
	shadowLevel: ShadowLevel;
	transitionSpeed: TransitionSpeed;
	compactMode: boolean; // 紧凑模式
	reducedMotion: boolean; // 减少动画（无障碍）
}

// 默认设置
const defaultSettings: AppearanceSettings = {
	fontSize: "medium",
	borderRadius: "medium",
	spacingDensity: "comfortable",
	animationLevel: "normal",
	shadowLevel: "normal",
	transitionSpeed: "normal",
	compactMode: false,
	reducedMotion: false,
};

type AppearanceProviderProps = {
	children: React.ReactNode;
	storageKey?: string;
};

type AppearanceProviderState = {
	settings: AppearanceSettings;
	updateSettings: (settings: Partial<AppearanceSettings>) => void;
	resetSettings: () => void;
};

const initialState: AppearanceProviderState = {
	settings: defaultSettings,
	updateSettings: () => null,
	resetSettings: () => null,
};

const AppearanceProviderContext = createContext<AppearanceProviderState>(initialState);

export function AppearanceProvider({
	children,
	storageKey = "vite-appearance-settings",
	...props
}: AppearanceProviderProps) {
	const [settings, setSettings] = useState<AppearanceSettings>(() => {
		try {
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				return { ...defaultSettings, ...JSON.parse(stored) };
			}
		} catch (error) {
			console.error("Failed to load appearance settings:", error);
		}
		return defaultSettings;
	});

	// 应用设置到 DOM
	useEffect(() => {
		const root = window.document.documentElement;

		// 字体大小
		const fontSizeMap: Record<FontSize, string> = {
			small: "0.875rem", // 14px
			medium: "1rem", // 16px
			large: "1.125rem", // 18px
			xlarge: "1.25rem", // 20px
		};
		root.style.setProperty("--app-font-size-base", fontSizeMap[settings.fontSize]);

		// 圆角大小
		const borderRadiusMap: Record<BorderRadius, string> = {
			none: "0",
			small: "0.125rem", // 2px
			medium: "0.25rem", // 4px
			large: "0.5rem", // 8px
			xlarge: "0.75rem", // 12px
		};
		root.style.setProperty("--app-radius", borderRadiusMap[settings.borderRadius]);

		// 间距密度
		const spacingMap: Record<SpacingDensity, number> = {
			compact: 0.75,
			comfortable: 1,
			spacious: 1.25,
		};
		root.style.setProperty("--app-spacing-multiplier", String(spacingMap[settings.spacingDensity]));

		// 动画级别
		const animationMap: Record<AnimationLevel, string> = {
			none: "0",
			reduced: "0.5",
			normal: "1",
			enhanced: "1.5",
		};
		root.style.setProperty("--app-animation-multiplier", animationMap[settings.animationLevel]);

		// 阴影级别
		const shadowMap: Record<ShadowLevel, string> = {
			none: "none",
			subtle: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
			normal: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
			elevated: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
		};
		root.style.setProperty("--app-shadow", shadowMap[settings.shadowLevel]);

		// 过渡速度
		const transitionMap: Record<TransitionSpeed, string> = {
			fast: "150ms",
			normal: "300ms",
			slow: "500ms",
		};
		root.style.setProperty("--app-transition-duration", transitionMap[settings.transitionSpeed]);

		// 紧凑模式
		root.classList.toggle("app-compact", settings.compactMode);

		// 减少动画（无障碍）
		root.classList.toggle("app-reduced-motion", settings.reducedMotion);
		if (settings.reducedMotion) {
			root.style.setProperty("--app-animation-multiplier", "0");
		}
	}, [settings]);

	const updateSettings = (newSettings: Partial<AppearanceSettings>) => {
		setSettings((prev) => {
			const updated = { ...prev, ...newSettings };
			try {
				localStorage.setItem(storageKey, JSON.stringify(updated));
			} catch (error) {
				console.error("Failed to save appearance settings:", error);
			}
			return updated;
		});
	};

	const resetSettings = () => {
		setSettings(defaultSettings);
		try {
			localStorage.removeItem(storageKey);
		} catch (error) {
			console.error("Failed to reset appearance settings:", error);
		}
	};

	const value = {
		settings,
		updateSettings,
		resetSettings,
	};

	return (
		<AppearanceProviderContext.Provider {...props} value={value}>
			{children}
		</AppearanceProviderContext.Provider>
	);
}

export const useAppearance = () => {
	const context = useContext(AppearanceProviderContext);

	if (context === undefined)
		throw new Error("useAppearance must be used within an AppearanceProvider");

	return context;
};

