interface HighlightTextProps {
	text: string;
	highlight: string;
	className?: string;
}

export function HighlightText({
	text,
	highlight,
	className = "",
}: HighlightTextProps) {
	if (!highlight.trim()) {
		return <span className={className}>{text}</span>;
	}

	const regex = new RegExp(highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
	const parts = text.split(regex);
	const matches = text.match(regex);

	return (
		<span className={className}>
			{parts.map((part, index) => (
				<span key={index}>
					{part}
					{matches && matches[index] && (
						<mark className="bg-yellow-200 dark:bg-yellow-900 font-medium px-0.5 rounded">
							{matches[index]}
						</mark>
					)}
				</span>
			))}
		</span>
	);
}
