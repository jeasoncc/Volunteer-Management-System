import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnimatedSection } from '../ui/AnimatedSection';

const images = [
  { id: 1, title: '义工服务', desc: '陪伴关怀', emoji: '🙏' },
  { id: 2, title: '斋饭供应', desc: '每日1500份', emoji: '🍚' },
  { id: 3, title: '培训活动', desc: '专业学习', emoji: '📚' },
  { id: 4, title: '团队合影', desc: '温暖大家庭', emoji: '👨‍👩‍👧‍👦' },
];

export function ImageGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleSelect = (index: number) => {
    if (isTransitioning || index === activeIndex) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#2d2a26]">服务剪影</h2>
        </AnimatedSection>
        
        <AnimatedSection className="max-w-4xl mx-auto" delay={200}>
          {/* 主图 */}
          <div className="relative aspect-video bg-gradient-to-br from-[#f5ede0] to-[#e8e0d5] rounded-2xl mb-4 overflow-hidden group">
            {/* 图片内容 */}
            <div 
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-500",
                isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
              )}
            >
              <div className="text-center">
                <div className="text-7xl mb-3 animate-float">{images[activeIndex].emoji}</div>
                <p className="text-xl font-semibold text-[#2d2a26]">{images[activeIndex].title}</p>
                <p className="text-sm text-[#6b6560]">{images[activeIndex].desc}</p>
              </div>
            </div>

            {/* 导航按钮 */}
            <button
              onClick={handlePrev}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full",
                "bg-white/80 text-[#2d2a26] shadow-lg",
                "opacity-0 group-hover:opacity-100 transition-all duration-300",
                "hover:bg-white hover:scale-110",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              aria-label="上一张"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full",
                "bg-white/80 text-[#2d2a26] shadow-lg",
                "opacity-0 group-hover:opacity-100 transition-all duration-300",
                "hover:bg-white hover:scale-110",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              aria-label="下一张"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* 进度指示器 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeIndex === index 
                      ? "w-8 bg-primary" 
                      : "w-1.5 bg-[#d4c4a8] hover:bg-primary/50"
                  )}
                  aria-label={`切换到第 ${index + 1} 张`}
                />
              ))}
            </div>
          </div>
          
          {/* 缩略图 */}
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => handleSelect(index)}
                className={cn(
                  "aspect-video rounded-lg overflow-hidden transition-all duration-300",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  activeIndex === index 
                    ? "ring-2 ring-primary ring-offset-2 scale-105" 
                    : "opacity-60 hover:opacity-100 hover:scale-102"
                )}
              >
                <div className="w-full h-full bg-gradient-to-br from-[#f5ede0] to-[#e8e0d5] flex items-center justify-center">
                  <span className="text-2xl">{img.emoji}</span>
                </div>
              </button>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
