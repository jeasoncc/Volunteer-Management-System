import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';

export function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="联系我们 | 莲花生命关怀" />
      <PageHeader title="联系我们" subtitle="无论多远，心与心总有一条路相连。" breadcrumbs={[{ label: '联系我们' }]} />
    </div>
  );
}
