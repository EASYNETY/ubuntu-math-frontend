import React, { useState } from 'react';
import { X, CreditCard, Building2, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import CheckoutModal from './CheckoutModal';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-2xl text-gray-900">
                Select Payment Method
              </h2>
              <p className="text-gray-500 text-sm mt-1">Choose how you want to pay</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Purchase Summary */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-[#E95420]/10 to-[#2D6EAA]/10 p-4 rounded-2xl border border-gray-200/60">
              <p className="text-gray-700 text-sm mb-1">You're purchasing:</p>
              <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 text-lg">{itemName}</p>
              <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-[#E95420] text-3xl mt-2">
                R {amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            {/* EvriPay - Bank Transfer */}
            <button
              onClick={() => setSelectedGateway('evripay')}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl hover:border-[#E95420] hover:bg-orange-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#E95420] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 text-lg">
                    Bank Transfer (EvriPay)
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Pay via EFT or Bank Transfer to FNB Account
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs font-black text-white bg-[#E95420] px-2 py-1 rounded-lg">
                      ⚡ Instant Verification
                    </span>
                    <span className="text-xs font-bold text-gray-600">• South African Rand (ZAR)</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Coming Soon Options */}
            <div className="relative opacity-50">
              <button
                disabled
                className="w-full p-5 border-2 border-gray-100 rounded-2xl text-left cursor-not-allowed"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-7 h-7 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-700 text-lg">
                      Card Payment
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Credit/Debit Card via Paystack
                    </p>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg mt-2 inline-block">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </button>
              <div className="absolute top-3 right-3">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-3 py-1 rounded-full">
                  Soon
                </span>
              </div>
            </div>

            <div className="relative opacity-50">
              <button
                disabled
                className="w-full p-5 border-2 border-gray-100 rounded-2xl text-left cursor-not-allowed"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-7 h-7 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-700 text-lg">
                      Digital Wallet
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      PayPal, Apple Pay, Google Pay
                    </p>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg mt-2 inline-block">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </button>
              <div className="absolute top-3 right-3">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-3 py-1 rounded-full">
                  Soon
                </span>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-xs text-gray-700">
              <span style={{ fontWeight: 900, fontFamily: INTER }}>🔒 Secure Payment:</span> All transactions are encrypted. Your payment information is never stored on our servers.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentGatewayModal;
