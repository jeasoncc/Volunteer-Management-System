import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';
import { Heart, Quote, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatedSection, StaggeredList } from '../components/ui/AnimatedSection';
import { StoryCardSkeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/utils';

const stories = [
  {
    id: 1,
    title: '最后的心愿',
    patient: '王奶奶',
    age: 82,
    summary: '王奶奶一直有个心愿，想在离开前见到远在国外的孙子。在义工的帮助下，通过视频连线，祖孙俩完成了最后的告别。',
    content: `王奶奶是一位退休教师，一生桃李满天下。晚年患病后，她最大的心愿就是能见到远在美国的孙子小明一面。

由于病情发展迅速，小明无法及时赶回国内。义工小李了解到这个情况后，主动联系了小明，帮助他们安排了一次视频通话。

在那次通话中，王奶奶看到了孙子的笑脸，听到了他说"奶奶，我爱您"。虽然隔着屏幕，但祖孙俩的心紧紧连在一起。

三天后，王奶奶安详地离开了。小明说，感谢莲花的义工们，让奶奶没有遗憾地离开。`,
    quote: '感谢你们让我见到了孙子，我可以安心走了。',
    volunteer: '李慈心',
    date: '2024年10月',
    featured: true,
    emoji: '👵',
  },
  {
    id: 2,
    title: '和解的力量',
    patient: '张先生',
    age: 65,
    summary: '张先生与儿子多年不和，在生命的最后时刻，义工帮助父子俩打开心结，完成了迟来的和解。',
    content: `张先生是一位退伍军人，性格刚强。因为一些家庭矛盾，他与儿子已经五年没有说过话。

当得知自己时日无多时，张先生内心充满了遗憾。义工小王在陪伴中慢慢了解到这个情况，决定帮助这对父子和解。

经过多次沟通，小王终于说服了张先生的儿子来到医院。当儿子走进病房的那一刻，张先生的眼泪夺眶而出。

"爸，对不起..."儿子跪在床前。张先生颤抖着手，抚摸着儿子的头："是爸爸不好，爸爸也对不起你..."

那一刻，所有的隔阂都消融了。张先生在儿子的陪伴下，安详地走完了人生最后一程。`,
    quote: '能在最后和儿子和好，我这辈子没有遗憾了。',
    volunteer: '王善缘',
    date: '2024年9月',
    emoji: '👨',
  },
  {
    id: 3,
    title: '独居老人的温暖',
    patient: '刘阿姨',
    age: 78,
    summary: '独居的刘阿姨没有亲人在身边，义工们轮流陪伴，让她在生命的最后时光感受到了家人般的温暖。',
    content: `刘阿姨是一位独居老人，丈夫早年去世，唯一的女儿也在十年前因病离世。当她被诊断为晚期癌症时，身边没有一个亲人。

莲花的义工们了解到刘阿姨的情况后，主动承担起了陪伴的责任。每天都有义工来到她的病床前，陪她聊天、读书、听音乐。

"你们就像我的孩子一样。"刘阿姨常常这样说。

在生命的最后几天，义工们轮流守护在她身边，为她念佛、助念。刘阿姨走得很安详，脸上带着微笑。

义工小陈说："虽然刘阿姨没有亲人，但她并不孤单。我们就是她的家人。"`,
    quote: '有你们在，我不孤单。',
    volunteer: '陈净莲',
    date: '2024年8月',
    emoji: '👩‍🦳',
  },
  {
    id: 4,
    title: '生命的礼物',
    patient: '李老师',
    age: 70,
    summary: '退休教师李老师在生命的最后时刻，将自己的藏书全部捐给了山区学校，用另一种方式延续了对教育的热爱。',
    content: `李老师是一位退休的语文教师，一生热爱读书，家中藏书数千册。当她得知自己的病情后，最放心不下的就是这些书。

"这些书是我一生的积累，我希望它们能继续发挥作用。"李老师对义工说。

义工小张帮助李老师联系了一所山区小学。当得知这些书将送给渴望知识的孩子们时，李老师非常高兴。

在生命的最后几天，李老师亲手在每本书的扉页上写下了寄语："愿知识的种子，在你心中生根发芽。"

李老师走后，这些书被送到了山区学校。孩子们捧着书，读着李老师的寄语，眼中闪烁着光芒。`,
    quote: '书是我留给这个世界最好的礼物。',
    volunteer: '张慈悲',
    date: '2024年7月',
    emoji: '👩‍🏫',
  },
  {
    id: 5,
    title: '母女的告别',
    patient: '陈女士',
    age: 55,
    summary: '年仅55岁的陈女士，在义工的帮助下，与女儿完成了一场特殊的告别仪式，将爱延续下去。',
    content: `陈女士是一位单亲妈妈，独自抚养女儿长大。当她被诊断为晚期肺癌时，最放心不下的就是即将高考的女儿。

义工小林了解到这个情况后，不仅陪伴陈女士，还帮助她的女儿进行心理疏导。

在陈女士的提议下，义工帮助母女俩举办了一场特殊的"告别仪式"。陈女士将自己写给女儿的信、录制的视频、以及一些珍贵的物品，一一交给女儿。

"妈妈不能陪你走完人生的路，但妈妈的爱会一直在你身边。"陈女士说。

女儿含泪答应妈妈，一定会好好生活，完成妈妈的心愿。

半年后，女儿以优异的成绩考上了大学。她说："妈妈在天上看着我，我不能让她失望。"`,
    quote: '我的爱，会一直陪着你。',
    volunteer: '林慧心',
    date: '2024年6月',
    emoji: '👩',
  },
];

const testimonials = [
  {
    content: '感谢莲花的义工们，让我父亲走得那么安详。你们的陪伴，是我们全家最大的安慰。',
    author: '张先生家属',
    relation: '儿子',
    avatar: '👨',
  },
  {
    content: '在最艰难的时候，是义工们给了我们力量。他们不仅照顾病人，也关心我们家属的心理状态。',
    author: '王女士家属',
    relation: '女儿',
    avatar: '👩',
  },
  {
    content: '义工们的专业和真诚让我们非常感动。他们用爱心和耐心，陪伴我母亲走完了最后一程。',
    author: '李先生家属',
    relation: '儿子',
    avatar: '👨‍🦱',
  },
];

export function StoriesPage() {
  const [selectedStory, setSelectedStory] = useState<typeof stories[0] | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // 自动轮播感言
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextTestimonial();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentTestimonial]);

  // 禁止滚动当弹窗打开时
  useEffect(() => {
    if (selectedStory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedStory]);

  const handlePrevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const featuredStory = stories.find((s) => s.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="生命见证 | 莲花生命关怀" />
      <PageHeader
        title="生命见证"
        subtitle="在无常的灰烬中，拾起金色的慈悲。"
        breadcrumbs={[{ label: '项目故事' }]}
      />

      {/* 引言 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              每一个生命都有自己的故事，每一次告别都值得被温柔以待。
              这里记录的，是我们在服务中遇到的真实故事，是生命最后时刻的爱与感动。
              <br /><br />
              <span className="text-sm text-muted-foreground/70">（为保护隐私，文中人物均为化名）</span>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 精选故事 */}
      {featuredStory && (
        <section className="py-16 bg-warm-100">
          <div className="container mx-auto px-6">
            <AnimatedSection className="max-w-5xl mx-auto" animation="scale">
              <div className="bg-white rounded-2xl overflow-hidden shadow-warm card-hover">
                <div className="grid md:grid-cols-2">
                  <div className="h-64 md:h-auto bg-gradient-to-br from-primary/20 to-lotus-light/30 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-7xl mb-2">{featuredStory.emoji}</div>
                      <Heart className="w-12 h-12 text-primary/30 mx-auto" />
                    </div>
                  </div>
                  <div className="p-8">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-3">
                      精选故事
                    </span>
                    <h2 className="text-2xl font-bold mb-4">{featuredStory.title}</h2>
                    <p className="text-muted-foreground mb-4">{featuredStory.summary}</p>
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-6">
                      "{featuredStory.quote}"
                      <footer className="mt-2 text-primary not-italic text-sm font-medium">— {featuredStory.patient}</footer>
                    </blockquote>
                    <button
                      onClick={() => setSelectedStory(featuredStory)}
                      className="text-primary font-medium hover:underline inline-flex items-center gap-1 link-underline"
                    >
                      阅读完整故事 →
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* 故事列表 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">更多故事</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </AnimatedSection>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <StoryCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <StaggeredList 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
              staggerDelay={100}
            >
              {stories.filter((s) => !s.featured).map((story) => (
                <article
                  key={story.id}
                  className={cn(
                    "bg-warm-50 rounded-xl p-6 cursor-pointer card-hover",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                  onClick={() => setSelectedStory(story)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedStory(story)}
                  role="button"
                  aria-label={`阅读故事：${story.title}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{story.emoji}</span>
                    <span className="text-sm text-muted-foreground">{story.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{story.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{story.summary}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{story.patient}，{story.age}岁</span>
                    <span className="text-primary font-medium">阅读更多 →</span>
                  </div>
                </article>
              ))}
            </StaggeredList>
          )}
        </div>
      </section>

      {/* 家属感言 */}
      <section className="py-16 bg-warm-100">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">家属感言</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </AnimatedSection>
          <AnimatedSection className="max-w-3xl mx-auto" delay={200}>
            <div className="bg-white rounded-2xl p-8 shadow-warm relative group">
              <Quote className="w-12 h-12 text-primary/10 absolute top-6 left-6" />
              <Quote className="w-12 h-12 text-primary/10 absolute bottom-6 right-6 rotate-180" />
              
              <div 
                className={cn(
                  "text-center py-4 transition-all duration-500",
                  isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                )}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-warm-100 rounded-full flex items-center justify-center text-3xl">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <p className="text-lg text-muted-foreground italic mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <p className="font-semibold">{testimonials[currentTestimonial].author}</p>
                <p className="text-sm text-muted-foreground">{testimonials[currentTestimonial].relation}</p>
              </div>
              
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handlePrevTestimonial}
                  className={cn(
                    "w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center",
                    "hover:bg-primary hover:text-white transition-all",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                  aria-label="上一条感言"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextTestimonial}
                  className={cn(
                    "w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center",
                    "hover:bg-primary hover:text-white transition-all",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                  aria-label="下一条感言"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 故事详情弹窗 */}
      {selectedStory && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in-up"
          onClick={() => setSelectedStory(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-title"
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <span className="text-primary text-sm font-medium">{selectedStory.date}</span>
              <button 
                onClick={() => setSelectedStory(null)} 
                className={cn(
                  "p-2 rounded-full hover:bg-warm-100 transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
                aria-label="关闭"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedStory.emoji}</span>
                <div>
                  <h2 id="story-title" className="text-2xl font-bold">{selectedStory.title}</h2>
                  <p className="text-muted-foreground">{selectedStory.patient}，{selectedStory.age}岁</p>
                </div>
              </div>
              <div className="prose prose-warm max-w-none">
                {selectedStory.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground mb-4 leading-relaxed">{paragraph}</p>
                ))}
              </div>
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mt-6 bg-warm-50 py-3 pr-4 rounded-r-lg">
                "{selectedStory.quote}"
                <footer className="mt-2 text-primary not-italic text-sm font-medium">— {selectedStory.patient}</footer>
              </blockquote>
              <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                服务义工：{selectedStory.volunteer}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <AnimatedSection>
        <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-4">每一个生命都值得被温柔以待</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              如果您想成为这些故事中的一员，用爱心陪伴生命的最后时光，欢迎加入我们
            </p>
            <Link
              to="/join"
              className={cn(
                "inline-flex items-center gap-2 px-8 py-3",
                "bg-primary text-white rounded-full font-medium",
                "hover:bg-primary/90 transition-all shadow-warm btn-press",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              )}
            >
              <Heart className="w-5 h-5" />
              成为义工
            </Link>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
