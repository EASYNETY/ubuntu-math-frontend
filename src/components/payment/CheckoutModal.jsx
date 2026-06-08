import React, { useState } from 'react';
import { X, Copy, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const CheckoutModal = ({ isOpen, onClose, itemType, itemId, itemName, amount }) => {
  const [step, setStep] = useState('confirm'); // confirm, instructions, checking
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState({});

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

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payments/${paymentData.paymentId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status === 'completed') {
          alert('Payment successful! You now have access to ' + itemName);
          onClose();
          window.location.reload();
        } else if (response.data.status === 'failed') {
          setError('Payment failed. Please try again.');
          setStep('instructions');
        } else {
          // Still pending, check again after 20 seconds
          setTimeout(checkStatus, 20000);
        }
      } catch (err) {
        setError('Error checking payment status');
        setStep('instructions');
      }
    };

    checkStatus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Purchase {itemName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'confirm' && (
            <div>
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-4">
                  You are about to purchase:
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900">{itemName}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{amount > 0 ? `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : 'Free'}</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={initiatePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
              >
                {loading ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          )}

          {step === 'instructions' && paymentData && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-semibold mb-2">✓ Payment initiated successfully!</p>
                <p className="text-green-700 text-sm">Complete the bank transfer using the details below.</p>
              </div>

              <div className="space-y-4">
                {/* Bank Details */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Bank Account Details</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-semibold">{paymentData.bankDetails.bank}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{paymentData.bankDetails.accountNumber}</span>
                        <button 
                          onClick={() => copyToClipboard(paymentData.bankDetails.accountNumber, 'account')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {copied.account ? <CheckCircle size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Holder:</span>
                      <span className="font-semibold text-sm">{paymentData.bankDetails.accountHolder}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Reference */}
                <div className="border-2 border-yellow-400 bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-yellow-600">⚠️</span> Payment Reference (Required)
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    You MUST include this reference number for automatic verification:
                  </p>
                  <div className="bg-white p-3 rounded border border-yellow-300 flex justify-between items-center">
                    <code className="font-mono text-lg font-bold text-gray-900">{paymentData.reference}</code>
                    <button 
                      onClick={() => copyToClipboard(paymentData.reference, 'reference')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {copied.reference ? <CheckCircle size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount to Transfer:</span>
                    <span className="text-2xl font-bold text-blue-600">{paymentData.amount}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Steps to Complete Payment:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Open your banking app or online banking</li>
                    <li>Add beneficiary or make payment to the account above</li>
                    <li>Use the reference number provided</li>
                    <li>Transfer the exact amount</li>
                    <li>Click "Check Payment Status" below</li>
                  </ol>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={checkPaymentStatus}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Check Payment Status
                </button>
                <button
                  onClick={onClose}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {step === 'checking' && (
            <div className="text-center py-8">
              <Clock className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
              <p className="text-lg font-semibold text-gray-900 mb-2">Checking payment status...</p>
              <p className="text-gray-600">This may take a few moments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
