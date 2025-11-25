import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';

export function StoriesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="生命见证 | 莲花生命关怀" />
      <PageHeader
        title="生命见证"
        subtitle="在无常的灰烬中，拾起金色的慈悲。"
        breadcrumbs={[{ label: '项目故事' }]}
      />
    </div>
  );
}