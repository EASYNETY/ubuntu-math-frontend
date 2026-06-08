import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, CheckCircle, XCircle, Award, MapPin, Clock, Users, Play } from 'lucide-react';
import Layout from '../components/Layout';
import { storiesAPI, innovationsAPI, modulesAPI, progressAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// StoryPage uses intentionally dark cinematic UI for immersive storytelling experience
export default function StoryPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [innovation, setInnovation] = useState(null);
  const [module, setModule] = useState(null);
  const [phase, setPhase] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [solved, setSolved] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const [moduleFinished, setModuleFinished] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        const { data: s } = await storiesAPI.getBySlug(slug);
        setStory(s);
        analyticsAPI.track({ eventType: 'page_view', path: `/story/${slug}`, userId: user?._id }).catch(() => {});
        if (s.innovationId) {
          try { const { data: inv } = await innovationsAPI.getById(s.innovationId); setInnovation(inv); } catch {}
        }
        if (s.moduleId) {
          try { const { data: mod } = await modulesAPI.getById(s.moduleId); setModule(mod); } catch {}
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [slug]);

  const handleStartJourney = () => {
    setPhase(2);
    analyticsAPI.track({ eventType: 'start_journey', path: `/story/${slug}`, userId: user?._id }).catch(() => {});
    if (user && story) {
      progressAPI.update({ userId: user._id, storyId: story._id, innovationId: story.innovationId, completionPercentage: 33, problemsAttempted: 0, problemsSolved: 0, timeSpentSeconds: 0 }).catch(() => {});
    }
  };

  const handleExploreLogic = () => {
    setPhase(3);
    analyticsAPI.track({ eventType: 'module_start', path: `/story/${slug}`, userId: user?._id }).catch(() => {});
  };

  const handleSubmitAnswer = () => {
    if (!module || !answer.trim()) return;
    const problem = module.problemSet[currentProblem];
    const isCorrect = parseFloat(answer) === problem.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setAttempted((a) => a + 1);
    if (isCorrect) setSolved((s) => s + 1);
  };

  const handleNextProblem = () => {
    const newSolved = solved + (feedback === 'correct' ? 1 : 0);
    setFeedback(null);
    setAnswer('');
    if (currentProblem + 1 >= module.problemSet.length) {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      const pct = (newSolved / module.problemSet.length) * 100;
      setModuleFinished(true);
      analyticsAPI.track({ eventType: 'module_complete', path: `/story/${slug}`, userId: user?._id }).catch(() => {});
      if (user && story) {
        progressAPI.update({ userId: user._id, storyId: story._id, innovationId: story.innovationId, moduleId: module._id, completionPercentage: 100, problemsAttempted: attempted + 1, problemsSolved: newSolved, timeSpentSeconds: timeSpent }).catch(() => {});
        if (pct >= 80) {
          progressAPI.complete({ userId: user._id, moduleId: module._id, problemsSolved: newSolved, problemsAttempted: attempted + 1, timeSpentSeconds: timeSpent, badge: module.badgeReward }).catch(() => {});
          setShowBadge(true);
        }
      }
    } else {
      setCurrentProblem((p) => p + 1);
    }
  };

  if (loading) return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-20 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-[#E95420]/30 border-t-[#E95420] rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!story) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-gray-500">Story not found.</p>
        <Link to="/stories" className="text-[#E95420] mt-4 inline-block hover:underline">← Back to Stories</Link>
      </div>
    </Layout>
  );

  return (
    // Intentionally dark cinematic UI for immersive story experience
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Phase 1: Cinematic story view */}
      {phase === 1 && (
        <div className="relative">
          {/* Back button */}
          <div className="absolute top-6 left-6 z-50">
            <Link to="/stories" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/10">
              <ArrowLeft className="w-5 h-5" /> Back to Hub
            </Link>
          </div>

          {/* Hero section */}
          <section className="h-screen relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black">
              {story.videoUrl ? (
                <video src={story.videoUrl} className="w-full h-full object-cover opacity-60" autoPlay muted loop playsInline />
              ) : story.thumbnailUrl ? (
                <img src={story.thumbnailUrl} alt={story.title} className="w-full h-full object-cover opacity-50" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 max-w-4xl px-6 text-center md:text-left flex flex-col items-center md:items-start">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                <span className="text-[#E95420] font-bold tracking-widest uppercase mb-4 block text-sm">Chapter 1</span>
                <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight">{story.title}</h1>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed font-light">
                {story.description}
              </motion.p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-10">
                {story.location && <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full"><MapPin className="w-4 h-4" />{story.location}</span>}
                {story.region && <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">🌍 {story.region}</span>}
                {story.estimatedReadTime && <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full"><Clock className="w-4 h-4" />{story.estimatedReadTime} min</span>}
              </div>
              <motion.button onClick={handleStartJourney}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-8 py-4 bg-[#E95420] text-white rounded-2xl font-black text-lg hover:bg-[#c94418] transition-colors shadow-2xl shadow-[#E95420]/30">
                <Play className="w-5 h-5" /> Start Journey <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </section>

          {/* Story details below fold */}
          <div className="max-w-4xl mx-auto px-6 py-16">
            {story.innovators?.length > 0 && (
              <div className="bg-slate-800/50 border border-white/10 rounded-3xl p-8 mb-8">
                <h3 className="font-black text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-[#E95420]" /> Innovators</h3>
                <div className="flex flex-wrap gap-3">
                  {story.innovators.map((inv, i) => (
                    <span key={i} className="bg-[#E95420]/10 text-[#E95420] border border-[#E95420]/20 px-4 py-2 rounded-xl text-sm font-bold">{inv}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 2: Innovation */}
      {phase === 2 && (
        <div className="min-h-screen">
          <div className="absolute top-6 left-6 z-50">
            <button onClick={() => setPhase(1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/10">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
          </div>
          <div className="max-w-4xl mx-auto px-6 py-24">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-[#2D6EAA] font-bold tracking-widest uppercase text-sm block mb-3">Phase 2</span>
              <h2 className="text-4xl font-black text-white mb-8">The Innovation</h2>
              {innovation ? (
                <div className="space-y-6">
                  <div className="bg-slate-800/50 border border-white/10 rounded-3xl p-8">
                    <h3 className="text-2xl font-black text-white mb-4">{innovation.name}</h3>
                    {innovation.ubuntuValueFormula && (
                      <div className="bg-[#E95420]/10 border border-[#E95420]/20 rounded-2xl p-5 mb-6">
                        <p className="text-xs font-bold text-[#E95420] uppercase tracking-widest mb-2">Ubuntu Value Formula</p>
                        <p className="font-mono text-white text-lg">{innovation.ubuntuValueFormula}</p>
                      </div>
                    )}
                    {innovation.impactMetrics && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Object.entries(innovation.impactMetrics).map(([k, v]) => (
                          <div key={k} className="bg-slate-900/50 rounded-2xl p-4 text-center border border-white/5">
                            <div className="text-2xl font-black text-[#2D6EAA]">{String(v)}</div>
                            <div className="text-xs text-slate-500 capitalize mt-1">{k.replace(/_/g, ' ')}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={handleExploreLogic}
                    className="flex items-center gap-3 px-8 py-4 bg-[#2D6EAA] text-white rounded-2xl font-black hover:bg-[#245a8e] transition-colors shadow-2xl shadow-[#2D6EAA]/20">
                    Explore the Logic <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-white/10 rounded-3xl p-12 text-center">
                  <p className="text-slate-400 mb-6">No innovation data available for this story.</p>
                  <button onClick={handleExploreLogic}
                    className="px-8 py-4 bg-[#2D6EAA] text-white rounded-2xl font-black hover:bg-[#245a8e] transition-colors">
                    Continue to Math Module <ChevronRight className="w-5 h-5 inline" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Phase 3: Math Module */}
      {phase === 3 && (
        <div className="min-h-screen">
          <div className="absolute top-6 left-6 z-50">
            <button onClick={() => setPhase(2)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/10">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
          </div>
          <div className="max-w-3xl mx-auto px-6 py-24">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-[#38A169] font-bold tracking-widest uppercase text-sm block mb-3">Phase 3</span>
              <h2 className="text-4xl font-black text-white mb-8">Math Module</h2>
              {module ? (
                <div className="bg-slate-800/50 border border-white/10 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white">{module.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      module.difficultyLevel === 'easy' ? 'bg-green-500/20 text-green-400' :
                      module.difficultyLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{module.difficultyLevel}</span>
                  </div>

                  {/* Progress */}
                  <div className="mb-8">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>Problem {Math.min(currentProblem + 1, module.problemSet.length)} of {module.problemSet.length}</span>
                      <span className="text-[#38A169] font-bold">{solved} correct</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${(currentProblem / module.problemSet.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-[#E95420] to-[#38A169] rounded-full" />
                    </div>
                  </div>

                  {!moduleFinished ? (
                    <div>
                      <p className="text-white font-bold text-xl mb-6">{module.problemSet[currentProblem]?.question}</p>
                      <div className="flex gap-3 mb-4">
                        <input type="number" value={answer} onChange={(e) => setAnswer(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !feedback && handleSubmitAnswer()}
                          disabled={!!feedback}
                          placeholder="Your answer..."
                          className="flex-1 bg-slate-700 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#38A169]/50 focus:ring-1 focus:ring-[#38A169]/30 disabled:opacity-60" />
                        {!feedback ? (
                          <button onClick={handleSubmitAnswer} disabled={!answer.trim()}
                            className="px-6 py-3.5 bg-[#38A169] text-white rounded-2xl font-black hover:bg-[#2d8a57] transition-colors disabled:opacity-50">
                            Submit
                          </button>
                        ) : (
                          <button onClick={handleNextProblem}
                            className="px-6 py-3.5 bg-[#2D6EAA] text-white rounded-2xl font-black hover:bg-[#245a8e] transition-colors">
                            {currentProblem + 1 >= module.problemSet.length ? 'Finish' : 'Next →'}
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {feedback && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`p-5 rounded-2xl flex items-start gap-3 ${feedback === 'correct' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                            {feedback === 'correct'
                              ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                              : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                            <div>
                              <p className={`font-black ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                                {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
                              </p>
                              <p className="text-sm text-slate-400 mt-1">{module.problemSet[currentProblem]?.explanation}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-20 h-20 text-[#E95420] mx-auto mb-4" />
                      <h3 className="text-2xl font-black text-white mb-2">Module Complete!</h3>
                      <p className="text-slate-400 mb-2">You solved {solved} out of {module.problemSet.length} problems.</p>
                      <p className="text-5xl font-black text-[#38A169]">{Math.round((solved / module.problemSet.length) * 100)}%</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-white/10 rounded-3xl p-12 text-center">
                  <p className="text-slate-400">No math module available for this story yet.</p>
                  <Link to="/stories" className="mt-4 inline-block text-[#E95420] hover:underline">← Back to Stories</Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Badge modal */}
      <AnimatePresence>
        {showBadge && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => { setShowBadge(false); navigate('/simulator'); }}>
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
              className="bg-slate-900 p-12 rounded-3xl border-2 border-[#E95420] max-w-md text-center shadow-2xl shadow-[#E95420]/20"
              onClick={(e) => e.stopPropagation()}>
              <motion.div initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                <Award className="w-20 h-20 text-[#E95420] mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-2">Badge Earned!</h2>
              <p className="text-slate-400 mb-2">You earned the badge:</p>
              <p className="text-xl font-black text-[#E95420] mb-8">{module?.badgeReward}</p>
              <button onClick={() => { setShowBadge(false); navigate('/simulator'); }}
                className="px-8 py-3 bg-[#E95420] text-white rounded-2xl font-black hover:bg-[#c94418] transition-colors">
                Try the Simulator →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
