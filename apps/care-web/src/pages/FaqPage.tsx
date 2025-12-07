import { useState, useMemo } from 'react';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';
import { ChevronDown, Search, Phone, Mail } from 'lucide-react';
import { AnimatedSection, StaggeredList } from '../components/ui/AnimatedSection';
import { cn } from '../lib/utils';

const faqCategories = [
  {
    name: '关于服务',
    faqs: [
      {
        q: '什么是临终关怀？',
        a: '临终关怀是为生命末期患者及其家属提供的全方位照护服务，包括身体照护、心理支持、精神慰藉等，旨在帮助患者减轻痛苦、安详离世，同时帮助家属度过艰难时期。',
      },
      {
        q: '你们提供哪些服务？',
        a: '我们提供临终陪伴、助念服务、家属心理支持、哀伤辅导、居家关怀等服务。具体服务内容会根据患者和家属的需求进行个性化安排。',
      },
      {
        q: '服务是免费的吗？',
        a: '是的，我们的所有服务都是免费的。作为公益组织，我们的运营资金来自社会捐赠，不向服务对象收取任何费用。',
      },
      {
        q: '如何申请服务？',
        a: '您可以通过电话、微信或网站在线表单提交服务申请。我们会在收到申请后24小时内与您联系，了解具体情况并安排服务。',
      },
      {
        q: '服务范围覆盖哪些地区？',
        a: '目前我们的服务主要覆盖深圳市龙岗区及周边地区。如果您在其他地区，我们可以帮助您联系当地的临终关怀机构。',
      },
      {
        q: '可以指定服务时间吗？',
        a: '可以。我们会尽量配合您的时间安排。日常服务时间为每天8:00-20:00，紧急情况（如助念）可24小时响应。',
      },
    ],
  },
  {
    name: '关于义工',
    faqs: [
      {
        q: '如何成为义工？',
        a: '您可以通过网站"加入我们"页面提交申请，或直接联系我们。申请通过后，您需要参加为期约2个月的培训课程，通过考核后即可正式成为义工。',
      },
      {
        q: '成为义工有什么要求？',
        a: '基本要求包括：年满18周岁、身心健康、有爱心和耐心、能够接受培训、每月至少能提供8小时服务时间。不需要医疗专业背景。',
      },
      {
        q: '培训需要收费吗？',
        a: '不需要。我们的义工培训完全免费，包括理论课程、实践演练和督导支持。',
      },
      {
        q: '义工服务会影响工作吗？',
        a: '我们理解每个人的时间都很宝贵，会尽量配合您的时间安排。您可以选择工作日、周末或灵活时间参与服务。',
      },
      {
        q: '服务过程中会有支持吗？',
        a: '当然。每位义工都会有资深义工作为导师，提供指导和支持。我们还定期举办督导会议和分享会，帮助义工处理服务中遇到的问题。',
      },
    ],
  },
  {
    name: '关于捐赠',
    faqs: [
      {
        q: '捐款如何使用？',
        a: '所有捐款将用于临终关怀服务、义工培训、生命教育推广等公益项目。我们承诺100%的善款用于公益事业，并定期公开财务报告。',
      },
      {
        q: '可以获得捐赠收据吗？',
        a: '可以。单笔捐赠满100元，我们将为您开具公益事业捐赠统一票据，可用于个人所得税抵扣。',
      },
      {
        q: '可以定向捐赠吗？',
        a: '可以。您可以选择将捐款用于特定项目，如义工培训、居家关怀等。请在捐赠时注明用途。',
      },
      {
        q: '接受物资捐赠吗？',
        a: '接受。我们接受医疗用品、关怀物资等实物捐赠。如有意向，请联系我们了解具体需求清单。',
      },
    ],
  },
  {
    name: '关于临终关怀',
    faqs: [
      {
        q: '什么时候应该考虑临终关怀？',
        a: '当患者被诊断为生命末期（通常预期寿命在6个月以内），且治疗已无法逆转病情时，可以考虑临终关怀。越早介入，越能帮助患者和家属做好准备。',
      },
      {
        q: '临终关怀会加速死亡吗？',
        a: '不会。临终关怀的目的是提高患者生命末期的生活质量，减轻痛苦，而不是加速或延缓死亡。研究表明，接受临终关怀的患者往往能更安详地离世。',
      },
      {
        q: '家属应该如何面对亲人的离世？',
        a: '面对亲人离世是非常艰难的。我们建议：保持与患者的沟通、表达爱和感谢、尊重患者的意愿、寻求专业支持。我们的义工会陪伴您度过这段时期。',
      },
      {
        q: '如何帮助孩子理解死亡？',
        a: '与孩子谈论死亡时，应该诚实、简单、温和。使用孩子能理解的语言，允许他们表达情绪，回答他们的问题。如需要，我们可以提供专业的指导。',
      },
    ],
  },
];

