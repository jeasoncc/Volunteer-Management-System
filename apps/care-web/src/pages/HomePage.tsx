import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { SEO } from '../components/SEO';
import { Heart, Users, Clock, Utensils, ArrowRight, Leaf, HandHeart, Sun } from 'lucide-react';
import { getVolunteerStats, VolunteerStats } from '../lib/api';
import { Testimonials } from '../components/home/Testimonials';
import { LatestNews } from '../components/home/LatestNews';
import { WechatQR } from '../components/home/WechatQR';
import { ImageGallery } from '../components/home/ImageGallery';
import { AnimatedCounter } from '../components/home/AnimatedCounter';
import { AnimatedSection, StaggeredList } from '../components/ui/AnimatedSection';
import { StatsCardSkeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/utils';

export default function HomePage() {
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVolunteerStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-warm-gradient text-foreground">
      <SEO />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5ede0]/50 to-transparent" />
        {/* 装饰元素 */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-lotus/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-6 relative">
          <AnimatedSection animation="blur" className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2d2a26]">
              <span className="text-gradient-animate">用爱陪伴</span>，用心服务
            </h1>
            <p className="text-lg text-[#6b6560] mb-8">
              生命关怀 · 斋饭布施 · 温暖每一个有缘人
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/join"
                className={cn(
                  "px-8 py-3 bg-primary text-white rounded-full font-medium",
                  "hover:bg-primary/90 transition-all shadow-warm hover:shadow-warm-lg",
                  "inline-flex items-center gap-2 btn-press ripple"
                )}
              >
                加入我们
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/services"
                className={cn(
                  "px-8 py-3 border-2 border-primary text-primary rounded-full font-medium",
                  "hover:bg-primary hover:text-white transition-all btn-press"
                )}
              >
                了解服务
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 核心服务亮点 */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* 生命关怀 */}
            <AnimatedSection animation="fadeLeft" delay={100}>
              <div className="bg-gradient-to-br from-[#fdf5f5] to-[#faf8f5] rounded-2xl p-6 shadow-warm card-hover h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Heart className="w-6 h-6 text-[#e8b4b8]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2d2a26]">生命关怀</h3>
                    <p className="text-[#6b6560] text-sm">临终陪伴 · 助念服务</p>
                  </div>
                </div>
                <p className="text-[#6b6560] text-sm mb-3">
                  为临终患者及家属提供专业关怀，陪伴生命最后一程。
                </p>
                <Link to="/services" className="text-primary text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all link-underline">
                  了解更多 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </AnimatedSection>

            {/* 斋饭布施 */}
            <AnimatedSection animation="fadeRight" delay={200}>
              <div className="bg-gradient-to-br from-[#e8f5e9] to-[#f1f8e9] rounded-2xl p-6 shadow-warm card-hover h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Utensils className="w-6 h-6 text-[#7cb342]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2d2a26]">斋饭布施</h3>
                    <p className="text-[#6b6560] text-sm">每日1,500份免费素食</p>
                  </div>
                </div>
                <p className="text-[#6b6560] text-sm mb-3">
                  每天为社区提供免费素食，欢迎所有人前来用餐。
                </p>
                <Link to="/about" className="text-[#7cb342] text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all link-underline">
                  了解更多 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 实时数据统计 */}
      <section className="py-16 bg-[#f5ede0]">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#2d2a26] mb-2">服务数据</h2>
            <p className="text-[#6b6560]">真实记录，持续更新</p>
          </AnimatedSection>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {loading ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : (
              <>
                <AnimatedSection animation="scale" delay={0}>
                  <div className="bg-white rounded-2xl p-6 text-center shadow-warm card-hover">
                    <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-1">
                      <AnimatedCounter end={stats?.totalVolunteers || 200} suffix="+" />
                    </div>
                    <div className="text-sm text-warm-600">注册义工</div>
                  </div>
                </AnimatedSection>
                
                <AnimatedSection animation="scale" delay={100}>
                  <div className="bg-white rounded-2xl p-6 text-center shadow-warm card-hover">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#e8b4b8]/20 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-[#e8b4b8]" />
                    </div>
                    <div className="text-3xl font-bold text-[#d4848a] mb-1">
                      <AnimatedCounter end={1000} suffix="+" />
                    </div>
                    <div className="text-sm text-warm-600">服务家庭</div>
                  </div>
                </AnimatedSection>
                
                <AnimatedSection animation="scale" delay={200}>
                  <div className="bg-white rounded-2xl p-6 text-center shadow-warm card-hover">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#7cb342]/10 rounded-full flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-[#7cb342]" />
                    </div>
                    <div className="text-3xl font-bold text-[#7cb342] mb-1">
                      <AnimatedCounter end={1500} />
                    </div>
                    <div className="text-sm text-warm-600">每日斋饭</div>
                  </div>
                </AnimatedSection>
                
                <AnimatedSection animation="scale" delay={300}>
                  <div className="bg-white rounded-2xl p-6 text-center shadow-warm card-hover">
                    <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-1">
                      <AnimatedCounter end={stats?.totalServiceHours || 12000} suffix="+" />
                    </div>
                    <div className="text-sm text-warm-600">服务时长(小时)</div>
                  </div>
                </AnimatedSection>
              </>
            )}
          </div>
          
          <AnimatedSection delay={400} className="text-center mt-8">
            <Link
              to="/stats"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              查看实时数据 <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* 斋饭服务详情 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <AnimatedSection animation="fadeLeft">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#7cb342]/10 rounded-full mb-4">
                  <Leaf className="w-4 h-4 text-[#7cb342]" />
                  <span className="text-[#7cb342] text-sm font-medium">免费素食</span>
                </div>
                <h2 className="text-2xl font-bold text-[#2d2a26] mb-3">
                  每日斋饭，欢迎用餐
                </h2>
                <p className="text-[#6b6560] mb-5">
                  每天提供1,500份免费素食，无论您是谁，都欢迎前来。
                </p>
                <div className="space-y-2 mb-5 text-[#6b6560]">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-[#7cb342]" />
                    <span>时间：每日 11:00 - 13:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#7cb342]" />
                    <span>菜品：时令蔬菜、豆制品、米饭、汤</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HandHeart className="w-4 h-4 text-[#7cb342]" />
                    <span>完全免费，随缘布施</span>
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7cb342] text-white rounded-full font-medium hover:bg-[#689f38] transition-colors text-sm btn-press"
                >
                  查看地址 <ArrowRight className="w-4 h-4" />
                </Link>
              </AnimatedSection>
              
              <AnimatedSection animation="fadeRight" delay={200}>
                <div className="bg-gradient-to-br from-[#e8f5e9] to-[#f1f8e9] rounded-2xl p-6 text-center">
                  <div className="text-5xl mb-3">🍚</div>
                  <div className="text-4xl font-bold text-[#7cb342] mb-1">
                    <AnimatedCounter end={1500} />
                  </div>
                  <div className="text-[#6b6560] mb-4">份 / 每日</div>
                  <div className="grid grid-cols-3 gap-3 text-center border-t border-[#7cb342]/20 pt-4">
                    <div>
                      <div className="text-xl font-bold text-[#2d2a26]">
                        <AnimatedCounter end={365} />
                      </div>
                      <div className="text-xs text-[#6b6560]">天/年</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-[#2d2a26]">54万+</div>
                      <div className="text-xs text-[#6b6560]">份/年</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-[#2d2a26]">
                        <AnimatedCounter end={6} />
                      </div>
                      <div className="text-xs text-[#6b6560]">年持续</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* 我们的服务 */}
      <section className="py-12 bg-[#faf8f5]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-8">我们做什么</h2>
            </AnimatedSection>
            <StaggeredList 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              staggerDelay={100}
            >
              <div className="bg-white p-5 rounded-2xl shadow-warm card-hover">
                <div className="text-3xl mb-2">🙏</div>
                <h3 className="font-semibold text-[#2d2a26] text-sm mb-1">临终陪伴</h3>
                <p className="text-xs text-[#6b6560]">专业关怀</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-warm card-hover">
                <div className="text-3xl mb-2">🍚</div>
                <h3 className="font-semibold text-[#2d2a26] text-sm mb-1">斋饭布施</h3>
                <p className="text-xs text-[#6b6560]">每日1500份</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-warm card-hover">
                <div className="text-3xl mb-2">📿</div>
                <h3 className="font-semibold text-[#2d2a26] text-sm mb-1">助念服务</h3>
                <p className="text-xs text-[#6b6560]">24小时响应</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-warm card-hover">
                <div className="text-3xl mb-2">💝</div>
                <h3 className="font-semibold text-[#2d2a26] text-sm mb-1">家属支持</h3>
                <p className="text-xs text-[#6b6560]">心理辅导</p>
              </div>
            </StaggeredList>
          </div>
        </div>
      </section>

      {/* 服务剪影 */}
      <ImageGallery />

      {/* 用户评价 */}
      <Testimonials />

      {/* 最新动态 */}
      <LatestNews />

      {/* 微信二维码 */}
      <WechatQR />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-[#f5ede0] to-[#e8f5e9]/50">
        <div className="container mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-[#2d2a26] mb-3">一起传递温暖</h2>
            <p className="text-[#6b6560] mb-6">加入我们，或以其他方式支持</p>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/join"
                className="px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all shadow-warm btn-press"
              >
                成为义工
              </Link>
              <Link
                to="/donate"
                className="px-6 py-2.5 bg-[#7cb342] text-white rounded-full font-medium hover:bg-[#689f38] transition-all shadow-warm btn-press"
              >
                捐赠支持
              </Link>
              <Link
                to="/contact"
                className="px-6 py-2.5 border-2 border-[#d4c4a8] text-[#6b6560] rounded-full font-medium hover:bg-white transition-all btn-press"
              >
                联系我们
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
