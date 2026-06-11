import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Layout, Tag, Send, Eye, Search } from 'lucide-react';
import { Article } from '../../types';

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    categoryId: 'Nostalgia',
    tags: [],
    author: 'Equipe Memórias da TV',
    status: 'draft',
    viewCount: 0,
    readingTime: 5,
    seo: { title: '', description: '' }
  });

  useEffect(() => {
    if (id) {
      async function fetchPost() {
        const d = await getDoc(doc(db, 'articles', id as string));
        if (d.exists()) {
          setFormData(d.data() as Article);
        }
      }
      fetchPost();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
        publishedAt: formData.publishedAt || serverTimestamp(),
      };

      if (id) {
        await updateDoc(doc(db, 'articles', id), data);
      } else {
        const newDocRef = doc(collection(db, 'articles'));
        await setDoc(newDocRef, data);
      }
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar artigo');
    } finally {
      setLoading(false);
    }
  };

  const handleSlug = (title: string) => {
    const slug = title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData(prev => ({ ...prev, title, slug }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       <header className="bg-white border-b border-gray-100 p-6 sticky top-0 z-30 flex justify-between items-center">
          <div className="flex items-center gap-6">
             <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <ArrowLeft />
             </Link>
             <h1 className="text-xl font-black text-[#010f25] uppercase tracking-tighter">
               {id ? 'Editar Artigo' : 'Novo Artigo'}
             </h1>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={() => setPreview(!preview)}
               className="px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
             >
                <Eye size={16} /> {preview ? 'Voltar para Editor' : 'Ver Previa'}
             </button>
             <button 
               onClick={handleSubmit}
               disabled={loading}
               className="bg-[#010f25] text-white px-8 py-2 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#D4AF37] hover:text-[#010f25] transition-all disabled:opacity-50"
             >
                <Save size={16} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
             </button>
          </div>
       </header>

       <div className="flex-grow p-8">
          <form className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8" onSubmit={handleSubmit}>
             <div className="lg:col-span-8 space-y-8">
                {/* Title and Content */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título do Artigo</label>
                      <input 
                        type="text" 
                        value={formData.title} 
                        onChange={(e) => handleSlug(e.target.value)}
                        placeholder="Ex: Por que Silvio Santos é o maior da TV?"
                        className="w-full text-3xl font-bold text-[#010f25] border-none focus:ring-0 placeholder:text-gray-100 p-0"
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Slug amigável</label>
                      <input 
                        type="text" 
                        value={formData.slug} 
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg text-sm text-gray-500 font-mono"
                      />
                   </div>

                   <div className="space-y-4 pt-4 border-t border-gray-50">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conteúdo (Markdown)</label>
                      <textarea 
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        rows={20}
                        className="w-full bg-gray-50 border-none focus:ring-0 rounded-xl p-4 font-serif text-lg leading-relaxed text-gray-700"
                        placeholder="Escreva seu artigo aqui usando Markdown..."
                      />
                   </div>
                </div>

                {/* Excerpt */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumo (Excerpt)</label>
                   <textarea 
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      rows={3}
                      className="w-full bg-gray-50 border border-transparent focus:border-[#D4AF37] rounded-xl p-4 text-sm text-gray-600"
                      placeholder="Um breve resumo para aparecer na listagem..."
                   />
                </div>
             </div>

             <div className="lg:col-span-4 space-y-8">
                {/* Status and Publish */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                         <Send size={14} className="text-[#D4AF37]" /> Publicação
                      </label>
                      <select 
                        value={formData.status} 
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                        className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-sm font-bold text-[#010f25] uppercase tracking-widest"
                      >
                         <option value="draft">Rascunho</option>
                         <option value="published">Publicado</option>
                      </select>
                   </div>
                   
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                         <Layout size={14} className="text-[#D4AF37]" /> Categoria
                      </label>
                      <select 
                        value={formData.categoryId} 
                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-sm font-bold text-[#010f25] uppercase tracking-widest"
                      >
                         <option value="Silvio Santos">Silvio Santos</option>
                         <option value="Nostalgia">Nostalgia</option>
                         <option value="Celebridades">Celebridades</option>
                         <option value="Por Onde Anda">Por Onde Anda</option>
                         <option value="Novelas">Novelas</option>
                         <option value="Curiosidades">Curiosidades</option>
                      </select>
                   </div>
                </div>

                {/* Featured Image */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={14} className="text-[#D4AF37]" /> Imagem de Destaque
                   </label>
                   <input 
                      type="text" 
                      value={formData.featuredImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                      placeholder="URL da Imagem..."
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-mono"
                   />
                   {formData.featuredImage && (
                     <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mt-4">
                        <img src={formData.featuredImage} className="w-full h-full object-cover" />
                     </div>
                   )}
                </div>

                {/* Tags */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Tag size={14} className="text-[#D4AF37]" /> Tags (Vírgula)
                   </label>
                   <input 
                      type="text" 
                      defaultValue={formData.tags?.join(', ')}
                      onBlur={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                      placeholder="Ex: SBT, Globo, Anos 90"
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-sm"
                   />
                </div>

                {/* SEO */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Search size={14} className="text-[#D4AF37]" /> Configurações de SEO
                   </h3>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Meta Title</label>
                      <input 
                        type="text" 
                        value={formData.seo?.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo!, title: e.target.value } }))}
                        className="w-full bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg text-xs"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Meta Description</label>
                      <textarea 
                        value={formData.seo?.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo!, description: e.target.value } }))}
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg text-xs"
                      />
                   </div>
                </div>
             </div>
          </form>
       </div>
    </div>
  );
}