export function FaqPage() {
  const [activeCategory, setActiveCategory] = useState(faqCategories[0].name);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategory = faqCategories.find((c) => c.name === activeCategory);
  
  const filteredFaqs = useMemo(() => {
    if (searchQuery) {
      return faqCategories.flatMap((c) => 
        c.faqs.filter(
          (f) => f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 f.a.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(f => ({ ...f, category: c.name }))
      );
    }
    return currentCategory?.faqs.map(f => ({ ...f, category: activeCategory })) || [];
  }, [searchQuery, activeCategory, currentCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="常见问题 | 莲花生命关怀" />
      <PageHeader title="常见问题" subtitle="每一个疑问背后，都是一份关切。" breadcrumbs={[{ label: '常见问题' }]} />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* 搜索框 */}
            <AnimatedSection className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索问题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-12 pr-4 py-4 rounded-xl border border-border",
                  "focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none",
                  "text-lg transition-all duration-300",
                  "placeholder:text-muted-foreground"
                )}
              />
            </AnimatedSection>

            {/* 分类标签 */}
            {!searchQuery && (
              <AnimatedSection delay={100} className="flex flex-wrap gap-2 mb-8">
                {faqCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      setExpandedFaq(null);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 btn-press",
                      activeCategory === cat.name
                        ? "bg-primary text-white shadow-warm"
                        : "bg-warm-100 text-muted-foreground hover:bg-warm-200"
                    )}
                  >
                    {cat.name}
                    <span className="ml-1 text-xs opacity-70">
                      ({faqCategories.find(c => c.name === cat.name)?.faqs.length})
                    </span>
                  </button>
                ))}
              </AnimatedSection>
            )}

            {/* 搜索结果提示 */}
            {searchQuery && (
              <AnimatedSection className="mb-4 text-sm text-muted-foreground">
                找到 {filteredFaqs.length} 个相关问题
              </AnimatedSection>
            )}

            {/* FAQ 列表 */}
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <AnimatedSection className="text-center py-12">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-muted-foreground">没有找到相关问题</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    试试其他关键词，或直接联系我们
                  </p>
                </AnimatedSection>
              ) : (
                <StaggeredList staggerDelay={50}>
                  {filteredFaqs.map((faq, index) => {
                    const key = `${faq.category}-${index}`;
                    const isExpanded = expandedFaq === key;
                    return (
                      <div 
                        key={key} 
                        className={cn(
                          "bg-warm-50 rounded-xl overflow-hidden",
                          "transition-all duration-300",
                          isExpanded && "shadow-warm"
                        )}
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : key)}
                          className={cn(
                            "w-full px-6 py-4 flex items-center justify-between text-left",
                            "hover:bg-warm-100 transition-colors duration-200",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                          )}
                          aria-expanded={isExpanded}
                        >
                          <div className="flex-1 pr-4">
                            {searchQuery && (
                              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full mr-2">
                                {faq.category}
                              </span>
                            )}
                            <span className="font-medium text-foreground">{faq.q}</span>
                          </div>
                          <ChevronDown 
                            className={cn(
                              "w-5 h-5 flex-shrink-0 transition-all duration-300",
                              isExpanded ? "rotate-180 text-primary" : "text-muted-foreground"
                            )} 
                          />
                        </button>
                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-300 ease-out",
                            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                          )}
                        >
                          <div className="px-6 pb-4 text-muted-foreground leading-relaxed">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </StaggeredList>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 联系我们 */}
      <AnimatedSection>
        <section className="py-16 bg-warm-100">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">没有找到答案？</h2>
              <p className="text-muted-foreground mb-8">
                如果您的问题没有在上面找到答案，欢迎直接联系我们
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="tel:0755-12345678"
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3",
                    "bg-primary text-white rounded-full font-medium",
                    "hover:bg-primary/90 transition-all shadow-warm btn-press",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  )}
                >
                  <Phone className="w-5 h-5" />
                  0755-12345678
                </a>
                <a
                  href="mailto:contact@lianhuazhai.org"
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3",
                    "border-2 border-primary text-primary rounded-full font-medium",
                    "hover:bg-primary hover:text-white transition-all btn-press",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  )}
                >
                  <Mail className="w-5 h-5" />
                  发送邮件
                </a>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
