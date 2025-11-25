import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';

export function JoinPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="加入我们 | 莲花生命关怀" />
      <PageHeader title="加入我们" subtitle="成为一道光，温暖另一个生命。" breadcrumbs={[{ label: '加入我们' }]} />
    </div>
  );
}
