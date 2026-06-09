import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, Calendar, Award, RefreshCw, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI } from '../services/api';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const { data } = await paymentsAPI.getHistory({
        userId: user._id,
        limit: 20
      });
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await fetchPayments();
    setRefreshing(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
      failed: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: XCircle }
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${style.bg} ${style.text} ${style.border}`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    );
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Profile card */}
          <div className="bg-white/70 border border-gray-200/60 rounded-3xl p-8">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#E95420] to-[#2D6EAA] rounded-2xl flex items-center justify-center text-white text-3xl font-black">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-2xl text-gray-900">{user.name}</h1>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-black capitalize ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-[#2D6EAA] border border-blue-200'
                }`}>{user.role}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="capitalize">{user.role}</span>
              </div>
              {user.createdAt && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <button onClick={handleRefresh} disabled={refreshing}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-60">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Profile'}
            </button>
          </div>

          {/* Purchase History */}
          <div className="bg-white/70 border border-gray-200/60 rounded-3xl p-8">
            <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-lg text-gray-900 mb-5 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#E95420]" /> Purchase History
            </h2>
            
            {loadingPayments ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-[#E95420] border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading purchases...</p>
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <motion.div
                    key={payment.paymentId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{payment.itemName}</h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          Reference: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">{payment.reference}</code>
                        </p>
                      </div>
                      <div className="text-right">
                        <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-lg text-[#E95420] mb-2">
                          {payment.amount}
                        </p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No purchases yet</p>
                <p className="text-gray-400 text-xs mt-1">Your purchase history will appear here</p>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="bg-white/70 border border-gray-200/60 rounded-3xl p-8">
            <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-lg text-gray-900 mb-5 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#E95420]" /> Badges ({user.badges?.length || 0})
            </h2>
            {user.badges?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.badges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#E95420]/10 border border-[#E95420]/20 text-[#E95420] px-4 py-2 rounded-2xl text-sm font-black">
                    🏅 {badge}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No badges yet — complete math modules in stories to earn them!</p>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
