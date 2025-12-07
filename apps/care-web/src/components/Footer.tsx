import { Link } from '@tanstack/react-router';
import { Heart, Utensils, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#2d2a26] text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid gap-10 md:grid-cols-4 mb-12">
          {/* Logo & 简介 */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🪷</span>
              <span className="font-bold text-xl text-white">莲花生命关怀</span>
            </Link>
            <p className="text-[#a8a29e] leading-relaxed max-w-md mb-6">
              我们致力于为临终者提供最后的尊严与安宁，每日提供1,500份免费斋饭，
              以慈悲之心，温暖每一个有缘人。
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#b8860b]/20 rounded-full">
                <Heart className="w-4 h-4 text-[#b8860b]" />
                <span className="text-sm text-[#b8860b]">生命关怀</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#7cb342]/20 rounded-full">
                <Utensils className="w-4 h-4 text-[#7cb342]" />
                <span className="text-sm text-[#7cb342]">斋饭布施</span>
              </div>
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">快速链接</h4>
            <ul className="space-y-3 text-sm text-[#a8a29e]">
              <li><Link to="/about" className="hover:text-[#b8860b] transition-colors">关于我们</Link></li>
              <li><Link to="/services" className="hover:text-[#b8860b] transition-colors">志愿服务</Link></li>
              <li><Link to="/stats" className="hover:text-[#b8860b] transition-colors">实时数据</Link></li>
              <li><Link to="/stories" className="hover:text-[#b8860b] transition-colors">项目故事</Link></li>
              <li><Link to="/join" className="hover:text-[#b8860b] transition-colors">加入我们</Link></li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">联系我们</h4>
            <ul className="space-y-3 text-sm text-[#a8a29e]">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#b8860b]" />
                <span>0755-12345678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#b8860b]" />
                <span>contact@lianhuazhai.org</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#b8860b] mt-0.5" />
                <span>深圳市龙岗区慈海医院福慧园</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-[#3a3530] rounded-lg">
              <p className="text-xs text-[#7cb342]">🍚 斋饭供应时间</p>
              <p className="text-sm text-white">每日 11:00 - 13:00</p>
            </div>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="border-t border-[#3a3530] pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#6b6560]">
          <p>© 2025 莲花生命关怀. 粤ICP备XXXXXXXX号</p>
          <div className="flex gap-6">
            <Link to="/faq" className="hover:text-[#b8860b] transition-colors">常见问题</Link>
            <span>隐私政策</span>
            <span>服务条款</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
