import { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnimatedSection } from '../ui/AnimatedSection';

const testimonials = [
  {
    content: '感谢义工们的陪伴，让父亲走得很安详。你们的专业和耐心让我们全家都很感动。',
    author: '张女士',
    relation: '家属',
    avatar: '👩',
  },
  {
    content: '斋饭很好吃，每天都来，感谢你们六年如一日的坚持。',
    author: '李大爷',
    relation: '社区居民',
    avatar: '👴',
  },
  {
    content: '专业又温暖，在最困难的时候给了我们最大的支持。',
    author: '王先生',
    relation: '家属',
    avatar: '👨',
  },
  {
    content: '成为义工后，我学会了如何更好地面对生命，这是一份珍贵的礼物。',
    author: '陈小姐',
    relation: '义工',
    avatar: '👩‍🦰',
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <AnimatedSection className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#2d2a26]">他们的声音</h2>
            <p className="text-[#6b6560] mt-2">来自服务对象和义工的真实反馈</p>
          </div>
          
          <div className="relative bg-gradient-to-br from-[#faf8f5] to-[#f5ede0] rounded-2xl p-8 md:p-12 shadow-warm group">
            {/* 装饰引号 */}
            <Quote className="w-12 h-12 text-primary/10 absolute top-6 left-6" />
            <Quote className="w-12 h-12 text-primary/10 absolute bottom-6 right-6 rotate-180" />
            
            {/* 内容 */}
            <div 
              className={cn(
                "text-center py-4 transition-all duration-500",
                isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              )}
            >
              {/* 头像 */}
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm text-3xl">
                {testimonials[current].avatar}
              </div>
              
              <p className="text-lg md:text-xl text-[#2d2a26] mb-6 italic leading-relaxed">
                "{testimonials[current].content}"
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-semibold text-[#2d2a26]">{testimonials[current].author}</span>
                <span className="text-[#d4c4a8]">·</span>
                <span className="text-[#6b6560]">{testimonials[current].relation}</span>
              </div>
            </div>

            {/* 导航按钮 */}
            <button
              onClick={handlePrev}
              className={cn(
                "absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full",
                "bg-white/80 text-[#2d2a26] shadow-md",
                "opacity-0 group-hover:opacity-100 transition-all duration-300",
                "hover:bg-white hover:scale-110",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              aria-label="上一条"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className={cn(
                "absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full",
                "bg-white/80 text-[#2d2a26] shadow-md",
                "opacity-0 group-hover:opacity-100 transition-all duration-300",
                "hover:bg-white hover:scale-110",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              aria-label="下一条"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* 指示器 */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isAnimating && index !== current) {
                      setIsAnimating(true);
                      setCurrent(index);
                      setTimeout(() => setIsAnimating(false), 500);
                    }
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    current === index 
                      ? "bg-primary w-8" 
                      : "bg-[#d4c4a8] w-2 hover:bg-primary/50"
                  )}
                  aria-label={`切换到第 ${index + 1} 条评价`}
                  aria-current={current === index ? 'true' : 'false'}
                />
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
