import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Logo } from '../components/ui/Logo.jsx';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function RegisterPage() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data) {
    setServerError('');
    try {
      await registerAuth(data.name, data.email, data.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Registration failed.');
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
            Join ReLoop Marketplace
          </h1>
          <p className="text-xs text-text-muted">
            Create a free account to buy, sell, and negotiate secondhand goods
          </p>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            icon={User}
            placeholder="e.g. Maya Sen"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="maya@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Minimum 8 characters"
            helperText="At least 8 characters"
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
            Create Free Account <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <p className="text-[11px] text-text-muted text-center leading-relaxed">
          By signing up, you agree to ReLoop's{' '}
          <Link to="/terms" className="underline hover:text-text-primary">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-text-primary">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="pt-4 border-t border-border-subtle text-center text-xs text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-green hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
