/**
 * SampleReader — renders sample chapter text beautifully in-app.
 * Fetches plain text from Cloudinary, formats it with chapter headings,
 * and provides a download button.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Download, X, ChevronLeft, ChevronRight,
  Loader, Lock, ZoomIn, ZoomOut, AlignLeft
} from 'lucide-react';

// ── Text formatter ────────────────────────────────────────────────────────────
function formatChapters(raw) {
  if (!raw) return [];
  // Split on chapter markers
  const parts = raw.split(/---\s*Chapter\s*(\d+)\s*---/i);
  const chapters = [];

  // parts[0] is the header (SAMPLE PREVIEW...)
  for (let i = 1; i < parts.length; i += 2) {
    const num = parseInt(parts[i]);
    const body = parts[i + 1] || '';
    // Split body into paragraphs
    const paragraphs = body
      .split(/\n{2,}/)
      .map(p => p.trim())
      .filter(p => p.length > 20);
    chapters.push({ num, paragraphs });
  }
  return chapters;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SampleReader({ sampleUrl, bookTitle, onClose, isModal = false }) {
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChapter, setActiveChapter] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!sampleUrl) { setError('No sample available'); setLoading(false); return; }
    setLoading(true);
    fetch(sampleUrl)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load sample');
        return r.text();
      })
      .then(text => { setRaw(text); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [sampleUrl]);

  const chapters = formatChapters(raw);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = sampleUrl;
    a.download = `${bookTitle?.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-sample-chapters.txt`;
    a.target = '_blank';
    a.click();
  };

  const scrollToTop = () => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const goNext = () => {
    if (activeChapter < chapters.length - 1) {
      setActiveChapter(c => c + 1);
      scrollToTop();
    }
  };

  const goPrev = () => {
    if (activeChapter > 0) {
      setActiveChapter(c => c - 1);
      scrollToTop();
    }
  };

  const content = (
    <div className={`flex flex-col ${isModal ? 'h-full' : 'h-[80vh]'} bg-[#0f1520] rounded-2xl overflow-hidden border border-white/10`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/80 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <BookOpen className="w-5 h-5 text-[#E95420] flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-black text-white text-sm truncate">{bookTitle}</p>
            <p className="text-xs text-slate-500">
              Sample Preview — Chapters 1–3
              {chapters.length > 0 && ` · Chapter ${activeChapter + 1} of ${chapters.length}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Font size */}
          <button onClick={() => setFontSize(s => Math.max(12, s - 2))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Smaller text">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-500 w-8 text-center">{fontSize}px</span>
          <button onClick={() => setFontSize(s => Math.min(24, s + 2))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Larger text">
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Download */}
          <button onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#38A169]/20 border border-[#38A169]/30 text-[#38A169] rounded-xl text-xs font-black hover:bg-[#38A169]/30 transition-colors">
            <Download className="w-3.5 h-3.5" /> Download
          </button>

          {/* Close (modal only) */}
          {isModal && onClose && (
            <button onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chapter tabs */}
      {chapters.length > 1 && (
        <div className="flex gap-1 px-5 py-2.5 border-b border-white/10 bg-slate-900/50 flex-shrink-0 overflow-x-auto">
          {chapters.map((ch, i) => (
            <button key={i} onClick={() => { setActiveChapter(i); scrollToTop(); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                activeChapter === i
                  ? 'bg-[#E95420] text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}>
              Chapter {ch.num}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
            <Loader className="w-8 h-8 animate-spin text-[#E95420]" />
            <p className="text-sm">Loading sample chapters...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 px-8 text-center">
            <BookOpen className="w-12 h-12 opacity-20" />
            <p className="text-sm">{error}</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
            <AlignLeft className="w-12 h-12 opacity-20" />
            <p className="text-sm">No readable content found in sample.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto px-6 sm:px-10 py-8"
            >
              {/* Chapter heading */}
              <div className="mb-8 pb-6 border-b border-white/10">
                <span className="text-xs font-black text-[#E95420] uppercase tracking-widest block mb-2">
                  Chapter {chapters[activeChapter].num}
                </span>
                <h2 className="text-2xl font-black text-white">{bookTitle}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Sample Preview · {chapters[activeChapter].paragraphs.length} paragraphs
                </p>
              </div>

              {/* Paragraphs */}
              <div className="space-y-5 text-slate-300 leading-relaxed"
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}>
                {chapters[activeChapter].paragraphs.map((para, i) => {
                  // Detect if it looks like a heading (short, no period at end, all caps or title case)
                  const isHeading = para.length < 80 && !para.endsWith('.') && !para.endsWith(',');
                  return isHeading && i > 0 ? (
                    <h3 key={i} className="font-black text-white mt-8 mb-2"
                      style={{ fontSize: `${fontSize + 2}px` }}>
                      {para}
                    </h3>
                  ) : (
                    <p key={i} className="text-slate-300">
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Paywall teaser at end */}
              <div className="mt-12 relative">
                {/* Fade overlay */}
                <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-[#0f1520] pointer-events-none" />
                <div className="bg-gradient-to-r from-[#E95420]/10 to-[#2D6EAA]/10 border border-[#E95420]/20 rounded-2xl p-6 text-center">
                  <Lock className="w-8 h-8 text-[#E95420] mx-auto mb-3" />
                  <p className="font-black text-white mb-1">Continue Reading</p>
                  <p className="text-sm text-slate-400 mb-4">
                    Purchase the full book to access all chapters.
                  </p>
                  <p className="text-2xl font-black text-[#E95420]">$39.99</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer navigation */}
      {chapters.length > 1 && !loading && !error && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-slate-900/50 flex-shrink-0">
          <button onClick={goPrev} disabled={activeChapter === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-slate-700 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs text-slate-500">
            {activeChapter + 1} / {chapters.length}
          </span>
          <button onClick={goNext} disabled={activeChapter === chapters.length - 1}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-slate-700 transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return content;
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
export function SampleReaderModal({ sampleUrl, bookTitle, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-3xl h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          <SampleReader
            sampleUrl={sampleUrl}
            bookTitle={bookTitle}
            onClose={onClose}
            isModal
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
