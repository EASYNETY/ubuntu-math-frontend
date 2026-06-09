import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Clock, Check, AlertCircle, Building2, Hash, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

const CheckoutModal = ({ isOpen, onClose, itemType, itemId, itemName, amount }) => {
  const [step, setStep] = useState('confirm'); // confirm, instructions, checking, confirmed, success
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState({});
  const [pollingCount, setPollingCount] = useState(0);
  const [showManualConfirm, setShowManualConfirm] = useState(false);

  const initiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payments/initiate`,
        { itemType, itemId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPaymentData(response.data);
      setStep('instructions');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
  };

  const checkPaymentStatus = async () => {
    if (!paymentData) return;

    setStep('checking');
    setPollingCount(0);
    setShowManualConfirm(false);

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payments/${paymentData.paymentId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status === 'completed') {
          setStep('success');
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 3000);
        } else if (response.data.status === 'failed') {
          setError('Payment failed. Please try again.');
          setStep('instructions');
        } else {
          // Still pending, increment counter
          setPollingCount(prev => {
            const newCount = prev + 1;
            // Show manual confirm button after 20 seconds (1 poll)
            if (newCount >= 1) {
              setShowManualConfirm(true);
            }
            return newCount;
          });
          
          // Continue polling
          setTimeout(checkStatus, 20000);
        }
      } catch (err) {
        setError('Error checking payment status');
        setStep('instructions');
      }
    };

    checkStatus();
  };

  const handleManualConfirm = () => {
    setStep('confirmed');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-gray-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-2xl text-gray-900">
              {step === 'confirm' && 'Confirm Purchase'}
              {step === 'instructions' && 'Bank Transfer Details'}
              {step === 'checking' && 'Verifying Payment'}
              {step === 'confirmed' && 'Payment Confirmed'}
              {step === 'success' && 'Success!'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{itemName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* STEP 1: CONFIRM */}
          {step === 'confirm' && (
            <div>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">You are about to purchase:</p>
                <div className="bg-gradient-to-r from-[#E95420]/10 to-[#2D6EAA]/10 p-5 rounded-2xl border border-gray-200/60">
                  <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 text-lg">{itemName}</p>
                  <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-[#E95420] text-4xl mt-2">
                    R {amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={initiatePayment}
                disabled={loading}
                style={{ fontWeight: 900, fontFamily: INTER }}
                className="w-full bg-[#E95420] text-white py-4 rounded-2xl hover:bg-[#c94418] disabled:bg-gray-400 text-lg shadow-lg transition-all"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          )}

          {/* STEP 2: BANK TRANSFER INSTRUCTIONS */}
          {step === 'instructions' && paymentData && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-green-800 mb-1">
                  ✓ Payment Initiated Successfully
                </p>
                <p className="text-green-700 text-sm">
                  Complete your payment using the bank account details below.
                </p>
              </div>

              <div className="space-y-4">
                {/* Bank Account Card */}
                <div className="border-2 border-[#E95420]/20 bg-gradient-to-br from-[#E95420]/5 to-[#2D6EAA]/5 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#E95420] rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 text-lg">
                      FNB Bank Account
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Bank:</span>
                      <span style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900">
                        {paymentData.bankDetails.bank}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900">
                          {paymentData.bankDetails.accountNumber}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(paymentData.bankDetails.accountNumber, 'account')}
                          className="text-[#E95420] hover:text-[#c94418] transition-colors"
                        >
                          {copied.account ? <CheckCircle size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Account Holder:</span>
                      <span style={{ fontWeight: 700, fontFamily: INTER }} className="text-gray-900 text-sm text-right">
                        {paymentData.bankDetails.accountHolder}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Branch Code:</span>
                      <span style={{ fontWeight: 700, fontFamily: INTER }} className="text-gray-900 text-sm">
                        {paymentData.bankDetails.branch}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Reference - CRITICAL */}
                <div className="border-2 border-yellow-400 bg-yellow-50 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Hash className="w-5 h-5 text-gray-900" />
                    </div>
                    <div className="flex-1">
                      <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 text-lg">
                        Payment Reference
                      </h3>
                      <p className="text-sm text-gray-700 mt-1">
                        <span style={{ fontWeight: 900 }}>⚠️ CRITICAL:</span> You MUST include this reference for automatic verification
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-yellow-300 flex justify-between items-center">
                    <code style={{ fontFamily: "'Courier New', monospace", fontWeight: 900 }} className="text-lg text-gray-900">
                      {paymentData.reference}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(paymentData.reference, 'reference')}
                      className="text-[#E95420] hover:text-[#c94418] transition-colors ml-3"
                    >
                      {copied.reference ? <CheckCircle size={22} /> : <Copy size={22} />}
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="border-2 border-[#2D6EAA]/20 bg-blue-50 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#2D6EAA] rounded-xl flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-700">Amount to Transfer:</span>
                    </div>
                    <span style={{ fontWeight: 900, fontFamily: INTER }} className="text-[#2D6EAA] text-3xl">
                      {paymentData.amount}
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 mb-3">
                    How to Complete Payment:
                  </h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span style={{ fontWeight: 900 }} className="text-[#E95420]">1.</span>
                      <span>Open your banking app or online banking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ fontWeight: 900 }} className="text-[#E95420]">2.</span>
                      <span>Make a payment/transfer to the account above</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ fontWeight: 900 }} className="text-[#E95420]">3.</span>
                      <span><strong>Use the payment reference provided</strong> (critical for tracking)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ fontWeight: 900 }} className="text-[#E95420]">4.</span>
                      <span>Transfer the exact amount shown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ fontWeight: 900 }} className="text-[#E95420]">5.</span>
                      <span>Click "Check Payment Status" below</span>
                    </li>
                  </ol>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mt-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={checkPaymentStatus}
                  style={{ fontWeight: 900, fontFamily: INTER }}
                  className="flex-1 bg-[#E95420] text-white py-4 rounded-2xl hover:bg-[#c94418] shadow-lg transition-all"
                >
                  Check Payment Status
                </button>
                <button
                  onClick={onClose}
                  style={{ fontWeight: 900, fontFamily: INTER }}
                  className="px-8 bg-gray-100 text-gray-700 py-4 rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHECKING */}
          {step === 'checking' && (
            <div className="text-center py-8">
              <Clock className="animate-spin mx-auto mb-4 text-[#E95420]" size={56} />
              <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-xl text-gray-900 mb-2">
                Verifying Your Payment...
              </h3>
              <p className="text-gray-600 mb-6">Checking with the bank. This usually takes a few seconds.</p>
              
              {/* Show "I have made payment" button after 20 seconds */}
              {showManualConfirm && (
                <div className="mt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 max-w-md mx-auto">
                    <p className="text-sm text-gray-700 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span>Taking longer than expected? If you've already completed the bank transfer, click below.</span>
                    </p>
                  </div>
                  <button
                    onClick={handleManualConfirm}
                    style={{ fontWeight: 900, fontFamily: INTER }}
                    className="px-8 py-4 bg-[#E95420] text-white rounded-2xl hover:bg-[#c94418] shadow-lg transition-all"
                  >
                    I Have Made the Payment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CONFIRMED (Manual) */}
          {step === 'confirmed' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-[#2D6EAA]" />
              </div>
              <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-2xl text-gray-900 mb-3">
                Payment Confirmation Received
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Thank you! We've recorded that you've made the payment. Your order will be fulfilled as soon as we confirm receipt of funds from the bank.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-5 mb-6 max-w-md mx-auto text-left">
                <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 mb-3">What happens next?</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#E95420]">•</span>
                    <span>We'll verify your payment with the bank</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#E95420]">•</span>
                    <span>You'll receive an email confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#E95420]">•</span>
                    <span>Access will be granted automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#E95420]">•</span>
                    <span><strong>Usually takes 5-30 minutes</strong></span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  You can safely close this window and continue browsing.
                </p>
                <button
                  onClick={onClose}
                  style={{ fontWeight: 900, fontFamily: INTER }}
                  className="px-10 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 shadow-lg transition-all"
                >
                  Close & Continue Browsing
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS (Webhook confirmed) */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-2xl text-gray-900 mb-3">
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                You now have access to <strong>{itemName}</strong>
              </p>
              <p className="text-sm text-gray-500">Redirecting in 3 seconds...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutModal;
