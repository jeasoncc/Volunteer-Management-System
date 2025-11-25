import { cn } from "../../lib/utils";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-12 pl-8 md:pl-0", className)}>
      {/* Vertical Line */}
      <div className="absolute left-8 top-2 bottom-2 w-px bg-border md:left-1/2 md:-translate-x-1/2" />

      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "relative flex flex-col gap-6 md:flex-row md:items-center md:gap-12",
            index % 2 === 0 ? "md:flex-row-reverse" : ""
          )}
        >
          {/* Dot */}
          <div className="absolute left-0 top-0 flex h-16 w-16 -translate-x-1/2 items-center justify-center md:left-1/2">
            <div className="h-4 w-4 rounded-full border-2 border-primary bg-background ring-4 ring-background" />
          </div>

          {/* Content Box */}
          <div className="ml-12 flex-1 md:ml-0 md:text-right">
            <div
              className={cn(
                "group relative rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg",
                index % 2 === 0 ? "md:text-left" : "md:text-right"
              )}
            >
              <span className="mb-2 inline-block font-['Cinzel'] text-3xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors">
                {item.year}
              </span>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
          
          {/* Spacer for alternating layout */}
          <div className="flex-1 hidden md:block" />
        </div>
      ))}
    </div>
  );
}
