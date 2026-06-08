import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, Calendar, Award, RefreshCw } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-12">
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
