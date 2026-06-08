import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Heart, Trash2, Pin, Search, Hash, ChevronDown, ChevronUp, Reply } from 'lucide-react';
import Layout from '../components/Layout';
import { communityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";

const CHANNEL_ICONS = {
  general: '💬', essays: '📄', recipes: '🍳', industrial: '⚙️', mathematics: '📐', announcements: '📢',
};

const CHANNEL_COLORS = {
  general: '#2D6EAA', essays: '#38A169', recipes: '#E95420',
  industrial: '#7B2D8B', mathematics: '#E95420', announcements: '#F59E0B',
};

function PostCard({ post, user, onLike, onDelete, onPin, onReply, depth = 0 }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const liked = post.likes?.includes(user?._id);
  const isAdmin = user?.role === 'admin';
  const isOwner = post.userId === user?._id || post.userId?._id === user?._id;

  const loadReplies = async () => {
    if (showReplies) { setShowReplies(false); return; }
    setLoadingReplies(true);
    try {
      const { data } = await communityAPI.getPosts({ channel: post.channel, parentId: post._id });
      setReplies(data);
      setShowReplies(true);
    } catch { }
    finally { setLoadingReplies(false); }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 sm:ml-10 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className={`border rounded-2xl p-4 sm:p-5 transition-all ${
        post.pinned
          ? 'border-yellow-300 bg-yellow-50'
          : 'bg-white/80 border-gray-200/60 hover:border-gray-300 hover:shadow-sm'
      }`}>
        {post.pinned && (
          <div className="flex items-center gap-1 text-yellow-600 text-xs font-black mb-2">
            <Pin className="w-3 h-3" /> Pinned
          </div>
        )}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
            style={{ backgroundColor: `${CHANNEL_COLORS[post.channel] || '#2D6EAA'}15`, color: CHANNEL_COLORS[post.channel] || '#2D6EAA' }}>
            {post.userName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-black text-gray-900 text-sm" style={{ fontFamily: INTER }}>{post.userName}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${
                post.userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
              }`}>{post.userRole}</span>
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(post.createdAt).toLocaleDateString()} {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-3">
              <button onClick={() => onLike(post._id)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                {post.likes?.length || 0}
              </button>
              {depth === 0 && (
                <button onClick={() => onReply(post)}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#2D6EAA] transition-colors">
                  <Reply className="w-3.5 h-3.5" /> Reply
                </button>
              )}
              {post.replyCount > 0 && depth === 0 && (
                <button onClick={loadReplies}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">
                  {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
                </button>
              )}
              {isAdmin && (
                <button onClick={() => onPin(post._id)}
                  className="flex items-center gap-1 text-xs text-gray-300 hover:text-yellow-500 transition-colors ml-auto">
                  <Pin className="w-3 h-3" />
                </button>
              )}
              {(isAdmin || isOwner) && (
                <button onClick={() => onDelete(post._id)}
                  className="flex items-center gap-1 text-xs text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <AnimatePresence>
        {showReplies && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2">
            {loadingReplies ? (
              <div className="ml-10 text-xs text-gray-400 py-2">Loading replies...</div>
            ) : replies.map((reply) => (
              <PostCard key={reply._id} post={reply} user={user} onLike={onLike} onDelete={onDelete} onPin={onPin} onReply={onReply} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState('general');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [mobileChannelOpen, setMobileChannelOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    communityAPI.getChannels().then(({ data }) => setChannels(data)).catch(console.error);
  }, []);

  const loadPosts = async (channel) => {
    setLoading(true);
    setSearchResults(null);
    try {
      const { data } = await communityAPI.getPosts({ channel, parentId: 'null' });
      setPosts(data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPosts(activeChannel); }, [activeChannel]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setPosting(true);
    try {
      await communityAPI.createPost({
        channel: activeChannel,
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        content,
        parentId: replyTo?._id || null,
      });
      setContent('');
      setReplyTo(null);
      await loadPosts(activeChannel);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { }
    finally { setPosting(false); }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    try {
      await communityAPI.likePost(postId, user._id);
      setPosts(posts.map(p => p._id === postId
        ? { ...p, likes: p.likes?.includes(user._id) ? p.likes.filter(id => id !== user._id) : [...(p.likes || []), user._id] }
        : p
      ));
    } catch { }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await communityAPI.deletePost(postId);
      setPosts(posts.filter(p => p._id !== postId));
    } catch { }
  };

  const handlePin = async (postId) => {
    try {
      await communityAPI.pinPost(postId);
      setPosts(posts.map(p => p._id === postId ? { ...p, pinned: true } : p));
    } catch { }
  };

  const handleSearch = async () => {
    if (!search.trim()) { setSearchResults(null); return; }
    try {
      const { data } = await communityAPI.search({ q: search, channel: activeChannel });
      setSearchResults(data);
    } catch { }
  };

  const displayPosts = searchResults ?? posts;

  return (
    <Layout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">

        {/* Channel sidebar — desktop */}
        <aside className="hidden sm:flex w-56 bg-white/80 border-r border-gray-200/60 flex-col flex-shrink-0 backdrop-blur-sm">
          <div className="px-4 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-sm flex items-center gap-2" style={{ fontFamily: INTER }}>
              <MessageSquare className="w-4 h-4 text-[#2D6EAA]" /> Community
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Discussion channels</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {channels.map((ch) => (
              <button key={ch.id} onClick={() => setActiveChannel(ch.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-all ${
                  activeChannel === ch.id
                    ? 'bg-[#2D6EAA]/10 text-[#2D6EAA]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <span className="text-base">{CHANNEL_ICONS[ch.id] || '💬'}</span>
                <span className="truncate"># {ch.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Channel header */}
          <div className="bg-white/80 border-b border-gray-200/60 px-4 sm:px-6 py-3 flex items-center gap-3 flex-shrink-0 backdrop-blur-sm">
            {/* Mobile channel picker */}
            <button className="sm:hidden flex items-center gap-2 text-sm font-black text-gray-900"
              onClick={() => setMobileChannelOpen(!mobileChannelOpen)}>
              <span>{CHANNEL_ICONS[activeChannel] || '💬'}</span>
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="capitalize">{activeChannel}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-lg">{CHANNEL_ICONS[activeChannel] || '💬'}</span>
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="font-black text-gray-900 capitalize" style={{ fontFamily: INTER }}>{activeChannel}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="Search..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2D6EAA]/50 w-32 sm:w-48" />
              </div>
              {searchResults && (
                <button onClick={() => { setSearchResults(null); setSearch(''); }}
                  className="text-xs text-gray-400 hover:text-gray-700 font-bold">Clear</button>
              )}
            </div>
          </div>

          {/* Mobile channel dropdown */}
          <AnimatePresence>
            {mobileChannelOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                className="sm:hidden bg-white border-b border-gray-200 overflow-hidden">
                {channels.map((ch) => (
                  <button key={ch.id} onClick={() => { setActiveChannel(ch.id); setMobileChannelOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold ${
                      activeChannel === ch.id ? 'text-[#2D6EAA] bg-[#2D6EAA]/5' : 'text-gray-600'
                    }`}>
                    <span>{CHANNEL_ICONS[ch.id] || '💬'}</span> # {ch.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse border border-gray-200" />
                ))}
              </div>
            ) : displayPosts.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold">{searchResults ? 'No results found.' : 'No posts yet. Start the conversation!'}</p>
              </div>
            ) : (
              displayPosts.map((post) => (
                <PostCard key={post._id} post={post} user={user}
                  onLike={handleLike} onDelete={handleDelete} onPin={handlePin}
                  onReply={(p) => { setReplyTo(p); document.getElementById('post-input')?.focus(); }} />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div className="border-t border-gray-200/60 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-4 flex-shrink-0">
            {replyTo && (
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <Reply className="w-3 h-3" />
                <span>Replying to <span className="font-black text-gray-900">{replyTo.userName}</span></span>
                <button onClick={() => setReplyTo(null)} className="ml-auto text-gray-400 hover:text-gray-700">✕</button>
              </div>
            )}
            {user ? (
              <form onSubmit={handlePost} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 bg-[#2D6EAA]/10 text-[#2D6EAA]">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 flex gap-2">
                  <input id="post-input" type="text" value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Message #${activeChannel}...`}
                    className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2D6EAA]/50 transition-all" />
                  <button type="submit" disabled={!content.trim() || posting}
                    className="px-4 py-2.5 bg-[#2D6EAA] text-white rounded-2xl font-black hover:bg-[#245a8e] transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm">
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:block">{posting ? '...' : 'Send'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-3">
                <p className="text-gray-500 text-sm">
                  <a href="/login" className="text-[#2D6EAA] font-black hover:underline">Sign in</a> to join the conversation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
