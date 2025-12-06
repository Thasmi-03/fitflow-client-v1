'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const { login, loading } = useAuth();
  const { register, handleSubmit } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await authService.login({ email: data.email, password: data.password });
      await login(response.token, response.user);

      toast.success('Login successful!');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Login failed';
      toast.error(errorMessage, {
        duration: Infinity,
        closeButton: true,
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Login</h2>
      <p className="text-gray-600 text-sm mb-6">Enter your credentials to access your account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            placeholder="you@example.com"
            disabled={loading}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            {...register('password')}
            id="password"
            type="password"
            disabled={loading}
            className="mt-1"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      {onSwitchToSignup && (
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      )}
    </div>
  );
}
