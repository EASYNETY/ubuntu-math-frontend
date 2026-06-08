import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-gray-300/50 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Ubuntu Math" className="h-10 w-10 object-contain" />
            <div>
              <p className="text-sm font-bold text-slate-800">Ubuntu Mathematics Platform</p>
              <p className="text-xs text-slate-600">Decoding African Innovation</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500 flex-wrap justify-center">
            <Link to="/stories" className="hover:text-gray-900 transition-colors">Stories</Link>
            <Link to="/books" className="hover:text-gray-900 transition-colors">Books</Link>
            <Link to="/essays" className="hover:text-gray-900 transition-colors">Essays</Link>
            <Link to="/processes" className="hover:text-gray-900 transition-colors">Processes</Link>
            <Link to="/simulator" className="hover:text-gray-900 transition-colors">Simulator</Link>
            <Link to="/courses" className="hover:text-gray-900 transition-colors">Courses</Link>
            <Link to="/community" className="hover:text-gray-900 transition-colors">Community</Link>
            <Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-slate-700">© {new Date().getFullYear()} <span className="font-bold">Easynet Telsurve Co</span></p>
            <p className="text-xs text-slate-500">Developed by Easynet Telsurve Co</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
