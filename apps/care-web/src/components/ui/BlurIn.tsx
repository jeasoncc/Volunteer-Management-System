import { cn } from "../../lib/utils";

interface BlurInProps {
  word: string;
  className?: string;
  variant?: {
    hidden: { filter: string; opacity: number };
    visible: { filter: string; opacity: number };
  };
  duration?: number;
}

export function BlurIn({ word, className, duration = 1 }: BlurInProps) {
  return (
    <span
      className={cn(
        "inline-block animate-blur-in opacity-0",
        className,
      )}
      style={{
        animationDuration: `${duration}s`,
        animationFillMode: 'forwards',
      }}
    >
      {word}
    </span>
  );
}
