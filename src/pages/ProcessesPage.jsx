import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Beaker, Search, ShoppingCart, ChevronRight, Tag } from 'lucide-react';
import Layout from '../components/Layout';
import { processesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";
const CATEGORIES = ['All', 'Food Processing', 'Manufacturing', 'Chemistry', 'Agriculture', 'Energy', 'Water Treatment'];

export default function ProcessesPage() {
  const { user } = useAuth();
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const load = (params = {}) => {
    setLoading(true);
    processesAPI.getAll(params)
      .then(({ data }) => setProcesses(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const params = {};
    if (category !== 'All') params.category = category;
    if (search) params.search = search;
    load(params);
  }, [category]);

  const handleBuy = async (process) => {
    if (!user) { window.location.href = '/login'; return; }
    try {
      const { data } = await processesAPI.initPayment({ userId: user._id, processId: process._id, email: user.email });
      if (data.url) window.location.href = data.url;
    } catch (e) { console.error(e); }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="border-b border-gray-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#7B2D8B] font-bold tracking-widest uppercase text-sm block mb-3">Technical Process Documents</span>
            <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-5xl text-gray-900 mb-3">Industrial Processes</h1>
            <p className="text-gray-600 text-lg max-w-2xl mb-4">
              Full professional-grade process documents — inputs, steps, equipment, scaling, and safety.
              Each is a standalone technical document for <strong className="text-gray-900">engineers, manufacturers, and co-ops</strong>.
            </p>
            {/* Cookbook upsell */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="inline-flex items-center gap-3 bg-[#E95420]/10 border border-[#E95420]/20 rounded-2xl px-5 py-3">
                <span className="text-lg">🍳</span>
                <div>
                  <p className="text-xs font-black text-gray-900">New to industrial production?</p>
                  <p className="text-xs text-gray-500">
                    Try the <a href="/cookbook" className="text-[#E95420] font-black hover:underline">CAMS Cookbook — $9.99</a> first · 25 beginner recipes
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-3 bg-[#7B2D8B]/10 border border-[#7B2D8B]/20 rounded-2xl px-5 py-3">
                <Tag className="w-5 h-5 text-[#7B2D8B]" />
                <span className="text-sm text-gray-600">
                  <span className="font-black text-gray-900">$49.99</span> per process — full documentation + scaling guide
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search processes..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load({ search, category: category !== 'All' ? category : undefined })}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#7B2D8B]/50 transition-all" />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                category === cat
                  ? 'bg-[#7B2D8B] text-white shadow-lg shadow-[#7B2D8B]/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#7B2D8B]/30 hover:text-[#7B2D8B]'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : processes.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Beaker className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">No processes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {processes.map((proc, i) => (
              <motion.div key={proc._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/70 border border-gray-200/60 rounded-2xl overflow-hidden hover:border-[#7B2D8B]/30 hover:-translate-y-1 transition-all group">
                {proc.coverUrl ? (
                  <img src={proc.coverUrl} alt={proc.title} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-[#7B2D8B]/10 to-purple-50 flex items-center justify-center">
                    <Beaker className="w-12 h-12 text-[#7B2D8B]/40" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#7B2D8B] bg-purple-50 px-2 py-0.5 rounded-full">{proc.category}</span>
                    <span className="text-xs text-gray-400">v{proc.version}</span>
                  </div>
                  <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 mb-2 line-clamp-2 group-hover:text-[#7B2D8B] transition-colors">{proc.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{proc.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-gray-900">${proc.price}</span>
                    <div className="flex gap-2">
                      <Link to={`/processes/${proc.slug}`}
                        className="px-3 py-2 bg-gray-100 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors flex items-center gap-1">
                        Preview <ChevronRight className="w-3 h-3" />
                      </Link>
                      <button onClick={() => handleBuy(proc)}
                        className="px-3 py-2 bg-[#7B2D8B]/10 border border-[#7B2D8B]/30 text-[#7B2D8B] rounded-xl text-xs font-black hover:bg-[#7B2D8B]/20 transition-colors flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" /> Buy
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
