import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, Globe, User, LogOut, LayoutDashboard, Shield, ChevronDown, Library } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t, languages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/stories', label: t('stories') },
    { to: '/courses', label: t('lms') },
    { to: '/community', label: 'Community' },
    { to: '/pricing', label: 'Pricing' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Ubuntu Math" className="h-8 w-8 object-contain" />
            <span className="font-black text-gray-900 text-lg tracking-tight hidden sm:block">Ubuntu Math</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.to)
                    ? 'bg-[#E95420]/10 text-[#E95420]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <button
              onClick={() => {
                const idx = languages.indexOf(lang);
                setLang(languages[(idx + 1) % languages.length]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all border border-gray-200 font-bold"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang}</span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E95420] text-white text-sm font-bold hover:bg-[#c94418] transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block max-w-24 truncate">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm text-gray-900 font-semibold truncate">{user.name}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> {t('dashboard')}
                    </Link>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4" /> {t('profile')}
                    </Link>
                    <Link to="/library" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                      <Library className="w-4 h-4" /> My Library
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                        <Shield className="w-4 h-4" /> {t('admin')}
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 w-full text-left transition-colors">
                      <LogOut className="w-4 h-4" /> {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                  {t('login')}
                </Link>
                <Link to="/register"
                  className="px-4 py-1.5 text-sm font-bold bg-[#E95420] text-white rounded-xl hover:bg-[#c94418] transition-colors shadow-sm">
                  {t('register')}
                </Link>
              </div>
            )}

            <button className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive(link.to) ? 'bg-[#E95420]/10 text-[#E95420]' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
