import { motion } from 'motion/react';
import { useArticles } from '../hooks/useArticles';
import ArticleCard from '../components/common/ArticleCard';
import { ArrowRight, Star, TrendingUp, Tv, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { articles, loading } = useArticles({ limitCount: 15 });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  // Split articles for different sections
  const heroArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4);
  const remainingArticles = articles.slice(4);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {heroArticle ? (
              <ArticleCard article={heroArticle} variant="large" />
            ) : (
              <div className="h-[500px] bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest border-2 border-dashed border-gray-200">
                Aguardando conteúdo...
              </div>
            )}
          </div>
          <div className="space-y-8">
            <h3 className="flex items-center gap-2 text-[#010f25] font-black uppercase tracking-widest text-sm border-b border-gray-100 pb-4">
              <Star size={18} className="text-[#D4AF37]" /> Destaques do Dia
            </h3>
            <div className="space-y-6">
              {secondaryArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
            
            {/* Ad Placeholder Placeholder (Only if AdSense enabled, but here just a clean box) */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-2 opacity-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Publicidade</span>
              {/* No placeholder content as per instructions */}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid (Icons) */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Silvio Santos', icon: <TrendingUp size={24} />, path: '/categoria/silvio-santos' },
                { name: 'Nostalgia', icon: <Heart size={24} />, path: '/categoria/nostalgia' },
                { name: 'Celebridades', icon: <Users size={24} />, path: '/categoria/celebridades' },
                { name: 'Programas TV', icon: <Tv size={24} />, path: '/categoria/programas-de-tv' },
                { name: 'Novelas', icon: <Star size={24} />, path: '/categoria/novelas' },
                { name: 'Por Onde Anda', icon: <ArrowRight size={24} />, path: '/categoria/por-onde-anda' },
              ].map((cat) => (
                <Link 
                  key={cat.name} 
                  to={cat.path}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-4 group"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-[#010f25] group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#010f25]">{cat.name}</span>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* Main Feed Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
           <h2 className="text-2xl font-bold text-[#010f25] uppercase tracking-tighter flex items-center gap-3">
             <div className="w-2 h-8 bg-[#D4AF37]" />
             Últimas Notícias
           </h2>
           <Link to="/noticias" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
             Ver Todas <ArrowRight size={14} />
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {remainingArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {remainingArticles.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
              Nenhuma notícia encontrada no momento.
            </div>
          )}
        </div>
      </section>

      {/* Custom Sections (Nostalgia, Silvio Santos, etc.) */}
      <section className="bg-[#010f25] py-20 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#D4AF37]/5 skew-x-12 transform translate-x-20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="space-y-4">
                <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.3em]">Especial</span>
                <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter leading-none">
                  Universo <br/> <span className="text-[#D4AF37]">Silvio Santos</span>
                </h2>
              </div>
              <Link to="/categoria/silvio-santos" className="bg-white/10 hover:bg-[#D4AF37] hover:text-[#010f25] px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all">
                Explorar Arquivos
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* This would fetch per category in a real scenario */}
              {articles.slice(0, 4).map((article) => (
                <Link key={article.id} to={`/artigo/${article.slug}`} className="group space-y-4">
                   <div className="aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      <img 
                        src={article.featuredImage} 
                        alt={article.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      />
                   </div>
                   <h3 className="font-bold text-lg leading-tight uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors">
                     {article.title}
                   </h3>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* POR ONDE ANDA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
           <h2 className="text-2xl font-bold text-[#010f25] uppercase tracking-tighter flex items-center gap-3">
             <div className="w-2 h-8 bg-[#D4AF37]" />
             Por Onde Anda?
           </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {articles.slice(0, 4).map((article) => (
              <Link key={article.id} to={`/artigo/${article.slug}`} className="relative h-64 rounded-xl overflow-hidden group">
                 <img src={article.featuredImage} className="w-full h-full object-cover" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-white font-bold uppercase tracking-tight text-sm line-clamp-2">{article.title}</h4>
                 </div>
              </Link>
           ))}
        </div>
      </section>

      {/* Newsletter Big */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-[-4rem] relative z-20">
         <div className="bg-[#D4AF37] rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center gap-10 shadow-2xl">
            <div className="flex-1 text-[#010f25]">
               <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-tight mb-4">
                 Receba a nostalgia <br/> no seu e-mail
               </h3>
               <p className="font-bold text-[#010f25]/70 max-w-md">
                 Junte-se a mais de 50.000 apaixonados pela televisão brasileira.
               </p>
            </div>
            <div className="w-full lg:w-auto flex flex-col md:flex-row gap-4 flex-1">
               <input 
                 type="email" 
                 placeholder="Digite seu e-mail..."
                 className="flex-1 bg-white border-transparent px-6 py-4 rounded-xl focus:outline-none placeholder:text-gray-400 font-bold"
               />
               <button className="bg-[#010f25] text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#010f25]/80 transition-all shadow-lg">
                 Cadastrar
               </button>
            </div>
         </div>
      </section>
    </div>
  );
}
