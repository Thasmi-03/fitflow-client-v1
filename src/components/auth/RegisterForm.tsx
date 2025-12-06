'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { Role } from '@/types/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'styler', 'partner']),
  // Styler-specific fields
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  isPartnerPage?: boolean;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ isPartnerPage = false, onSuccess, onSwitchToLogin }: RegisterFormProps = {}) {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      gender: undefined,
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    setValue('role', isPartnerPage ? 'partner' : 'styler');
  }, [setValue, isPartnerPage]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const registerData = {
        email: data.email,
        password: data.password,
        role: data.role as Role,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        ...(data.role === 'styler' && data.gender ? { gender: data.gender } : {}),
        ...(data.role === 'styler' && data.dateOfBirth ? { dateOfBirth: data.dateOfBirth } : {}),
      };

      const response = await authService.register(registerData);

      toast.success('Registration successful!');

      if (response.token && response.user) {
        await login(response.token, response.user);
      } else if (data.role === 'partner') {
        // Partners might not get a token immediately if approval is needed
        if (onSuccess) onSuccess();
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err?.response?.data?.error || err.message || 'Registration failed';
      toast.error(errorMessage, {
        duration: Infinity,
        closeButton: true,
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Create Account</h2>
      <p className="text-gray-600 text-sm mb-6">Sign up as a partner</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            {...register('fullName')}
            id="fullName"
            disabled={loading}
            className="mt-1"
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
        </div>

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
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            {...register('phone')}
            id="phone"
            placeholder="+1234567890"
            disabled={loading}
            className="mt-1"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            {...register('address')}
            id="address"
            placeholder="123 Main St, City, Country"
            disabled={loading}
            className="mt-1"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            {...register('password')}
            id="password"
            type={showPassword ? 'text' : 'password'}
            disabled={loading}
            className="mt-1"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {!isPartnerPage && (
          <>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                {...register('gender')}
                id="gender"
                disabled={loading}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                {...register('dateOfBirth')}
                id="dateOfBirth"
                type="date"
                disabled={loading}
                className="mt-1"
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
            </div>
          </>
        )}

        <input {...register('role')} type="hidden" value="partner" />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </form>

      {onSwitchToLogin && (
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </button>
        </p>
      )}
    </div>
  );
}
