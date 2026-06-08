import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, BarChart3 } from 'lucide-react';
import Layout from '../components/Layout';
import { computationAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";
const INNOVATION_TYPES = ['Agriculture', 'Energy', 'Water', 'Health', 'Education', 'Technology'];

export default function SimulatorPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ communitySize: 1000, resourcesCaptured: 50000, innovationType: 'Agriculture', modelType: 'ubuntu' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await computationAPI.calculate(form);
      setResult(data);
      analyticsAPI.track({ eventType: 'simulation_run', eventData: form, path: '/simulator', userId: user?._id }).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="border-b border-gray-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#2D6EAA] font-bold tracking-widest uppercase text-sm block mb-3">Interactive Tool</span>
            <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-5xl text-gray-900 mb-3">Ubuntu Value Simulator</h1>
            <p className="text-gray-600 text-lg max-w-xl">
              Model communal value creation using the Ubuntu philosophy and compare it with traditional economic models.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4">
            <div className="bg-white/70 border border-gray-200/60 rounded-3xl p-8 sticky top-24">
              <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 text-lg mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#2D6EAA]" /> Parameters
              </h2>

              <div className="space-y-6">
                <div>
                  <label id="community-label" className="block text-sm font-bold text-gray-600 mb-2">Community Size</label>
                  <input type="range" min="100" max="50000" step="100" aria-labelledby="community-label"
                    value={form.communitySize} onChange={(e) => setForm({ ...form, communitySize: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2D6EAA] focus:ring-2 focus:ring-[#2D6EAA] outline-none" />
                  <div className="text-right text-[#2D6EAA] font-mono mt-2 text-sm" aria-live="polite">
                    {form.communitySize.toLocaleString()} members
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Resources Captured (USD)</label>
                  <input type="range" min="1000" max="1000000" step="1000"
                    value={form.resourcesCaptured} onChange={(e) => setForm({ ...form, resourcesCaptured: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E95420] outline-none" />
                  <div className="text-right text-[#E95420] font-mono mt-2 text-sm">
                    ${form.resourcesCaptured.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-3">Innovation Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {INNOVATION_TYPES.map((type) => (
                      <button key={type} onClick={() => setForm({ ...form, innovationType: type })}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                          form.innovationType === type ? 'bg-[#38A169] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200'
                        }`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-3">Model Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ id: 'ubuntu', label: '🌍 Ubuntu', color: '#E95420' }, { id: 'traditional', label: '📊 Traditional', color: '#2D6EAA' }].map((m) => (
                      <button key={m.id} onClick={() => setForm({ ...form, modelType: m.id })}
                        className={`py-3 rounded-2xl text-sm font-black transition-all ${
                          form.modelType === m.id
                            ? 'text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        }`}
                        style={form.modelType === m.id ? { backgroundColor: m.color, boxShadow: `0 8px 24px -4px ${m.color}40` } : {}}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

                <button onClick={handleCalculate} disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#E95420] to-[#2D6EAA] text-white rounded-2xl font-black hover:opacity-90 transition-opacity disabled:opacity-60 shadow-xl text-base">
                  {loading ? 'Calculating...' : 'Calculate Ubuntu Value →'}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-8">
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Main metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 border border-gray-200/60 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <TrendingUp size={100} />
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Communal Value Score</h3>
                    <p className="text-5xl font-black text-gray-900 mb-2">{result.ubuntu?.communalValueScore?.toLocaleString() ?? result.communalValueScore?.toLocaleString() ?? '—'}</p>
                    {result.ubuntu?.impactMultiplier && (
                      <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                        Multiplier: {result.ubuntu.impactMultiplier}x
                      </div>
                    )}
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white/70 border border-gray-200/60 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <BarChart3 size={100} />
                    </div>
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Environmental Score</h3>
                    <p className="text-5xl font-black text-[#38A169] mb-2">
                      {result.ubuntu?.environmentalScore ?? result.environmentalScore ?? '—'}/10
                    </p>
                    {result.ubuntu?.environmentalScore && (
                      <div className="text-sm text-gray-500">Sustainability Factor: +{Number(result.ubuntu.environmentalScore).toFixed(1)}% Growth</div>
                    )}
                  </motion.div>
                </div>

                {/* Model comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Traditional */}
                  <div className="bg-white/70 border border-gray-200/60 p-6 rounded-3xl opacity-60 grayscale hover:grayscale-0 transition-all">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-widest">Traditional Capitalist Model</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-500 text-sm">Net Profit (Year 1)</p>
                        <p className="text-3xl font-bold text-gray-700">${(result.traditional?.profit ?? result.profit ?? 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Community Reinvestment</p>
                        <p className="text-sm font-bold text-red-500">0%</p>
                      </div>
                      <div className="h-1 bg-red-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 w-1/4" />
                      </div>
                    </div>
                  </div>

                  {/* Ubuntu */}
                  <motion.div
                    className="relative p-6 rounded-3xl border-2 bg-[#E95420]/10 border-[#E95420]/50 shadow-[0_0_40px_-10px_rgba(233,84,32,0.3)]"
                    animate={{ boxShadow: ['0 0 20px -5px rgba(233,84,32,0.2)', '0 0 50px 0px rgba(233,84,32,0.35)', '0 0 20px -5px rgba(233,84,32,0.2)'] }}
                    transition={{ duration: 2, repeat: Infinity }}>
                    <h3 className="text-[#E95420] text-xs font-bold uppercase mb-4 tracking-widest">Ubuntu Sovereign Model</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600 text-sm">Communal Value Impact</p>
                        <p className="text-3xl font-black text-gray-900">${(result.ubuntu?.communalValueScore ?? result.communalValueScore ?? 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[#38A169] text-xs font-bold">Community Reinvestment: 100%</p>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }}
                          className="h-full bg-gradient-to-r from-[#E95420] to-[#38A169]" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-[#E95420] text-white text-[10px] font-black px-2 py-1 rounded-full animate-bounce">
                      UBUNTU WIN
                    </div>
                  </motion.div>
                </div>

                <div className="pt-4 flex justify-center">
                  <button onClick={() => alert('Generating Nation Building Report Card (PDF)...')}
                    className="px-8 py-4 bg-white/70 hover:bg-white border border-gray-200/60 rounded-2xl font-bold flex items-center gap-3 transition-all text-gray-700">
                    <TrendingUp className="w-5 h-5 text-[#38A169]" /> Generate Nation Building Report Card
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 animate-pulse py-32">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-bold">initializing ubuntu engine...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
