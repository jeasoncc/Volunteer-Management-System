import { useInView } from '../../hooks/useInView';
import { cn } from '../../lib/utils';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function FadeIn({ 
  children, 
  className, 
  delay = 0, 
  direction = 'up' 
}: FadeInProps) {
  const [ref, isInView] = useInView();

  // 动态计算初始 transform
  const transformStyle = !isInView
    ? direction === 'up' ? 'translateY(20px)'
    : direction === 'down' ? 'translateY(-20px)'
    : direction === 'left' ? 'translateX(20px)'
    : direction === 'right' ? 'translateX(-20px)'
    : 'none'
    : 'none';

  return (
    <div
      ref={ref}
      className={cn("transition-all duration-700 ease-out", className)}
      style={{
        opacity: isInView ? 1 : 0,
        transform: transformStyle,
        transitionDelay: `${delay}s`
      }}
    >
      {children}
    </div>
  );
}
