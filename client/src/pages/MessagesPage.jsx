import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  Shield,
  Clock,
  ArrowLeft,
  Loader2,
  Tag,
  AlertCircle,
  Ban,
  Paperclip,
  Camera,
  Image as ImageIcon,
  X,
  CheckCircle2,
  ZoomIn,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';

export function MessagesPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [blocking, setBlocking] = useState(false);

  // Image attachment state
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const chatFeedRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const quickReplies = [
    'Can we negotiate on the price?',
    'Would you consider my offer?',
    'Can you share more photos?',
    'When and where can we meet for pickup?',
    'Is this still available?',
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      // Poll active conversation every 4s
      const timer = setInterval(() => {
        loadMessages(conversationId, true);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }

  function handleImageFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image file size must be less than 5MB.');
      return;
    }

    setSelectedImageFile(file);
    setSelectedImagePreview(URL.createObjectURL(file));
    setImageError(null);
  }

  function handleClearImage() {
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  async function loadConversations() {
    try {
      const data = await apiRequest('/conversations');
      setConversations(data.conversations || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(id, silent = false) {
    try {
      const data = await apiRequest(`/conversations/${id}/messages`);
      setActiveConversation(data.conversation);
      setMessages(data.messages || []);
    } catch (err) {
      if (!silent) console.warn(err);
    }
  }

  async function handleSendMessage(content, isQuick = false) {
    const text = content || newMessage;
    if ((!text.trim() && !selectedImageFile) || !conversationId) return;

    setSending(true);
    setImageError(null);

    try {
      let res;
      if (selectedImageFile) {
        const formData = new FormData();
        if (text.trim()) {
          formData.append('content', text.trim());
        }
        formData.append('image', selectedImageFile);
        if (isQuick) {
          formData.append('isQuickReply', 'true');
        }

        res = await apiRequest(`/conversations/${conversationId}/messages`, {
          method: 'POST',
          data: formData,
          isFormData: true,
        });
      } else {
        res = await apiRequest(`/conversations/${conversationId}/messages`, {
          method: 'POST',
          data: {
            content: text.trim(),
            isQuickReply: isQuick,
          },
        });
      }

      setMessages((prev) => [...prev, res.message]);
      setNewMessage('');
      handleClearImage();
      loadConversations(); // update snippet
    } catch (err) {
      const errMsg = err.message || 'Could not send message.';
      setImageError(errMsg);
    } finally {
      setSending(false);
    }
  }

  async function handleToggleBlock() {
    if (!conversationId) return;
    const confirmMsg = activeConversation?.isBlocked
      ? 'Do you want to unblock this conversation?'
      : 'Block this conversation? Neither party will be able to send messages.';
    if (!window.confirm(confirmMsg)) return;

    setBlocking(true);
    try {
      const res = await apiRequest(`/conversations/${conversationId}/block`, { method: 'POST' });
      setActiveConversation(res.conversation);
    } catch (err) {
      alert(err.message || 'Could not block conversation.');
    } finally {
      setBlocking(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hidden file inputs for Gallery/Files and Camera */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Lightbox Modal for Fullscreen Image Viewing */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
              title="Close viewer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged chat attachment"
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur-md border border-white/10">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Safe by ReLoop AI Vision</span>
            </div>
          </div>
        </div>
      )}

      <div className="clay-card bg-white dark:bg-slate-900 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] h-[calc(100vh-140px)] max-h-[800px] border border-border-subtle dark:border-slate-800 transition-colors">
        {/* Left Pane: Conversations List (4 cols) */}
        <div
          className={`md:col-span-4 border-r border-border-subtle dark:border-slate-800 flex flex-col ${
            conversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-border-subtle dark:border-slate-800 bg-background-secondary/30 dark:bg-slate-800/40">
            <h2 className="text-base font-bold text-text-primary dark:text-slate-100">Messages</h2>
            <p className="text-xs text-text-muted dark:text-slate-400">Direct chats linked to product listings</p>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-border-subtle dark:divide-slate-800">
            {loading ? (
              <div className="p-8 text-center text-xs text-text-muted dark:text-slate-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-text-muted dark:text-slate-500 mx-auto" />
                <p className="text-xs text-text-muted dark:text-slate-400">No conversations yet.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === conversationId;
                const otherParty = conv.buyerId === user.id ? conv.seller : conv.buyer;
                const lastMsg = conv.messages && conv.messages[0];

                return (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/messages/${conv.id}`)}
                    className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                      isSelected
                        ? 'bg-brand-green-soft/40 dark:bg-emerald-950/40 border-l-4 border-brand-green'
                        : 'hover:bg-background-secondary/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-border-subtle dark:bg-slate-800 overflow-hidden shrink-0">
                      {otherParty?.avatar ? (
                        <img src={otherParty.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-brand-green-soft text-brand-green font-bold text-xs flex items-center justify-center">
                          {otherParty?.name?.[0] || 'U'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary dark:text-slate-100 truncate">
                          {otherParty?.name}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-brand-green text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[11px] text-brand-green dark:text-emerald-400 font-semibold truncate flex-1">
                          {conv.listing?.title}
                        </p>
                        {conv.listing?.offers?.[0] && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                              conv.listing.offers[0].status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : conv.listing.offers[0].status === 'COUNTERED'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            ₹{(conv.listing.offers[0].counterAmount || conv.listing.offers[0].amount)?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-text-muted dark:text-slate-400 truncate mt-0.5">
                        {lastMsg ? (lastMsg.content || '📷 Photo attachment') : 'Started conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window (8 cols) */}
        <div
          className={`md:col-span-8 flex flex-col bg-[#FAF9F5] dark:bg-slate-950 ${
            !conversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {conversationId && activeConversation ? (
            <>
              {/* Header */}
              <div className="p-3.5 border-b border-border-subtle dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => navigate('/messages')}
                    className="md:hidden p-1.5 rounded-lg text-text-muted hover:bg-background-secondary dark:hover:bg-slate-800 shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-text-primary dark:text-slate-100 truncate">
                        {activeConversation.buyerId === user.id
                          ? activeConversation.seller?.name
                          : activeConversation.buyer?.name}
                      </h3>
                      {activeConversation.isBlocked && (
                        <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-[10px] font-bold rounded shrink-0">
                          Blocked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Link
                        to={`/listing/${activeConversation.listingId}`}
                        className="text-[11px] text-brand-green dark:text-emerald-400 hover:underline font-semibold truncate"
                      >
                        {activeConversation.listing?.title} — ₹
                        {activeConversation.listing?.price?.toLocaleString()}
                      </Link>
                      {activeConversation.listing?.offers?.[0] && (
                        <Link
                          to="/offers"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-transform hover:scale-105 shrink-0 ${
                            activeConversation.listing.offers[0].status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : activeConversation.listing.offers[0].status === 'COUNTERED'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                          }`}
                          title="View offer negotiation on Offers page"
                        >
                          <Tag className="w-2.5 h-2.5 shrink-0" />
                          <span>
                            {activeConversation.listing.offers[0].status === 'ACCEPTED'
                              ? `Deal Agreed: ₹${activeConversation.listing.offers[0].amount?.toLocaleString()}`
                              : activeConversation.listing.offers[0].status === 'COUNTERED'
                              ? `Countered: ₹${activeConversation.listing.offers[0].counterAmount?.toLocaleString()}`
                              : `Offer: ₹${activeConversation.listing.offers[0].amount?.toLocaleString()} (${activeConversation.listing.offers[0].status})`}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleToggleBlock}
                  disabled={blocking}
                  className="text-xs text-text-muted dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 font-semibold p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{activeConversation.isBlocked ? 'Unblock' : 'Block'}</span>
                </button>
              </div>

              {/* Messages Feed */}
              <div ref={chatFeedRef} className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                          isMine
                            ? 'bg-brand-green text-white rounded-br-none shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-text-primary dark:text-slate-100 rounded-bl-none border border-border-subtle dark:border-slate-700 shadow-sm'
                        }`}
                      >
                        {/* Image Attachment Rendering */}
                        {msg.imageUrl && (
                          <div className="relative group mb-1.5 overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20">
                            <img
                              src={msg.imageUrl}
                              alt="Attachment"
                              className="max-h-60 sm:max-h-72 w-auto rounded-xl object-contain cursor-pointer transition-transform duration-200 group-hover:scale-[1.01]"
                              onClick={() => setLightboxImage(msg.imageUrl)}
                              loading="lazy"
                            />
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-medium shadow-sm">
                              <Shield className="w-3 h-3 text-emerald-400" />
                              <span>AI Verified</span>
                            </div>
                          </div>
                        )}

                        {/* Text Content */}
                        {msg.content && (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-text-muted dark:text-slate-500 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* AI Moderation Error / Safety Warning Banner */}
              {imageError && (
                <div className="mx-4 mb-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 flex items-start justify-between gap-3 text-xs shadow-sm animate-in fade-in">
                  <div className="flex items-start gap-2 min-w-0">
                    <Shield className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">ReLoop AI Safety Notice</p>
                      <p className="text-[11px] mt-0.5 opacity-90 break-words">{imageError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageError(null)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-300 p-0.5 shrink-0"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Attachment Preview Drawer (Before Sending) */}
              {selectedImagePreview && (
                <div className="p-3 bg-brand-green-soft/40 dark:bg-emerald-950/40 border-t border-border-subtle dark:border-slate-800 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border-subtle dark:border-slate-700 shrink-0 shadow-inner">
                      <img
                        src={selectedImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-text-primary dark:text-slate-100 truncate">
                          {selectedImageFile?.name}
                        </span>
                        <span className="text-[10px] text-text-muted dark:text-slate-400 shrink-0">
                          ({(selectedImageFile?.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[11px] text-brand-green dark:text-emerald-400 font-medium">
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">AI will verify safety before delivery</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    disabled={sending}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Cancel image attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Quick Reply Suggestions */}
              {!activeConversation.isBlocked && (
                <div className="px-4 py-2 bg-white/70 dark:bg-slate-900/70 border-t border-border-subtle dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] font-bold text-text-muted dark:text-slate-500 uppercase tracking-wider shrink-0">
                    Quick replies:
                  </span>
                  {quickReplies.map((qr) => (
                    <button
                      key={qr}
                      type="button"
                      onClick={() => handleSendMessage(qr, true)}
                      className="px-2.5 py-1 rounded-full bg-background-secondary dark:bg-slate-800 hover:bg-brand-green-soft dark:hover:bg-emerald-950/60 hover:text-brand-green dark:hover:text-emerald-400 text-[11px] font-medium text-text-primary dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 border border-border-subtle dark:border-slate-700"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Bar */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-border-subtle dark:border-slate-800 transition-colors">
                {activeConversation.isBlocked ? (
                  <p className="text-xs text-red-600 dark:text-red-400 text-center py-2 font-medium">
                    This conversation is blocked. Unblock it to send messages.
                  </p>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    {/* Camera Button */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={sending}
                      className="p-2 rounded-xl text-text-muted dark:text-slate-400 hover:text-brand-green dark:hover:text-emerald-400 hover:bg-background-secondary dark:hover:bg-slate-800 transition-colors shrink-0"
                      title="Take photo from camera"
                    >
                      <Camera className="w-5 h-5" />
                    </button>

                    {/* Gallery / File Attachment Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                      className={`p-2 rounded-xl transition-colors shrink-0 ${
                        selectedImageFile
                          ? 'text-brand-green dark:text-emerald-400 bg-brand-green-soft/50 dark:bg-emerald-950/50'
                          : 'text-text-muted dark:text-slate-400 hover:text-brand-green dark:hover:text-emerald-400 hover:bg-background-secondary dark:hover:bg-slate-800'
                      }`}
                      title="Attach image from gallery or files"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={
                        selectedImageFile
                          ? 'Add a message or press send...'
                          : 'Type your message...'
                      }
                      className="flex-1 clay-input px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 text-text-primary dark:text-slate-100 placeholder:text-text-muted dark:placeholder:text-slate-500 border border-border-subtle dark:border-slate-700"
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={(!newMessage.trim() && !selectedImageFile) || sending}
                      isLoading={sending}
                      className="shrink-0"
                    >
                      {sending && selectedImageFile ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">AI Scanning...</span>
                        </span>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="m-auto text-center p-8 space-y-2">
              <MessageSquare className="w-12 h-12 text-text-muted dark:text-slate-500 mx-auto" />
              <h3 className="font-bold text-sm text-text-primary dark:text-slate-100">Select a Conversation</h3>
              <p className="text-xs text-text-muted dark:text-slate-400 max-w-xs">
                Pick a buyer or seller on the left to review messages, negotiate, and answer questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
