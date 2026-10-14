import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Sparkles,
  PlusCircle,
  Heart,
  MessageSquare,
  Bell,
  User,
  ShieldAlert,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Button } from '../ui/Button.jsx';
import { Logo } from '../ui/Logo.jsx';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5F0]/90 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <Logo size="md" />

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mobiles, laptops, furniture, gaming..."
              className="w-full clay-input pl-10 pr-4 py-2 text-sm bg-white"
            />
          </form>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <Link
              to="/browse"
              className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                location.pathname === '/browse'
                  ? 'text-brand-green bg-brand-green-soft'
                  : 'text-text-primary hover:bg-background-secondary'
              }`}
            >
              Browse
            </Link>

            {user ? (
              <>
                {/* Saved Items */}
                <Link
                  to="/saved"
                  title="Saved Items"
                  className="p-2 text-text-muted hover:text-brand-green hover:bg-background-secondary rounded-xl transition-colors relative"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Messages */}
                <Link
                  to="/messages"
                  title="Messages"
                  className="p-2 text-text-muted hover:text-brand-green hover:bg-background-secondary rounded-xl transition-colors relative"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  title="Notifications"
                  className="p-2 text-text-muted hover:text-brand-green hover:bg-background-secondary rounded-xl transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* AI Listing Creator Shortcut */}
                <Link
                  to="/ai-creator"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-green bg-brand-green-soft border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                  AI Listing Creator
                </Link>

                {/* Standard Sell Button */}
                <Link to="/sell">
                  <Button size="sm" variant="primary">
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Sell Item
                  </Button>
                </Link>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-background-secondary transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-border-subtle"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-green-soft text-brand-green font-bold text-xs flex items-center justify-center border border-emerald-200">
                        {user.name[0]}
                      </div>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-border-subtle py-2 z-50 clay-card"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-border-subtle">
                        <p className="text-xs font-bold text-text-primary truncate">{user.name}</p>
                        <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/seller/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-text-primary hover:bg-background-secondary"
                      >
                        <LayoutDashboard className="w-4 h-4 text-text-muted" />
                        Seller Analytics & Items
                      </Link>

                      <Link
                        to="/offers"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-text-primary hover:bg-background-secondary"
                      >
                        <PlusCircle className="w-4 h-4 text-text-muted" />
                        My Offers & Counteroffers
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-text-primary hover:bg-background-secondary"
                      >
                        <User className="w-4 h-4 text-text-muted" />
                        Account Settings
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100"
                        >
                          <ShieldAlert className="w-4 h-4 text-purple-700" />
                          Admin Moderation Panel
                        </Link>
                      )}

                      {/* Dark Theme Toggle inside Profile Dropdown */}
                      <div className="border-t border-border-subtle my-1 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTheme();
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-text-primary hover:bg-background-secondary transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            {isDark ? (
                              <Sun className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Moon className="w-4 h-4 text-brand-green" />
                            )}
                            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                          </div>
                          <div
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                              isDark ? 'bg-brand-green justify-end' : 'bg-gray-300 justify-start'
                            }`}
                          >
                            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                          </div>
                        </button>
                      </div>

                      <div className="border-t border-border-subtle mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Theme Toggle for Unauthenticated Visitors */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 text-text-muted hover:text-brand-green hover:bg-background-secondary rounded-xl transition-colors"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-green" />}
                </button>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions: Theme Toggle, Notifications, Menu */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* Direct Mobile Header Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-text-muted hover:text-brand-green dark:text-slate-300 dark:hover:text-emerald-400 hover:bg-background-secondary dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-brand-green" />
              )}
            </button>

            {user && (
              <Link
                to="/notifications"
                className="p-2 text-text-muted relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-terracotta text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-text-primary hover:bg-background-secondary"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-border-subtle space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search secondhand products..."
                className="w-full clay-input pl-10 pr-4 py-2.5 text-xs bg-white"
              />
            </form>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/browse"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-center border border-border-subtle dark:border-slate-700"
              >
                Browse All Items
              </Link>
              <Link
                to="/ai-creator"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 bg-brand-green-soft dark:bg-emerald-950/60 text-brand-green dark:text-emerald-400 rounded-xl text-xs font-bold text-center border border-emerald-200 dark:border-emerald-800"
              >
                AI Listing Creator
              </Link>
            </div>

            {user ? (
              <div className="space-y-1 pt-2 border-t border-border-subtle">
                <Link
                  to="/seller/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-semibold text-text-primary"
                >
                  Seller Analytics & Listings
                </Link>
                <Link
                  to="/offers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-semibold text-text-primary"
                >
                  Offers & Counteroffers
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-semibold text-text-primary"
                >
                  Saved Listings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-bold text-purple-700 bg-purple-50 rounded-xl"
                  >
                    Admin Moderation Panel
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1"
                >
                  <Button variant="secondary" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1"
                >
                  <Button variant="primary" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Theme Toggle - Always visible for both Guests & Authenticated Users */}
            <div className="pt-2 border-t border-border-subtle dark:border-slate-800">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary dark:text-slate-200 hover:bg-background-secondary dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-brand-green dark:text-emerald-400" />
                  )}
                  <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                </div>
                <div
                  className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                    isDark ? 'bg-brand-green justify-end' : 'bg-gray-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
