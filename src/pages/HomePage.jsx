import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Zap, Award, Users, MapPin, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { storiesAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storiesAPI.getAll()
      .then(({ data }) => setStories(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
    analyticsAPI.track({ eventType: 'page_view', path: '/', userId: user?._id }).catch(() => {});
  }, []);

  return (
    <Layout>
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E95420]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2D6EAA]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12 flex-1">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-8">
            <h1 style={{ fontSize: 'clamp(3rem,10vw,7rem)', fontWeight: 900, fontFamily: INTER, letterSpacing: '-0.02em', lineHeight: 1, color: '#111827', marginBottom: '1.5rem' }}>
              {t('welcome')}
            </h1>
            <div className="border-l-4 border-gray-400 pl-4 max-w-lg">
              <p className="text-lg text-gray-600 leading-relaxed">{t('tagline')}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4 mb-12">
            <Link to="/stories" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#E95420] text-white rounded-2xl hover:bg-[#c94418] transition-all shadow-lg hover:-translate-y-0.5" style={{ fontWeight: 900, fontFamily: INTER }}>
              {t('exploreStories')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/simulator" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/60 text-gray-700 rounded-2xl border border-gray-200 hover:border-[#E95420]/40 hover:text-[#E95420] transition-all hover:-translate-y-0.5" style={{ fontWeight: 900, fontFamily: INTER }}>
              <Zap className="w-4 h-4" /> Try Simulator
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="border-2 border-dashed border-slate-400 rounded-3xl bg-white/50 backdrop-blur-sm overflow-hidden">
            {loading || stories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 border-4 border-[#E95420]/30 border-t-[#E95420] rounded-full animate-spin" />
                <p className="text-slate-600 text-sm uppercase tracking-widest" style={{ fontWeight: 700, fontFamily: INTER }}>Sourcing Innovations...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-dashed divide-slate-300">
                {stories.map((story, i) => (
                  <motion.div key={story._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                    <Link to={`/story/${story.slug}`} className="block p-6 hover:bg-white/70 transition-colors group">
                      {story.thumbnailUrl && (
                        <img src={story.thumbnailUrl} alt={story.title} className="w-full h-36 object-cover rounded-2xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                      )}
                      <h3 className="mb-2 line-clamp-2 group-hover:text-[#E95420] transition-colors" style={{ fontWeight: 900, fontFamily: INTER, color: '#111827' }}>
                        {story.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{story.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {story.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{story.location}</span>}
                          {story.estimatedReadTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{story.estimatedReadTime} min</span>}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#E95420] transition-all">
                          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-24 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: INTER, color: '#111827', marginBottom: '1rem' }}>Why Ubuntu Mathematics?</h2>
            <p className="text-gray-600 max-w-2xl text-lg">A unique approach to learning mathematics through the lens of African innovation and the Ubuntu philosophy.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'African Innovation Stories', desc: 'Discover real innovations from across Africa and learn the mathematics behind them.', color: '#E95420' },
              { icon: Zap, title: 'Ubuntu Value Simulator', desc: 'Model communal value creation using the Ubuntu philosophy and compare economic models.', color: '#2D6EAA' },
              { icon: Award, title: 'Earn Badges & Certificates', desc: 'Complete modules, solve problems, and earn recognition for your achievements.', color: '#38A169' },
              { icon: Users, title: 'Community Learning', desc: 'Join a growing community of learners exploring mathematics through African culture.', color: '#7B2D8B' },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: `${f.color}15` }}>
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 style={{ fontWeight: 900, fontFamily: INTER, color: '#111827', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-gray-200/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border-2 border-dashed border-slate-400 rounded-3xl p-16 bg-white/40 backdrop-blur-sm">
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: INTER, color: '#111827', marginBottom: '1rem' }}>Ready to start your journey?</h2>
            <p className="text-gray-600 mb-10 text-lg">Join thousands of learners discovering mathematics through African innovation.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register" className="px-10 py-4 bg-[#E95420] text-white rounded-2xl hover:bg-[#c94418] transition-colors shadow-lg" style={{ fontWeight: 900, fontFamily: INTER }}>Get Started Free</Link>
              <Link to="/courses" className="px-10 py-4 bg-white text-gray-800 rounded-2xl border border-gray-200 hover:border-[#E95420] hover:text-[#E95420] transition-colors" style={{ fontWeight: 900, fontFamily: INTER }}>Browse Courses</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
