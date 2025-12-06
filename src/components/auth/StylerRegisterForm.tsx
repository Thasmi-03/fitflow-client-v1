'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface StylerRegisterFormValues {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  gender: string;
  dateOfBirth: string;
}

const genders = ['male', 'female', 'unisex'] as const;

interface StylerRegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function StylerRegisterForm({ onSuccess, onSwitchToLogin }: StylerRegisterFormProps) {
  const { login, loading } = useAuth();
  const { register, handleSubmit, watch, setValue } = useForm<StylerRegisterFormValues>();
  const [error, setError] = useState('');

  const dateOfBirth = watch('dateOfBirth');

  // Calculate age from date of birth
  const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(dateOfBirth);

  const onSubmit = async (data: StylerRegisterFormValues) => {
    setError('');
    try {
      const response = await authService.register({
        email: data.email,
        password: data.password,
        role: 'styler',
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        age: age || undefined
      });

      if (response.token && response.user) {
        await login(response.token, response.user);
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 100);
    } catch (err: any) {
      console.error('Styler register error:', err);
      setError(err?.response?.data?.error || err.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Create Account</h2>
      <p className="text-gray-600 text-sm mb-6">Sign up as a styler</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            {...register('fullName')}
            id="fullName"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            {...register('phone')}
            id="phone"
            placeholder="+1234567890"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            {...register('address')}
            id="address"
            placeholder="123 Main St, City, Country"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            {...register('password')}
            id="password"
            type="password"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select onValueChange={(value) => setValue('gender', value)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            {...register('dateOfBirth')}
            id="dateOfBirth"
            type="date"
            className="mt-1"
            max={new Date().toISOString().split('T')[0]}
          />
          {age !== null && (
            <p className="text-sm text-gray-600 mt-1">
              Age: <span className="font-semibold">{age} years old</span>
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

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
