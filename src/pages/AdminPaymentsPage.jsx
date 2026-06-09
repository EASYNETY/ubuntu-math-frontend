import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Search, Filter, Download } from 'lucide-react';
import Layout from '../components/Layout';
import { paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    fetchPayments();
  }, [statusFilter, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await paymentsAPI.getAllPayments({
        status: statusFilter,
        search: searchTerm,
        limit: 100
      });
      setPayments(data.payments);
      setStatusCounts(data.statusCounts);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    if (!confirm('Approve this payment and grant access to the customer?')) return;
    
    try {
      setActionLoading(true);
      await paymentsAPI.approvePayment(paymentId, { adminUserId: user._id });
      alert('Payment approved! Customer access granted.');
      fetchPayments();
      setSelectedPayment(null);
    } catch (error) {
      alert('Error approving payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (paymentId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      setActionLoading(true);
      await paymentsAPI.rejectPayment(paymentId, { adminUserId: user._id, reason });
      alert('Payment rejected.');
      fetchPayments();
      setSelectedPayment(null);
    } catch (error) {
      alert('Error rejecting payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-black border ${styles[status] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-4xl text-gray-900 mb-2">
            Payment Management
          </h1>
          <p className="text-gray-600">Review and approve pending bank transfer payments</p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { key: 'all', label: 'All', icon: Filter, color: 'blue' },
            { key: 'pending', label: 'Pending', icon: Clock, color: 'yellow' },
            { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'green' },
            { key: 'failed', label: 'Failed', icon: XCircle, color: 'red' }
          ].map(status => (
            <button
              key={status.key}
              onClick={() => setStatusFilter(status.key)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                statusFilter === status.key
                  ? `border-${status.color}-500 bg-${status.color}-50`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <status.icon className={`w-6 h-6 mb-2 text-${status.color}-600`} />
              <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-2xl text-gray-900">
                {statusCounts[status.key === 'all' ? undefined : status.key] || 0}
              </p>
              <p className="text-sm text-gray-600">{status.label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference, payment ID, or item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E95420]/50"
          />
        </div>

        {/* Payments Table */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-[#E95420] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-black text-gray-700 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-black text-gray-700 uppercase">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-black text-gray-700 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-black text-gray-700 uppercase">Item</th>
                    <th className="px-4 py-3 text-right text-xs font-black text-gray-700 uppercase">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-black text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-black text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-400">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {payment.reference}
                        </code>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="font-bold text-gray-900">
                          {payment.userId?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.userId?.email || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {payment.itemName}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900">
                          {payment.amountFormatted}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {payment.status === 'pending' && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(payment.paymentId)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(payment.paymentId)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {payment.status !== 'pending' && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
