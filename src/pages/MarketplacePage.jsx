import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Beaker, Brain, GraduationCap, FileText, Package, ArrowRight, Star, Shield, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { marketplaceAPI } from '../services/api';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

const CATEGORY_ICONS = {
  books: BookOpen,
  'industrial-cookbook': Beaker,
  'patent-dossier': Brain,
  courses: GraduationCap,
  essays: FileText,
};

const CATEGORY_COLORS = {
  books: '#2D6EAA',
  'industrial-cookbook': '#E95420',
  'patent-dossier': '#7B2D8B',
  courses: '#38A169',
  essays: '#F59E0B',
};

const CATEGORY_ROUTES = {
  books: '/books',
  'industrial-cookbook': '/cookbook',
  'patent-dossier': '/patent-dossier',
  courses: '/courses',
  essays: '/essays',
};

export default function MarketplacePage() {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketplaceAPI.getCatalog()
      .then(({ data }) => setCatalog(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <div className="border-b border-gray-200/60 bg-white/40 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#E95420] font-bold tracking-widest uppercase text-sm block mb-3">Digital Marketplace</span>
            <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-5xl sm:text-6xl text-gray-900 mb-4 leading-tight">
              CAMS Knowledge<br />
              <span className="text-[#E95420]">Marketplace</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mb-8">
              Premium industrial knowledge assets — books, patents, processes, and courses.
              Built for entrepreneurs, engineers, and innovators across Africa.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/patent-dossier"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7B2D8B] text-white rounded-2xl font-black hover:bg-[#6a2578] transition-colors shadow-lg shadow-[#7B2D8B]/20">
                <Brain className="w-5 h-5" /> Patent Dossier — $1,000
              </Link>
              <Link to="/cookbook"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E95420]/10 border border-[#E95420]/30 text-[#E95420] rounded-2xl font-black hover:bg-[#E95420]/20 transition-colors">
                <Beaker className="w-5 h-5" /> Industrial Cookbook — $9.99
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="border-b border-gray-200/60 bg-white/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            {[
              { icon: Shield, text: 'DRM Protected Downloads' },
              { icon: Zap, text: 'Instant Digital Delivery' },
              { icon: Star, text: 'Licensed IP Content' },
              { icon: Package, text: 'Bundle Discounts Available' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-[#38A169]" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-3xl h-64 animate-pulse border border-gray-200" />
            ))
          ) : catalog?.categories?.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.id] || Package;
            const color = CATEGORY_COLORS[cat.id] || '#E95420';
            const route = CATEGORY_ROUTES[cat.id] || '/';
            const isPremium = cat.id === 'patent-dossier';

            return (
              <motion.div key={cat.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link to={route}
                  className={`block rounded-3xl p-7 border transition-all hover:-translate-y-1 group relative overflow-hidden ${
                    isPremium
                      ? 'bg-gradient-to-br from-purple-50 to-white border-[#7B2D8B]/30 hover:border-[#7B2D8B]/60'
                      : 'bg-white/70 border-gray-200/60 hover:border-gray-300'
                  }`}>
                  {isPremium && (
                    <div className="absolute top-4 right-4 bg-[#7B2D8B] text-white text-xs font-black px-3 py-1 rounded-full">
                      PREMIUM
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl"
                    style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-7 h-7" style={{ color }} />
                  </div>
                  <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-xl text-gray-900 mb-2 group-hover:text-[#E95420] transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cat.description}</p>

                  {cat.price !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black" style={{ color }}>
                        {cat.price === 0 ? 'Free' : `${cat.price}`}
                      </span>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#E95420] group-hover:translate-x-1 transition-all" />
                    </div>
                  )}

                  {cat.bundlePrice && (
                    <div className="mt-2 text-xs text-gray-500">
                      Bundle: <span className="text-[#38A169] font-bold">${cat.bundlePrice}</span> for all {cat.items?.length || 15} books
                    </div>
                  )}

                  {cat.subscriptionPlans && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {cat.subscriptionPlans.map((plan) => (
                        <span key={plan.id} className="text-xs px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-gray-500">
                          ${plan.price}/{plan.interval === 'year' ? 'yr' : 'mo'}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Featured: Patent Dossier */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 border border-[#7B2D8B]/20 rounded-3xl p-8 sm:p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-[#7B2D8B] font-bold tracking-widest uppercase text-xs block mb-3">Featured Product</span>
              <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-3xl sm:text-4xl text-gray-900 mb-4">
                CAMS Industrial Patent Dossier
              </h2>
              <p className="text-gray-600 mb-6">
                388 fully documented industrial patents covering manufacturing, food processing,
                materials science, and sustainable technology. Includes 1 year of updates and support.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-black text-gray-900">$1,000</span>
                <span className="text-gray-500 text-sm">one-time + subscription options</span>
              </div>
              <Link to="/patent-dossier"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#7B2D8B] text-white rounded-2xl font-black hover:bg-[#6a2578] transition-colors shadow-xl shadow-[#7B2D8B]/20">
                <Brain className="w-5 h-5" /> View Patent Dossier
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '388', label: 'Patents' },
                { value: '1yr', label: 'Updates' },
                { value: '<48h', label: 'Support SLA' },
                { value: '4x/yr', label: 'Webinars' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
                  <p className="text-3xl font-black text-[#7B2D8B]">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Funnel: Free → Paid */}
        <div className="text-center mb-12">
          <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-2xl text-gray-900 mb-3">Your Learning Journey</h2>
          <p className="text-gray-500 mb-8">Start free, upgrade when ready</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Free Courses', color: '#38A169', route: '/courses' },
              { label: '→', color: '#9ca3af', route: null },
              { label: 'Essays & Papers', color: '#F59E0B', route: '/essays' },
              { label: '→', color: '#9ca3af', route: null },
              { label: 'Cookbook $9.99', color: '#E95420', route: '/cookbook' },
              { label: '→', color: '#9ca3af', route: null },
              { label: 'Process Docs $49.99', color: '#E95420', route: '/processes' },
              { label: '→', color: '#9ca3af', route: null },
              { label: 'Books Series', color: '#2D6EAA', route: '/books' },
              { label: '→', color: '#9ca3af', route: null },
              { label: 'Patent Dossier $1,000', color: '#7B2D8B', route: '/patent-dossier' },
            ].map((step, i) =>
              step.route ? (
                <Link key={i} to={step.route}
                  className="px-4 py-2 rounded-xl text-sm font-black border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: `${step.color}40`, color: step.color, backgroundColor: `${step.color}10` }}>
                  {step.label}
                </Link>
              ) : (
                <span key={i} className="text-gray-400 font-bold">{step.label}</span>
              )
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
