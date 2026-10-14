import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { apiRequest } from '../lib/api.js';
import { User, Mail, Shield, CheckCircle, AlertCircle, Camera, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { CameraModal } from '../components/ui/CameraModal.jsx';

export function ProfilePage() {
  const { user, updateProfile, uploadAvatar } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleAvatarFileSelected(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Avatar image must be less than 5MB.');
      return;
    }
    setUploadingAvatar(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const updatedUser = await uploadAvatar(file);
      setAvatar(updatedUser.avatar || '');
      setProfileSuccess('Profile picture updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    setUploadingAvatar(true);
    try {
      await updateProfile({ avatar: null });
      setAvatar('');
      setProfileSuccess('Profile picture removed.');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to remove avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border-subtle">
          {/* Avatar with live status */}
          <div className="relative group shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-2 border-brand-green/30 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-green-soft text-brand-green font-extrabold text-3xl flex items-center justify-center border-2 border-brand-green/20 shadow-inner">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}

            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>

          {/* User Details & Photo Actions */}
          <div className="space-y-3 flex-1">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">{user?.name}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-background-secondary text-text-primary">
                  <Shield className="w-3 h-3 text-brand-green" />
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-text-muted">{user?.email}</p>
            </div>

            {/* Picture Upload Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAvatarFileSelected(f);
                }}
              />

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="text-xs font-semibold"
              >
                <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-brand-green" />
                Choose from Gallery / Files
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsCameraOpen(true)}
                disabled={uploadingAvatar}
                className="text-xs font-semibold"
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                Take Photo with Camera
              </Button>

              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="p-1.5 text-text-muted hover:text-red-600 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
                  title="Remove avatar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-text-muted">
              JPG, PNG, WebP up to 5MB. Photo updates immediately upon selection.
            </p>
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
            label="Avatar Image URL (Optional custom image link)"
            placeholder="https://..."
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

      {/* Live Camera Modal for Profile Photo */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleAvatarFileSelected}
        title="Take Profile Photo"
      />
    </div>
  );
}

