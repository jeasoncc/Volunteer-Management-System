import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export function SEO({ 
  title = "莲花生命关怀 | Lotus Life Care", 
  description = "守护生命最后的尊严与安宁。面向临终关怀、重症陪护与家属支持。", 
  keywords = "莲花生命关怀, 志愿者, 临终关怀, 生命陪伴" 
}: SEOProps) {
  React.useEffect(() => {
    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords;
      document.head.appendChild(meta);
    }
  }, [title, description, keywords]);

  return null;
}
