import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingCart, Download, Star, Package, Search, Eye } from 'lucide-react';
import Layout from '../components/Layout';
import { booksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SampleReaderModal } from '../components/SampleReader';
import CheckoutModal from '../components/payment/CheckoutModal';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";
const BUNDLE_PRICE = 499.99;
const SINGLE_PRICE = 39.99;

export default function BooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [purchases, setPurchases] = useState({});
  const [previewBook, setPreviewBook] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(null);

  useEffect(() => {
    booksAPI.getAll()
      .then(({ data }) => setBooks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user || !books.length) return;
    booksAPI.checkPurchase(user._id, null)
      .then(({ data }) => {
        if (data.bundle) {
          const all = {};
          books.forEach(b => { all[b._id] = true; });
          setPurchases(all);
        }
      }).catch(() => {});
  }, [user, books]);

  const filtered = books.filter(b =>
    !search || b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  const handleBuyBundle = async () => {
    if (!user) { window.location.href = '/login'; return; }
    try {
      const { data } = await booksAPI.initPayment({ userId: user._id, bundle: true, email: user.email });
      if (data.url) window.location.href = data.url;
    } catch (e) { console.error(e); }
  };

  const handleBuyBook = async (book) => {
    if (!user) { window.location.href = '/login'; return; }
    // Open EvriPay checkout modal
    setCheckoutModal({
      itemType: 'book',
      itemId: book._id,
      itemName: book.title,
      amount: book.price || SINGLE_PRICE
    });
  };

  const handleDownload = async (book) => {
    try {
      const { data } = await booksAPI.download(book._id, user._id);
      if (data.downloadUrl) window.open(data.downloadUrl, '_blank');
    } catch (e) { alert('Download failed. Please ensure you have purchased this book.'); }
  };

  return (
    <Layout>
      {/* EvriPay Checkout Modal */}
      {checkoutModal && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setCheckoutModal(null)}
          {...checkoutModal}
        />
      )}

      {/* Sample reader modal */}
      {previewBook && (
        <SampleReaderModal
          sampleUrl={previewBook.sampleChapterUrl}
          bookTitle={previewBook.title}
          onClose={() => setPreviewBook(null)}
        />
      )}

      {/* Hero */}
      <div className="border-b border-gray-200/60 bg-white/40 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#E95420] font-bold tracking-widest uppercase text-sm block mb-3">Digital Library</span>
            <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-5xl text-gray-900 mb-3">Books Series</h1>
            <p className="text-gray-600 text-lg max-w-2xl mb-8">
              A 15-book series decoding African innovation through mathematics. Each book is a deep dive into a specific domain.
            </p>

            {/* Bundle CTA */}
            <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gradient-to-r from-[#E95420]/10 to-[#2D6EAA]/10 border border-gray-200/60 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-[#E95420]" />
                <div>
                  <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900">Complete 15-Book Bundle</p>
                  <p className="text-sm text-gray-500">Save over 15% vs buying individually</p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:ml-auto">
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-900">${BUNDLE_PRICE}</p>
                  <p className="text-xs text-gray-400 line-through">${(SINGLE_PRICE * 15).toFixed(2)}</p>
                </div>
                <button onClick={handleBuyBundle}
                  className="px-6 py-3 bg-[#E95420] text-white rounded-xl font-black hover:bg-[#c94418] transition-colors shadow-lg shadow-[#E95420]/20 whitespace-nowrap">
                  Buy Bundle
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="relative max-w-md mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search books..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E95420]/50 transition-all" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">No books found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {filtered.map((book, i) => {
              const owned = purchases[book._id];
              return (
                <motion.div key={book._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="group">
                  <Link to={`/books/${book.slug}`}
                    className="block bg-white/70 border border-gray-200/60 rounded-2xl overflow-hidden hover:border-[#E95420]/30 hover:-translate-y-1 transition-all">
                    {/* Cover */}
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                          <BookOpen className="w-10 h-10 text-[#E95420]/40 mb-2" />
                          {book.seriesNumber && (
                            <span className="text-xs font-black text-[#E95420]/60">#{book.seriesNumber}</span>
                          )}
                        </div>
                      )}
                      {book.seriesNumber && (
                        <div className="absolute top-2 left-2 bg-[#E95420] text-white text-xs font-black px-2 py-0.5 rounded-full">
                          #{book.seriesNumber}
                        </div>
                      )}
                      {owned && (
                        <div className="absolute top-2 right-2 bg-[#38A169] text-white text-xs font-black px-2 py-0.5 rounded-full">
                          Owned
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-black text-gray-900 text-xs line-clamp-2 mb-1 group-hover:text-[#E95420] transition-colors">{book.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{book.author}</p>
                      <p className="text-sm font-black text-[#E95420]">${book.price}</p>
                    </div>
                  </Link>

                  {owned ? (
                    <button onClick={() => handleDownload(book)}
                      className="w-full mt-2 py-2 bg-green-50 border border-green-200 text-[#38A169] rounded-xl text-xs font-black hover:bg-green-100 transition-colors flex items-center justify-center gap-1">
                      <Download className="w-3 h-3" /> Download
                    </button>
                  ) : (
                    <button onClick={() => handleBuyBook(book)}
                      className="w-full mt-2 py-2 bg-[#E95420]/10 border border-[#E95420]/20 text-[#E95420] rounded-xl text-xs font-black hover:bg-[#E95420]/20 transition-colors flex items-center justify-center gap-1">
                      <ShoppingCart className="w-3 h-3" /> Buy ${book.price}
                    </button>
                  )}
                  {book.sampleChapterUrl && (
                    <button onClick={() => setPreviewBook(book)}
                      className="w-full mt-1.5 py-2 bg-blue-50 border border-blue-200 text-[#2D6EAA] rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" /> Read Sample
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pricing info */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Single Book', price: `${SINGLE_PRICE}`, desc: 'PDF + EPUB access', icon: BookOpen, color: '#2D6EAA' },
            { label: 'Full Bundle (15 books)', price: `${BUNDLE_PRICE}`, desc: 'All 15 books + future updates', icon: Package, color: '#E95420' },
            { label: 'Essays & Papers', price: 'Free', desc: 'All academic papers free', icon: Star, color: '#38A169' },
          ].map((item) => (
            <div key={item.label} className="bg-white/70 border border-gray-200/60 rounded-2xl p-6 text-center">
              <item.icon className="w-8 h-8 mx-auto mb-3" style={{ color: item.color }} />
              <p className="font-black text-gray-900 text-lg">{item.price}</p>
              <p className="text-sm font-bold text-gray-700 mt-1">{item.label}</p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
