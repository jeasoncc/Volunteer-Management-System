import { useEffect, useRef } from "react";
import { useInView } from "../../hooks/useInView";
import { cn } from "../../lib/utils";

export default function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
}: {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number; // delay in s
  decimalPlaces?: number;
}) {
  const [ref, isInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        const start = direction === "down" ? value : 0;
        const end = direction === "down" ? 0 : value;
        const duration = 2000; // ms
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOutExpo = (x: number): number => {
            return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
          };

          const current = start + (end - start) * easeOutExpo(progress);
          
          if (spanRef.current) {
            spanRef.current.textContent = Intl.NumberFormat("en-US", {
              minimumFractionDigits: decimalPlaces,
              maximumFractionDigits: decimalPlaces,
            }).format(current);
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      }, delay * 1000);
    }
  }, [isInView, delay, value, direction, decimalPlaces]);

  return (
    <div ref={ref} className={cn("inline-block tabular-nums tracking-wider", className)}>
      <span ref={spanRef} />
    </div>
  );
}
