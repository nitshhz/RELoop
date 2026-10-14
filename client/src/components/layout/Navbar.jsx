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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { Button } from '../ui/Button.jsx';
import { Logo } from '../ui/Logo.jsx';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
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

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
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

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-text-primary hover:bg-background-secondary"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Drawer */}
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
                className="p-2.5 bg-white rounded-xl text-xs font-bold text-center border border-border-subtle"
              >
                Browse All Items
              </Link>
              <Link
                to="/ai-creator"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 bg-brand-green-soft text-brand-green rounded-xl text-xs font-bold text-center border border-emerald-200"
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
          </div>
        )}
      </div>
    </header>
  );
}
