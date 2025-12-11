'use client';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Link href="/" className="mb-8">
        <Image src="/logo.svg" alt="logo" width={120} height={40} className="h-10 w-auto" priority />
      </Link>
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg border border-border">
        <LoginForm />
      </div>
    </div>
  );
}