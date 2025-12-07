import { Link } from '@tanstack/react-router';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';
import { Heart, Users, Award, Calendar, Target, Eye, Sparkles } from 'lucide-react';
import { AnimatedSection, StaggeredList } from '../components/ui/AnimatedSection';
import { cn } from '../lib/utils';

const milestones = [
  { year: '2018', title: '创立初心', desc: '莲花生命关怀在深圳成立，开始临终关怀服务探索' },
  { year: '2019', title: '团队成长', desc: '首批专业义工培训完成，服务团队初具规模' },
  { year: '2020', title: '服务拓展', desc: '与多家医院建立合作，服务范围扩大' },
  { year: '2021', title: '专业认证', desc: '获得临终关怀服务专业资质认证' },
  { year: '2022', title: '社区深耕', desc: '建立社区服务网络，服务更多家庭' },
  { year: '2023', title: '数字化升级', desc: '引入智能管理系统，提升服务效率' },
  { year: '2024', title: '持续发展', desc: '累计服务超过1000个家庭，义工团队突破200人' },
];

const teamMembers = [
  { name: '释慧明法师', role: '创始人 · 精神导师', desc: '二十年佛学修行，致力于生命关怀事业', emoji: '🙏' },
  { name: '张慈心', role: '执行总监', desc: '资深社工，十年临终关怀经验', emoji: '👩‍💼' },
  { name: '李善缘', role: '培训主管', desc: '心理咨询师，负责义工培训体系', emoji: '👨‍🏫' },
  { name: '王净莲', role: '服务协调', desc: '护理专业背景，统筹日常服务工作', emoji: '👩‍⚕️' },
];

const values = [
  { icon: Heart, title: '慈悲', desc: '以无条件的爱，陪伴每一个生命' },
  { icon: Users, title: '尊重', desc: '尊重生命的选择，守护最后的尊严' },
  { icon: Award, title: '专业', desc: '持续学习，提供专业的关怀服务' },
  { icon: Sparkles, title: '奉献', desc: '无私付出，传递温暖与希望' },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="关于我们 | 莲花生命关怀" />
      <PageHeader title="关于我们" subtitle="源于慈悲，行于世间。" breadcrumbs={[{ label: '关于我们' }]} />

      {/* 组织简介 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">我们是谁</h2>
              <div className="w-20 h-1 bg-primary mx-auto" />
            </AnimatedSection>
            <AnimatedSection delay={200} className="prose prose-lg mx-auto text-muted-foreground leading-relaxed space-y-6">
              <p>
                莲花生命关怀是一个致力于临终关怀服务的公益组织，成立于2018年，总部位于深圳市龙岗区。
                我们秉承佛教慈悲精神，为临终患者及其家属提供身心灵全方位的关怀与支持。
              </p>
              <p>
                我们相信，每一个生命都值得被温柔以待，每一次告别都应该充满尊严与爱。
                通过专业的培训和真诚的服务，我们帮助患者安详地走完人生最后一程，
                也帮助家属度过这段艰难的时光。
              </p>
              <p>
                多年来，我们已经服务了超过1000个家庭，培训了200多名专业义工，
                与深圳多家医院和社区建立了长期合作关系。
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 愿景使命 */}
      <section className="py-20 bg-warm-100">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <AnimatedSection animation="fadeLeft">
              <div className="bg-white rounded-2xl p-8 shadow-warm card-hover h-full">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">我们的愿景</h3>
                <p className="text-muted-foreground leading-relaxed">
                  让每一个生命都能在爱与尊严中安详离去，让临终关怀成为社会的共识，
                  让更多人理解死亡、接纳死亡，从而更好地珍惜生命。
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fadeRight" delay={200}>
              <div className="bg-white rounded-2xl p-8 shadow-warm card-hover h-full">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">我们的使命</h3>
                <p className="text-muted-foreground leading-relaxed">
                  为临终患者提供专业的身心灵关怀服务，帮助患者减轻痛苦、安详离世；
                  为家属提供心理支持和哀伤辅导，帮助他们度过艰难时期。
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 核心价值观 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">核心价值观</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </AnimatedSection>
          <StaggeredList 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto"
            staggerDelay={100}
          >
            {values.map((value) => (
              <div key={value.title} className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <value.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.desc}</p>
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* 发展历程 */}
      <section className="py-20 bg-warm-100">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">发展历程</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </AnimatedSection>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* 时间线 */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-primary/20 transform md:-translate-x-1/2" />
              
              {milestones.map((item, index) => (
                <AnimatedSection 
                  key={item.year} 
                  animation={index % 2 === 0 ? 'fadeLeft' : 'fadeRight'}
                  delay={index * 100}
                  className={cn(
                    "relative flex items-center mb-8",
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  )}
                >
                  <div className={cn(
                    "flex-1 pl-12 md:pl-0",
                    index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'
                  )}>
                    <div className="bg-white rounded-lg p-6 shadow-warm card-hover">
                      <span className="text-primary font-bold text-lg">{item.year}</span>
                      <h4 className="font-semibold mt-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm mt-2">{item.desc}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full transform md:-translate-x-1/2 z-10 ring-4 ring-white" />
                  <div className="flex-1 hidden md:block" />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 核心团队 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">核心团队</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </AnimatedSection>
          <StaggeredList 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto"
            staggerDelay={100}
          >
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center group">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-warm">
                  <span className="text-4xl">{member.emoji}</span>
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.desc}</p>
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* CTA */}
      <AnimatedSection>
        <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-4">加入我们，一起传递爱与温暖</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              无论您是想成为义工，还是希望了解更多关于临终关怀的信息，我们都欢迎您的加入
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
              <Calendar className="w-5 h-5" />
              立即加入
            </Link>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
