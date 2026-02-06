
import React, { useState } from 'react';
import { UserSession, Registration } from './types';
import AdminDashboard from './components/AdminDashboard';
import UserPortal from './components/UserPortal';
import ChatWidget from './components/ChatWidget';
import { storageService } from './store/dataStore';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === 'admin@copacrm.com') {
      setSession({ email, role: 'admin' });
      return;
    }

    const regs = storageService.getRegistrations();
    const found = regs.find(r => r.EMAIL === email || r.DNI === dni);
    
    if (found) {
      setSession({ email: found.EMAIL, dni: found.DNI, role: 'user' });
    } else {
      setError('No se encontró ninguna solicitud con estos datos. Prueba con admin@copacrm.com para ver el panel de control.');
    }
  };

  const handleLogout = () => setSession(null);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-indigo-900">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-8 pb-0 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">FANS</h1>
            <p className="text-slate-500 mt-3 font-medium">Gestiona tus entradas y abonos con el poder de la IA</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="ej: manuel.urba@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">DNI (Para Usuarios)</label>
              <input 
                type="text" 
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="ej: 45738884A"
              />
            </div>
            {error && <p className="text-rose-500 text-xs font-medium bg-rose-50 p-2 rounded-lg border border-rose-100">{error}</p>}
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5 active:translate-y-0">
              Acceder al Portal
            </button>
          </form>
          <div className="px-8 pb-8 text-center text-xs text-slate-400">
            Al acceder aceptas los términos y condiciones de FANS.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
             </div>
             <span className="text-xl font-black text-slate-800 tracking-tight">FANS</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{session.email}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{session.role === 'admin' ? 'Administrador' : 'Solicitante'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2 rounded-lg text-sm transition"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <UserPortal session={session} onLogout={handleLogout} />
        )}
      </main>

      <ChatWidget registrations={storageService.getRegistrations()} />
      
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
          © 2026 FANS - Gestión Inteligente de Tickets. Powered by Gemini Pro & Flash.
        </div>
      </footer>
    </div>
  );
};

export default App;
