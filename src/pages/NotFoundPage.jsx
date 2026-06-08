import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-9xl font-black text-gray-200 mb-4" style={{ fontFamily: INTER }}>404</div>
        <h1 style={{ fontWeight: 900, fontFamily: INTER, color: '#111827' }} className="text-3xl mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-[#E95420] text-white rounded-2xl font-black hover:bg-[#c94418] transition-colors shadow-lg shadow-[#E95420]/20">
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
