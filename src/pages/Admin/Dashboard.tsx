import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { 
  collection, query, orderBy, onSnapshot, deleteDoc, doc, 
  getDocs, getDoc, setDoc, updateDoc, serverTimestamp, limit 
} from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Eye, FileText, Plus, Trash2, Edit3, LogOut, 
  TrendingUp, Calendar, BarChart3, Settings, ExternalLink,
  MessageSquare, Globe, Save, Info
} from 'lucide-react';
import { Article, AppSetting } from '../../types';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'overview' | 'analytics' | 'settings'>('overview');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalPosts: 0,
    todayViews: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Article[];
      setArticles(data);
      
      const views = data.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
      setStats({
        totalViews: views,
        totalPosts: data.length,
        todayViews: 0, 
      });
      setLoading(false);
    }, (error) => {
      console.error("Firestore [Dashboard] Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      console.log("Deletando artigo via doc ID:", id);
      await deleteDoc(doc(db, 'articles', id));
      setDeleteConfirmId(null);
      alert('Artigo excluído com sucesso!');
    } catch (err: any) {
      console.error("Delete Error:", err);
      alert(`Erro ao excluir artigo: ${err.message || 'Verifique as permissões.'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#010f25] text-white flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#D4AF37] rounded-lg p-2 flex items-center justify-center">
                <Globe className="text-[#010f25]" />
             </div>
             <span className="font-black text-xs uppercase tracking-widest">Painel Admin</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <button 
            onClick={() => setCurrentTab('overview')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${currentTab === 'overview' ? 'bg-white/10 text-[#D4AF37]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <BarChart3 size={18} /> Dashboard
          </button>
          <Link to="/admin/posts/new" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-all">
            <Plus size={18} /> Novo Artigo
          </Link>
          <button 
            onClick={() => setCurrentTab('analytics')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${currentTab === 'analytics' ? 'bg-white/10 text-[#D4AF37]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <TrendingUp size={18} /> Analytics
          </button>
          <button 
            onClick={() => setCurrentTab('settings')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${currentTab === 'settings' ? 'bg-white/10 text-[#D4AF37]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={18} /> Configurações
          </button>
        </nav>

        <div className="p-6 border-t border-white/5">
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/10 text-red-400 rounded-xl font-bold text-sm uppercase tracking-widest transition-all"
           >
             <LogOut size={18} /> Sair
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-100 p-8 flex justify-between items-center">
           <div>
             <h1 className="text-3xl font-black text-[#010f25] uppercase tracking-tighter">Resumo do Portal</h1>
             <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Bem-vindo, Administrador</p>
           </div>
           <Link 
             to="/admin/posts/new" 
             className="bg-[#D4AF37] text-[#010f25] px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#010f25] hover:text-[#D4AF37] transition-all"
           >
             <Plus size={18} /> Publicar Agora
           </Link>
        </header>

        <div className="p-8 space-y-12">
           {currentTab === 'overview' && (
             <>
               {/* Stats Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard icon={<Eye className="text-blue-500" />} label="Total de Views" value={stats.totalViews} />
                  <StatCard icon={<FileText className="text-[#D4AF37]" />} label="Artigos Criados" value={stats.totalPosts} />
                  <StatCard icon={<Calendar className="text-green-500" />} label="Visitas Hoje" value="Aguardando dados" />
                  <StatCard icon={<Users className="text-purple-500" />} label="Usuários Online" value="Aguardando dados" />
               </div>

               {/* Content Management */}
               <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                     <h2 className="text-xl font-black text-[#010f25] uppercase tracking-tighter">Gerenciar Artigos</h2>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-gray-50 uppercase text-[10px] font-black tracking-widest text-gray-400 border-b border-gray-100">
                           <tr>
                              <th className="px-8 py-4">Artigo</th>
                              <th className="px-8 py-4">Status</th>
                              <th className="px-8 py-4">Categoria</th>
                              <th className="px-8 py-4">Views</th>
                              <th className="px-8 py-4 text-right">Ações</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {articles.map((article) => (
                              <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                 <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                          <img src={article.featuredImage} className="w-full h-full object-cover" />
                                       </div>
                                       <div>
                                          <p className="font-bold text-[#010f25] text-sm line-clamp-1">{article.title}</p>
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Postado em {article.publishedAt ? format(article.publishedAt.toDate ? article.publishedAt.toDate() : new Date(article.publishedAt), 'dd/MM/yy') : '---'}
                                          </p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                       {article.status === 'published' ? 'Publicado' : 'Rascunho'}
                                    </span>
                                 </td>
                                 <td className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    {article.categoryId}
                                 </td>
                                 <td className="px-8 py-4 text-sm font-bold text-[#010f25]">
                                    {article.viewCount || 0}
                                 </td>
                                 <td className="px-8 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                       <Link to={`/admin/posts/edit/${article.id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                                          <Edit3 size={18} />
                                       </Link>
                                       <button 
                                         onClick={() => setDeleteConfirmId(article.id)}
                                         className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                       >
                                          <Trash2 size={18} />
                                       </button>
                                       <a href={`/artigo/${article.slug}`} target="_blank" className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                                          <ExternalLink size={18} />
                                       </a>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     {articles.length === 0 && !loading && (
                        <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest flex flex-col items-center gap-4">
                            <FileText size={48} className="opacity-20" />
                            Ainda não existem artigos publicados.
                        </div>
                     )}
                  </div>
               </section>
             </>
           )}

           {currentTab === 'analytics' && <AnalyticsView articles={articles} />}
           {currentTab === 'settings' && <SettingsView />}
        </div>

        {/* Custom Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-[#010f25] uppercase tracking-tighter">Confirmar Exclusão</h3>
                <p className="text-gray-500 text-sm">Esta ação é permanente e removerá o artigo definitivamente do portal.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-colors uppercase tracking-widest text-[10px] disabled:opacity-50"
                >
                  {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
       <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
          <p className="text-2xl font-black text-[#010f25] tracking-tighter mt-1">{value}</p>
       </div>
    </div>
  );
}

function AnalyticsView({ articles }: { articles: Article[] }) {
  // Mock monthly data based on articles
  const chartData = [
    { name: 'Seg', views: 400 },
    { name: 'Ter', views: 300 },
    { name: 'Qua', views: 600 },
    { name: 'Qui', views: 800 },
    { name: 'Sex', views: 500 },
    { name: 'Sáb', views: 900 },
    { name: 'Dom', views: 1100 },
  ];

  const categoryData = articles.reduce((acc: any[], article) => {
    const existing = acc.find(c => c.name === article.categoryId);
    if (existing) {
      existing.value += (article.viewCount || 0);
    } else {
      acc.push({ name: article.categoryId, value: (article.viewCount || 0) });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-black text-[#010f25] uppercase tracking-tighter mb-8">Desempenho Semanal</h2>
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                     itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                   />
                   <Line type="monotone" dataKey="views" stroke="#D4AF37" strokeWidth={4} dot={{ r: 6, fill: '#D4AF37', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
             </ResponsiveContainer>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <h3 className="text-sm font-black text-[#010f25] uppercase tracking-widest mb-6">Visualizações por Categoria</h3>
             <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#010f25" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <h3 className="text-sm font-black text-[#010f25] uppercase tracking-widest mb-6">Artigos em Destaque</h3>
             <div className="space-y-4">
                {articles.slice(0, 5).sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).map((article, idx) => (
                   <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                         <span className="w-6 h-6 bg-[#010f25] text-[#D4AF37] rounded-full flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                         <span className="text-sm font-bold text-[#010f25] line-clamp-1">{article.title}</span>
                      </div>
                      <span className="text-xs font-black text-gray-400">{article.viewCount || 0} views</span>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}

function SettingsView() {
  const [settings, setSettings] = useState<AppSetting>({
    siteName: 'Memórias da TV',
    siteDescription: 'Portal de nostalgia e curiosidades da TV Brasileira.',
    adSensePublisherId: '',
    adSenseCode: '',
    adsEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const docRef = doc(db, 'settings', 'general');
      const d = await getDoc(docRef);
      if (d.exists()) {
        setSettings(d.data() as AppSetting);
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center uppercase font-black text-gray-300">Carregando...</div>;

  return (
    <form onSubmit={handleSave} className="max-w-4xl space-y-8 animate-in fade-in duration-500">
       <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center gap-2 pb-6 border-b border-gray-50">
             <Settings className="text-[#D4AF37]" />
             <h2 className="text-xl font-black text-[#010f25] uppercase tracking-tighter">Configurações Gerais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Site</label>
                <input 
                  type="text" 
                  value={settings.siteName}
                  onChange={e => setSettings({...settings, siteName: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logo URL</label>
                <input 
                  type="text" 
                  value={settings.logo || ''}
                  onChange={e => setSettings({...settings, logo: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none"
                />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição do Site (SEO)</label>
             <textarea 
               value={settings.siteDescription}
               onChange={e => setSettings({...settings, siteDescription: e.target.value})}
               rows={3}
               className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none"
             />
          </div>
       </div>

       <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
             <Globe className="text-[#D4AF37]" size={18} />
             <h3 className="text-sm font-black text-[#010f25] uppercase tracking-widest">Publicidade (Google AdSense)</h3>
          </div>

          <div className="flex items-center gap-4 py-4 px-6 bg-gray-50 rounded-2xl">
             <input 
               type="checkbox" 
               checked={settings.adsEnabled}
               onChange={e => setSettings({...settings, adsEnabled: e.target.checked})}
               className="w-5 h-5 accent-[#010f25]"
             />
             <span className="text-sm font-bold text-[#010f25]">Ativar anúncios no portal</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Publisher ID (pub-XXXXXXXX)</label>
                <input 
                  type="text" 
                  value={settings.adSensePublisherId}
                  onChange={e => setSettings({...settings, adSensePublisherId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Script AdSense (Opcional)</label>
                <input 
                  type="text" 
                  value={settings.adSenseCode}
                  onChange={e => setSettings({...settings, adSenseCode: e.target.value})}
                  placeholder="https://pagead2.googlesyndication.com/..."
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none"
                />
             </div>
          </div>
       </div>

       <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="bg-[#010f25] text-white px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 hover:bg-[#D4AF37] hover:text-[#010f25] transition-all disabled:opacity-50 shadow-xl"
          >
             <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
       </div>
    </form>
  );
}
