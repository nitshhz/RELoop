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

  const messagesEndRef = useRef(null);

  const quickReplies = [
    'Is this still available?',
    'Can you share more photos?',
    'Can you provide more details?',
    'Would you consider this offer?',
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (!text.trim() || !conversationId) return;

    setSending(true);
    try {
      const res = await apiRequest(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        data: {
          content: text.trim(),
          isQuickReply: isQuick,
        },
      });

      setMessages((prev) => [...prev, res.message]);
      setNewMessage('');
      loadConversations(); // update snippet
    } catch (err) {
      alert(err.message || 'Could not send message.');
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
      <div className="clay-card bg-white overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[70vh] max-h-[82vh] border border-border-subtle">
        {/* Left Pane: Conversations List (4 cols) */}
        <div
          className={`md:col-span-4 border-r border-border-subtle flex flex-col ${
            conversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-border-subtle bg-background-secondary/30">
            <h2 className="text-base font-bold text-text-primary">Messages</h2>
            <p className="text-xs text-text-muted">Direct chats linked to product listings</p>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-border-subtle">
            {loading ? (
              <div className="p-8 text-center text-xs text-text-muted">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-xs text-text-muted">No conversations yet.</p>
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
                        ? 'bg-brand-green-soft/40 border-l-4 border-brand-green'
                        : 'hover:bg-background-secondary/50'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-border-subtle overflow-hidden shrink-0">
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
                        <span className="text-xs font-bold text-text-primary truncate">
                          {otherParty?.name}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-brand-green text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-brand-green font-semibold truncate">
                        {conv.listing?.title}
                      </p>

                      <p className="text-[11px] text-text-muted truncate mt-0.5">
                        {lastMsg ? lastMsg.content : 'Started conversation'}
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
          className={`md:col-span-8 flex flex-col bg-[#FAF9F5] ${
            !conversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {conversationId && activeConversation ? (
            <>
              {/* Header */}
              <div className="p-3.5 border-b border-border-subtle bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/messages')}
                    className="md:hidden p-1.5 rounded-lg text-text-muted hover:bg-background-secondary"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-text-primary truncate">
                        {activeConversation.buyerId === user.id
                          ? activeConversation.seller?.name
                          : activeConversation.buyer?.name}
                      </h3>
                      {activeConversation.isBlocked && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">
                          Blocked
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/listing/${activeConversation.listingId}`}
                      className="text-[11px] text-brand-green hover:underline font-semibold block truncate"
                    >
                      {activeConversation.listing?.title} — ₹
                      {activeConversation.listing?.price?.toLocaleString()}
                    </Link>
                  </div>
                </div>

                <button
                  onClick={handleToggleBlock}
                  disabled={blocking}
                  className="text-xs text-text-muted hover:text-red-600 flex items-center gap-1 font-semibold p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{activeConversation.isBlocked ? 'Unblock' : 'Block'}</span>
                </button>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                          isMine
                            ? 'bg-brand-green text-white rounded-br-none shadow-sm'
                            : 'bg-white text-text-primary rounded-bl-none border border-border-subtle shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-text-muted mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Suggestions */}
              {!activeConversation.isBlocked && (
                <div className="px-4 py-2 bg-white/70 border-t border-border-subtle flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0">
                    Quick replies:
                  </span>
                  {quickReplies.map((qr) => (
                    <button
                      key={qr}
                      type="button"
                      onClick={() => handleSendMessage(qr, true)}
                      className="px-2.5 py-1 rounded-full bg-background-secondary hover:bg-brand-green-soft hover:text-brand-green text-[11px] font-medium text-text-primary transition-colors whitespace-nowrap shrink-0 border border-border-subtle"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Bar */}
              <div className="p-3 bg-white border-t border-border-subtle">
                {activeConversation.isBlocked ? (
                  <p className="text-xs text-red-600 text-center py-2 font-medium">
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
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 clay-input px-3.5 py-2.5 text-xs sm:text-sm bg-white"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!newMessage.trim() || sending}
                      isLoading={sending}
                      className="shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="m-auto text-center p-8 space-y-2">
              <MessageSquare className="w-12 h-12 text-text-muted mx-auto" />
              <h3 className="font-bold text-sm text-text-primary">Select a Conversation</h3>
              <p className="text-xs text-text-muted max-w-xs">
                Pick a buyer or seller on the left to review messages, negotiate, and answer questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
