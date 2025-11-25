import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';

export function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="常见问题 | 莲花生命关怀" />
      <PageHeader title="常见问题" subtitle="每一个疑问背后，都是一份关切。" breadcrumbs={[{ label: '常见问题' }]} />
    </div>
  );
}
