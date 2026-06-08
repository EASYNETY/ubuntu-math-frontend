import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Beaker, ShoppingCart, ChevronRight, Package, Clock, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import { processesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function ProcessDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [process, setProcess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    processesAPI.getBySlug(slug)
      .then(({ data }) => setProcess(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleBuy = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setBuying(true);
    try {
      const { data } = await processesAPI.initPayment({ userId: user._id, processId: process._id, email: user.email });
      if (data.url) window.location.href = data.url;
    } catch (e) { console.error(e); }
    finally { setBuying(false); }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 border-4 border-[#7B2D8B]/30 border-t-[#7B2D8B] rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!process) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-gray-500">Process not found.</p>
        <Link to="/processes" className="text-[#7B2D8B] mt-4 inline-block hover:underline">← Back to Processes</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link to="/processes" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Processes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-[#7B2D8B] font-bold tracking-widest uppercase text-xs block mb-2">{process.category}</span>
              <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-4xl text-gray-900 mb-2">{process.title}</h1>
              <p className="text-gray-600 leading-relaxed mb-4">{process.description}</p>

              {/* Preview content */}
              {process.previewContent && (
                <div className="bg-white/70 border border-gray-200/60 rounded-2xl p-6">
                  <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 mb-3 flex items-center gap-2">
                    <Beaker className="w-5 h-5 text-[#7B2D8B]" /> Process Overview (Preview)
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{process.previewContent}</p>
                  <div className="mt-4 p-4 bg-[#7B2D8B]/10 border border-[#7B2D8B]/20 rounded-xl flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-[#7B2D8B] flex-shrink-0" />
                    <p className="text-sm text-gray-600">Purchase to access full process documentation, all steps, equipment list, and scaling instructions.</p>
                  </div>
                </div>
              )}

              {/* Inputs preview */}
              {process.inputs?.length > 0 && (
                <div className="bg-white/70 border border-gray-200/60 rounded-2xl p-6">
                  <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#E95420]" /> Inputs Required
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {process.inputs.map((inp, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <p className="font-bold text-gray-900 text-sm">{inp.name}</p>
                        <p className="text-xs text-gray-500">{inp.quantity} {inp.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps preview (first 2 only) */}
              {process.steps?.length > 0 && (
                <div className="bg-white/70 border border-gray-200/60 rounded-2xl p-6">
                  <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 mb-4 flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-[#2D6EAA]" /> Process Steps (Preview)
                  </h2>
                  <div className="space-y-3">
                    {process.steps.slice(0, 2).map((step) => (
                      <div key={step.order} className="flex gap-4">
                        <div className="w-8 h-8 bg-[#2D6EAA]/10 text-[#2D6EAA] rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">
                          {step.order}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{step.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                          {step.duration && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{step.duration}</p>}
                        </div>
                      </div>
                    ))}
                    {process.steps.length > 2 && (
                      <div className="text-center py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 text-sm">
                        + {process.steps.length - 2} more steps — purchase to unlock
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Safety notes */}
              {process.safetyNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-yellow-700 text-sm mb-1">Safety Notes</p>
                    <p className="text-sm text-gray-600">{process.safetyNotes}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Purchase sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 border border-gray-200/60 rounded-2xl p-6 sticky top-24">
              <div className="text-center mb-5">
                <p className="text-4xl font-black text-gray-900">${process.price}</p>
                <p className="text-xs text-gray-500 mt-1">One-time purchase</p>
              </div>

              <button onClick={handleBuy} disabled={buying}
                className="w-full py-3.5 bg-[#7B2D8B] text-white rounded-xl font-black hover:bg-[#6a2578] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#7B2D8B]/20 mb-4">
                <ShoppingCart className="w-4 h-4" />
                {buying ? 'Processing...' : 'Purchase Full Process'}
              </button>

              <div className="space-y-2 text-xs text-gray-500 border-t border-gray-100 pt-4">
                {[
                  'Complete step-by-step documentation',
                  'Equipment list & specifications',
                  'Scaling instructions',
                  'Expected output metrics',
                  'PDF download included',
                  'Version updates included',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#7B2D8B] rounded-full flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-lg font-black text-[#7B2D8B]">{process.downloadCount}</p>
                  <p className="text-xs text-gray-500">Downloads</p>
                </div>
                <div>
                  <p className="text-lg font-black text-[#E95420]">v{process.version}</p>
                  <p className="text-xs text-gray-500">Version</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
