import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Package, Download, PlayCircle, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function LibraryPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [library, setLibrary] = useState({
    courses: [],
    books: [],
    marketplaceProducts: []
  });

  useEffect(() => {
    if (!user?._id) return;
    
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        
        // Fetch courses (enrollments)
        const coursesRes = await axios.get(`${API_URL}/api/enrollments/user/${user._id}`);
        
        // Fetch user data with populated books
        const userRes = await axios.get(`${API_URL}/api/auth/me/${user._id}`);
        
        // Fetch marketplace products
        const marketplaceRes = await axios.get(`${API_URL}/api/marketplace/library/${user._id}`);
        
        setLibrary({
          courses: coursesRes.data || [],
          books: userRes.data?.purchasedBooks || [],
          marketplaceProducts: marketplaceRes.data || []
        });
      } catch (error) {
        console.error('Error fetching library:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [user]);

  const handleDownloadBook = async (bookId) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/books/download/${bookId}`, { userId: user._id });
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleDownloadMarketplaceProduct = async (product) => {
    try {
      const productId = product.product?._id || product.purchaseId;
      const { data } = await axios.post(`${API_URL}/api/marketplace/download/${productId}`, {
        userId: user._id,
        purchaseId: product.purchaseId,
      });

      if (data.downloadUrl) {
        alert(`📄 Your document is watermarked with:\n• Name: ${data.watermarkData?.name}\n• Email: ${data.watermarkData?.email}\n• Order: ${data.watermarkData?.orderId}\n\n${data.watermarkData?.notice}`);
        window.open(data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      const msg = error.response?.data?.message || 'Download failed. Please try again.';
      alert(msg);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isEmpty = library.courses.length === 0 && library.books.length === 0 && library.marketplaceProducts.length === 0;

  return (
    <Layout>
      {/* Header */}
      <div className="border-b border-gray-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-black text-gray-900 mb-2">My Library</h1>
            <p className="text-gray-600">All your purchased courses, books, and products in one place</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {isEmpty ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your library is empty</h2>
            <p className="text-gray-600 mb-8">Explore our catalog to find courses, books, and resources</p>
            <div className="flex gap-4 justify-center">
              <Link 
                to="/courses" 
                className="px-6 py-3 bg-[#E95420] text-white rounded-xl font-bold hover:bg-[#c94418] transition-colors"
              >
                Browse Courses
              </Link>
              <Link 
                to="/books" 
                className="px-6 py-3 bg-[#2D6EAA] text-white rounded-xl font-bold hover:bg-[#245585] transition-colors"
              >
                Browse Books
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {/* Courses Section */}
            {library.courses.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap className="w-6 h-6 text-[#E95420]" />
                  <h2 className="text-2xl font-black text-gray-900">Courses</h2>
                  <span className="text-sm text-gray-500">({library.courses.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {library.courses.map((enrollment) => (
                    <motion.div
                      key={enrollment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#E95420]/30 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <GraduationCap className="w-8 h-8 text-[#E95420]" />
                        <span className="text-xs font-bold text-[#E95420] bg-[#E95420]/10 px-2 py-1 rounded-full">
                          {enrollment.overallProgress || 0}% Complete
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{enrollment.courseId?.title || 'Course'}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {enrollment.courseId?.description || 'Continue your learning journey'}
                      </p>
                      <Link
                        to={`/courses/${enrollment.courseId?._id}`}
                        className="inline-flex items-center gap-2 text-[#E95420] font-bold text-sm hover:gap-3 transition-all"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Continue Learning
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Books Section */}
            {library.books.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-[#2D6EAA]" />
                  <h2 className="text-2xl font-black text-gray-900">Books</h2>
                  <span className="text-sm text-gray-500">({library.books.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                  {library.books.map((book) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <Link to={`/books/${book.slug}`} className="block">
                        <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden mb-3">
                          {book.coverUrl ? (
                            <img 
                              src={book.coverUrl} 
                              alt={book.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-[#2D6EAA]/40" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1">{book.title}</h3>
                        <p className="text-xs text-gray-500">{book.author}</p>
                      </Link>
                      <button
                        onClick={() => handleDownloadBook(book._id)}
                        className="w-full mt-2 py-2 bg-green-50 border border-green-200 text-[#38A169] rounded-xl text-xs font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Marketplace Products Section */}
            {library.marketplaceProducts.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6 text-[#38A169]" />
                  <h2 className="text-2xl font-black text-gray-900">Marketplace Products</h2>
                  <span className="text-sm text-gray-500">({library.marketplaceProducts.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {library.marketplaceProducts.map((product) => (
                    <motion.div
                      key={product.purchaseId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#38A169]/30 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <FileText className="w-8 h-8 text-[#38A169]" />
                        {product.amountPaid && (
                          <span className="text-xs text-gray-500">
                            {product.currency} {product.amountPaid}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        {product.product?.title || product.productType || 'Marketplace Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.product?.description || 'Premium digital content'}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        License: {product.licenseId?.substring(0, 16)}...
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Downloads: {product.downloadCount || 0} / {product.maxDownloads || 100}
                      </p>
                      <button 
                        onClick={() => handleDownloadMarketplaceProduct(product)}
                        className="inline-flex items-center gap-2 text-[#38A169] font-bold text-sm hover:gap-3 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Access Product
                      </button>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
