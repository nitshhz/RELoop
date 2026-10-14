import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Tag,
  TrendingDown,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.jsx';
import { Button } from '../components/ui/Button.jsx';

export function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  function getNotificationIcon(type) {
    switch (type) {
      case 'OFFER_RECEIVED':
      case 'OFFER_ACCEPTED':
      case 'OFFER_COUNTERED':
        return <Tag className="w-4 h-4 text-brand-green" />;
      case 'PRICE_DROP':
        return <TrendingDown className="w-4 h-4 text-terracotta" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'LISTING_APPROVED':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'LISTING_REJECTED':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-text-muted" />;
    }
  }

  function handleNotificationClick(item) {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    if (item.link) {
      navigate(item.link);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real in-app updates for offers, price drops, and messages
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="clay-card p-12 text-center space-y-3 bg-white">
          <Bell className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="font-bold text-text-primary">No notifications yet</h3>
          <p className="text-xs text-text-muted">
            When you receive offers, price discounts on saved items, or messages, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`clay-card p-4 flex items-start gap-3.5 cursor-pointer transition-all ${
                item.isRead
                  ? 'bg-white opacity-85 hover:opacity-100'
                  : 'bg-emerald-50/40 border-l-4 border-l-brand-green shadow-sm'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-background-secondary flex items-center justify-center shrink-0 mt-0.5">
                {getNotificationIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-text-primary truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-text-muted shrink-0">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
