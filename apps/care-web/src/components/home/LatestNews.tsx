import { Link } from '@tanstack/react-router';
import { ArrowRight, Calendar } from 'lucide-react';
import { AnimatedSection, StaggeredList } from '../ui/AnimatedSection';
import { cn } from '../../lib/utils';

const news = [
  {
    id: 1,
    title: '2024年度义工表彰大会圆满举行',
    date: '2024-12-15',
    category: '活动',
    isNew: true,
  },
  {
    id: 2,
    title: '第28期义工培训班开始报名',
    date: '2024-12-10',
    category: '培训',
    isNew: true,
  },
  {
    id: 3,
    title: '深圳电视台专题报道我们的服务',
    date: '2024-12-05',
    category: '媒体',
    isNew: false,
  },
];

export function LatestNews() {
  return (
    <section className="py-12 bg-[#faf8f5]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2d2a26]">最新动态</h2>
            <Link
              to="/news"
              className="text-primary text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all link-underline"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>

          <StaggeredList 
            className="grid md:grid-cols-3 gap-4"
            staggerDelay={100}
          >
            {news.map((item) => (
              <Link
                key={item.id}
                to="/news"
                className={cn(
                  "bg-white rounded-xl p-4 shadow-warm card-hover group relative overflow-hidden",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
              >
                {/* 新标签 */}
                {item.isNew && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-medium rounded-full animate-pulse-soft">
                    NEW
                  </span>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs text-[#a8a29e] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>
                <h3 className="text-[#2d2a26] font-medium group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                {/* 悬停时的箭头 */}
                <div className="mt-3 flex items-center gap-1 text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  阅读更多 <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </StaggeredList>
        </div>
      </div>
    </section>
  );
}
