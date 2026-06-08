import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Search, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { coursesAPI, enrollmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function LMSPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await coursesAPI.getPublished();
        setCourses(data);
        if (user) {
          const { data: enr } = await enrollmentsAPI.getByUser(user._id);
          setEnrollments(enr);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const levels = ['All', 'beginner', 'intermediate', 'advanced'];
  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'All' || c.level === levelFilter;
    return matchSearch && matchLevel;
  });

  const getEnrollment = (courseId) => enrollments.find((e) => e.courseId?._id === courseId || e.courseId === courseId);

  const LEVEL_COLORS = { beginner: 'bg-green-100 text-green-700', intermediate: 'bg-yellow-100 text-yellow-700', advanced: 'bg-red-100 text-red-700' };
  const TIER_COLORS = { free: 'bg-gray-100 text-gray-600', basic: 'bg-blue-100 text-blue-700', professional: 'bg-purple-100 text-purple-700', institutional: 'bg-orange-100 text-orange-700' };

  return (
    <Layout>
      <div className="border-b border-gray-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontWeight: 900, fontFamily: INTER }} className="text-5xl text-gray-900 mb-3">Courses</h1>
            <p className="text-gray-600 text-lg max-w-xl">Structured courses to deepen your understanding of Ubuntu Mathematics.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search courses..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2D6EAA]/50 transition-all" />
          </div>
          <div className="flex gap-2">
            {levels.map((l) => (
              <button key={l} onClick={() => setLevelFilter(l)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${
                  levelFilter === l ? 'bg-[#2D6EAA] text-white shadow-lg shadow-[#2D6EAA]/20' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2D6EAA]/30 hover:text-[#2D6EAA]'
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-3xl h-80 animate-pulse border border-gray-200" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-3xl py-20 text-center bg-white/50">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-bold">No courses found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => {
              const enrollment = getEnrollment(course._id);
              const progress = enrollment?.overallProgress ?? 0;
              return (
                <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/courses/${course.slug}`}
                    className="block bg-white/70 border border-gray-200/60 rounded-3xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-44 object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-[#2D6EAA]/10 to-[#7B2D8B]/10 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-[#2D6EAA]/40" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${LEVEL_COLORS[course.level] || LEVEL_COLORS.beginner}`}>{course.level}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${TIER_COLORS[course.requiredTier] || TIER_COLORS.free}`}>{course.requiredTier === 'free' ? 'Free' : course.requiredTier}</span>
                        {enrollment && <span className="ml-auto flex items-center gap-1 text-xs text-[#38A169] font-bold"><CheckCircle className="w-3 h-3" /> Enrolled</span>}
                      </div>
                      <h3 style={{ fontWeight: 900, fontFamily: INTER }} className="text-gray-900 mb-2 line-clamp-2 group-hover:text-[#2D6EAA] transition-colors">{course.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessons?.length || 0} lessons</span>
                        {course.totalDuration > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.totalDuration} min</span>}
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrolledCount || 0}</span>
                      </div>
                      {enrollment ? (
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                            <span>Progress</span><span className="font-bold text-gray-700">{Math.round(progress)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#E95420] to-[#38A169] rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          {course.requiredTier !== 'free' && !course.freeEnrollment && (
                            <span className="flex items-center gap-1 text-xs text-gray-500"><Lock className="w-3 h-3" /> Requires {course.requiredTier}</span>
                          )}
                          <span className="ml-auto flex items-center gap-1 text-xs text-[#2D6EAA] font-bold group-hover:gap-2 transition-all">
                            Enroll <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
