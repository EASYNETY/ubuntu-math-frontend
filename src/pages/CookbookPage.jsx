import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Beaker, CheckCircle, ShoppingCart, Download, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import Layout from '../components/Layout';
import { marketplaceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/payment/CheckoutModal';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

const RECIPES = [
  'Cold-process shea butter soap',
  'Baobab vitamin C powder (for immune support)',
  'Moringa seed water purification drops',
  'Marula oil lip balm',
  'Indigenous traditional antiseptic ointment (neem & aloe)',
  'Fermented rooibos iced tea concentrate',
  'Hand-pressed moringa cooking oil',
  'Natural indigo dye (zero-water method)',
  'Teff gluten-free sourdough starter',
  'Baobab fruit leather snack strips',
  'Neem leaf mosquito-repellent candle',
  'Rooibos anti-inflammatory face serum',
  'Marula seed shell activated charcoal',
  'Moringa leaf protein powder',
  'Shea butter hair growth pomade',
  'Aloe ferox burn gel',
  'Hoodia gordonii appetite-suppressant tea',
  'Kigelia firming body butter',
  "Devil's claw joint-relief tincture",
  'Pelargonium sidoides cough syrup',
  'Bitter kola antiviral throat lozenges',
  'Mongongo nut cooking oil',
  'Fonio gluten-free flour blend',
  'Baobab electrolyte sports drink',
  'Artemisinin anti-malarial herbal tea',
];

const SUBSCRIPTION_PLANS = [
  { id: 'monthly', label: 'Monthly', price: 50, interval: 'month', desc: 'New recipes + updates monthly' },
  { id: 'premium', label: 'Premium', price: 100, interval: 'month', desc: 'Priority support + all updates' },
  { id: 'annual', label: 'Annual', price: 500, interval: 'year', desc: 'Best value — full year access' },
];

const WHO_FOR = [
  { icon: '🏠', label: 'Hobbyists', desc: 'Make products at home for personal use' },
  { icon: '🏭', label: 'Home-based producers', desc: 'Start a small production business' },
  { icon: '🎓', label: 'Students', desc: 'Learn practical industrial chemistry' },
  { icon: '🤝', label: 'Small co-operatives', desc: 'Community-scale production' },
  { icon: '🌱', label: 'Entrepreneurs', desc: 'Launch a product line from scratch' },
  { icon: '🔬', label: 'Researchers', desc: 'Validate traditional knowledge' },
];

const WHAT_NOT = [
  'Patent claims',
  'Legal advice',
  'Industrial-scale chemical engineering',
  'Permission to sell as your own invention (see license)',
];

export default function CookbookPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [buying, setBuying] = useState(false);
  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(null);

  const visibleRecipes = showAllRecipes ? RECIPES : RECIPES.slice(0, 10);

  const handleBuy = async () => {
    if (!user) { navigate('/login'); return; }
    const finalAmount = couponResult?.valid ? parseFloat(couponResult.finalAmount) : 9.99;
    
    // Open EvriPay checkout modal
    setCheckoutModal({
      itemType: 'book', // Using 'book' type for general products
      itemId: 'cams-industrial-cookbook',
      itemName: 'CAMS Industrial Cookbook',
      amount: finalAmount
    });
  };

  const handleValidateCoupon = async () => {
    try {
      const { data } = await marketplaceAPI.validateCoupon({ code: coupon, amount: 9.99 });
      setCouponResult(data);
    } catch { setCouponResult({ valid: false, message: 'Invalid coupon' }); }
  };

  return (
    <Layout>
      {/* EvriPay Checkout Modal */}
      {checkoutModal && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setCheckoutModal(null)}
          {...checkoutModal}
        />
      )}
      
      {/* Hero */}
      <div className="border-b border-gray-200/60 bg-gradient-to-br from-orange-50 to-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-[#E95420] font-bold tracking-widest uppercase text-xs block mb-3">Industrial Cookbook · $9.99</span>
              <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-4xl sm:text-5xl text-gray-900 mb-4 leading-tight">
                CAMS Industrial Cookbook
              </h1>
              <p className="text-xl text-gray-700 font-bold mb-2">
                Small-Scale Recipes for Soap, Food, Medicine & Materials
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                A single PDF download containing <strong className="text-gray-900">25 practical recipes</strong> derived
                from the CAMS 388-patent portfolio — translated into simple, safe, small-scale instructions.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['45 Pages', 'Printable PDF', 'Photos Included', 'Safety Notes', 'One-time $9.99'].map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 text-xs font-bold text-[#38A169] bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleBuy} disabled={buying}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#E95420] text-white rounded-2xl font-black hover:bg-[#c94418] transition-colors shadow-xl shadow-[#E95420]/20 disabled:opacity-60">
                  <ShoppingCart className="w-5 h-5" />
                  {buying ? 'Processing...' : 'Buy Now — $9.99'}
                </button>
                <a href="#recipes"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition-colors">
                  <Beaker className="w-5 h-5" /> See All 25 Recipes
                </a>
              </div>
            </motion.div>

            {/* Product card */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <div className="bg-white border border-[#E95420]/20 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-[#E95420]/10 rounded-2xl flex items-center justify-center">
                    <Beaker className="w-7 h-7 text-[#E95420]" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900">CAMS Industrial Cookbook</p>
                    <p className="text-xs text-gray-500">Digital PDF · Instant Download</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[{ value: '25', label: 'Recipes' }, { value: '45', label: 'Pages' }, { value: '388', label: 'Patents Source' }].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-2xl font-black text-[#E95420]">{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center mb-5">
                  <p className="text-5xl font-black text-gray-900">$9.99</p>
                  <p className="text-sm text-gray-500 mt-1">One-time payment · No subscription required</p>
                </div>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Coupon code" value={coupon}
                    onChange={e => setCoupon(e.target.value.toUpperCase())}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E95420]/50" />
                  <button onClick={handleValidateCoupon}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors border border-gray-200">
                    Apply
                  </button>
                </div>
                {couponResult && (
                  <p className={`text-xs mb-3 font-bold ${couponResult.valid ? 'text-[#38A169]' : 'text-red-500'}`}>
                    {couponResult.valid ? `✓ Discount applied — Final: ${couponResult.finalAmount}` : `✗ ${couponResult.message}`}
                  </p>
                )}
                <button onClick={handleBuy} disabled={buying}
                  className="w-full py-3.5 bg-[#E95420] text-white rounded-xl font-black hover:bg-[#c94418] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#E95420]/20">
                  <Download className="w-4 h-4" />
                  {buying ? 'Processing...' : 'Buy & Download — $9.99'}
                </button>
                <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#38A169]" /> Instant PDF download after payment</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#38A169]" /> Printable, 45 pages with photographs</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#38A169]" /> Safety notes included for every recipe</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#38A169]" /> Lifetime access</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        {/* Who this is for */}
        <section>
          <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-3xl text-gray-900 mb-2">Who This Is For</h2>
          <p className="text-gray-500 mb-8">Anyone who wants to make things rather than just read about them.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {WHO_FOR.map(w => (
              <div key={w.label} className="bg-white/70 border border-gray-200/60 rounded-2xl p-4 text-center hover:border-[#E95420]/30 transition-colors">
                <div className="text-3xl mb-2">{w.icon}</div>
                <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 text-sm mb-1">{w.label}</p>
                <p className="text-xs text-gray-500">{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recipes */}
        <section id="recipes">
          <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-3xl text-gray-900 mb-2">What You Can Make</h2>
          <p className="text-gray-500 mb-8">25 recipes from the CAMS patent portfolio, ready to produce at home or co-op scale.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleRecipes.map((recipe, i) => (
              <motion.div key={recipe}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 bg-white/70 border border-gray-200/60 rounded-xl p-3.5 hover:border-[#E95420]/30 transition-colors">
                <div className="w-7 h-7 bg-[#E95420]/10 text-[#E95420] rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm text-gray-700 font-medium">{recipe}</span>
              </motion.div>
            ))}
          </div>
          {RECIPES.length > 10 && (
            <button onClick={() => setShowAllRecipes(s => !s)}
              className="mt-5 flex items-center gap-2 text-sm text-[#E95420] font-bold hover:text-orange-600 transition-colors mx-auto">
              {showAllRecipes
                ? <><ChevronUp className="w-4 h-4" /> Show less</>
                : <><ChevronDown className="w-4 h-4" /> Show all {RECIPES.length} recipes</>}
            </button>
          )}
        </section>

        {/* What you will NOT get */}
        <section>
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-xl text-yellow-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> What You Will NOT Get
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WHAT_NOT.map(item => (
                <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-yellow-600 font-black flex-shrink-0">✗</span> {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscription plans */}
        <section>
          <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-3xl text-gray-900 mb-2">Subscription Plans</h2>
          <p className="text-gray-500 mb-8">
            The $9.99 cookbook is a one-time purchase. Subscribe for ongoing updates, new recipes, and support.
            <span className="text-[#38A169] font-bold"> Free for the first year after purchase.</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {SUBSCRIPTION_PLANS.map(plan => (
              <div key={plan.id}
                className={`bg-white/70 border rounded-2xl p-6 transition-all ${plan.id === 'premium' ? 'border-[#E95420]/40 shadow-lg shadow-[#E95420]/10' : 'border-gray-200/60'}`}>
                {plan.id === 'premium' && (
                  <span className="text-xs font-black text-[#E95420] bg-[#E95420]/10 px-3 py-1 rounded-full block w-fit mb-3">Most Popular</span>
                )}
                <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 text-lg mb-1">{plan.label}</h3>
                <p className="text-3xl font-black text-gray-900 mb-1">${plan.price}<span className="text-sm text-gray-500">/{plan.interval}</span></p>
                <p className="text-sm text-gray-500 mb-5">{plan.desc}</p>
                <button
                  onClick={() => { if (!user) navigate('/login'); else alert('Subscription coming soon — contact support@cams.org.za'); }}
                  className={`w-full py-2.5 rounded-xl font-black text-sm transition-colors ${plan.id === 'premium' ? 'bg-[#E95420] text-white hover:bg-[#c94418]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}`}>
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-[#E95420]/20 rounded-3xl p-12">
            <Beaker className="w-16 h-16 text-[#E95420] mx-auto mb-4" />
            <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-3xl text-gray-900 mb-3">Ready to Start Making?</h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">25 practical recipes. 45 pages. $9.99. Instant download. No subscription required.</p>
            <button onClick={handleBuy} disabled={buying}
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#E95420] text-white rounded-2xl font-black hover:bg-[#c94418] transition-colors shadow-xl shadow-[#E95420]/20 disabled:opacity-60 text-lg">
              <ShoppingCart className="w-5 h-5" />
              {buying ? 'Processing...' : 'Buy the Cookbook — $9.99'}
            </button>
          </div>
        </section>

        {/* Upsell to Industrial Processes */}
        <section>
          <div className="bg-white/70 border border-gray-200/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1">
              <p className="text-xs font-black text-[#7B2D8B] uppercase tracking-widest mb-1">Next Level Up</p>
              <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-xl text-gray-900 mb-1">Need the Full Technical Process?</h3>
              <p className="text-sm text-gray-600">
                The Cookbook gives you the recipe. The <strong className="text-gray-900">Industrial Process documents</strong> give you
                the full engineering spec — equipment lists, industrial scaling, chemical inputs, and safety protocols.
                For manufacturers and co-ops ready to produce at scale.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <p className="text-2xl font-black text-[#7B2D8B]">$49.99</p>
              <p className="text-xs text-gray-500">per process document</p>
              <a href="/processes"
                className="px-6 py-2.5 bg-[#7B2D8B] text-white rounded-xl font-black hover:bg-[#6a2578] transition-colors text-sm">
                Browse Processes →
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
