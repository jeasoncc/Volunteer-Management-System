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
    <div className={cn("relative flex min-h-[40vh] w-full flex-col items-center justify-center overflow-hidden bg-background text-center px-6 pt-20 pb-12", className)}>
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-[120px] rounded-[100%]" />
        <Particles
          className="absolute inset-0 h-full w-full opacity-30"
          quantity={60}
          staticity={50}
          ease={70}
          color="#c28a3a"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl space-y-6">
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <FadeIn delay={0.1} direction="down" className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">首页</Link>
            {breadcrumbs.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                <span className="opacity-50">/</span>
                {item.href ? (
                  <Link to={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
                ) : (
                  <span className="text-primary">{item.label}</span>
                )}
              </span>
            ))}
          </FadeIn>
        )}

        {/* Title */}
        <div className="font-['Cinzel'] text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
           <TextReveal text={title} delay={0.3} />
        </div>

        {/* Subtitle */}
        {subtitle && (
          <FadeIn delay={0.8} direction="up">
            <p className="mx-auto max-w-2xl font-['Playfair_Display'] text-lg text-muted-foreground sm:text-xl leading-relaxed">
              {subtitle}
            </p>
          </FadeIn>
        )}
      </div>
      
      {/* Decorative Bottom Border */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
