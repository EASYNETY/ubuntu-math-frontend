import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, TrendingUp, Star, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import { essaysAPI } from '../services/api';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";
const CATEGORIES = ['All', 'Mathematics', 'Innovation', 'Economics', 'Technology', 'Agriculture', 'General'];

export default function EssaysPage() {
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [downloading, setDownloading] = useState(null);

  const load = (params = {}) => {
    setLoading(true);
    essaysAPI.getAll(params)
      .then(({ data }) => setEssays(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => {
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    load(params);
  };

  useEffect(() => {
    const params = {};
    if (category !== 'All') params.category = category;
    if (search) params.search = search;
    load(params);
  }, [category]);

  const handleDownload = async (essay) => {
    setDownloading(essay._id);
    try {
      const { data } = await essaysAPI.download(essay._id);
      if (data.downloadUrl) window.open(data.downloadUrl, '_blank');
    } catch { alert('Download failed.'); }
    finally { setDownloading(null); }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="border-b border-gray-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#38A169] font-bold tracking-widest uppercase text-sm block mb-3">Free Access</span>
            <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-5xl text-gray-900 mb-3">Essays & Academic Papers</h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Free educational content — research papers, essays, and academic work on African innovation and mathematics.
              All papers are freely downloadable.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search essays, authors, topics..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#38A169]/50 transition-all" />
          </div>
          <button onClick={handleSearch}
            className="px-6 py-3 bg-[#38A169] text-white rounded-2xl font-black hover:bg-[#2d8a57] transition-colors text-sm">
            Search
          </button>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                category === cat
                  ? 'bg-[#38A169] text-white shadow-lg shadow-[#38A169]/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#38A169]/30 hover:text-[#38A169]'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : essays.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">No essays found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {essays.map((essay, i) => (
              <motion.div key={essay._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white/70 border border-gray-200/60 rounded-2xl p-5 sm:p-6 hover:border-[#38A169]/30 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {essay.featured && (
                        <span className="flex items-center gap-1 text-xs font-black text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                      <span className="text-xs font-bold text-[#38A169] bg-green-50 px-2 py-0.5 rounded-full">{essay.category}</span>
                    </div>
                    <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 text-lg mb-1 group-hover:text-[#38A169] transition-colors line-clamp-2">
                      {essay.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">by <span className="text-gray-800 font-bold">{essay.author}</span></p>
                    <p className="text-sm text-gray-500 line-clamp-2">{essay.abstract}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {essay.tags?.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                        <TrendingUp className="w-3 h-3" /> {essay.downloadCount} downloads
                      </p>
                    </div>

                    <button onClick={() => handleDownload(essay)}
                      disabled={downloading === essay._id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-50 border border-green-200 text-[#38A169] rounded-xl text-sm font-black hover:bg-green-100 transition-colors disabled:opacity-60 whitespace-nowrap">
                      <Download className="w-4 h-4" />
                      {downloading === essay._id ? 'Downloading...' : 'Free Download'}
                    </button>

                    {essay.academiaUrl && (
                      <a href={essay.academiaUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                        <ExternalLink className="w-3 h-3" /> Academia.edu
                      </a>
                    )}
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
