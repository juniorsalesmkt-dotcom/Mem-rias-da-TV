import { useParams, Link } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import ArticleCard from '../components/common/ArticleCard';
import { ChevronRight } from 'lucide-react';

export default function CategoryView() {
  const { slug } = useParams();
  const categoryName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ') : '';
  const { articles, loading } = useArticles({ categorySlug: slug }); // Simplified for now

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]"></div>
    </div>
  );

  return (
    <div className="pb-20">
      {/* Category Header */}
      <div className="bg-[#010f25] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#D4AF37]/5 skew-y-6 transform translate-y-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-4">
              <Link to="/">Home</Link>
              <ChevronRight size={12} />
              <span>Arquivo</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none mb-6">
             {categoryName}
           </h1>
           <p className="text-gray-400 font-medium text-lg max-w-2xl border-l-4 border-[#D4AF37] pl-6 py-2">
             Explore os fatos mais marcantes de <span className="text-white">{categoryName}</span> na história da televisão brasileira.
           </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        {articles.length === 0 && (
           <div className="py-32 text-center text-gray-400 font-bold uppercase tracking-widest bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
             Não encontramos artigos nesta categoria ainda.
           </div>
        )}
      </div>
    </div>
  );
}
