import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { subscriptionsAPI, paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

const PLAN_FEATURES = {
  basic: ['Access to all stories', 'Math modules', 'Progress tracking', 'Badges', '5 courses'],
  professional: ['Everything in Basic', 'All courses', 'Certificates', 'Simulator access', 'Priority support'],
  institutional: ['Everything in Professional', 'Google Classroom import', 'Admin dashboard', 'Analytics', 'Unlimited users'],
};

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [billing, setBilling] = useState('monthly');
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    subscriptionsAPI.getPlans().then(({ data }) => setPlans(data)).catch(console.error);
    if (user) subscriptionsAPI.getMine(user._id).then(({ data }) => setCurrentSub(data)).catch(() => {});
  }, [user]);

  const handleSubscribe = async (plan) => {
    if (!user) { navigate('/login'); return; }
    setProcessingPlan(plan.id); setLoading(true);
    sessionStorage.setItem('pending_tier', plan.id);
    sessionStorage.setItem('pending_billing', billing);
    try {
      const { data } = await paymentsAPI.initPaystack({ userId: user._id, tier: plan.id, billing, email: user.email });
      if (data.url) window.location.href = data.url;
    } catch {
      try {
        await subscriptionsAPI.create({ userId: user._id, plan: plan.id, billingCycle: billing });
        navigate('/dashboard');
      } catch (e) { console.error(e); }
    } finally { setLoading(false); setProcessingPlan(null); }
  };

  const getPrice = (plan) => billing === 'annual' ? plan.yearlyPrice : plan.monthlyPrice;
  const isCurrentPlan = (planId) => currentSub?.tier === planId && currentSub?.status === 'active';

  return (
    <Layout>
      <div className="border-b border-gray-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#E95420] font-bold tracking-widest uppercase text-sm block mb-3">Pricing</span>
            <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-5xl text-gray-900 mb-3">Simple, Transparent Pricing</h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto mb-8">Choose the plan that fits your learning goals. Upgrade or cancel anytime.</p>
            <div className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-2xl p-1">
              <button onClick={() => setBilling('monthly')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${billing === 'monthly' ? 'bg-white text-gray-900 shadow border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                Monthly
              </button>
              <button onClick={() => setBilling('annual')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${billing === 'annual' ? 'bg-white text-gray-900 shadow border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                Annual <span className="ml-1.5 text-xs bg-[#38A169] text-white px-1.5 py-0.5 rounded-full">Save 17%</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const isPro = plan.id === 'professional';
            const isCurrent = isCurrentPlan(plan.id);
            const features = PLAN_FEATURES[plan.id] || [];
            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 border-2 transition-all ${
                  isPro ? 'bg-white border-[#E95420] shadow-2xl shadow-[#E95420]/10' : 'bg-white/70 border-gray-200 hover:border-gray-300'
                }`}>
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#E95420] text-white text-xs font-black px-4 py-1 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-lg text-gray-900 mb-1 capitalize">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-gray-900">${getPrice(plan)}</span>
                    <span className="text-gray-500 text-sm">/{billing === 'annual' ? 'yr' : 'mo'}</span>
                  </div>
                  {billing === 'annual' && (
                    <p className="text-xs text-[#38A169] mt-1 font-bold">${(getPrice(plan) / 12).toFixed(2)}/month billed annually</p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-[#38A169] flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="w-full py-3 bg-green-50 border border-green-200 text-[#38A169] rounded-2xl text-sm font-black text-center">
                    ✓ Current Plan
                  </div>
                ) : (
                  <button onClick={() => handleSubscribe(plan)} disabled={loading && processingPlan === plan.id}
                    className={`w-full py-3.5 rounded-2xl text-sm font-black transition-all disabled:opacity-60 ${
                      isPro ? 'bg-[#E95420] text-white hover:bg-[#c94418] shadow-lg shadow-[#E95420]/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}>
                    {loading && processingPlan === plan.id ? 'Processing...' : 'Get Started'}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
        <p className="text-center text-sm text-gray-500 mt-8">Payments processed securely via Paystack. Cancel anytime.</p>
      </div>
    </Layout>
  );
}
