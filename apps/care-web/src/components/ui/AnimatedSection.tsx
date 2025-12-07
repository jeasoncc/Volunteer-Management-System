import { ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';
import { cn } from '../../lib/utils';

type AnimationType = 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'scale' | 'blur';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
}

const animationClasses: Record<AnimationType, { initial: string; animate: string }> = {
  fadeUp: {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  fadeIn: {
    initial: 'opacity-0',
    animate: 'opacity-100',
  },
  fadeLeft: {
    initial: 'opacity-0 -translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  fadeRight: {
    initial: 'opacity-0 translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  scale: {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100',
  },
  blur: {
    initial: 'opacity-0 blur-sm scale-95',
    animate: 'opacity-100 blur-0 scale-100',
  },
};

export function AnimatedSection({
  children,
  className,
  animation = 'fadeUp',
  delay = 0,
  duration = 600,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const [ref, isInView] = useInView({ threshold, triggerOnce: true });
  const { initial, animate } = animationClasses[animation];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-out',
        isInView ? animate : initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// 用于列表项的交错动画
interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  animation?: AnimationType;
  staggerDelay?: number;
  duration?: number;
}

export function StaggeredList({
  children,
  className,
  itemClassName,
  animation = 'fadeUp',
  staggerDelay = 100,
  duration = 500,
}: StaggeredListProps) {
  const [ref, isInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const { initial, animate } = animationClasses[animation];

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all ease-out',
            isInView ? animate : initial,
            itemClassName
          )}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
