import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Save, ArrowLeft, Image as ImageIcon, Layout, Tag, Send, Eye, Search,
  Bold, Italic, Underline, List, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight,
  Trash2, Plus
} from 'lucide-react';
import { Article } from '../../types';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  
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
      const { id: _, ...cleanData } = formData;
      const data = {
        ...cleanData,
        blocks: [], // Ensure blocks are cleared to use the full HTML content from Quill
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

  const imageHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    // Focus first to ensure we have a range
    quill.focus();
    const range = quill.getSelection(true);

    const choice = window.confirm('Deseja fazer UPLOAD de uma imagem? (Clique em "OK" para Upload ou "Cancelar" para inserir por URL)');

    if (choice) {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (file) {
          setLoading(true);
          try {
            const storageRef = ref(storage, `articles/${Date.now()}-${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            
            if (range) {
              quill.insertEmbed(range.index, 'image', url);
              quill.setSelection(range.index + 1);
            } else {
              const length = quill.getLength();
              quill.insertEmbed(length, 'image', url);
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao fazer upload da imagem.');
          } finally {
            setLoading(false);
          }
        }
      };
    } else {
      const url = prompt('Cole a URL da imagem aqui:');
      if (url) {
        if (range) {
          quill.insertEmbed(range.index, 'image', url);
          quill.setSelection(range.index + 1);
        } else {
          const length = quill.getLength();
          quill.insertEmbed(length, 'image', url);
        }
      }
    }
  }, []);

  const linkHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const range = quill.getSelection();
    if (range) {
      if (range.length === 0) {
        const url = prompt('Cole o link aqui:');
        if (url) {
          quill.insertText(range.index, url, 'link', url);
        }
      } else {
        const url = prompt('Cole o link aqui:');
        if (url) {
          quill.format('link', url);
        } else {
          quill.format('link', false);
        }
      }
    }
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler,
        link: linkHandler
      }
    }
  }), [imageHandler, linkHandler]);

  const formats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'align',
    'link', 'image'
  ], []);

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const storageRef = ref(storage, `featured/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setFormData(prev => ({ ...prev, featuredImage: url }));
      } catch (error) {
        console.error('Error uploading featured image:', error);
        alert('Erro ao fazer upload da imagem de destaque.');
      } finally {
        setLoading(false);
      }
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

                  {/* Rich Text Editor */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col pt-4">
                     <div className="px-8 pb-4 border-b border-gray-50 bg-white flex justify-between items-center">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conteúdo do Artigo</label>
                        <div className="flex gap-2">
                           <button 
                             type="button"
                             onClick={imageHandler}
                             className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37]/10 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                           >
                              <ImageIcon size={12} /> Adicionar Mídia
                           </button>
                        </div>
                     </div>
                     <div className="flex-grow quill-editor-wrapper">
                        <ReactQuill 
                          ref={quillRef}
                          theme="snow"
                          value={formData.content}
                          onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                          modules={modules}
                          formats={formats}
                          className="h-full border-none"
                          placeholder="Conte o que vem à sua mente..."
                        />
                     </div>
                  </div>

                  <style>{`
                     .quill-editor-wrapper .ql-container {
                       border: none !important;
                       font-family: 'Inter', sans-serif !important;
                       font-size: 1.125rem !important;
                     }
                     .quill-editor-wrapper .ql-toolbar {
                       border: none !important;
                       border-bottom: 1px solid #f9fafb !important;
                       padding: 1rem 2rem !important;
                       background: white !important;
                       position: sticky;
                       top: 0;
                       z-index: 10;
                     }
                     .quill-editor-wrapper .ql-editor {
                       min-height: 500px !important;
                       padding: 3rem 4rem !important;
                       line-height: 1.8 !important;
                       color: #374151 !important;
                       max-width: 800px;
                       margin: 0 auto;
                     }
                     .quill-editor-wrapper .ql-editor p {
                       margin-bottom: 1.5rem !important;
                     }
                     .quill-editor-wrapper .ql-editor h2 {
                       margin-top: 2.5rem !important;
                       margin-bottom: 1.25rem !important;
                       font-weight: 900 !important;
                       text-transform: uppercase !important;
                       letter-spacing: -0.025em !important;
                       color: #010f25 !important;
                       line-height: 1.2 !important;
                     }
                     .quill-editor-wrapper .ql-editor h3 {
                       margin-top: 2rem !important;
                       margin-bottom: 1rem !important;
                       font-weight: 800 !important;
                       text-transform: uppercase !important;
                       color: #010f25 !important;
                       line-height: 1.2 !important;
                     }
                     .quill-editor-wrapper .ql-editor img {
                       border-radius: 1.5rem !important;
                       box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
                       margin: 2rem auto !important;
                     }
                     .quill-editor-wrapper .ql-editor.ql-blank::before {
                       left: 4rem !important;
                       font-style: normal !important;
                       color: #e5e7eb !important;
                       font-weight: 700 !important;
                     }
                  `}</style>
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
                   <div className="space-y-4">
                      <div className="flex gap-2">
                         <input 
                            type="text" 
                            value={formData.featuredImage}
                            onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                            placeholder="URL da Imagem..."
                            className="flex-grow bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-mono"
                         />
                         <label className="bg-gray-100 hover:bg-gray-200 text-[#010f25] p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-center">
                            <Plus size={18} />
                            <input 
                               type="file" 
                               className="hidden" 
                               accept="image/*"
                               onChange={handleFeaturedImageUpload}
                            />
                         </label>
                      </div>
                      {formData.featuredImage && (
                        <div className="relative group aspect-video bg-gray-100 rounded-xl overflow-hidden">
                           <img src={formData.featuredImage} className="w-full h-full object-cover" />
                           <button 
                             type="button"
                             onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                             className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                      )}
                   </div>
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
