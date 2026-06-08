import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, FileText, Brain, BookOpen, Beaker, Receipt, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { marketplaceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

const TYPE_ICONS = {
  book: BookOpen,
  'patent-dossier': Brain,
  process: Beaker,
  essay: FileText,
};

const TYPE_COLORS = {
  book: '#2D6EAA',
  'patent-dossier': '#7B2D8B',
  process: '#E95420',
  essay: '#38A169',
};

const TYPE_LABELS = {
  book: 'Digital Book',
  'patent-dossier': 'Patent Dossier',
  process: 'Industrial Process',
  essay: 'Academic Paper',
};

export default function CustomerLibraryPage() {
  const { user } = useAuth();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(null);

  useEffect(() => {
    if (!user) return;
    marketplaceAPI.getLibrary(user._id)
      .then(({ data }) => setLibrary(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleDownload = async (item) => {
    setDownloading(item.purchaseId);
    try {
      const { data } = await marketplaceAPI.download(item.product?._id || item.purchaseId, {
        userId: user._id,
        purchaseId: item.purchaseId,
      });

      if (data.downloadUrl) {
        alert(`📄 Your document is watermarked with:\n• Name: ${data.watermarkData?.name}\n• Email: ${data.watermarkData?.email}\n• Order: ${data.watermarkData?.orderId}\n\n${data.watermarkData?.notice}`);
        window.open(data.downloadUrl, '_blank');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Download failed';
      alert(msg);
    } finally {
      setDownloading(null);
    }
  };

  const handleInvoice = async (item) => {
    setInvoiceLoading(item.purchaseId);
    try {
      const { data } = await marketplaceAPI.getInvoice(item.purchaseId, user._id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
    } finally {
      setInvoiceLoading(null);
    }
  };

  if (!user) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-gray-500">Please <Link to="/login" className="text-[#E95420] hover:underline">sign in</Link> to view your library.</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="border-b border-gray-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#38A169] font-bold tracking-widest uppercase text-sm block mb-3">My Account</span>
            <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-4xl text-gray-900 mb-2">My Library</h1>
            <p className="text-gray-600">Your purchased digital products and downloads</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : library.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-xl text-gray-900 mb-2">Your library is empty</h2>
            <p className="text-gray-500 mb-6">Purchase products from the marketplace to see them here.</p>
            <Link to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E95420] text-white rounded-xl font-black hover:bg-[#c94418] transition-colors">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {library.map((item, i) => {
              const Icon = TYPE_ICONS[item.productType] || FileText;
              const color = TYPE_COLORS[item.productType] || '#E95420';
              const label = TYPE_LABELS[item.productType] || 'Product';
              const downloadPct = item.maxDownloads > 0
                ? ((item.downloadCount / item.maxDownloads) * 100)
                : 0;
              const atLimit = item.downloadCount >= item.maxDownloads;

              return (
                <motion.div key={item.purchaseId}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white/70 border border-gray-200/60 rounded-2xl p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}15` }}>
                      <Icon className="w-7 h-7" style={{ color }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
                          {label}
                        </span>
                        {item.licenseId && (
                          <span className="text-xs text-gray-400 font-mono">#{item.licenseId}</span>
                        )}
                      </div>
                      <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 truncate">
                        {item.product?.title || (item.productType === 'patent-dossier' ? 'CAMS Industrial Patent Dossier' : 'Product')}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        <span>Purchased: {new Date(item.purchasedAt).toLocaleDateString()}</span>
                        <span>Paid: ${item.amountPaid} {item.currency}</span>
                        {item.bundlePurchase && <span className="text-[#38A169] font-bold">Bundle</span>}
                      </div>

                      {/* Download progress */}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Downloads: {item.downloadCount}/{item.maxDownloads}</span>
                          {atLimit && <span className="text-red-500 font-bold">Limit reached</span>}
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden w-32">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${downloadPct}%`, backgroundColor: atLimit ? '#ef4444' : color }} />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleInvoice(item)}
                        disabled={invoiceLoading === item.purchaseId}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-60">
                        <Receipt className="w-3.5 h-3.5" />
                        {invoiceLoading === item.purchaseId ? '...' : 'Invoice'}
                      </button>

                      {atLimit ? (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-500 rounded-xl text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Limit Reached
                        </div>
                      ) : (
                        <button onClick={() => handleDownload(item)}
                          disabled={downloading === item.purchaseId}
                          className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-black hover:opacity-90 transition-colors disabled:opacity-60"
                          style={{ backgroundColor: color }}>
                          <Download className="w-3.5 h-3.5" />
                          {downloading === item.purchaseId ? 'Preparing...' : 'Download'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DRM notice */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="w-3 h-3" />
                    <span>Watermarked with your name, email & order ID. Unauthorized redistribution is prohibited.</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* DRM info */}
        {library.length > 0 && (
          <div className="mt-8 bg-white/70 border border-gray-200/60 rounded-2xl p-5">
            <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#38A169]" /> About Your Downloads
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#38A169] flex-shrink-0 mt-0.5" />
                <span>Each download is watermarked with your personal details for leak tracing</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#38A169] flex-shrink-0 mt-0.5" />
                <span>Downloads are limited per purchase. Contact support to request additional downloads</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>Unauthorized redistribution violates your license agreement and is traceable</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
