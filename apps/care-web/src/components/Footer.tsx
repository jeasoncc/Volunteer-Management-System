import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-white/5 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid gap-12 md:grid-cols-4 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                <Heart className="w-4 h-4 text-primary" fill="currentColor" />
              </div>
              <span className="font-['Cinzel'] font-bold text-lg tracking-wider text-foreground">LOTUS CARE</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-md mb-8">
              我们致力于为临终者提供最后的尊严与安宁，为家属提供情感支持与哀伤辅导。
              以凡人之躯，行微小善事。
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-widest text-sm">快速链接</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">关于我们</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">志愿服务</Link></li>
              <li><Link to="/stories" className="hover:text-primary transition-colors">项目故事</Link></li>
              <li><Link to="/join" className="hover:text-primary transition-colors">加入我们</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-widest text-sm">联系方式</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>Email: volunteer@lotuscare.org</li>
              <li>Tel: 400-XXX-XXXX</li>
              <li>Add: XX省XX市XX区XX路</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground/50">
          <p>© 2025 Lotus Life Care. All rights reserved.</p>
          <div className="flex gap-6">
            <span>隐私政策</span>
            <span>服务条款</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
