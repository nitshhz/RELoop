import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { apiRequest } from '../lib/api.js';
import { User, Mail, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim() || null,
        avatar: avatar.trim() || null,
      });
      setProfileSuccess('Profile updated successfully.');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordSuccess('');
    setPasswordError('');

    try {
      await apiRequest('/auth/change-password', {
        method: 'PUT',
        data: { currentPassword, newPassword },
      });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Could not change password.');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Manage your personal profile, avatar, and security credentials
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="clay-card p-6 bg-white space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-border-subtle">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="w-16 h-16 rounded-full object-cover border border-border-subtle"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-green-soft text-brand-green font-extrabold text-2xl flex items-center justify-center">
              {user?.name?.[0] || 'U'}
            </div>
          )}

          <div>
            <h2 className="text-base font-bold text-text-primary">{user?.name}</h2>
            <p className="text-xs text-text-muted">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-background-secondary text-text-primary">
              <Shield className="w-3 h-3 text-brand-green" />
              Role: {user?.role}
            </span>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Display Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Avatar Image URL (Optional)"
            placeholder="https://images.unsplash.com/..."
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />

          <Textarea
            label="Bio (Visible on your public seller profile)"
            rows={3}
            placeholder="Tell buyers a little about yourself or what you typically sell..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-green shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" isLoading={savingProfile}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="clay-card p-6 bg-white space-y-4">
        <h3 className="text-base font-bold text-text-primary">Change Password</h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <Input
            label="New Password (min 8 characters)"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-green shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="secondary" isLoading={savingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
