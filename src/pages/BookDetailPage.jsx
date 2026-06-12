import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Download, ShoppingCart, CheckCircle, FileText, Eye } from 'lucide-react';
import Layout from '../components/Layout';
import { booksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SampleReader, { SampleReaderModal } from '../components/SampleReader';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function BookDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [buying, setBuying] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [sampleMode, setSampleMode] = useState('inline');

  useEffect(() => {
    booksAPI.getBySlug(slug)
      .then(({ data }) => {
        setBook(data);
        if (user) {
          booksAPI.checkPurchase(user._id, data._id)
            .then(({ data: p }) => setPurchased(p.purchased))
            .catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, user]);

  const handleBuy = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setBuying(true);
    try {
      const { data } = await booksAPI.initPayment({ userId: user._id, bookId: book._id, bundle: false, email: user.email });
      if (data.url) window.location.href = data.url;
    } catch (e) { console.error(e); }
    finally { setBuying(false); }
  };

  const handleDownload = async () => {
    try {
      const { data } = await booksAPI.download(book._id, user._id);
      if (data.downloadUrl) window.open(data.downloadUrl, '_blank');
    } catch { alert('Download failed. Please ensure you have purchased this book.'); }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 border-4 border-[#E95420]/30 border-t-[#E95420] rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!book) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-gray-500">Book not found.</p>
        <Link to="/books" className="text-[#E95420] mt-4 inline-block hover:underline">← Back to Library</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      {/* Sample modal */}
      {showSample && sampleMode === 'modal' && (
        <SampleReaderModal
          sampleUrl={book.sampleChapterUrl}
          fullContentUrl={book.fullContentUrl}
          bookTitle={book.title}
          purchased={purchased}
          onClose={() => setShowSample(false)}
        />
      )}

      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link to="/books" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Cover */}
          <div className="md:col-span-1">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <BookOpen className="w-16 h-16 text-[#E95420]/40" />
                  {book.seriesNumber && (
                    <span className="text-3xl font-black text-[#E95420]/60">#{book.seriesNumber}</span>
                  )}
                </div>
              )}
            </motion.div>

            {/* Purchase card */}
            <div className="mt-5 bg-white/70 border border-gray-200/60 rounded-2xl p-5 space-y-3">
              <div className="text-center">
                <p className="text-3xl font-black text-gray-900">${book.price}</p>
                <p className="text-xs text-gray-500 mt-1">EPUB · Lifetime access</p>
              </div>

              {purchased ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-[#38A169] text-sm font-black py-1">
                    <CheckCircle className="w-4 h-4" /> Purchased
                  </div>
                  <button onClick={handleDownload}
                    className="w-full py-3 bg-[#38A169] text-white rounded-xl font-black hover:bg-[#2d8a57] transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download Full Book
                  </button>
                </>
              ) : (
                <button onClick={handleBuy} disabled={buying}
                  className="w-full py-3 bg-[#E95420] text-white rounded-xl font-black hover:bg-[#c94418] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#E95420]/20">
                  <ShoppingCart className="w-4 h-4" />
                  {buying ? 'Processing...' : `Buy Now — $${book.price}`}
                </button>
              )}

              {/* Sample chapter buttons */}
              {book.sampleChapterUrl && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setSampleMode('inline'); setShowSample(s => !s); }}
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border ${
                      showSample && sampleMode === 'inline'
                        ? 'bg-blue-100 border-blue-300 text-[#2D6EAA]'
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                    }`}>
                    <Eye className="w-3.5 h-3.5" />
                    {showSample && sampleMode === 'inline' ? 'Hide' : purchased ? 'Read' : 'Read Sample'}
                  </button>
                  <button
                    onClick={() => { setSampleMode('modal'); setShowSample(true); }}
                    className="py-2.5 bg-gray-100 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Full Screen
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#38A169]" /> Instant download after purchase</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#38A169]" /> EPUB format</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#38A169]" /> Lifetime access</div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {book.seriesNumber && (
                <span className="text-[#E95420] font-bold tracking-widest uppercase text-xs block mb-2">
                  Book #{book.seriesNumber} of 16
                </span>
              )}
              <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-3xl sm:text-4xl text-gray-900 mb-2">{book.title}</h1>
              <p className="text-gray-500 mb-4">
                by <span className="text-gray-800 font-bold">{book.author}</span>
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-[#2D6EAA] rounded-full text-xs font-bold capitalize">
                  {book.category}
                </span>
                {book.tags?.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-500 rounded-full text-xs font-bold">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="bg-white/70 border border-gray-200/60 rounded-2xl p-6">
                <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 mb-3">About This Book</h2>
                <p className="text-gray-600 leading-relaxed">{book.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/70 border border-gray-200/60 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-[#E95420]">{book.downloadCount || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Downloads</p>
                </div>
                <div className="bg-white/70 border border-gray-200/60 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-[#2D6EAA]">{book.purchaseCount || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Purchases</p>
                </div>
                <div className="bg-white/70 border border-gray-200/60 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-[#38A169] uppercase">{book.fileType || 'epub'}</p>
                  <p className="text-xs text-gray-500 mt-1">Format</p>
                </div>
              </div>
            </motion.div>

            {/* Inline sample reader */}
            <AnimatePresence>
              {showSample && sampleMode === 'inline' && book.sampleChapterUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border border-[#2D6EAA]/30 rounded-2xl overflow-hidden">
                    <SampleReader
                      sampleUrl={book.sampleChapterUrl}
                      fullContentUrl={book.fullContentUrl}
                      bookTitle={book.title}
                      purchased={purchased}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}
