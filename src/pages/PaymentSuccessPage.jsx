import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | success | failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    const gateway = searchParams.get('gateway');
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference || !user) {
      setStatus('failed');
      setMessage('Missing payment reference or user session.');
      return;
    }

    const verify = async () => {
      try {
        if (gateway === 'paystack') {
          const storedTier = sessionStorage.getItem('pending_tier') || 'basic';
          const storedBilling = sessionStorage.getItem('pending_billing') || 'monthly';
          await paymentsAPI.verifyPaystack({
            reference,
            userId: user._id,
            tier: storedTier,
            billing: storedBilling,
          });
        }
        setStatus('success');
        setMessage('Your subscription is now active!');
        sessionStorage.removeItem('pending_tier');
        sessionStorage.removeItem('pending_billing');
      } catch (err) {
        setStatus('failed');
        setMessage(err.response?.data?.message || 'Payment verification failed.');
      }
    };

    verify();
  }, [searchParams, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-purple-100 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-xl border border-gray-100"
      >
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-[#2D6EAA] mx-auto mb-4 animate-spin" />
            <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-xl text-gray-900 mb-2">Verifying Payment...</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle className="w-16 h-16 text-[#38A169] mx-auto mb-4" />
            </motion.div>
            <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-2xl text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/dashboard"
              className="inline-block px-8 py-3 bg-[#E95420] text-white rounded-xl font-black hover:bg-[#c94418] transition-colors shadow-lg shadow-[#E95420]/20"
            >
              Go to Dashboard →
            </Link>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-2xl text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/pricing"
              className="inline-block px-8 py-3 bg-gray-900 text-white rounded-xl font-black hover:bg-gray-700 transition-colors"
            >
              Try Again
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
