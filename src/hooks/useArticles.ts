import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article } from '../types';

export function useArticles(options: { 
  categorySlug?: string; 
  limitCount?: number; 
  featuredOnly?: boolean;
  status?: 'published' | 'draft';
} = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(
      collection(db, 'articles'), 
      where('status', '==', options.status || 'published')
    );

    if (options.categorySlug) {
      q = query(q, where('categoryId', '==', options.categorySlug));
    }

    if (options.featuredOnly) {
      q = query(q, where('isFeatured', '==', true));
    }

    q = query(q, orderBy('publishedAt', 'desc'));
    
    if (options.limitCount) {
      q = query(q, limit(options.limitCount));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      
      setArticles(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching articles:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [options.categorySlug, options.limitCount, options.featuredOnly, options.status]);

  return { articles, loading };
}
