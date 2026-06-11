export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  categoryId: string;
  tags: string[];
  author: string;
  publishedAt: any; // Firestore Timestamp
  updatedAt: any;
  status: 'draft' | 'published';
  readingTime: number;
  viewCount: number;
  isFeatured?: boolean;
  isHero?: boolean;
  seo?: {
    title: string;
    description: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface AppSetting {
  siteName: string;
  siteDescription: string;
  adSensePublisherId: string;
  adSenseCode: string;
  adsEnabled: boolean;
  newsletterMailchimpUrl?: string;
  logo?: string;
}

export interface Analytics {
  id: string; // date string yyyy-mm-dd
  views: number;
  referrers: Record<string, number>;
}
