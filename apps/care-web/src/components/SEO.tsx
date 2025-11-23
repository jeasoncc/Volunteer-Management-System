import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
}

export function SEO({
  title = '莲花生命关怀志愿者官网',
  description = '莲花生命关怀志愿者团队，面向临终关怀、重症陪护、家属支持等场景，以温柔、稳定、可信赖的陪伴，守护生命最后一段路程中的安宁与尊严。',
  keywords = '莲花生命关怀, 志愿者, 临终关怀, 生命陪伴, 重症陪护, 家属支持',
  author = '莲花生命关怀志愿者团队',
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
}: SEOProps) {
  const location = useLocation();
  const baseUrl = 'https://www.lotuscare.org'; // 实际部署时需要替换为真实域名
  const currentUrl = `${baseUrl}${location.pathname}`;

  useEffect(() => {
    // 更新标题
    document.title = title;

    // 更新meta标签
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: author },
      { property: 'og:title', content: ogTitle || title },
      { property: 'og:description', content: ogDescription || description },
      { property: 'og:image', content: ogImage || `${baseUrl}/images/og-image.jpg` },
      { property: 'og:url', content: ogUrl || currentUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: '莲花生命关怀' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: ogTitle || title },
      { name: 'twitter:description', content: ogDescription || description },
      { name: 'twitter:image', content: ogImage || `${baseUrl}/images/og-image.jpg` },
    ];

    metaTags.forEach(tag => {
      const attributeName = tag.name ? 'name' : 'property';
      const attributeValue = tag.name || tag.property || '';
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });

    // 更新canonical链接
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

  }, [title, description, keywords, author, ogTitle, ogDescription, ogImage, ogUrl, currentUrl]);

  return null;
}