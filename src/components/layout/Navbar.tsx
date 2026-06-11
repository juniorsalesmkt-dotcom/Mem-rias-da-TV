import { useState } from 'react';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Silvio Santos', path: '/categoria/silvio-santos' },
  { name: 'Nostalgia', path: '/categoria/nostalgia' },
  { name: 'Curiosidades', path: '/categoria/curiosidades' },
  { name: 'Por Onde Anda?', path: '/categoria/por-onde-anda' },
  { name: 'Celebridades', path: '/categoria/celebridades' },
  { name: 'Programas de TV', path: '/categoria/programas-de-tv' },
  { name: 'Novelas', path: '/categoria/novelas' },
  { name: 'Últimas Notícias', path: '/noticias' },
  { name: 'Contato', path: '/contato' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Top bar - Branding */}
      <div className="bg-[#010f25] text-white py-2 px-4 text-center text-xs font-medium uppercase tracking-widest hidden md:block">
        O portal oficial da nostalgia brasileira
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-28">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center p-2 shadow-lg shadow-[#D4AF37]/20">
              <svg viewBox="0 0 24 24" className="w-full h-full text-[#010f25]" fill="currentColor">
                <path d="M21 6H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H3V8h18v10zM8.5 11h3v2h-3v-3zm0 3h3v2h-3v-2zm4.5-3h3v2h-3v-2zm0 3h3v2h-3v-2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-bold tracking-tighter text-[#010f25] leading-none uppercase">
                Memórias <span className="text-[#D4AF37]">da TV</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Brasil Nostálgico
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-1">
            {navItems.slice(0, 8).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="px-3 py-2 text-sm font-bold text-[#010f25] hover:text-[#D4AF37] transition-colors uppercase tracking-tight"
              >
                {item.name}
              </Link>
            ))}
            <div className="h-6 w-[1px] bg-gray-200 mx-2" />
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#010f25] hover:text-[#D4AF37] transition-colors"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden flex items-center gap-4">
             <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#010f25]"
            >
              <Search size={22} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-[#010f25] focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-menu Desktop (Categories) */}
      <div className="bg-[#010f25] hidden xl:block">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-8 py-3 overflow-x-auto no-scrollbar whitespace-nowrap">
            {['SBT', 'Globo', 'Record', 'Band', 'Manchete', 'Infantil', 'Anos 80', 'Anos 90'].map((cat) => (
              <Link 
                key={cat} 
                to={`/categoria/${cat.toLowerCase()}`}
                className="text-white/80 hover:text-[#D4AF37] text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-3 py-4 text-base font-bold text-[#010f25] border-b border-gray-50 uppercase tracking-tight"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 p-6 z-40"
          >
            <div className="max-w-4xl mx-auto flex gap-4">
              <input 
                type="text" 
                placeholder="Pesquise por programas, celebridades ou novelas..."
                className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-medium"
              />
              <button className="bg-[#010f25] text-white px-8 py-3 rounded-md font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-all">
                Buscar
              </button>
            </div>
            <button 
               onClick={() => setSearchOpen(false)}
               className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors mx-auto block"
            >
              Fechar Busca
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
