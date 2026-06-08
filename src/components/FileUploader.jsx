/**
 * FileUploader — drag-and-drop + click-to-browse file uploader.
 * Uploads to Cloudinary via the backend /api/upload endpoint.
 * Returns the Cloudinary URL to the parent via onUploaded(url).
 */
import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, FileText, Image, Film, Package, Loader } from 'lucide-react';
import { uploadAPI } from '../services/api';

const FILE_ICONS = {
  'application/pdf': FileText,
  'application/epub+zip': FileText,
  'application/zip': Package,
  'image/': Image,
  'video/': Film,
};

function getIcon(mime = '') {
  for (const [key, Icon] of Object.entries(FILE_ICONS)) {
    if (mime.startsWith(key) || mime === key) return Icon;
  }
  return FileText;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploader({
  label = 'Upload File',
  accept = '.pdf,.epub,.zip,.jpg,.jpeg,.png,.webp,.mp4,.webm',
  currentUrl = '',
  onUploaded,
  hint = 'PDF, EPUB, ZIP, images, or video up to 500MB',
  className = '',
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(null); // { url, filename, size }
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress (Cloudinary doesn't give real progress via REST)
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 85));
      }, 300);

      const { data } = await uploadAPI.upload(formData);

      clearInterval(progressInterval);
      setProgress(100);

      const result = { url: data.url, filename: data.filename, size: data.bytes || data.size };
      setUploaded(result);
      onUploaded?.(data.url, data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Check your Cloudinary config.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setUploaded(null);
    setProgress(0);
    setError('');
    onUploaded?.('', null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const FileIcon = uploaded ? getIcon(uploaded.filename?.split('.').pop()) : Upload;

  return (
    <div className={className}>
      {label && <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">{label}</label>}

      {/* Current URL display */}
      {currentUrl && !uploaded && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-slate-800/50 border border-white/10 rounded-xl text-xs">
          <CheckCircle className="w-3.5 h-3.5 text-[#38A169] flex-shrink-0" />
          <a href={currentUrl} target="_blank" rel="noopener noreferrer"
            className="text-[#2D6EAA] hover:underline truncate flex-1">{currentUrl}</a>
          <span className="text-slate-500">Current</span>
        </div>
      )}

      {/* Drop zone */}
      {!uploaded ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-[#E95420] bg-[#E95420]/10'
              : uploading
              ? 'border-[#2D6EAA]/50 bg-[#2D6EAA]/5 cursor-not-allowed'
              : 'border-white/20 hover:border-[#E95420]/50 hover:bg-[#E95420]/5'
          }`}
        >
          <input ref={inputRef} type="file" accept={accept} onChange={handleChange}
            className="hidden" disabled={uploading} />

          {uploading ? (
            <div className="space-y-3">
              <Loader className="w-8 h-8 text-[#2D6EAA] mx-auto animate-spin" />
              <p className="text-sm text-slate-400">Uploading to Cloudinary...</p>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden mx-auto max-w-xs">
                <div className="h-full bg-gradient-to-r from-[#E95420] to-[#2D6EAA] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-slate-500">{progress}%</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">
                Drop file here or <span className="text-[#E95420]">click to browse</span>
              </p>
              <p className="text-xs text-slate-600">{hint}</p>
            </div>
          )}
        </div>
      ) : (
        /* Uploaded state */
        <div className="flex items-center gap-3 p-4 bg-[#38A169]/10 border border-[#38A169]/30 rounded-2xl">
          <CheckCircle className="w-8 h-8 text-[#38A169] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white truncate">{uploaded.filename}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {uploaded.size && <span className="text-xs text-slate-500">{formatBytes(uploaded.size)}</span>}
              <a href={uploaded.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#2D6EAA] hover:underline truncate max-w-[200px]">
                View on Cloudinary ↗
              </a>
            </div>
          </div>
          <button onClick={clear}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
