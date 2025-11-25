import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';

export function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="志愿服务 | 莲花生命关怀" />
      <PageHeader title="志愿服务" subtitle="以身为船，渡人于苦海。" breadcrumbs={[{ label: '志愿服务' }]} />
    </div>
  );
}
