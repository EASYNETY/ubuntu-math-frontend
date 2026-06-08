import React, { useState } from 'react';
import { X, CreditCard, Building2, Wallet } from 'lucide-react';
import CheckoutModal from './CheckoutModal';

const PaymentGatewayModal = ({ isOpen, onClose, itemType, itemId, itemName, amount }) => {
  const [selectedGateway, setSelectedGateway] = useState(null);

  if (!isOpen) return null;

  // If gateway selected, show the specific checkout modal
  if (selectedGateway === 'evripay') {
    return (
      <CheckoutModal
        isOpen={true}
        onClose={() => {
          setSelectedGateway(null);
          onClose();
        }}
        itemType={itemType}
        itemId={itemId}
        itemName={itemName}
        amount={amount}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Select Payment Method</h2>
            <p className="text-sm text-gray-500 mt-1">Choose how you want to pay</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
              <p className="font-semibold text-gray-900">{itemName}</p>
              <p className="text-3xl font-black text-blue-600 mt-2">
                R {amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            {/* EvriPay - Bank Transfer */}
            <button
              onClick={() => setSelectedGateway('evripay')}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-[#E95420] hover:bg-orange-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E95420] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900">Bank Transfer (EvriPay)</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Pay via EFT/Bank Transfer • FNB Account
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-[#E95420] bg-orange-100 px-2 py-0.5 rounded">
                      Instant Verification
                    </span>
                    <span className="text-xs text-gray-500">• ZAR Currency</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Coming Soon Options */}
            <div className="relative">
              <button
                disabled
                className="w-full p-4 border-2 border-gray-100 rounded-xl text-left opacity-50 cursor-not-allowed"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-gray-700">Card Payment</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Credit/Debit Card via Paystack
                    </p>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-2 inline-block">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </button>
              <div className="absolute top-2 right-2">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                  Soon
                </span>
              </div>
            </div>

            <div className="relative">
              <button
                disabled
                className="w-full p-4 border-2 border-gray-100 rounded-xl text-left opacity-50 cursor-not-allowed"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-gray-700">Digital Wallet</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      PayPal, Apple Pay, Google Pay
                    </p>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-2 inline-block">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </button>
              <div className="absolute top-2 right-2">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                  Soon
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-600">
              <span className="font-bold text-gray-900">🔒 Secure Payment:</span> All transactions are encrypted and secure. Your payment information is never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewayModal;
