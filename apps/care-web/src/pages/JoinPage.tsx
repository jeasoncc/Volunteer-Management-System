import { useState } from 'react';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';
import { Heart, Clock, BookOpen, Users, CheckCircle, Send } from 'lucide-react';
import { AnimatedSection, StaggeredList } from '../components/ui/AnimatedSection';
import { Input, Textarea, Select } from '../components/ui/Input';
import { LoadingButton } from '../components/ui/LoadingButton';
import { Accordion } from '../components/ui/Accordion';
import { useToast } from '../components/ui/Toast';

const benefits = [
  { icon: Heart, title: '生命成长', desc: '在服务中体悟生命的意义，获得心灵的成长' },
  { icon: BookOpen, title: '专业培训', desc: '免费参加专业的临终关怀培训课程' },
  { icon: Users, title: '志同道合', desc: '结识一群有爱心、有情怀的伙伴' },
  { icon: Clock, title: '灵活时间', desc: '根据个人时间灵活安排服务' },
];

const requirements = [
  '年满18周岁，身心健康',
  '具有爱心和耐心，愿意帮助他人',
  '能够接受临终关怀相关培训',
  '每月至少能提供8小时服务时间',
  '尊重患者及家属的信仰和选择',
  '能够保守服务对象的隐私',
];

const trainingModules = [
  { title: '基础理论', duration: '8小时', desc: '临终关怀概念、伦理原则、服务规范' },
  { title: '沟通技巧', duration: '8小时', desc: '倾听技巧、情绪支持、非语言沟通' },
  { title: '心理支持', duration: '8小时', desc: '哀伤辅导、心理疏导、自我关怀' },
  { title: '实践演练', duration: '16小时', desc: '模拟服务、案例分析、实地见习' },
];

const faqs = [
  {
    title: '我没有医疗背景，可以成为义工吗？',
    content: '可以的。我们的义工主要提供心灵陪伴和情感支持，不需要医疗专业背景。我们会提供完整的培训课程，帮助您掌握必要的知识和技能。',
  },
  {
    title: '培训需要多长时间？',
    content: '基础培训共40小时，分为理论学习和实践演练两部分。培训通常在周末进行，为期约2个月。完成培训并通过考核后，即可正式成为义工。',
  },
  {
    title: '每月需要服务多少时间？',
    content: '我们建议每月至少服务8小时，但具体时间可以根据您的个人情况灵活安排。我们理解每个人的时间都很宝贵，会尽量配合您的时间。',
  },
  {
    title: '服务过程中会有支持吗？',
    content: '当然。每位义工都会有一位资深义工作为导师，在服务过程中提供指导和支持。我们还定期举办督导会议和分享会，帮助义工处理服务中遇到的问题。',
  },
  {
    title: '如何保护义工的心理健康？',
    content: '我们非常重视义工的心理健康。除了定期的督导和支持，我们还提供心理咨询服务，帮助义工处理服务中可能产生的情绪。同时，我们也会教授自我关怀的方法。',
  },
];

const timeOptions = [
  { value: '', label: '请选择' },
  { value: 'weekday', label: '工作日' },
  { value: 'weekend', label: '周末' },
  { value: 'both', label: '工作日和周末都可以' },
  { value: 'flexible', label: '时间灵活' },
];

export function JoinPage() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    occupation: '',
    motivation: '',
    experience: '',
    availableTime: '',
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
    
    if (!formData.age) {
      newErrors.age = '请输入年龄';
    } else if (parseInt(formData.age) < 18 || parseInt(formData.age) > 80) {
      newErrors.age = '年龄需在18-80岁之间';
    }
    
    if (!formData.motivation.trim()) {
      newErrors.motivation = '请填写申请动机';
    }
    
    if (!formData.availableTime) {
      newErrors.availableTime = '请选择可服务时间';
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
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Form submitted:', formData);
    setLoading(false);
    setSubmitted(true);
    addToast('success', '申请已提交，我们会尽快与您联系！');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="加入我们 | 莲花生命关怀" />
      <PageHeader title="加入我们" subtitle="成为一道光，温暖另一个生命。" breadcrumbs={[{ label: '加入我们' }]} />

      {/* 为什么加入 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">为什么成为义工</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </AnimatedSection>
          <StaggeredList 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto"
            staggerDelay={100}
          >
            {benefits.map((item) => (
              <div key={item.title} className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <item.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* 申请条件 */}
      <section className="py-20 bg-warm-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <AnimatedSection animation="fadeLeft">
                <h2 className="text-2xl font-bold mb-6">申请条件</h2>
                <ul className="space-y-4">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
              
              <AnimatedSection animation="fadeRight" delay={200}>
                <h2 className="text-2xl font-bold mb-6">培训内容</h2>
                <div className="space-y-4">
                  {trainingModules.map((module) => (
                    <div key={module.title} className="bg-white rounded-lg p-4 shadow-sm card-hover">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{module.title}</h4>
                        <span className="text-sm text-primary">{module.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{module.desc}</p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* 申请表单 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">义工申请</h2>
              <div className="w-20 h-1 bg-primary mx-auto" />
              <p className="text-muted-foreground mt-4">填写以下信息，我们会尽快与您联系</p>
            </AnimatedSection>

            {submitted ? (
              <AnimatedSection animation="scale">
                <div className="text-center py-12 bg-green-50 rounded-2xl">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">申请已提交</h3>
                  <p className="text-muted-foreground">感谢您的申请！我们会在3个工作日内与您联系。</p>
                </div>
              </AnimatedSection>
            ) : (
              <AnimatedSection>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="姓名"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="请输入您的姓名"
                      error={errors.name}
                    />
                    <Input
                      label="手机号码"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="请输入您的手机号码"
                      error={errors.phone}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="邮箱"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="请输入您的邮箱"
                      error={errors.email}
                    />
                    <Input
                      label="年龄"
                      type="number"
                      required
                      min={18}
                      max={80}
                      value={formData.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      placeholder="请输入您的年龄"
                      error={errors.age}
                    />
                  </div>

                  <Input
                    label="职业"
                    value={formData.occupation}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    placeholder="请输入您的职业"
                  />

                  <Textarea
                    label="申请动机"
                    required
                    rows={3}
                    value={formData.motivation}
                    onChange={(e) => handleChange('motivation', e.target.value)}
                    placeholder="请简述您想成为义工的原因"
                    error={errors.motivation}
                  />

                  <Textarea
                    label="相关经验"
                    rows={3}
                    value={formData.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                    placeholder="如有志愿服务或相关经验，请简要描述"
                  />

                  <Select
                    label="可服务时间"
                    required
                    value={formData.availableTime}
                    onChange={(e) => handleChange('availableTime', e.target.value)}
                    options={timeOptions}
                    error={errors.availableTime}
                  />

                  <LoadingButton
                    type="submit"
                    loading={loading}
                    className="w-full"
                    size="lg"
                    icon={<Send className="w-5 h-5" />}
                  >
                    提交申请
                  </LoadingButton>
                </form>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-warm-100">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">常见问题</h2>
              <div className="w-20 h-1 bg-primary mx-auto" />
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <Accordion items={faqs} />
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
