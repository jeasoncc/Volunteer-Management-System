import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="关于我们 | 莲花生命关怀" />
      <PageHeader title="关于我们" subtitle="源于慈悲，行于世间。" breadcrumbs={[{ label: '关于我们' }]} />
    </div>
  );
}
