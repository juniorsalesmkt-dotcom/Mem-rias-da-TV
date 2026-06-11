import { Facebook, Instagram, Youtube, Twitter, Mail, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#010f25] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/10 pb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center p-2">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#010f25]" fill="currentColor">
                  <path d="M21 6H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H3V8h18v10zM8.5 11h3v2h-3v-3zm0 3h3v2h-3v-2zm4.5-3h3v2h-3v-2zm0 3h3v2h-3v-2z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight uppercase">
                Memórias <span className="text-[#D4AF37]">da TV</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              O portal brasileiro dedicado a preservar a história da nossa televisão. Notícias, curiosidades e o melhor da nostalgia televisiva em um só lugar.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#010f25] transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#010f25] transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#010f25] transition-all">
                <Youtube size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#010f25] transition-all">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Categories Column */}
          <div>
            <h4 className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs mb-8">Categorias Populares</h4>
            <ul className="grid grid-cols-1 gap-4">
              {['Silvio Santos', 'Novelas Históricas', 'Por Onde Anda?', 'Programas Antigos', 'Curiosidades', 'Celebridades'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs mb-8">Links Úteis</h4>
            <ul className="flex flex-col gap-4">
              {['Sobre Nós', 'Anuncie', 'Contato', 'Política de Privacidade', 'Termos de Uso', 'Cookies'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs mb-8">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-6">
              Assine nossa newsletter e receba conteúdos nostálgicos direto no seu e-mail.
            </p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Seu melhor e-mail"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded text-sm focus:outline-none focus:border-[#D4AF37]"
              />
              <button className="w-full bg-[#D4AF37] text-[#010f25] font-bold py-3 rounded uppercase tracking-wider text-xs hover:bg-white transition-all">
                Inscrever-se
              </button>
            </form>
          </div>
        </div>

        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-xs font-medium">
            © {new Date().getFullYear()} MEMÓRIAS DA TV. Todos os direitos reservados.
          </p>
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[#D4AF37] font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
          >
            Voltar ao Topo <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
