'use client';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Link href="/" className="mb-8">
        <img src="/logo.png" alt="FitFlow Logo" className="h-16 w-auto" />
      </Link>
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg border border-border">
        <LoginForm />
      </div>
    </div>
  );
}