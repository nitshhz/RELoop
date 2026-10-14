import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { Logo } from '../components/ui/Logo.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request Code, 2: Enter Code & New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoCode, setDemoCode] = useState('');

  async function handleRequestCode(e) {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');
    if (!email || !email.includes('@')) {
      setServerError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        data: { email },
      });
      setSuccessMsg(res.message || 'Verification code generated.');
      if (res.data?.resetCode) {
        setDemoCode(res.data.resetCode);
        setCode(res.data.resetCode); // auto-fill for convenience
      }
      setStep(2);
    } catch (err) {
      setServerError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setServerError('');
    if (!code || code.length < 6) {
      setServerError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setServerError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setServerError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        data: { email, code, newPassword },
      });
      setSuccessMsg('Your password has been successfully reset! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setServerError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md clay-card p-6 sm:p-8 bg-white space-y-6">
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-3">
            <Logo size="lg" variant="iconOnly" asLink={false} />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-text-muted">
            {step === 1
              ? 'Enter your registered email to receive a password reset code'
              : 'Enter the verification code and your new password'}
          </p>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {demoCode && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Verification Code Generated</span>
            </div>
            <p className="font-mono text-sm tracking-wider font-extrabold text-amber-950">
              {demoCode}
            </p>
            <p className="text-[11px] text-amber-700">
              This code was automatically filled in for you below.
            </p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
            >
              Send Reset Code <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="6-Digit Reset Code"
              type="text"
              icon={KeyRound}
              placeholder="e.g. 123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              icon={Lock}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              icon={Lock}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
            >
              Update Password
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setServerError('');
                setSuccessMsg('');
                setDemoCode('');
              }}
              className="w-full text-center text-xs text-text-muted hover:text-brand-green font-medium pt-1"
            >
              Use a different email address
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-border-subtle text-center text-xs text-text-muted">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-bold text-brand-green hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
