import { SEO } from '../components/SEO';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO />
      <div className="pt-20 pb-24 text-center">
        <h1 className="font-['Cinzel'] text-5xl font-bold mb-4">凡心为舟 · 渡越无常</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          以温柔、稳定、可信赖的心，守护生命最后的尊严与安宁。
        </p>
      </div>
    </div>
  );
}
