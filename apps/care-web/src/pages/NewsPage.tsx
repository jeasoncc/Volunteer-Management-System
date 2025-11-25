import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';

export function NewsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="新闻动态 | 莲花生命关怀" />
      <PageHeader title="新闻动态" subtitle="记录每一次爱的回响。" breadcrumbs={[{ label: '新闻动态' }]} />
    </div>
  );
}
