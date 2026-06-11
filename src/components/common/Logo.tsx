import { Link } from 'react-router-dom';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-3 ${className}`}>
      <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center p-2 shadow-lg shadow-[#D4AF37]/20 flex-shrink-0">
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#010f25]" fill="currentColor">
          <path d="M21 6H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H3V8h18v10zM8.5 11h3v2h-3v-3zm0 3h3v2h-3v-2zm4.5-3h3v2h-3v-2zm0 3h3v2h-3v-2z" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-black tracking-tighter text-[#010f25] leading-none uppercase">
          Memórias <span className="text-[#D4AF37]">da TV</span>
        </span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          O Portal da Nostalgia
        </span>
      </div>
    </Link>
  );
}
