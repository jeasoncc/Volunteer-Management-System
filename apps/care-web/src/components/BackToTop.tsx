import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'fixed bottom-8 right-8 z-50 p-3 rounded-full',
        'bg-primary text-white shadow-warm-lg',
        'transition-all duration-300 ease-out',
        'hover:bg-primary/90 hover:scale-110 hover:shadow-xl',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
      aria-label="返回顶部"
    >
      <ArrowUp 
        className={cn(
          'w-5 h-5 transition-transform duration-300',
          isHovered && 'animate-bounce'
        )} 
      />
    </button>
  );
}
