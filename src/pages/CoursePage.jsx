import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle, Lock, Award, Clock, BookOpen, User, ChevronRight } from 'lucide-react';
import { coursesAPI, enrollmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CoursePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        const { data: c } = await coursesAPI.getBySlug(slug);
        setCourse(c);
        if (user) {
          try {
            const { data: enr } = await enrollmentsAPI.getOne(user._id, c._id);
            setEnrollment(enr);
            const firstIncomplete = enr.lessonProgress?.findIndex((l) => !l.completed);
            if (firstIncomplete > 0 && c.lessons?.[firstIncomplete]) setActiveLesson(c.lessons[firstIncomplete]);
            else if (c.lessons?.[0]) setActiveLesson(c.lessons[0]);
          } catch { /* not enrolled */ }
        }
      } catch { navigate('/courses'); }
      finally { setLoading(false); }
    };
    load();
  }, [slug, user]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      const { data } = await enrollmentsAPI.enroll({ userId: user._id, courseId: course._id });
      setEnrollment(data);
      if (course.lessons?.[0]) setActiveLesson(course.lessons[0]);
    } catch (err) { console.error(err); }
    finally { setEnrolling(false); }
  };

  const handleLessonComplete = async (lessonId) => {
    if (!enrollment) return;
    const watchedSeconds = Math.round((Date.now() - startTime.current) / 1000);
    startTime.current = Date.now();
    try {
      const { data } = await enrollmentsAPI.updateLessonProgress({ enrollmentId: enrollment._id, lessonId, watchedSeconds });
      setEnrollment(data);
      if (data.overallProgress >= 100) {
        try {
          const { data: cert } = await enrollmentsAPI.issueCertificate(enrollment._id, { userId: user._id });
          setCertificate(cert);
        } catch {}
      }
      // Auto-advance
      const idx = course.lessons.findIndex((l) => l._id === lessonId || l._id?.toString() === lessonId?.toString());
      if (idx < course.lessons.length - 1) setActiveLesson(course.lessons[idx + 1]);
    } catch (err) { console.error(err); }
  };

  const isLessonCompleted = (lessonId) =>
    enrollment?.lessonProgress?.find((l) => l.lessonId?.toString() === lessonId?.toString())?.completed;

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="h-10 w-10 border-4 border-[#E95420]/30 border-t-[#E95420] rounded-full animate-spin" />
    </div>
  );

  if (!course) return null;

  const progress = enrollment?.overallProgress || 0;
  const completedCount = enrollment?.lessonProgress?.filter((l) => l.completed).length || 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between z-50 flex-shrink-0">
        <Link to="/courses" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors font-bold">
          <ArrowLeft size={16} /> Courses
        </Link>
        <div className="flex-1 mx-8">
          <p className="text-sm font-black text-white truncate">{course.title}</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-[#E95420] to-[#38A169]" />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{completedCount}/{course.lessons?.length} · {Math.round(progress)}%</span>
          </div>
        </div>
        <button onClick={() => setSidebarOpen((s) => !s)} className="text-gray-400 hover:text-white transition-colors">
          <BookOpen size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* Video */}
              {(activeLesson.videoUrl || activeLesson.embedUrl) && (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-8 shadow-2xl">
                  {activeLesson.embedUrl ? (
                    <iframe src={activeLesson.embedUrl} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  ) : activeLesson.videoUrl?.includes('drive.google.com') ? (
                    <iframe src={activeLesson.videoUrl.replace('/view', '/preview').replace('/edit', '/preview')} className="w-full h-full" allowFullScreen allow="autoplay" />
                  ) : (
                    <video src={activeLesson.videoUrl} controls className="w-full h-full" />
                  )}
                </div>
              )}

              {/* Lesson info */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-black text-[#E95420] uppercase tracking-wider">
                    Lesson {(course.lessons?.findIndex((l) => l._id === activeLesson._id) ?? 0) + 1}
                  </span>
                  {isLessonCompleted(activeLesson._id) && (
                    <span className="flex items-center gap-1 text-xs text-[#38A169] font-black"><CheckCircle size={12} /> Completed</span>
                  )}
                </div>
                <h1 className="text-3xl font-black mb-3">{activeLesson.title}</h1>
                <p className="text-gray-400 leading-relaxed">{activeLesson.description}</p>
              </div>

              {/* Resources */}
              {activeLesson.resources?.length > 0 && (
                <div className="bg-gray-900 rounded-2xl p-6 mb-8">
                  <h3 className="font-black mb-4 text-gray-300">Resources</h3>
                  <ul className="space-y-2">
                    {activeLesson.resources.map((r, i) => (
                      <li key={i}><a href={r.url} target="_blank" rel="noreferrer" className="text-[#E95420] hover:underline text-sm">{r.title}</a></li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certificate */}
              <AnimatePresence>
                {certificate && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-[#E95420]/20 to-[#2D6EAA]/20 border border-[#E95420]/30 rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-3">
                      <Award className="w-10 h-10 text-[#E95420]" />
                      <div>
                        <h3 className="font-black text-white">Certificate Earned!</h3>
                        <p className="text-sm text-gray-400">#{certificate.certificateNumber}</p>
                      </div>
                      {certificate.downloadable && (
                        <button className="ml-auto px-4 py-2 bg-[#E95420] text-white rounded-xl text-sm font-black hover:bg-[#c94418] transition-colors">Download</button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => { const idx = course.lessons.findIndex((l) => l._id === activeLesson._id); if (idx > 0) setActiveLesson(course.lessons[idx - 1]); }}
                  disabled={course.lessons?.findIndex((l) => l._id === activeLesson._id) === 0}
                  className="flex items-center gap-2 px-5 py-3 bg-gray-800 rounded-xl text-sm font-black disabled:opacity-30 hover:bg-gray-700 transition-colors">
                  <ArrowLeft size={16} /> Previous
                </button>

                {progress === 100 ? (
                  <button onClick={() => enrollmentsAPI.issueCertificate(enrollment._id, { userId: user?._id }).then(({ data }) => setCertificate(data)).catch(() => {})}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-yellow-900 rounded-xl font-black text-sm hover:bg-yellow-400 transition-colors">
                    <Award size={16} /> Get Certificate
                  </button>
                ) : (
                  <button onClick={() => handleLessonComplete(activeLesson._id)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#E95420] text-white rounded-xl font-black text-sm hover:bg-[#c94418] transition-colors">
                    {isLessonCompleted(activeLesson._id) ? 'Next Lesson' : 'Mark Complete'} <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Not enrolled — course overview */
            <div className="max-w-3xl mx-auto px-6 py-12">
              {course.thumbnailUrl && (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-64 object-cover rounded-2xl mb-8 opacity-80" />
              )}
              <h1 className="text-4xl font-black mb-4">{course.title}</h1>
              <p className="text-gray-400 mb-6 leading-relaxed">{course.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8">
                <span className="flex items-center gap-1"><User size={14} />{course.instructor}</span>
                <span className="flex items-center gap-1"><BookOpen size={14} />{course.lessons?.length} lessons</span>
                {course.totalDuration > 0 && <span className="flex items-center gap-1"><Clock size={14} />{course.totalDuration} min</span>}
              </div>
              {course.lessons?.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-black text-white mb-4">What you'll learn</h3>
                  <div className="space-y-2">
                    {course.lessons.map((l, i) => (
                      <div key={l._id || i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800">
                        <div className="w-6 h-6 rounded-full bg-[#E95420]/10 text-[#E95420] text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                        <p className="text-sm font-bold text-gray-300 flex-1 truncate">{l.title}</p>
                        <span className="text-xs text-gray-500 flex items-center gap-0.5"><Clock size={10} /> {l.duration}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={handleEnroll} disabled={enrolling}
                className="w-full bg-[#E95420] hover:bg-[#c94418] text-white py-4 rounded-2xl font-black text-base transition-colors shadow-lg shadow-[#E95420]/20 disabled:opacity-50">
                {enrolling ? 'Enrolling...' : 'Enroll Free — Start Learning'}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              className="bg-gray-900 border-l border-gray-800 overflow-y-auto flex-shrink-0">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-black text-white text-sm">Course Content</h3>
                <p className="text-xs text-gray-500 mt-1">{completedCount}/{course.lessons?.length} completed</p>
              </div>
              <div className="divide-y divide-gray-800">
                {course.lessons?.sort((a, b) => a.order - b.order).map((lesson) => {
                  const completed = isLessonCompleted(lesson._id);
                  const isActive = activeLesson?._id === lesson._id;
                  return (
                    <button key={lesson._id}
                      onClick={() => enrollment ? setActiveLesson(lesson) : null}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${isActive ? 'bg-[#E95420]/10' : 'hover:bg-gray-800'} ${!enrollment ? 'cursor-default' : 'cursor-pointer'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${completed ? 'bg-[#38A169] text-white' : isActive ? 'bg-[#E95420] text-white' : 'bg-gray-700 text-gray-400'}`}>
                        {completed ? <CheckCircle size={14} /> : !enrollment ? <Lock size={12} /> : <Play size={12} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-[#E95420]' : completed ? 'text-gray-400' : 'text-gray-200'}`}>{lesson.title}</p>
                        {lesson.duration > 0 && <p className="text-xs text-gray-600">{lesson.duration} min</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
