import { Link, useLocation } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 关闭菜单当路由变化时
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // 禁止滚动当移动菜单打开时
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: '关于我们', href: '/about' },
    { name: '志愿服务', href: '/services' },
    { name: '实时数据', href: '/stats' },
    { name: '项目故事', href: '/stories' },
    { name: '新闻动态', href: '/news' },
    { name: '加入我们', href: '/join' },
    { name: '捐赠支持', href: '/donate' },
    { name: '联系我们', href: '/contact' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled ? "bg-white/95 backdrop-blur-md border-[#e8e0d5] py-3 shadow-sm" : "bg-transparent border-transparent py-6"
      )}
      role="banner"
    >
      {/* 跳过链接 - 无障碍 */}
      <a href="#main-content" className="skip-link">
        跳到主要内容
      </a>

      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group"
          aria-label="莲花关怀 - 返回首页"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:bg-primary transition-all duration-500 group-hover:scale-110">
            <span className="text-xl" role="img" aria-hidden="true">🪷</span>
          </div>
          <div>
            <div className="font-bold text-lg tracking-wide text-[#2d2a26]">莲花关怀</div>
            <div className="text-[10px] tracking-[0.2em] text-[#6b6560] uppercase">Lotus Life Care</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6" role="navigation" aria-label="主导航">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors tracking-wide relative group",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded",
                isActive(link.href) 
                  ? "text-primary" 
                  : "text-[#6b6560] hover:text-primary"
              )}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.name}
              <span 
                className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full transition-all duration-300",
                  isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                )} 
              />
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className={cn(
            "lg:hidden text-foreground p-2 rounded-lg",
            "transition-colors duration-200",
            "hover:bg-primary/10",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? '关闭菜单' : '打开菜单'}
        >
          <div className="relative w-6 h-6">
            <Menu 
              className={cn(
                "absolute inset-0 transition-all duration-300",
                isMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
              )} 
            />
            <X 
              className={cn(
                "absolute inset-0 transition-all duration-300",
                isMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
              )} 
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 bg-[#faf8f5] z-40 flex flex-col items-center justify-center gap-6 lg:hidden",
          "transition-all duration-500 ease-out",
          isMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="导航菜单"
      >
        <nav className="flex flex-col items-center gap-6" role="navigation">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-xl font-medium transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-4 py-2",
                isActive(link.href) 
                  ? "text-primary" 
                  : "text-[#2d2a26] hover:text-primary",
                isMenuOpen 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms' }}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
