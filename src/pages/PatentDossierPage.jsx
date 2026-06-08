// CAMS Patent Dossier Page v2
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Shield, CheckCircle, AlertTriangle, FileText,
  Download, Users, Clock, Zap, ChevronDown, ChevronUp,
  Tag, Lock, Star
} from 'lucide-react';
import Layout from '../components/Layout';
import { marketplaceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentGatewayModal from '../components/payment/PaymentGatewayModal';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

function LicenseModal({ onAccept, onClose }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-gray-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-100">
          <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-xl text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#7B2D8B]" /> License Agreement
          </h2>
          <p className="text-gray-500 text-sm mt-1">Please read and accept before purchasing</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-black text-gray-900 mb-2">1. Grant of License</h3>
            <p className="text-gray-600">CAMS grants you a single-user, non-transferable, non-exclusive license to access and use the CAMS Industrial Patent Dossier for your own internal business operations only.</p>
          </div>
          <div>
            <h3 className="font-black text-gray-900 mb-2">2. Restrictions</h3>
            <ul className="space-y-1 text-gray-600">
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" /> No redistribution or resale of patent documents</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" /> No sublicensing to third parties</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" /> No public disclosure of proprietary formulations</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" /> Export control compliance required</li>
            </ul>
          </div>
          <div>
            <h3 className="font-black text-gray-900 mb-2">3. DRM & Watermarking</h3>
            <p className="text-gray-600">All downloaded documents are watermarked with your name, email, order ID, and timestamp. A unique digital fingerprint is embedded. Unauthorized redistribution can be traced back to the original purchaser.</p>
          </div>
          <div>
            <h3 className="font-black text-gray-900 mb-2">4. Termination</h3>
            <p className="text-gray-600">This license terminates immediately upon any breach of these terms. CAMS reserves the right to revoke access without refund upon breach.</p>
          </div>
          <div>
            <h3 className="font-black text-gray-900 mb-2">5. Refund Policy</h3>
            <p className="text-gray-600">No refunds are available once document access has been granted, due to the digital nature of the product.</p>
          </div>
          <div>
            <h3 className="font-black text-gray-900 mb-2">6. Liability Disclaimer</h3>
            <p className="text-gray-600">CAMS provides patents as-is. No warranty of commercial viability, fitness for purpose, or accuracy is provided. Use at your own risk.</p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)}
              className="w-5 h-5 accent-[#7B2D8B] mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              I have read and agree to the License Agreement. I understand that downloaded documents are watermarked and tracked.
            </span>
          </label>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors border border-gray-200">
              Cancel
            </button>
            <button onClick={() => checked && onAccept()} disabled={!checked}
              className="flex-1 py-3 bg-[#7B2D8B] text-white rounded-xl font-black hover:bg-[#6a2578] transition-colors disabled:opacity-40">
              Accept & Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PatentDossierPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLicense, setShowLicense] = useState(false);
  const [billing, setBilling] = useState('annual');
  const [coupon, setCoupon] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [buying, setBuying] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(null);

  useEffect(() => {
    marketplaceAPI.getPatentDossier()
      .then(({ data }) => setDossier(data))
      .catch(console.error)
      .finally(() => setLoading(false));

    if (user) {
      marketplaceAPI.checkLicense(user._id, 'patent-dossier')
        .then(({ data }) => setHasPurchased(data.accepted))
        .catch(() => {});
    }
  }, [user]);

  const handleValidateCoupon = async () => {
    try {
      const { data } = await marketplaceAPI.validateCoupon({ code: coupon, amount: 1000 });
      setCouponResult(data);
    } catch { setCouponResult({ valid: false, message: 'Invalid coupon' }); }
  };

  const handleBuy = () => {
    if (!user) { navigate('/login'); return; }
    setShowLicense(true);
  };

  const handleLicenseAccepted = async () => {
    setShowLicense(false);
    try {
      await marketplaceAPI.acceptLicense({
        userId: user._id,
        productId: 'patent-dossier',
        productType: 'patent-dossier',
        agreementVersion: '1.0',
        ipAddress: '',
      });

      const finalAmount = couponResult?.valid ? parseFloat(couponResult.finalAmount) : 1000;

      // Open EvriPay checkout modal
      setCheckoutModal({
        itemType: 'book', // Using 'book' type for general products
        itemId: 'patent-dossier',
        itemName: 'CAMS Industrial Patent Dossier',
        amount: finalAmount
      });
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 border-4 border-[#7B2D8B]/30 border-t-[#7B2D8B] rounded-full animate-spin" />
      </div>
    </Layout>
  );

  const selectedPlan = dossier?.sections?.subscriptionPlans?.find(p => p.id === billing);

  return (
    <Layout>
      {/* Payment Gateway Selection Modal */}
      {checkoutModal && (
        <PaymentGatewayModal
          isOpen={true}
          onClose={() => setCheckoutModal(null)}
          {...checkoutModal}
        />
      )}
      
      <AnimatePresence>
        {showLicense && <LicenseModal onAccept={handleLicenseAccepted} onClose={() => setShowLicense(false)} />}
      </AnimatePresence>

      {/* Hero */}
      <div className="border-b border-gray-200/60 bg-gradient-to-br from-purple-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-[#7B2D8B] font-bold tracking-widest uppercase text-xs block mb-3">Premium IP Asset</span>
              <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-4xl sm:text-5xl text-gray-900 mb-4 leading-tight">
                CAMS Industrial<br />Patent Dossier
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Full Access + 1 Year Updates & Support
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {['388 Patents', '1yr Updates', '<48h Support', 'DRM Protected'].map((tag) => (
                  <span key={tag} className="flex items-center gap-1.5 text-xs font-bold text-[#7B2D8B] bg-purple-50 border border-[#7B2D8B]/20 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-5xl font-black text-gray-900">$1,000</span>
                <span className="text-gray-500">one-time access</span>
              </div>
              {hasPurchased ? (
                <div className="flex items-center gap-2 text-[#38A169] font-black">
                  <CheckCircle className="w-5 h-5" /> You own this — go to your library
                </div>
              ) : (
                <button onClick={handleBuy} disabled={buying}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#7B2D8B] text-white rounded-2xl font-black hover:bg-[#6a2578] transition-colors shadow-xl shadow-[#7B2D8B]/20 disabled:opacity-60">
                  <Brain className="w-5 h-5" />
                  {buying ? 'Processing...' : 'Purchase Full Access'}
                </button>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4">
              {[
                { value: '388', label: 'Industrial Patents', icon: FileText, color: '#7B2D8B' },
                { value: '8', label: 'Patent Categories', icon: Tag, color: '#E95420' },
                { value: '<48h', label: 'Support Response', icon: Clock, color: '#38A169' },
                { value: '4x/yr', label: 'Live Webinars', icon: Users, color: '#2D6EAA' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-sm">
                  <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you get */}
            <div className="bg-white/70 border border-gray-200/60 rounded-2xl p-7">
              <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-xl text-gray-900 mb-5 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#7B2D8B]" /> What You Get
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dossier?.sections?.whatYouGet?.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#38A169] flex-shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Patent coverage */}
            <div className="bg-white/70 border border-gray-200/60 rounded-2xl p-7">
              <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-xl text-gray-900 mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#E95420]" /> Patent Coverage
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {dossier?.sections?.patentCoverage?.map((cat) => (
                  <div key={cat} className="bg-[#E95420]/10 border border-[#E95420]/20 rounded-xl p-3 text-center">
                    <p className="text-xs font-bold text-[#E95420]">{cat}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Support SLA */}
            <div className="bg-white/70 border border-gray-200/60 rounded-2xl p-7">
              <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-xl text-gray-900 mb-5 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#2D6EAA]" /> Support & Updates
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {dossier?.sections?.supportSLA && Object.entries(dossier.sections.supportSLA).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="font-black text-gray-900 text-sm">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DRM notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex gap-3">
              <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-yellow-700 text-sm mb-1">DRM Protected Content</p>
                <p className="text-sm text-gray-600">
                  All documents are watermarked with your name, email, and order ID.
                  A unique digital fingerprint is embedded for leak tracing.
                  Downloads are limited and monitored.
                </p>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white/70 border border-gray-200/60 rounded-2xl overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-100">
                <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-xl text-gray-900">FAQs</h2>
              </div>
              {dossier?.sections?.faqs?.map((faq, i) => (
                <div key={i} className="border-b border-gray-100 last:border-0">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-7 py-4 text-left hover:bg-gray-50 transition-colors">
                    <span className="font-bold text-gray-900 text-sm">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden">
                        <p className="px-7 pb-4 text-sm text-gray-600">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase sidebar */}
          <div className="space-y-5">
            {/* Main purchase card */}
            <div className="bg-white border border-[#7B2D8B]/20 rounded-2xl p-6 sticky top-24 shadow-sm">
              <div className="text-center mb-5">
                <p className="text-4xl font-black text-gray-900">$1,000</p>
                <p className="text-xs text-gray-500 mt-1">One-time full access</p>
              </div>

              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input type="text" placeholder="Coupon code" value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#7B2D8B]/50" />
                  <button onClick={handleValidateCoupon}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors border border-gray-200">
                    Apply
                  </button>
                </div>
                {couponResult && (
                  <p className={`text-xs mt-1.5 font-bold ${couponResult.valid ? 'text-[#38A169]' : 'text-red-500'}`}>
                    {couponResult.valid
                      ? `✓ ${couponResult.discountValue}${couponResult.discountType === 'percent' ? '%' : '$'} off — Final: $${couponResult.finalAmount}`
                      : `✗ ${couponResult.message}`}
                  </p>
                )}
              </div>

              {hasPurchased ? (
                <button onClick={() => navigate('/library')}
                  className="w-full py-3.5 bg-[#38A169] text-white rounded-xl font-black hover:bg-[#2d8a57] transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Go to My Library
                </button>
              ) : (
                <button onClick={handleBuy} disabled={buying}
                  className="w-full py-3.5 bg-[#7B2D8B] text-white rounded-xl font-black hover:bg-[#6a2578] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#7B2D8B]/20">
                  <Lock className="w-4 h-4" />
                  {buying ? 'Processing...' : 'Purchase Full Access'}
                </button>
              )}

              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-[#38A169]" /> DRM watermarked download</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#38A169]" /> Instant access after payment</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#38A169]" /> License agreement required</div>
                <div className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-yellow-500" /> No refunds after access granted</div>
              </div>
            </div>

            {/* Subscription plans */}
            <div className="bg-white/70 border border-gray-200/60 rounded-2xl p-5">
              <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 text-sm mb-4">Subscription Plans</h3>
              <div className="flex gap-2 mb-4">
                {dossier?.sections?.subscriptionPlans?.map((plan) => (
                  <button key={plan.id} onClick={() => setBilling(plan.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                      billing === plan.id ? 'bg-[#7B2D8B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}>
                    {plan.label}
                  </button>
                ))}
              </div>
              {selectedPlan && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-2xl font-black text-gray-900">${selectedPlan.price}<span className="text-sm text-gray-500">/{selectedPlan.interval}</span></p>
                  <p className="text-xs text-gray-500 mt-1">{selectedPlan.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
