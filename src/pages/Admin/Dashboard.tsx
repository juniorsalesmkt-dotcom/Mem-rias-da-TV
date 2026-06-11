import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Eye, FileText, Plus, Trash2, Edit3, LogOut, 
  TrendingUp, Calendar, BarChart3, Settings, ExternalLink,
  MessageSquare, Globe
} from 'lucide-react';
import { Article } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalPosts: 0,
    todayViews: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Article[];
      setArticles(data);
      
      const views = data.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
      setStats({
        totalViews: views,
        totalPosts: data.length,
        todayViews: 0, // In a real app we'd fetch from stats collection
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este artigo?')) {
      await deleteDoc(doc(db, 'articles', id));
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
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-[#D4AF37] font-bold text-sm uppercase tracking-widest">
            <BarChart3 size={18} /> Dashboard
          </Link>
          <Link to="/admin/posts/new" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-all">
            <Plus size={18} /> Novo Artigo
          </Link>
          <Link to="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-all">
            <TrendingUp size={18} /> Analytics
          </Link>
          <Link to="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-all">
            <Settings size={18} /> Configurações
          </Link>
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
                 <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Filtrar por título..."
                      className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm focus:outline-none"
                    />
                 </div>
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
                                     onClick={() => handleDelete(article.id)}
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
        </div>
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
