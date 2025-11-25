import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';

export function DonatePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="捐赠支持 | 莲花生命关怀" />
      <PageHeader title="捐赠支持" subtitle="每一份善意，都是对生命的礼赞。" breadcrumbs={[{ label: '捐赠支持' }]} />
    </div>
  );
}
