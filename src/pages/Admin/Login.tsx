import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ShieldAlert, Tv } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user is developer or already in admins
      if (user.email === 'juniorsales.mkt@gmail.com') {
        const { setupInitialPortal } = await import('../../lib/setupPortal');
        await setupInitialPortal(user.uid, user.email!);
        navigate('/admin');
        return;
      }

      let adminDoc;
      try {
        adminDoc = await getDoc(doc(db, 'admins', user.uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `admins/${user.uid}`);
      }

      if (adminDoc?.exists()) {
        navigate('/admin');
      } else {
        await auth.signOut();
        setError('Acesso negado. Apenas administradores podem entrar.');
      }
    } catch (err: any) {
      let message = err.message;
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) message = parsed.error;
      } catch {
        // Not a JSON error
      }
      setError('Erro ao fazer login: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010f25] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-[#D4AF37] p-8 text-center">
           <div className="w-16 h-16 bg-[#010f25] rounded-2xl flex items-center justify-center mx-auto mb-4 p-3 shadow-lg">
              <Tv className="text-[#D4AF37] w-full h-full" />
           </div>
           <h1 className="text-2xl font-black text-[#010f25] uppercase tracking-tighter">
             Portal Administrativo
           </h1>
           <p className="text-[#010f25]/70 text-xs font-bold uppercase tracking-widest mt-1">
             Memórias da TV
           </p>
        </div>
        
        <div className="p-10 space-y-8 text-center">
          <p className="text-gray-500 font-medium leading-relaxed">
            Este é um acesso exclusivo para administradores do portal. Para segurança, utilize sua conta Google cadastrada.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 text-sm font-bold text-left">
              <ShieldAlert size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#010f25] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#010f25] transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn size={20} />
                Entrar com Google
              </>
            )}
          </button>
          
          <div className="pt-4 border-t border-gray-100">
            <Link to="/" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#010f25]">
              Voltar ao Portal Público
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
