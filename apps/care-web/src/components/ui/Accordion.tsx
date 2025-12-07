import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-6 py-4 flex items-center justify-between text-left',
          'transition-colors duration-200',
          'hover:bg-warm-50',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20'
        )}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-foreground pr-4">{title}</span>
        <ChevronDown 
          className={cn(
            'w-5 h-5 text-muted-foreground flex-shrink-0',
            'transition-transform duration-300 ease-out',
            isOpen && 'rotate-180 text-primary'
          )} 
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 pb-4 text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  items: { title: string; content: ReactNode }[];
  className?: string;
  allowMultiple?: boolean;
}

export function Accordion({ items, className, allowMultiple = false }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const handleToggle = (index: number) => {
    if (allowMultiple) {
      const newIndices = new Set(openIndices);
      if (newIndices.has(index)) {
        newIndices.delete(index);
      } else {
        newIndices.add(index);
      }
      setOpenIndices(newIndices);
    } else {
      setOpenIndex(openIndex === index ? null : index);
    }
  };

  const isOpen = (index: number) => {
    return allowMultiple ? openIndices.has(index) : openIndex === index;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => handleToggle(index)}
            className={cn(
              'w-full px-6 py-4 flex items-center justify-between text-left',
              'transition-colors duration-200',
              'hover:bg-warm-50',
              'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20'
            )}
            aria-expanded={isOpen(index)}
          >
            <span className="font-medium text-foreground pr-4">{item.title}</span>
            <ChevronDown 
              className={cn(
                'w-5 h-5 text-muted-foreground flex-shrink-0',
                'transition-transform duration-300 ease-out',
                isOpen(index) && 'rotate-180 text-primary'
              )} 
            />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300 ease-out',
              isOpen(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="px-6 pb-4 text-muted-foreground">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
