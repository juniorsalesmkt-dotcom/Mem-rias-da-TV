import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ArticleView from './pages/ArticleView';
import CategoryView from './pages/CategoryView';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import PostEditor from './pages/Admin/PostEditor';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { HelmetProvider } from 'react-helmet-async';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          if (user.email === 'juniorsales.mkt@gmail.com') {
            setIsAdmin(true);
          } else {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            setIsAdmin(adminDoc.exists());
          }
        } catch (err) {
          console.error("Auth check error:", err);
          // Fallback bypass for specifically authorized email
          setIsAdmin(user.email === 'juniorsales.mkt@gmail.com');
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#010f25]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
    </div>
  );

  if (!isAdmin) return <Navigate to="/login" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-white">
          <Routes>
            {/* Admin Routes - No layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/posts/new" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
            <Route path="/admin/posts/edit/:id" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
            
            {/* Public Routes with Layout */}
            <Route path="*" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/artigo/:slug" element={<ArticleView />} />
                    <Route path="/categoria/:slug" element={<CategoryView />} />
                    {/* Fallback */}
                    <Route path="*" element={<Home />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}
