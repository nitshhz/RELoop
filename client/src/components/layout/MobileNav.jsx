import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Browse', path: '/browse', icon: Compass },
    { label: 'Sell', path: '/sell', icon: Plus, isAction: true },
    { label: 'Chat', path: user ? '/messages' : '/login', icon: MessageSquare },
    { label: 'Profile', path: user ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#151B16]/95 backdrop-blur-md border-t border-border-subtle pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isAction) {
            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-brand-green text-white shadow-clay-button flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-brand-green mt-0.5">
                  Sell
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center w-14 py-1 relative transition-colors ${
                isActive ? 'text-brand-green font-bold' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.label === 'Chat' && unreadCount > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-terracotta" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
