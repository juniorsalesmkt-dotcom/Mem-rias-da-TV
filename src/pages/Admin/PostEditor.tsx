import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Save, ArrowLeft, Image as ImageIcon, Layout, Tag, Send, Eye, Search,
  Plus, Trash2, ChevronUp, ChevronDown, Type, Heading2, Heading3, 
  Youtube, Quote, List as ListIcon, Minus, MessageSquare, AlertCircle
} from 'lucide-react';
import { Article, ContentBlock, BlockType } from '../../types';

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    slug: '',
    content: '',
    blocks: [],
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
          const data = d.data() as Article;
          if (!data.blocks) data.blocks = [];
          setFormData(data);
        }
      }
      fetchPost();
    }
  }, [id]);

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: '',
      alignment: 'center'
    };
    if (type === 'heading') newBlock.level = 2;
    if (type === 'list') newBlock.items = [''];
    setFormData(prev => ({ ...prev, blocks: [...(prev.blocks || []), newBlock] }));
  };

  const updateBlock = (idx: number, updates: Partial<ContentBlock>) => {
    const newBlocks = [...(formData.blocks || [])];
    newBlocks[idx] = { ...newBlocks[idx], ...updates };
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const removeBlock = (idx: number) => {
    const newBlocks = (formData.blocks || []).filter((_, i) => i !== idx);
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const moveBlock = (idx: number, direction: 'up' | 'down') => {
    const newBlocks = [...(formData.blocks || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newBlocks.length) return;
    [newBlocks[idx], newBlocks[targetIdx]] = [newBlocks[targetIdx], newBlocks[idx]];
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

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

                {/* Blocks Editor */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <h2 className="text-sm font-black uppercase tracking-widest text-[#010f25] flex items-center gap-2">
                        <Layout size={18} className="text-[#D4AF37]" /> Blocos de Conteúdo
                     </h2>
                   </div>

                   <div className="space-y-4">
                      {formData.blocks?.map((block, idx) => (
                        <div key={block.id} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-[#D4AF37] transition-all p-6">
                           <div className="absolute -left-4 top-1/2 -translate-y-12 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-all z-10">
                              <button type="button" onClick={() => moveBlock(idx, 'up')} className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm text-gray-400 hover:text-[#010f25]"><ChevronUp size={14} /></button>
                              <button type="button" onClick={() => moveBlock(idx, 'down')} className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm text-gray-400 hover:text-[#010f25]"><ChevronDown size={14} /></button>
                              <button type="button" onClick={() => removeBlock(idx)} className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm text-red-400 hover:text-red-600 mt-2"><Trash2 size={14} /></button>
                           </div>

                           <div className="flex items-center gap-3 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                              {block.type === 'paragraph' && <><Type size={12} /> Parágrafo</>}
                              {block.type === 'heading' && <><Heading2 size={12} /> Título {block.level}</>}
                              {block.type === 'image' && <><ImageIcon size={12} /> Imagem</>}
                              {block.type === 'youtube' && <><Youtube size={12} /> Vídeo YouTube</>}
                              {block.type === 'quote' && <><Quote size={12} /> Citação</>}
                              {block.type === 'list' && <><ListIcon size={12} /> Lista</>}
                              {block.type === 'callout' && <><AlertCircle size={12} /> Destaque</>}
                              {block.type === 'divider' && <><Minus size={12} /> Divisor</>}
                              {block.type === 'gallery' && <><ImageIcon size={12} /> Galeria</>}
                           </div>

                           {block.type === 'paragraph' && (
                             <textarea 
                                value={block.content}
                                onChange={(e) => updateBlock(idx, { content: e.target.value })}
                                rows={4}
                                className="w-full bg-gray-50/50 border-none focus:ring-0 rounded-xl p-4 text-gray-700 leading-relaxed font-serif text-lg"
                                placeholder="Conteúdo do parágrafo..."
                             />
                           )}

                           {block.type === 'heading' && (
                             <div className="flex gap-4">
                                <select 
                                  value={block.level}
                                  onChange={(e) => updateBlock(idx, { level: Number(e.target.value) as 2 | 3 })}
                                  className="bg-gray-50 border-none font-bold text-xs uppercase"
                                >
                                  <option value={2}>H2</option>
                                  <option value={3}>H3</option>
                                </select>
                                <input 
                                  value={block.content}
                                  onChange={(e) => updateBlock(idx, { content: e.target.value })}
                                  className="flex-grow bg-gray-50/50 border-none focus:ring-0 rounded-xl px-4 py-2 font-bold text-2xl text-[#010f25]"
                                  placeholder="Título da seção..."
                                />
                             </div>
                           )}

                           {block.type === 'image' && (
                             <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-1">
                                      <label className="text-[9px] font-bold uppercase text-gray-400">URL da Imagem</label>
                                      <input 
                                        type="text"
                                        value={block.url}
                                        onChange={(e) => updateBlock(idx, { url: e.target.value })}
                                        className="w-full bg-gray-50 border-none text-xs p-3 rounded-lg"
                                        placeholder="https://..."
                                      />
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-[9px] font-bold uppercase text-gray-400">Alinhamento</label>
                                      <select 
                                        value={block.alignment}
                                        onChange={(e) => updateBlock(idx, { alignment: e.target.value as any })}
                                        className="w-full bg-gray-50 border-none text-xs p-3 rounded-lg"
                                      >
                                        <option value="center">Centralizado</option>
                                        <option value="full">Largura Total</option>
                                        <option value="left">Esquerda</option>
                                        <option value="right">Direita</option>
                                      </select>
                                   </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-1">
                                      <label className="text-[9px] font-bold uppercase text-gray-400">Legenda</label>
                                      <input 
                                        type="text"
                                        value={block.caption}
                                        onChange={(e) => updateBlock(idx, { caption: e.target.value })}
                                        className="w-full bg-gray-50 border-none text-xs p-3 rounded-lg"
                                      />
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-[9px] font-bold uppercase text-gray-400">Texto Alt</label>
                                      <input 
                                        type="text"
                                        value={block.alt}
                                        onChange={(e) => updateBlock(idx, { alt: e.target.value })}
                                        className="w-full bg-gray-50 border-none text-xs p-3 rounded-lg"
                                      />
                                   </div>
                                </div>
                                {block.url && <img src={block.url} className="h-32 object-contain bg-gray-50 rounded-lg mx-auto" />}
                             </div>
                           )}

                           {block.type === 'youtube' && (
                             <div className="space-y-2">
                               <label className="text-[9px] font-bold uppercase text-gray-400">URL do Vídeo</label>
                               <input 
                                  value={block.url}
                                  onChange={(e) => updateBlock(idx, { url: e.target.value })}
                                  placeholder="Youtube Link (ex: https://youtube.com/watch?v=...)"
                                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs"
                               />
                             </div>
                           )}

                           {block.type === 'quote' && (
                              <textarea 
                                value={block.content}
                                onChange={(e) => updateBlock(idx, { content: e.target.value })}
                                rows={2}
                                className="w-full bg-gray-50/50 border-l-4 border-[#D4AF37] focus:ring-0 rounded-r-xl p-4 text-gray-800 leading-relaxed font-bold italic text-xl"
                                placeholder="Frase ou citação marcante..."
                             />
                           )}

                           {block.type === 'callout' && (
                              <textarea 
                                value={block.content}
                                onChange={(e) => updateBlock(idx, { content: e.target.value })}
                                rows={2}
                                className="w-full bg-[#010f25] text-white focus:ring-0 rounded-2xl p-6 font-bold text-lg"
                                placeholder="Texto em destaque para chamar atenção..."
                             />
                           )}

                           {block.type === 'list' && (
                              <div className="space-y-2">
                                {block.items?.map((item, iIdx) => (
                                  <div key={iIdx} className="flex gap-2">
                                    <input 
                                      value={item} 
                                      onChange={(e) => {
                                        const newItems = [...(block.items || [])];
                                        newItems[iIdx] = e.target.value;
                                        updateBlock(idx, { items: newItems });
                                      }}
                                      className="flex-grow bg-gray-50 border-none rounded-lg p-2 text-sm"
                                    />
                                    <button type="button" onClick={() => {
                                      const newItems = (block.items || []).filter((_, i) => i !== iIdx);
                                      updateBlock(idx, { items: newItems });
                                    }} className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => updateBlock(idx, { items: [...(block.items || []), ''] })} className="text-[10px] font-black uppercase text-[#D4AF37] flex items-center gap-1"><Plus size={10} /> Adicionar Item</button>
                              </div>
                           )}

                           {block.type === 'gallery' && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  {block.images?.map((img, iIdx) => (
                                    <div key={iIdx} className="bg-gray-50 p-4 rounded-xl space-y-2 relative">
                                      <button type="button" onClick={() => {
                                        const newImages = (block.images || []).filter((_, i) => i !== iIdx);
                                        updateBlock(idx, { images: newImages });
                                      }} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={10} /></button>
                                      <input 
                                        value={img.url}
                                        onChange={(e) => {
                                          const newImages = [...(block.images || [])];
                                          newImages[iIdx] = { ...newImages[iIdx], url: e.target.value };
                                          updateBlock(idx, { images: newImages });
                                        }}
                                        className="w-full bg-white border-none text-[10px] p-2 rounded"
                                        placeholder="URL da Imagem"
                                      />
                                      <input 
                                        value={img.caption}
                                        onChange={(e) => {
                                          const newImages = [...(block.images || [])];
                                          newImages[iIdx] = { ...newImages[iIdx], caption: e.target.value };
                                          updateBlock(idx, { images: newImages });
                                        }}
                                        className="w-full bg-white border-none text-[10px] p-2 rounded"
                                        placeholder="Legenda"
                                      />
                                    </div>
                                  ))}
                                </div>
                                <button type="button" onClick={() => updateBlock(idx, { images: [...(block.images || []), { url: '', caption: '' }] })} className="text-[10px] font-black uppercase text-[#D4AF37] flex items-center gap-1"><Plus size={10} /> Adicionar Imagem à Galeria</button>
                              </div>
                           )}
                        </div>
                      ))}
                      
                      {(!formData.blocks || formData.blocks.length === 0) && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                           <Layout size={40} className="mx-auto text-gray-200 mb-4" />
                           <p className="text-gray-400 font-medium italic">Seu artigo ainda não tem blocos. Comece a criar abaixo ↓</p>
                        </div>
                      )}
                   </div>

                   <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl flex flex-wrap justify-center gap-4 sticky bottom-8 z-40">
                      <button type="button" onClick={() => addBlock('paragraph')} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><Type size={20} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Texto</span>
                      </button>
                      <button type="button" onClick={() => addBlock('heading')} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                        <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center"><Heading2 size={20} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Título</span>
                      </button>
                      <button type="button" onClick={() => addBlock('image')} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                        <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><ImageIcon size={20} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Imagem</span>
                      </button>
                      <button type="button" onClick={() => addBlock('youtube')} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><Youtube size={20} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Vídeo</span>
                      </button>
                      <button type="button" onClick={() => addBlock('quote')} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><Quote size={20} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Citação</span>
                      </button>
                      <button type="button" onClick={() => addBlock('list')} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center"><ListIcon size={20} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Lista</span>
                      </button>
                      <button type="button" onClick={() => addBlock('callout')} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                        <div className="w-12 h-12 bg-slate-900 text-[#D4AF37] rounded-xl flex items-center justify-center"><AlertCircle size={20} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Destaque</span>
                      </button>
                      <button type="button" onClick={() => addBlock('divider')} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                        <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center"><Minus size={20} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Separador</span>
                      </button>
                      <button type="button" onClick={() => addBlock('gallery')} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                        <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center"><ImageIcon size={20} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Galeria</span>
                      </button>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">Conteúdo RAW (SEO)</label>
                   <textarea 
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={2}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-xs font-mono text-gray-400"
                      placeholder="Este campo é opcional..."
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
