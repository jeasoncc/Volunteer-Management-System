import { Link } from '@tanstack/react-router';
import { TextReveal } from './ui/TextReveal';
import { FadeIn } from './ui/FadeIn';
import { Particles } from './ui/Particles';
import { cn } from '../lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumbs, className }: PageHeaderProps) {
  return (
    <div className={cn("relative flex min-h-[35vh] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#f5ede0] to-[#faf8f5] text-center px-6 pt-24 pb-12", className)}>
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#b8860b]/5 blur-[100px] rounded-[100%]" />
        <Particles
          className="absolute inset-0 h-full w-full opacity-20"
          quantity={40}
          staticity={50}
          ease={70}
          color="#b8860b"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl space-y-4">
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <FadeIn delay={0.1} direction="down" className="flex items-center justify-center gap-2 text-xs tracking-wide text-[#6b6560]">
            <Link to="/" className="hover:text-primary transition-colors">首页</Link>
            {breadcrumbs.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                <span className="opacity-50">/</span>
                {item.href ? (
                  <Link to={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
                ) : (
                  <span className="text-primary font-medium">{item.label}</span>
                )}
              </span>
            ))}
          </FadeIn>
        )}

        {/* Title */}
        <div className="text-4xl font-bold text-[#2d2a26] sm:text-5xl">
           <TextReveal text={title} delay={0.3} />
        </div>

        {/* Subtitle */}
        {subtitle && (
          <FadeIn delay={0.8} direction="up">
            <p className="mx-auto max-w-2xl text-lg text-[#6b6560] leading-relaxed">
              {subtitle}
            </p>
          </FadeIn>
        )}
      </div>
      
      {/* Decorative Bottom Border */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#b8860b]/30 to-transparent" />
    </div>
  );
}
