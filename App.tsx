
import React, { useState, useEffect } from 'react';
import { UserSession, Registration } from './types';
import AdminDashboard from './components/AdminDashboard';
import UserPortal from './components/UserPortal';
import { storageService } from './store/dataStore';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Start as loading to check session
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const result = await storageService.getCurrentSession();
        if (result && result.session && result.profile) {
          setSession({
            email: result.session.user.email || '',
            role: result.profile.role as 'admin' | 'user',
            id: result.session.user.id
          } as any);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { session: authSession, profile, error: authError } = await storageService.signIn(email, password);

      if (authError) {
        setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
        console.error('Auth error:', authError);
      } else if (authSession && profile) {
        setSession({
          email: email,
          role: profile.role as 'admin' | 'user',
          id: authSession.user.id
        } as any);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await storageService.signOut();
    setSession(null);
  };

  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="animate-spin h-10 w-10 border-4 border-[#0D88CA] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#0D88CA] to-[#003CA6]">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-8 pb-0 text-center">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
              <img src="https://i.imgur.com/77mlnlA.png" alt="Viña Albali Valdepeñas" className="w-20 h-20 object-contain" />
            </div>
            <h1 className="text-2xl font-black text-[#0D88CA] tracking-tight uppercase">Viña Albali Valdepeñas</h1>
            <p className="text-slate-500 mt-2 font-medium text-sm">Gestión de entradas y abonos<br /><span className="text-[#0D88CA]/70 italic">Copa de España 2026</span></p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0D88CA] focus:border-transparent transition disabled:opacity-50"
                placeholder="ej: manuel.urba@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0D88CA] focus:border-transparent transition disabled:opacity-50"
                placeholder="Tu contraseña segura"
              />
            </div>
            {error && <p className="text-rose-500 text-xs font-medium bg-rose-50 p-2 rounded-lg border border-rose-100">{error}</p>}
            <button
              disabled={loading}
              className="w-full bg-[#0D88CA] hover:bg-[#0c7ab5] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#0D88CA]/20 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>}
              {loading ? 'Verificando...' : 'Acceder al Portal'}
            </button>
          </form>
          <div className="px-8 pb-8 text-center text-xs text-slate-400">
            Al acceder aceptas los términos y condiciones de Viña Albali Valdepeñas.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 p-1">
              <img src="https://i.imgur.com/77mlnlA.png" alt="Icon" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-lg font-black text-[#0D88CA] tracking-tighter uppercase leading-none hidden sm:block">
              Viña Albali<br /><span className="text-slate-800 text-xs">Valdepeñas</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{session.email}</p>
              <p className="text-[10px] text-[#0D88CA] font-bold uppercase tracking-widest">{session.role === 'admin' ? 'Administrador' : 'Socio / Aficionado'}</p>
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

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
          © 2026 FANS - Gestión Inteligente de Tickets. Powered by Gemini Pro & Flash.
        </div>
      </footer>
    </div>
  );
};

export default App;
