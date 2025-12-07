import { createContext, useContext, useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";
type ColorTheme = 
	| "theme-lotus" 
	| "theme-land" 
	| "theme-lapis"
	| "theme-gold"
	| "theme-red"
	| "theme-orange"
	| "theme-green"
	| "theme-white"
	| "theme-purple"
	| "theme-ink"
	| "theme-tea"
	| "theme-sky"
	| "theme-coral"
	| "theme-sapphire"
	| "theme-ivory"
	| "theme-cinnabar"
	| "theme-amber"
	| "theme-jade";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultMode?: Mode;
	defaultColorTheme?: ColorTheme;
	storageKey?: string;
};

type ThemeProviderState = {
	mode: Mode;
	setMode: (mode: Mode) => void;
	colorTheme: ColorTheme;
	setColorTheme: (theme: ColorTheme) => void;
};

const initialState: ThemeProviderState = {
	mode: "system",
	setMode: () => null,
	colorTheme: "theme-lotus",
	setColorTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultMode = "system",
	defaultColorTheme = "theme-lotus",
	storageKey = "vite-ui-theme",
	...props
}: ThemeProviderProps) {
	const [mode, setMode] = useState<Mode>(
		() => (localStorage.getItem(`${storageKey}-mode`) as Mode) || defaultMode,
	);
	const [colorTheme, setColorTheme] = useState<ColorTheme>(
		() => (localStorage.getItem(`${storageKey}-color`) as ColorTheme) || defaultColorTheme,
	);

	useEffect(() => {
		const root = window.document.documentElement;

		// 1. 处理 Dark Mode
		root.classList.remove("light", "dark");

		if (mode === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";
			root.classList.add(systemTheme);
		} else {
			root.classList.add(mode);
		}

		// 2. 处理 Color Theme
		root.classList.remove(
			"theme-lotus", 
			"theme-land", 
			"theme-lapis",
			"theme-gold",
			"theme-red",
			"theme-orange",
			"theme-green",
			"theme-white",
			"theme-purple",
			"theme-ink",
			"theme-tea",
			"theme-sky",
			"theme-coral",
			"theme-sapphire",
			"theme-ivory",
			"theme-cinnabar",
			"theme-amber",
			"theme-jade"
		);
		root.classList.add(colorTheme);
		
	}, [mode, colorTheme]);

	const value = {
		mode,
		setMode: (mode: Mode) => {
			localStorage.setItem(`${storageKey}-mode`, mode);
			setMode(mode);
		},
		colorTheme,
		setColorTheme: (theme: ColorTheme) => {
			localStorage.setItem(`${storageKey}-color`, theme);
			setColorTheme(theme);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};
