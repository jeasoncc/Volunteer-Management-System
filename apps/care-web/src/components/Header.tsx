import { useState } from 'react';
import { Link } from '@tanstack/react-router';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-[#e0d4bf] bg-[#f5ecdd]/90 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#d9b37c]" />
          <div>
            <div className="text-sm font-semibold tracking-wide text-[#6b4a2b]">
              莲花生命关怀
            </div>
            <div className="text-xs text-[#8a6a46]">志愿者服务 · 生命陪伴</div>
          </div>
        </div>

        {/* 桌面端导航 */}
        <nav className="hidden gap-6 text-sm text-[#6b4a2b] md:flex">
          <Link to="/" className="[&.active]:font-medium hover:text-[#a0672a]">
            首页
          </Link>
          <Link to="/about" className="[&.active]:font-medium hover:text-[#a0672a]">
            关于我们
          </Link>
          <Link to="/services" className="[&.active]:font-medium hover:text-[#a0672a]">
            志愿服务
          </Link>
          <Link to="/stories" className="[&.active]:font-medium hover:text-[#a0672a]">
            项目故事
          </Link>
          <Link to="/news" className="[&.active]:font-medium hover:text-[#a0672a]">
            新闻动态
          </Link>
          <Link to="/join" className="[&.active]:font-medium hover:text-[#a0672a]">
            加入我们
          </Link>
          <Link to="/donate" className="[&.active]:font-medium hover:text-[#a0672a]">
            捐赠支持
          </Link>
          <Link to="/contact" className="[&.active]:font-medium hover:text-[#a0672a]">
            联系我们
          </Link>
        </nav>

        {/* 移动端菜单按钮 */}
        <button 
          className="md:hidden text-[#6b4a2b]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="切换菜单"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#f5ecdd] border-t border-[#e0d4bf] absolute w-full shadow-lg">
          <nav className="flex flex-col py-2">
            <Link 
              to="/" 
              className="px-4 py-3 text-[#6b4a2b] hover:bg-[#f1e4cf] border-b border-[#e0d4bf]"
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </Link>
            <Link 
              to="/about" 
              className="px-4 py-3 text-[#6b4a2b] hover:bg-[#f1e4cf] border-b border-[#e0d4bf]"
              onClick={() => setIsMenuOpen(false)}
            >
              关于我们
            </Link>
            <Link 
              to="/services" 
              className="px-4 py-3 text-[#6b4a2b] hover:bg-[#f1e4cf] border-b border-[#e0d4bf]"
              onClick={() => setIsMenuOpen(false)}
            >
              志愿服务
            </Link>
            <Link 
              to="/stories" 
              className="px-4 py-3 text-[#6b4a2b] hover:bg-[#f1e4cf] border-b border-[#e0d4bf]"
              onClick={() => setIsMenuOpen(false)}
            >
              项目故事
            </Link>
            <Link 
              to="/news" 
              className="px-4 py-3 text-[#6b4a2b] hover:bg-[#f1e4cf] border-b border-[#e0d4bf]"
              onClick={() => setIsMenuOpen(false)}
            >
              新闻动态
            </Link>
            <Link 
              to="/join" 
              className="px-4 py-3 text-[#6b4a2b] hover:bg-[#f1e4cf] border-b border-[#e0d4bf]"
              onClick={() => setIsMenuOpen(false)}
            >
              加入我们
            </Link>
            <Link 
              to="/donate" 
              className="px-4 py-3 text-[#6b4a2b] hover:bg-[#f1e4cf] border-b border-[#e0d4bf]"
              onClick={() => setIsMenuOpen(false)}
            >
              捐赠支持
            </Link>
            <Link 
              to="/contact" 
              className="px-4 py-3 text-[#6b4a2b] hover:bg-[#f1e4cf]"
              onClick={() => setIsMenuOpen(false)}
            >
              联系我们
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}