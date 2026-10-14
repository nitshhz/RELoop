import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { MobileNav } from './components/layout/MobileNav.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Pages
import { HomePage } from './pages/HomePage.jsx';
import { BrowsePage } from './pages/BrowsePage.jsx';
import { ListingDetailPage } from './pages/ListingDetailPage.jsx';
import { CreateListingPage } from './pages/CreateListingPage.jsx';
import { EditListingPage } from './pages/EditListingPage.jsx';
import { AiListingCreatorPage } from './pages/AiListingCreatorPage.jsx';
import { OffersPage } from './pages/OffersPage.jsx';
import { MessagesPage } from './pages/MessagesPage.jsx';
import { SavedListingsPage } from './pages/SavedListingsPage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { SellerDashboardPage } from './pages/SellerDashboardPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { UserPublicProfilePage } from './pages/UserPublicProfilePage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { AdminModerationPage } from './pages/admin/AdminModerationPage.jsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx';
import { AdminReportsPage } from './pages/admin/AdminReportsPage.jsx';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage.jsx';

// Static Pages
import {
  AboutPage,
  SafetyPage,
  ProhibitedPage,
  TermsPage,
  PrivacyPage,
} from './pages/static/PolicyPages.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="py-24 text-center text-xs text-text-muted">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="py-24 text-center text-xs text-text-muted">Checking privileges...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-brand-green-soft selection:text-brand-green">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Marketplace */}
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/user/:userId" element={<UserPublicProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Static policy & trust pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/prohibited" element={<ProhibitedPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Protected User Marketplace Actions */}
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listing/:id/edit"
            element={
              <ProtectedRoute>
                <EditListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-creator"
            element={
              <ProtectedRoute>
                <AiListingCreatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute>
                <SellerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <ProtectedRoute>
                <OffersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Administrator Controls */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <AdminRoute>
                <AdminModerationPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminReportsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <AdminRoute>
                <AdminAuditLogsPage />
              </AdminRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
