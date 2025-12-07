import { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';
import { Calendar, Tag, ArrowRight, Search } from 'lucide-react';
import { AnimatedSection, StaggeredList } from '../components/ui/AnimatedSection';
import { NewsCardSkeleton } from '../components/ui/Skeleton';
import { LoadingButton } from '../components/ui/LoadingButton';
import { cn } from '../lib/utils';

const categories = ['全部', '活动资讯', '培训动态', '媒体报道', '公告通知'];

const newsItems = [
  {
    id: 1,
    title: '2024年度义工表彰大会圆满举行',
    summary: '12月15日，莲花生命关怀2024年度义工表彰大会在深圳举行，表彰了50名优秀义工...',
    date: '2024-12-15',
    category: '活动资讯',
    image: '/images/news/award.jpg',
    featured: true,
  },
  {
    id: 2,
    title: '第28期义工培训班开始报名',
    summary: '新一期义工培训班将于2025年1月开班，欢迎有爱心的朋友报名参加...',
    date: '2024-12-10',
    category: '培训动态',
    image: '/images/news/training.jpg',
  },
  {
    id: 3,
    title: '深圳电视台专题报道我们的服务',
    summary: '深圳电视台《民生关注》栏目对莲花生命关怀进行了专题报道，引起社会广泛关注...',
    date: '2024-12-05',
    category: '媒体报道',
    image: '/images/news/media.jpg',
  },
  {
    id: 4,
    title: '与龙岗区民政局签署合作协议',
    summary: '莲花生命关怀与龙岗区民政局正式签署合作协议，将在社区临终关怀服务方面深入合作...',
    date: '2024-11-28',
    category: '活动资讯',
    image: '/images/news/cooperation.jpg',
  },
  {
    id: 5,
    title: '2024年冬季义工团建活动通知',
    summary: '为增进义工之间的交流，定于12月22日举办冬季团建活动，请各位义工踊跃报名...',
    date: '2024-11-20',
    category: '公告通知',
    image: '/images/news/team.jpg',
  },
  {
    id: 6,
    title: '临终关怀知识讲座走进社区',
    summary: '11月份，我们在龙岗区5个社区举办了临终关怀知识讲座，普及生命教育理念...',
    date: '2024-11-15',
    category: '活动资讯',
    image: '/images/news/lecture.jpg',
  },
  {
    id: 7,
    title: '第27期义工培训班顺利结业',
    summary: '经过两个月的系统培训，第27期义工培训班30名学员顺利结业，正式加入服务团队...',
    date: '2024-11-10',
    category: '培训动态',
    image: '/images/news/graduation.jpg',
  },
  {
    id: 8,
    title: '关于调整服务预约流程的通知',
    summary: '为提升服务效率，自12月1日起，服务预约流程将进行优化调整，详情请查看...',
    date: '2024-11-05',
    category: '公告通知',
    image: '/images/news/notice.jpg',
  },
];

export function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 模拟加载
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredNews = newsItems.filter((item) => {
    const matchCategory = activeCategory === '全部' || item.category === activeCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const featuredNews = newsItems.find((item) => item.featured);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingMore(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="新闻动态 | 莲花生命关怀" />
      <PageHeader title="新闻动态" subtitle="记录每一次爱的回响。" breadcrumbs={[{ label: '新闻动态' }]} />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          {/* 搜索和筛选 */}
          <AnimatedSection className="max-w-5xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* 分类筛选 */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 btn-press',
                      activeCategory === cat
                        ? 'bg-primary text-white shadow-warm'
                        : 'bg-warm-100 text-muted-foreground hover:bg-warm-200'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* 搜索框 */}
              <div className="relative w-full md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="搜索新闻..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-2 rounded-full border border-border',
                    'focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none',
                    'transition-all duration-300'
                  )}
                />
              </div>
            </div>
          </AnimatedSection>

          {/* 置顶新闻 */}
          {featuredNews && activeCategory === '全部' && !searchQuery && (
            <AnimatedSection className="max-w-5xl mx-auto mb-12" animation="scale">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl overflow-hidden card-hover">
                <div className="grid md:grid-cols-2 gap-8 p-8">
                  <div className="bg-warm-200 rounded-xl h-64 flex items-center justify-center img-placeholder">
                    <span className="text-muted-foreground">置顶新闻图片</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="inline-flex items-center gap-1 text-primary text-sm mb-2">
                      <Tag className="w-4 h-4" />
                      {featuredNews.category}
                    </span>
                    <h2 className="text-2xl font-bold mb-4">{featuredNews.title}</h2>
                    <p className="text-muted-foreground mb-4">{featuredNews.summary}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredNews.date}
                      </span>
                      <a 
                        href={`/news/${featuredNews.id}`} 
                        className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all link-underline"
                      >
                        阅读全文 <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* 新闻列表 */}
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredNews.length === 0 ? (
              <AnimatedSection className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-muted-foreground">没有找到相关新闻</p>
              </AnimatedSection>
            ) : (
              <StaggeredList 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                staggerDelay={100}
              >
                {filteredNews.filter(n => !n.featured || activeCategory !== '全部' || searchQuery).map((item) => (
                  <article 
                    key={item.id} 
                    className="bg-white rounded-xl shadow-sm overflow-hidden group card-hover"
                  >
                    <div className="h-48 bg-warm-200 flex items-center justify-center img-placeholder relative overflow-hidden">
                      <span className="text-muted-foreground text-sm">新闻图片</span>
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {item.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{item.summary}</p>
                      <a 
                        href={`/news/${item.id}`} 
                        className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        阅读更多 <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </article>
                ))}
              </StaggeredList>
            )}

            {/* 加载更多 */}
            {filteredNews.length > 0 && !loading && (
              <AnimatedSection className="text-center mt-12" delay={300}>
                <LoadingButton
                  variant="outline"
                  loading={loadingMore}
                  onClick={handleLoadMore}
                >
                  加载更多
                </LoadingButton>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
