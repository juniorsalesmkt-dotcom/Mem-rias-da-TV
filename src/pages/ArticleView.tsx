import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article, ContentBlock } from '../types';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User, Calendar, Share2, Facebook, Twitter, Mail, ChevronRight, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ArticleCard from '../components/common/ArticleCard';

import { Helmet } from 'react-helmet-async';

const ArticleRenderer = ({ content, blocks }: { content: string, blocks?: ContentBlock[] }) => {
  // Helper to detect if content was saved with double escaping
  const prepareHTML = (html: string) => {
    if (!html) return '';
    // Unescape HTML entities if they dominate the content (indicating double encoding)
    if (html.includes('&lt;') && html.includes('&gt;')) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.documentElement.textContent || html;
    }
    return html;
  };

  if (blocks && blocks.length > 0) {
    return (
      <div className="space-y-12 overflow-hidden break-words">
        {blocks.map((block) => {
          switch (block.type) {
            case 'paragraph':
              return (
                <div 
                  key={block.id} 
                  className="text-xl text-gray-700 leading-relaxed font-normal mb-8"
                  dangerouslySetInnerHTML={{ __html: prepareHTML(block.content || '') }}
                />
              );
            case 'heading':
              const Tag = block.level === 3 ? 'h3' : 'h2';
              return (
                <Tag 
                  key={block.id} 
                  className={`font-black text-[#010f25] uppercase tracking-tighter mt-16 mb-8 ${block.level === 3 ? 'text-2xl' : 'text-3xl md:text-4xl'}`}
                  dangerouslySetInnerHTML={{ __html: prepareHTML(block.content || '') }}
                />
              );
            case 'image':
              const alignmentClasses = {
                left: 'max-w-md mr-auto',
                center: 'max-w-3xl mx-auto',
                right: 'max-w-md ml-auto',
                full: 'w-full'
              };
              return (
                <figure key={block.id} className={`my-16 space-y-4 ${alignmentClasses[block.alignment || 'center']}`}>
                  <img src={block.url} alt={block.alt} className="w-full h-auto rounded-3xl shadow-2xl object-cover" />
                  {block.caption && <figcaption className="text-center text-sm text-gray-400 font-medium italic uppercase tracking-widest">{block.caption}</figcaption>}
                </figure>
              );
            case 'youtube':
              const videoId = block.url?.split('v=')[1] || block.url?.split('/').pop();
              return (
                <div key={block.id} className="my-16 aspect-video rounded-3xl overflow-hidden shadow-2xl">
                  <iframe 
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="w-full h-full border-none"
                    allowFullScreen
                    title="YouTube Video"
                  />
                </div>
              );
            case 'quote':
              return (
                <blockquote key={block.id} className="my-16 border-l-4 border-[#D4AF37] bg-gray-50 py-10 px-12 rounded-r-3xl">
                  <p 
                    className="text-2xl font-bold text-[#010f25] leading-relaxed italic"
                    dangerouslySetInnerHTML={{ __html: prepareHTML(block.content || '') }}
                  />
                </blockquote>
              );
            case 'list':
              return (
                <ul key={block.id} className="my-12 space-y-4 list-disc list-inside text-xl text-gray-700 font-medium">
                  {block.items?.map((item, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: prepareHTML(item) }} />
                  ))}
                </ul>
              );
            case 'callout':
              return (
                <div key={block.id} className="my-16 bg-[#010f25] text-white p-10 rounded-3xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-10 rounded-full -translate-x-12 -translate-y-12"></div>
                   <h4 className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em] mb-4">Destaque</h4>
                   <p 
                    className="text-xl md:text-2xl font-bold leading-tight relative z-10"
                    dangerouslySetInnerHTML={{ __html: prepareHTML(block.content || '') }}
                   />
                </div>
              );
            case 'divider':
              return <hr key={block.id} className="my-20 border-t-2 border-gray-100 w-24 mx-auto" />;
            case 'gallery':
              return (
                <div key={block.id} className="my-16 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {block.images?.map((img, idx) => (
                    <figure key={idx} className="space-y-2">
                       <img src={img.url} className="w-full h-64 object-cover rounded-2xl shadow-lg" alt={img.caption || ''} />
                       {img.caption && <figcaption className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  }

  // HTML / Quill Rendering
  return (
    <div 
      className="article-content prose prose-base md:prose-lg lg:prose-xl prose-slate max-w-none break-words overflow-x-hidden
        prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-[#010f25] prose-headings:font-black
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-8
        prose-img:rounded-3xl prose-img:shadow-2xl prose-img:mx-auto prose-img:my-12 prose-img:block prose-img:max-w-full
        prose-strong:text-[#010f25] prose-strong:font-black
        prose-blockquote:border-l-4 prose-blockquote:border-[#D4AF37] prose-blockquote:bg-gray-50 prose-blockquote:py-8 prose-blockquote:px-10 prose-blockquote:rounded-r-3xl prose-blockquote:not-italic prose-blockquote:font-bold
        prose-li:text-gray-700 prose-li:mb-4
      "
      dangerouslySetInnerHTML={{ __html: prepareHTML(content) }}
    />
  );
};


export default function ArticleView() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      try {
        // Must filter by status to satisfy security rules for non-admins
        const q = query(
          collection(db, 'articles'), 
          where('slug', '==', slug), 
          where('status', '==', 'published'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const data = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Article;
          setArticle(data);
          
          // Increment view count (this is allowed by rules for visitors)
          try {
            await updateDoc(doc(db, 'articles', data.id), {
              viewCount: increment(1)
            });
          } catch (e) {
            console.error("Failed to increment views:", e);
          }

          // Fetch related
          const relatedQuery = query(
            collection(db, 'articles'), 
            where('categoryId', '==', data.categoryId),
            where('status', '==', 'published'), // Always filter for published
            where('slug', '!=', slug),
            limit(3)
          );
          const relatedSnapshot = await getDocs(relatedQuery);
          setRelated(relatedSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Article[]);
        }
      } catch (err) {
        console.error("Error fetching article:", err);
      }
      setLoading(false);
    }

    if (slug) fetchArticle();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]"></div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-4xl font-bold text-[#010f25] mb-4">Artigo não encontrado</h2>
      <Link to="/" className="text-[#D4AF37] font-bold uppercase tracking-widest hover:underline">Voltar para Home</Link>
    </div>
  );

  const publishedDate = article.publishedAt?.toDate ? article.publishedAt.toDate() : new Date(article.publishedAt);
  const shareUrl = window.location.href;

  return (
    <motion.article 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="pb-20"
    >
      <Helmet>
        <title>{article.seo?.title || article.title} | Memórias da TV</title>
        <meta name="description" content={article.seo?.description || article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.featuredImage} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-100 py-3">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
           <Link to="/" className="hover:text-[#D4AF37]">Home</Link>
           <ChevronRight size={10} />
           <Link to={`/categoria/${article.categoryId}`} className="hover:text-[#D4AF37]">{article.categoryId}</Link>
           <ChevronRight size={10} />
           <span className="text-[#010f25] truncate max-w-[200px]">{article.title}</span>
        </div>
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 pt-12 pb-8 space-y-6">
        <Link 
          to={`/categoria/${article.categoryId}`}
          className="bg-[#D4AF37] text-[#010f25] text-xs font-black px-3 py-1 uppercase tracking-widest rounded"
        >
          {article.categoryId}
        </Link>
        <h1 className="text-4xl md:text-6xl font-bold text-[#010f25] leading-tight uppercase tracking-tighter">
          {article.title}
        </h1>
        <p className="text-xl text-gray-500 font-medium leading-relaxed tracking-tight">
          {article.excerpt}
        </p>
        
        <div className="flex flex-wrap items-center gap-6 py-6 border-y border-gray-100 text-xs font-bold uppercase tracking-widest text-[#010f25]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <User size={20} />
            </div>
            <div className="flex flex-col">
               <span className="text-gray-400">Por</span>
               <span>{article.author}</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#D4AF37]" />
            <span>{format(publishedDate, "dd 'de' MMMM', ' yyyy", { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#D4AF37]" />
            <span>{article.readingTime} MIN DE LEITURA</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
          <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 lg:grid lg:grid-cols-12 gap-12">
        {/* Left Sidebar - Social Share */}
        <aside className="hidden lg:block lg:col-span-1 py-4">
           <div className="sticky top-32 flex flex-col items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Share</span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#010f25] transition-all">
                <Facebook size={18} />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#010f25] transition-all">
                <Twitter size={18} />
              </a>
              <a href={`https://wa.me/?text=${shareUrl}`} target="_blank" className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#010f25] transition-all">
                <MessageSquare size={18} />
              </a>
           </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-8 py-4">
           <ArticleRenderer content={article.content} blocks={article.blocks} />
           
           {/* Tags */}
           <div className="mt-12 py-6 border-t border-gray-100 flex flex-wrap gap-2">
             {article.tags?.map(tag => (
               <span key={tag} className="bg-gray-50 text-gray-500 text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-full hover:bg-gray-100 cursor-pointer transition-colors">
                 #{tag}
               </span>
             ))}
           </div>

           {/* Mobile Share */}
           <div className="lg:hidden mt-8 p-6 bg-gray-50 rounded-2xl flex flex-col items-center gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#010f25]">Compartilhe este artigo</span>
              <div className="flex gap-4">
                <a href={`https://wa.me/?text=${shareUrl}`} className="w-12 h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center"><MessageSquare /></a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} className="w-12 h-12 bg-[#1877F2] text-white rounded-xl flex items-center justify-center"><Facebook /></a>
                <a href={`https://twitter.com/intent/tweet?url=${shareUrl}`} className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center"><Twitter /></a>
              </div>
           </div>
        </div>

        {/* Right Sidebar - Related / Trending */}
        <aside className="lg:col-span-3 py-4 space-y-12">
            {/* Newsletter Side */}
            <div className="bg-[#010f25] text-white p-8 rounded-2xl">
               <Mail size={32} className="text-[#D4AF37] mb-4" />
               <h3 className="text-xl font-bold uppercase tracking-tight mb-2">Fique por dentro</h3>
               <p className="text-gray-400 text-sm mb-6">Inscreva-se para receber semanalmente os fatos mais curiosos da nossa TV.</p>
               <input type="email" placeholder="Seu e-mail" className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-sm mb-3" />
               <button className="w-full bg-[#D4AF37] text-[#010f25] font-black py-3 rounded-lg uppercase tracking-widest text-xs">Assinar Grátis</button>
            </div>

            {/* Related Posts */}
            <div className="space-y-6">
               <h3 className="text-[#010f25] font-black uppercase tracking-widest text-sm border-b border-gray-100 pb-4 flex items-center gap-2">
                 <MessageSquare size={18} className="text-[#D4AF37]" /> Leia Também
               </h3>
               <div className="space-y-6">
                 {related.map(r => (
                   <ArticleCard key={r.id} article={r} variant="horizontal" />
                 ))}
                 {related.length === 0 && <p className="text-gray-400 text-xs italic uppercase tracking-widest">Aguardando mais artigos...</p>}
               </div>
            </div>
        </aside>
      </div>
    </motion.article>
  );
}
