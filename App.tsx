
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Matches from './pages/Matches';
import ProfileDetail from './pages/ProfileDetail';
import AIMatchmaker from './pages/AIMatchmaker';
import ProfileEdit from './pages/ProfileEdit';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Chat from './pages/Chat';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-slate-100 py-12">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="font-playfair font-bold text-xl text-slate-900 mb-4">Soulmate<span className="text-rose-600">AI</span></p>
      <div className="flex justify-center gap-6 mb-8 text-slate-500 text-sm">
        <a href="#" className="hover:text-rose-600">About Us</a>
        <a href="#" className="hover:text-rose-600">Success Stories</a>
        <a href="#" className="hover:text-rose-600">Privacy Policy</a>
        <a href="#" className="hover:text-rose-600">Contact</a>
      </div>
      <p className="text-slate-400 text-xs">© 2024 SoulmateAI. All rights reserved.</p>
    </div>
  </footer>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <HashRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />

                {/* Protected Routes */}
                <Route path="/matches" element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                } />
                <Route path="/matches/:id" element={
                  <ProtectedRoute>
                    <ProfileDetail />
                  </ProtectedRoute>
                } />
                <Route path="/ai-matchmaker" element={
                  <ProtectedRoute>
                    <AIMatchmaker />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfileEdit />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/chat/:userId" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
