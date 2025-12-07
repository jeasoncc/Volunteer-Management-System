import { Link } from '@tanstack/react-router';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';
import { Heart, Users, BookOpen, Home, Gift, CreditCard, Smartphone, Building, CheckCircle } from 'lucide-react';
import { AnimatedSection, StaggeredList } from '../components/ui/AnimatedSection';
import { AnimatedCounter } from '../components/home/AnimatedCounter';
import { Accordion } from '../components/ui/Accordion';
import { cn } from '../lib/utils';

const donationProjects = [
  {
    icon: Heart,
    title: '临终关怀服务',
    desc: '支持义工为临终患者提供陪伴和关怀服务',
    amount: '100元可支持1次上门服务',
    raised: 85000,
    goal: 100000,
  },
  {
    icon: Users,
    title: '义工培训计划',
    desc: '资助义工参加专业培训，提升服务质量',
    amount: '500元可资助1名义工完成培训',
    raised: 42000,
    goal: 50000,
  },
  {
    icon: BookOpen,
    title: '生命教育推广',
    desc: '支持在社区和学校开展生命教育活动',
    amount: '200元可支持1场社区讲座',
    raised: 28000,
    goal: 40000,
  },
  {
    icon: Home,
    title: '居家关怀支持',
    desc: '为选择居家临终的患者提供必要的物资支持',
    amount: '300元可提供1套居家关怀物资',
    raised: 15000,
    goal: 30000,
  },
];

const donationMethods = [
  {
    icon: Smartphone,
    title: '微信支付',
    desc: '扫描二维码，快速完成捐赠',
    qrcode: true,
  },
  {
    icon: CreditCard,
    title: '银行转账',
    desc: '户名：深圳市莲花生命关怀服务中心\n开户行：中国银行深圳龙岗支行\n账号：1234 5678 9012 3456',
  },
  {
    icon: Building,
    title: '企业合作',
    desc: '欢迎企业通过CSR项目支持我们的工作，我们将提供定制化的合作方案',
  },
];

const impactStats = [
  { value: 1000, label: '服务家庭', suffix: '+' },
  { value: 200, label: '培训义工', suffix: '+' },
  { value: 50, label: '合作机构', suffix: '+' },
  { value: 100, label: '善款用于公益', suffix: '%' },
];

const faqs = [
  {
    title: '捐款如何使用？',
    content: '所有捐款将用于临终关怀服务、义工培训、生命教育推广等公益项目。我们承诺100%的善款用于公益事业，并定期公开财务报告。',
  },
  {
    title: '可以获得捐赠收据吗？',
    content: '可以。单笔捐赠满100元，我们将为您开具公益事业捐赠统一票据，可用于个人所得税抵扣。',
  },
  {
    title: '可以定向捐赠吗？',
    content: '可以。您可以选择将捐款用于特定项目，如义工培训、居家关怀等。请在捐赠时注明用途。',
  },
  {
    title: '如何了解捐款使用情况？',
    content: '我们每季度发布财务报告，详细说明善款的使用情况。您也可以通过微信公众号或官网查看项目进展。',
  },
];

const commitments = [
  '100%的善款用于公益项目，不收取任何管理费',
  '定期公开财务报告，接受社会监督',
  '为捐赠者提供正规的公益捐赠票据',
  '及时反馈项目进展和善款使用情况',
  '尊重捐赠者意愿，按指定用途使用善款',
];

export function DonatePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="捐赠支持 | 莲花生命关怀" />
      <PageHeader title="捐赠支持" subtitle="每一份善意，都是对生命的礼赞。" breadcrumbs={[{ label: '捐赠支持' }]} />

      {/* 捐赠理念 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">您的支持，让爱延续</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              莲花生命关怀是一个非营利公益组织，我们的工作完全依靠社会各界的支持。
              您的每一份捐赠，都将帮助我们为更多临终患者和家属提供关怀服务，
              让更多生命在最后时刻感受到爱与尊严。
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 影响力数据 */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {impactStats.map((stat, index) => (
              <AnimatedSection 
                key={stat.label} 
                animation="scale" 
                delay={index * 100}
                className="text-center text-white"
              >
                <div className="text-4xl font-bold mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 捐赠项目 */}
      <section className="py-20 bg-warm-100">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">捐赠项目</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
            <p className="text-muted-foreground mt-4">选择您想支持的项目</p>
          </AnimatedSection>
          <StaggeredList 
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            staggerDelay={100}
          >
            {donationProjects.map((project) => {
              const progress = Math.round((project.raised / project.goal) * 100);
              return (
                <div key={project.title} className="bg-white rounded-2xl p-6 shadow-warm card-hover">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <project.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{project.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{project.desc}</p>
                    </div>
                  </div>
                  <div className="bg-warm-100 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-accent rounded-full h-2 transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">已筹 ¥{project.raised.toLocaleString()}</span>
                    <span className="text-primary font-medium">{progress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{project.amount}</p>
                  <button className={cn(
                    "w-full mt-4 py-3 bg-primary text-white rounded-lg font-medium",
                    "hover:bg-primary/90 transition-all btn-press",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  )}>
                    支持此项目
                  </button>
                </div>
              );
            })}
          </StaggeredList>
        </div>
      </section>

      {/* 捐赠方式 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">捐赠方式</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </AnimatedSection>
          <StaggeredList 
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            staggerDelay={100}
          >
            {donationMethods.map((method) => (
              <div key={method.title} className="bg-warm-50 rounded-2xl p-6 text-center card-hover">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <method.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-3">{method.title}</h3>
                {method.qrcode ? (
                  <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <div className="w-32 h-32 bg-warm-100 mx-auto flex items-center justify-center text-muted-foreground text-sm rounded-lg img-placeholder">
                      微信二维码
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm whitespace-pre-line">{method.desc}</p>
                )}
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* 其他支持方式 */}
      <AnimatedSection>
        <section className="py-16 bg-warm-100">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">其他支持方式</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 flex items-start gap-4 shadow-warm card-hover">
                  <Gift className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">物资捐赠</h3>
                    <p className="text-muted-foreground text-sm">
                      我们接受医疗用品、关怀物资等实物捐赠。如有意向，请联系我们了解具体需求。
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 flex items-start gap-4 shadow-warm card-hover">
                  <Users className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">志愿服务</h3>
                    <p className="text-muted-foreground text-sm">
                      除了金钱捐赠，您也可以通过成为义工来支持我们的工作。您的时间和爱心同样珍贵。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* 捐赠承诺 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <AnimatedSection className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">我们的承诺</h2>
            <StaggeredList className="space-y-4" staggerDelay={100}>
              {commitments.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-green-50 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </StaggeredList>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-warm-100">
        <div className="container mx-auto px-6">
          <AnimatedSection className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">常见问题</h2>
            <Accordion items={faqs} />
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <AnimatedSection>
        <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-4">感谢您的支持</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              每一份捐赠，无论大小，都是对生命的尊重和关爱。感谢您与我们一起，让爱延续。
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="#donate"
                className={cn(
                  "inline-flex items-center gap-2 px-8 py-3",
                  "bg-primary text-white rounded-full font-medium",
                  "hover:bg-primary/90 transition-all shadow-warm btn-press",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
              >
                <Heart className="w-5 h-5" />
                立即捐赠
              </a>
              <Link
                to="/contact"
                className={cn(
                  "inline-flex items-center gap-2 px-8 py-3",
                  "border-2 border-primary text-primary rounded-full font-medium",
                  "hover:bg-primary hover:text-white transition-all btn-press",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
              >
                联系我们
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
