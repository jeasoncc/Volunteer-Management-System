import { useInView } from '../../hooks/useInView';
import { cn } from '../../lib/utils';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ text, className, delay = 0 }: TextRevealProps) {
  const [ref, isInView] = useInView();
  const letters = text.split("");

  return (
    <h1 ref={ref} className={cn("flex flex-wrap justify-center", className)}>
      {letters.map((letter, index) => (
        <span
          key={index}
          className="inline-block transition-all duration-500 ease-out"
          style={{
            opacity: isInView ? 1 : 0,
            filter: isInView ? 'blur(0px)' : 'blur(10px)',
            transform: isInView ? 'translateY(0)' : 'translateY(10px)',
            transitionDelay: `${delay + index * 0.05}s`
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </h1>
  );
}
