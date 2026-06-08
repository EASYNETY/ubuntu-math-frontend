import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Search, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { storiesAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function StoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');

  useEffect(() => {
    storiesAPI.getAll().then(({ data }) => setStories(data)).catch(console.error).finally(() => setLoading(false));
    analyticsAPI.track({ eventType: 'page_view', path: '/stories', userId: user?._id }).catch(() => {});
  }, []);

  const regions = ['All', ...new Set(stories.map((s) => s.region).filter(Boolean))];
  const filtered = stories.filter((s) => {
    const matchSearch = !search ||
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.location?.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === 'All' || s.region === regionFilter;
    return matchSearch && matchRegion;
  });

  return (
    <Layout>
      {/* Header */}
      <div className="border-b border-gray-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-5xl text-gray-900 mb-3">Innovation Stories</h1>
            <p className="text-gray-600 text-lg max-w-xl">
              Discover real African innovations and learn the mathematics behind them.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search stories, locations, innovators..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E95420]/50 focus:ring-1 focus:ring-[#E95420]/30 transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {regions.map((r) => (
              <button key={r} onClick={() => setRegionFilter(r)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  regionFilter === r
                    ? 'bg-[#E95420] text-white shadow-lg shadow-[#E95420]/20'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#E95420]/30 hover:text-[#E95420]'
                }`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 border-4 border-[#E95420]/30 border-t-[#E95420] rounded-full animate-spin" />
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Sourcing Innovations...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-3xl py-20 text-center bg-white/50">
            <p className="text-gray-500 font-bold">No stories found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((story, i) => (
              <motion.div key={story._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/story/${story.slug}`}
                  className="block bg-white/70 border border-gray-200/60 rounded-3xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group">
                  {story.thumbnailUrl ? (
                    <img src={story.thumbnailUrl} alt={story.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-[#E95420]/10 to-[#2D6EAA]/10 flex items-center justify-center">
                      <span className="text-4xl">🌍</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 mb-2 line-clamp-2 group-hover:text-[#E95420] transition-colors text-lg">
                      {story.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{story.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {story.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{story.location}</span>}
                        {story.estimatedReadTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{story.estimatedReadTime} min</span>}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#E95420] group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      </div>
                    </div>
                    {story.innovators?.length > 0 && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span className="truncate">{story.innovators.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
