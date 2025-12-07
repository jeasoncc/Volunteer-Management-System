import { Link } from '@tanstack/react-router';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';
import { Heart, Users, BookOpen, Phone, Home, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { AnimatedSection, StaggeredList } from '../components/ui/AnimatedSection';
import { cn } from '../lib/utils';

const services = [
  {
    icon: Heart,
    title: '临终陪伴',
    desc: '为临终患者提供温暖的陪伴，倾听他们的心声，给予精神上的支持与慰藉。',
    features: ['一对一陪伴', '心灵对话', '情绪疏导', '生命回顾'],
    color: 'from-lotus-light to-white',
    iconBg: 'bg-lotus/20',
    iconColor: 'text-lotus',
  },
  {
    icon: BookOpen,
    title: '助念服务',
    desc: '根据患者及家属的信仰需求，提供专业的助念服务，帮助患者安详离世。',
    features: ['佛教助念', '往生开示', '临终关怀', '后事指导'],
    color: 'from-primary/10 to-white',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  {
    icon: Users,
    title: '家属支持',
    desc: '为患者家属提供心理支持和哀伤辅导，帮助他们度过艰难时期。',
    features: ['心理疏导', '哀伤辅导', '家庭支持', '后续关怀'],
    color: 'from-accent/20 to-white',
    iconBg: 'bg-accent/20',
    iconColor: 'text-accent',
  },
  {
    icon: Home,
    title: '居家关怀',
    desc: '为选择居家临终的患者提供上门服务，让患者在熟悉的环境中安详离世。',
    features: ['上门服务', '居家陪伴', '家庭指导', '紧急支援'],
    color: 'from-veggie-light/30 to-white',
    iconBg: 'bg-veggie/20',
    iconColor: 'text-veggie',
  },
];

const process = [
  { step: 1, title: '服务申请', desc: '通过电话或在线表单提交服务申请' },
  { step: 2, title: '需求评估', desc: '专业人员上门评估患者和家庭需求' },
  { step: 3, title: '方案制定', desc: '根据评估结果制定个性化服务方案' },
  { step: 4, title: '服务实施', desc: '安排专业义工提供持续的关怀服务' },
  { step: 5, title: '后续跟进', desc: '服务结束后持续关注家属心理状态' },
];

const cases = [
  {
    title: '王奶奶的最后时光',
    summary: '在义工的陪伴下，王奶奶安详地走完了人生最后一程，家属深受感动。',
    quote: '感谢莲花的义工们，让妈妈走得那么安详，我们全家都很感激。',
    author: '王奶奶的女儿',
    emoji: '🌸',
  },
  {
    title: '李先生的心愿',
    summary: '义工帮助李先生完成了与家人和解的心愿，让他没有遗憾地离开。',
    quote: '是你们帮助爸爸放下了心结，让他能够安心离去。',
    author: '李先生的儿子',
    emoji: '🕊️',
  },
  {
    title: '张阿姨的陪伴',
    summary: '独居的张阿姨在义工的陪伴下，感受到了家人般的温暖。',
    quote: '虽然我没有亲人在身边，但义工们让我感受到了爱。',
    author: '张阿姨',
    emoji: '💝',
  },
];

export function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="志愿服务 | 莲花生命关怀" />
      <PageHeader title="志愿服务" subtitle="以身为船，渡人于苦海。" breadcrumbs={[{ label: '志愿服务' }]} />

      {/* 服务理念 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <AnimatedSection className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">服务理念</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              我们相信，临终关怀不仅是对患者身体的照顾，更是对心灵的抚慰。
              通过专业的服务和真诚的陪伴，我们帮助患者在生命的最后阶段感受到爱与尊严，
              也帮助家属在失去亲人后能够健康地走出悲伤。
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 服务项目 */}
      <section className="py-20 bg-warm-100">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">服务项目</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </AnimatedSection>
          <StaggeredList 
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            staggerDelay={150}
          >
            {services.map((service) => (
              <div 
                key={service.title} 
                className={cn(
                  "bg-gradient-to-br rounded-2xl p-8 shadow-warm card-hover",
                  service.color
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-6",
                  service.iconBg
                )}>
                  <service.icon className={cn("w-7 h-7", service.iconColor)} />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* 服务流程 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">服务流程</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </AnimatedSection>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-4">
              {process.map((item, index) => (
                <AnimatedSection 
                  key={item.step} 
                  animation="scale" 
                  delay={index * 100}
                  className="relative"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold shadow-warm">
                      {item.step}
                    </div>
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  {index < process.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-full w-full">
                      <ArrowRight className="w-6 h-6 text-primary/30 mx-auto" />
                    </div>
                  )}
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 服务案例 */}
      <section className="py-20 bg-warm-100">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">服务案例</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
            <p className="text-muted-foreground mt-4">真实的故事，真挚的感动</p>
          </AnimatedSection>
          <StaggeredList 
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            staggerDelay={100}
          >
            {cases.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-warm card-hover">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{item.summary}</p>
                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground text-sm">
                  "{item.quote}"
                  <footer className="mt-2 text-primary not-italic font-medium">— {item.author}</footer>
                </blockquote>
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* 服务时间 */}
      <AnimatedSection>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 shadow-warm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">服务时间</h3>
                  <p className="text-muted-foreground mb-4">
                    我们提供全年无休的服务，紧急情况可随时联系。
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      日常服务时间：每天 8:00 - 20:00
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      紧急服务热线：24小时
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-veggie rounded-full" />
                      助念服务：根据需求随时响应
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection>
        <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-4">需要我们的服务？</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              如果您或您的家人需要临终关怀服务，请随时联系我们，我们将竭诚为您服务
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/contact"
                className={cn(
                  "inline-flex items-center gap-2 px-8 py-3",
                  "bg-primary text-white rounded-full font-medium",
                  "hover:bg-primary/90 transition-all shadow-warm btn-press",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
              >
                <Phone className="w-5 h-5" />
                联系我们
              </Link>
              <a
                href="tel:0755-12345678"
                className={cn(
                  "inline-flex items-center gap-2 px-8 py-3",
                  "border-2 border-primary text-primary rounded-full font-medium",
                  "hover:bg-primary hover:text-white transition-all btn-press",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
              >
                服务热线：0755-12345678
              </a>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
