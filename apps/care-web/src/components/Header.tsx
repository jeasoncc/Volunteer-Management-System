import { Link } from '@tanstack/react-router';
import { Menu, X, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '关于我们', href: '/about' },
    { name: '志愿服务', href: '/services' },
    { name: '项目故事', href: '/stories' },
    { name: '新闻动态', href: '/news' },
    { name: '加入我们', href: '/join' },
    { name: '捐赠支持', href: '/donate' },
    { name: '联系我们', href: '/contact' },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-background/80 backdrop-blur-md border-white/10 py-3" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:bg-primary group-hover:text-black transition-colors duration-500">
            <Heart className="w-5 h-5 text-primary group-hover:text-black transition-colors" fill="currentColor" />
          </div>
          <div>
            <div className="font-['Cinzel'] font-bold text-lg tracking-wider text-foreground">LOTUS CARE</div>
            <div className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Volunteers</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors tracking-wide relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-foreground p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 bg-background z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 lg:hidden",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none pointer-events-none"
        )}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            onClick={() => setIsMenuOpen(false)}
            className="text-2xl font-['Cinzel'] text-foreground hover:text-primary transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
