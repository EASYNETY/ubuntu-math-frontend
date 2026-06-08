import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Award, TrendingUp, Clock, ChevronRight, Star } from 'lucide-react';
import Layout from '../components/Layout';
import { enrollmentsAPI, progressAPI, subscriptionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function DashboardPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      enrollmentsAPI.getByUser(user._id),
      progressAPI.getByUser(user._id),
      subscriptionsAPI.getMine(user._id),
    ]).then(([enrRes, progRes, subRes]) => {
      if (enrRes.status === 'fulfilled') setEnrollments(enrRes.value.data);
      if (progRes.status === 'fulfilled') setProgress(progRes.value.data);
      if (subRes.status === 'fulfilled') setSubscription(subRes.value.data);
    }).finally(() => setLoading(false));
  }, [user]);

  const completedCourses = enrollments.filter((e) => e.overallProgress >= 100).length;
  const totalTimeMinutes = Math.round(progress.reduce((sum, p) => sum + (p.timeSpentSeconds || 0), 0) / 60);

  const stats = [
    { label: 'Courses Enrolled', value: enrollments.length, icon: BookOpen, color: '#2D6EAA' },
    { label: 'Completed', value: completedCourses, icon: TrendingUp, color: '#38A169' },
    { label: 'Badges Earned', value: user?.badges?.length || 0, icon: Award, color: '#E95420' },
    { label: 'Time Spent', value: `${totalTimeMinutes}m`, icon: Clock, color: '#7B2D8B' },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-4xl text-gray-900">
            Welcome back, <span className="text-[#E95420]">{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's your learning overview.</p>
        </motion.div>

        {/* Subscription banner */}
        {!subscription && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-[#E95420]/10 to-[#2D6EAA]/10 border border-gray-200/60 rounded-3xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900">Unlock all courses and features</p>
              <p className="text-sm text-gray-500">Subscribe to a plan starting at $8/month</p>
            </div>
            <Link to="/pricing"
              className="px-6 py-2.5 bg-[#E95420] text-white rounded-xl text-sm font-black hover:bg-[#c94418] transition-colors flex-shrink-0 shadow-lg shadow-[#E95420]/20">
              View Plans
            </Link>
          </motion.div>
        )}

        {subscription && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <Star className="w-5 h-5 text-[#38A169]" />
            <p className="text-sm text-gray-700">
              Active <span className="font-black capitalize text-[#38A169]">{subscription.tier}</span> plan
              {' '}— expires {new Date(subscription.endDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white/70 border border-gray-200/60 rounded-3xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className="text-3xl font-black text-gray-900">{loading ? '—' : stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Courses */}
          <div className="bg-white/70 border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900">My Courses</h2>
              <Link to="/courses" className="text-sm text-[#2D6EAA] hover:text-[#245a8e] transition-colors flex items-center gap-1 font-bold">
                Browse <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No courses yet.</p>
                <Link to="/courses" className="text-[#2D6EAA] text-sm hover:underline mt-2 inline-block font-bold">Browse courses →</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {enrollments.slice(0, 5).map((enr) => {
                  const course = enr.courseId;
                  const title = typeof course === 'object' ? course?.title : 'Course';
                  const slug = typeof course === 'object' ? course?.slug : '';
                  return (
                    <Link key={enr._id} to={slug ? `/courses/${slug}` : '/courses'}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-[#2D6EAA]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-[#2D6EAA]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#E95420] to-[#38A169] rounded-full" style={{ width: `${enr.overallProgress}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(enr.overallProgress)}%</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="bg-white/70 border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900">My Badges</h2>
              <Link to="/stories" className="text-sm text-[#E95420] hover:text-[#c94418] transition-colors flex items-center gap-1 font-bold">
                Earn more <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {user?.badges?.length > 0 ? (
              <div className="p-6 flex flex-wrap gap-3">
                {user.badges.map((badge, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05, type: 'spring' }}
                    className="flex items-center gap-2 bg-[#E95420]/10 border border-[#E95420]/20 text-[#E95420] px-4 py-2 rounded-2xl text-sm font-black">
                    🏅 {badge}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500">
                <Award className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No badges yet.</p>
                <Link to="/stories" className="text-[#E95420] text-sm hover:underline mt-2 inline-block font-bold">Explore stories to earn badges →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
