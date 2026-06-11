import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import { Article } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ArticleCardProps {
  article: Article;
  variant?: 'large' | 'medium' | 'small' | 'horizontal';
}

export default function ArticleCard({ article, variant = 'medium' }: ArticleCardProps) {
  const publishedDate = article.publishedAt?.toDate ? article.publishedAt.toDate() : new Date(article.publishedAt);
  
  if (variant === 'large') {
    return (
      <Link to={`/artigo/${article.slug}`} className="group block relative overflow-hidden rounded-xl h-[500px]">
        <img 
          src={article.featuredImage} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#010f25] via-[#010f25]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 space-y-4">
          <span className="bg-[#D4AF37] text-[#010f25] text-xs font-black px-3 py-1 uppercase tracking-widest rounded">
            Destaque
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight uppercase tracking-tighter">
            {article.title}
          </h2>
          <p className="text-gray-300 text-lg line-clamp-2 max-w-2xl font-medium tracking-tight">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-6 text-gray-400 text-xs font-bold uppercase tracking-widest pt-2">
            <span className="flex items-center gap-2"><User size={14} className="text-[#D4AF37]" /> {article.author}</span>
            <span className="flex items-center gap-2"><Clock size={14} className="text-[#D4AF37]" /> {format(publishedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/artigo/${article.slug}`} className="group flex gap-4 items-center">
        <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
          <img 
            src={article.featuredImage} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#010f25] leading-tight group-hover:text-[#D4AF37] transition-colors uppercase tracking-tight">
            {article.title}
          </h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {format(publishedDate, "dd/MM/yyyy")}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/artigo/${article.slug}`} className="group block space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-gray-100 shadow-sm">
        <img 
          src={article.featuredImage} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
           <span className="bg-white/90 backdrop-blur-sm text-[#010f25] text-[10px] font-black px-2 py-1 uppercase tracking-widest rounded shadow-sm border border-gray-100">
            {article.categoryId}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-[#010f25] leading-tight group-hover:text-[#D4AF37] transition-colors uppercase tracking-tight md:h-[3.5rem] line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 font-medium">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest pt-2">
          <span className="flex items-center gap-1.5"><User size={12} className="text-[#D4AF37]" /> {article.author}</span>
          <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#D4AF37]" /> {format(publishedDate, "dd/MM", { locale: ptBR })}</span>
        </div>
      </div>
    </Link>
  );
}
