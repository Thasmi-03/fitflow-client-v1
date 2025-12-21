'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

// Zod validation schema
const stylerRegisterSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name should only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((phone) => {
      // Remove spaces and special characters for validation
      const cleaned = phone.replace(/[\s\-\(\)]/g, '');

      // Sri Lankan mobile: 0771234567 (10 digits starting with 07)
      const localMobile = /^07[0-9]{8}$/;

      // Sri Lankan landline: 0112345678 (10 digits, area code + number)
      const localLandline = /^0[1-9][0-9]{8}$/;

      // International format: +94771234567 or 94771234567
      const intlMobile = /^(\+?94|94)7[0-9]{8}$/;
      const intlLandline = /^(\+?94|94)[1-9][0-9]{8}$/;

      return localMobile.test(cleaned) ||
        localLandline.test(cleaned) ||
        intlMobile.test(cleaned) ||
        intlLandline.test(cleaned);
    }, 'Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)'),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must not exceed 200 characters')
    // .refine((addr) => /\d/.test(addr),
    //   'Address must include a house/building number')
    .refine((addr) => addr.trim().split(/\s+/).length >= 3,
      'Please provide a complete address (e.g. Galle Road, Colombo)'),
  password: z
    .string()
    .min(5, 'Password must be at least 5 characters')
    // .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  gender: z.enum(['male', 'female'], {
    message: 'Please select a gender',
  }),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 12;
    }, 'You must be at least 12 years old to register'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type StylerRegisterFormValues = z.infer<typeof stylerRegisterSchema>;

const genders = ['male', 'female'] as const;

interface StylerRegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function StylerRegisterForm({ onSuccess, onSwitchToLogin }: StylerRegisterFormProps) {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<StylerRegisterFormValues>({
    resolver: zodResolver(stylerRegisterSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

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

      toast.success('Registration successful! Redirecting to sign-in...', {
        duration: 3000,
      });

      // Redirect to sign-in page after successful registration
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (err: any) {
      console.error('Styler register error:', err);
      const errorMessage = err?.response?.data?.error || err.message || 'Registration failed';
      toast.error(errorMessage, {
        duration: Infinity,
        closeButton: true,
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-foreground">Create Account</h2>
      <p className="text-muted-foreground text-sm mb-6">Sign up as a styler</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            {...register('fullName')}
            id="fullName"
            className="mt-1"
          />
          {errors.fullName && (
            <p className="text-destructive text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            placeholder="you@example.com"
            className="mt-1"
          />
          {errors.email && (
            <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            {...register('phone')}
            id="phone"
            placeholder="+1234567890"
            className="mt-1"
          />
          {errors.phone && (
            <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            {...register('address')}
            id="address"
            placeholder="123 Main St, City, Country"
            className="mt-1"
          />
          {errors.address && (
            <p className="text-destructive text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1">
            <Input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select onValueChange={(value) => setValue('gender', value as 'male' | 'female', { shouldValidate: true })}>
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
          {errors.gender && (
            <p className="text-destructive text-sm mt-1">{errors.gender.message}</p>
          )}
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
          {errors.dateOfBirth && (
            <p className="text-destructive text-sm mt-1">{errors.dateOfBirth.message}</p>
          )}
          {!errors.dateOfBirth && age !== null && (
            <p className="text-sm text-muted-foreground mt-1">
              Age: <span className="font-semibold">{age} years old</span>
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </form>

      {onSwitchToLogin && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
          >
            Login
          </button>
        </p>
      )}
    </div>
  );
}
