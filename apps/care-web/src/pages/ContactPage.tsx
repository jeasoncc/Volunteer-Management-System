import { useState } from 'react';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { AnimatedSection, StaggeredList } from '../components/ui/AnimatedSection';
import { Input, Textarea, Select } from '../components/ui/Input';
import { LoadingButton } from '../components/ui/LoadingButton';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

const contactInfo = [
  {
    icon: MapPin,
    title: '地址',
    content: '深圳市龙岗区慈海医院福慧园七栋一楼',
    link: 'https://maps.google.com',
  },
  {
    icon: Phone,
    title: '服务热线',
    content: '0755-12345678',
    link: 'tel:0755-12345678',
  },
  {
    icon: Mail,
    title: '邮箱',
    content: 'contact@lianhuazhai.org',
    link: 'mailto:contact@lianhuazhai.org',
  },
  {
    icon: Clock,
    title: '服务时间',
    content: '每天 8:00 - 20:00（紧急服务24小时）',
  },
];

const socialLinks = [
  { name: '微信公众号', id: 'LianhuaCare', desc: '关注获取最新资讯' },
  { name: '微信服务号', id: 'LianhuaService', desc: '在线咨询和预约' },
];

const subjectOptions = [
  { value: '', label: '请选择' },
  { value: 'service', label: '服务咨询' },
  { value: 'volunteer', label: '义工申请' },
  { value: 'cooperation', label: '合作洽谈' },
  { value: 'donation', label: '捐赠咨询' },
  { value: 'other', label: '其他' },
];

export function ContactPage() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号码';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    if (!formData.subject) {
      newErrors.subject = '请选择主题';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = '请输入留言内容';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('error', '请检查表单填写是否正确');
      return;
    }
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Message submitted:', formData);
    setLoading(false);
    setSubmitted(true);
    addToast('success', '留言已发送，我们会尽快回复您！');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="联系我们 | 莲花生命关怀" />
      <PageHeader title="联系我们" subtitle="无论多远，心与心总有一条路相连。" breadcrumbs={[{ label: '联系我们' }]} />

      {/* 联系方式 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <StaggeredList 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto"
            staggerDelay={100}
          >
            {contactInfo.map((item) => (
              <div key={item.title} className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <item.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                {item.link ? (
                  <a 
                    href={item.link} 
                    className={cn(
                      "text-muted-foreground hover:text-primary transition-colors text-sm",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    )}
                  >
                    {item.content}
                  </a>
                ) : (
                  <p className="text-muted-foreground text-sm">{item.content}</p>
                )}
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* 地图和表单 */}
      <section className="py-20 bg-warm-100">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* 地图 */}
            <AnimatedSection animation="fadeLeft">
              <h2 className="text-2xl font-bold mb-6">我们的位置</h2>
              <div className="bg-warm-200 rounded-2xl h-80 flex items-center justify-center overflow-hidden img-placeholder">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <p className="font-medium">深圳市龙岗区</p>
                  <p className="text-sm">慈海医院福慧园七栋一楼</p>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-primary hover:underline text-sm link-underline"
                  >
                    在地图中查看 →
                  </a>
                </div>
              </div>

              {/* 交通指引 */}
              <div className="mt-8 bg-white rounded-xl p-6 shadow-warm card-hover">
                <h3 className="font-semibold mb-4">交通指引</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">地铁：</strong>乘坐3号线至龙城广场站，B出口步行约10分钟</p>
                  <p><strong className="text-foreground">公交：</strong>乘坐M361、M447至慈海医院站下车</p>
                  <p><strong className="text-foreground">自驾：</strong>导航至"慈海医院"，院内有停车场</p>
                </div>
              </div>
            </AnimatedSection>

            {/* 留言表单 */}
            <AnimatedSection animation="fadeRight" delay={200}>
              <h2 className="text-2xl font-bold mb-6">在线留言</h2>
              {submitted ? (
                <div className="text-center py-12 bg-green-50 rounded-2xl">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">留言已发送</h3>
                  <p className="text-muted-foreground">感谢您的留言！我们会尽快回复您。</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-warm space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="姓名"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="您的姓名"
                      error={errors.name}
                    />
                    <Input
                      label="手机号码"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="您的手机号码"
                      error={errors.phone}
                    />
                  </div>

                  <Input
                    label="邮箱"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="您的邮箱"
                    error={errors.email}
                  />

                  <Select
                    label="主题"
                    required
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    options={subjectOptions}
                    error={errors.subject}
                  />

                  <Textarea
                    label="留言内容"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="请输入您想咨询的内容..."
                    error={errors.message}
                  />

                  <LoadingButton
                    type="submit"
                    loading={loading}
                    className="w-full"
                    size="lg"
                    icon={<Send className="w-5 h-5" />}
                  >
                    发送留言
                  </LoadingButton>
                </form>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 社交媒体 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-8">关注我们</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {socialLinks.map((social) => (
                <div 
                  key={social.name} 
                  className="bg-warm-50 rounded-xl p-6 flex items-center gap-4 card-hover"
                >
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">{social.name}</h3>
                    <p className="text-primary text-sm">{social.id}</p>
                    <p className="text-muted-foreground text-xs mt-1">{social.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 紧急联系 */}
      <AnimatedSection animation="scale">
        <section className="py-12 bg-red-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-xl font-bold text-red-700 mb-2">紧急服务热线</h3>
              <p className="text-red-600 mb-4">如有紧急情况需要助念或临终关怀服务，请拨打：</p>
              <a
                href="tel:0755-12345678"
                className={cn(
                  "inline-flex items-center gap-2 text-2xl font-bold text-red-700 hover:text-red-800",
                  "animate-pulse-soft",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg px-4 py-2"
                )}
              >
                <Phone className="w-6 h-6" />
                0755-12345678
              </a>
              <p className="text-red-500 text-sm mt-2">24小时服务</p>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
