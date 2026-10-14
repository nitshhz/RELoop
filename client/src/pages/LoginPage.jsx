import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Logo } from '../components/ui/Logo.jsx';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const from = location.state?.from?.pathname || '/';

  async function onSubmit(data) {
    setServerError('');
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check your credentials.');
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
            Welcome back to ReLoop
          </h1>
          <p className="text-xs text-text-muted">
            Sign in to access your listings, offers, and conversations
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
          <p className="font-bold text-brand-green">Demo Quick Credentials:</p>
          <div className="text-[11px] text-text-muted space-y-0.5">
            <p>• Admin: <code className="text-text-primary font-bold">admin@reloop.dev</code> / <code className="text-text-primary font-bold">Admin@ReLoop2026!</code></p>
            <p>• Seller: <code className="text-text-primary font-bold">seller@reloop.dev</code> / <code className="text-text-primary font-bold">Password123!</code></p>
            <p>• Buyer: <code className="text-text-primary font-bold">buyer1@reloop.dev</code> / <code className="text-text-primary font-bold">Password123!</code></p>
          </div>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="name@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Sign In <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="pt-4 border-t border-border-subtle text-center text-xs text-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-green hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
