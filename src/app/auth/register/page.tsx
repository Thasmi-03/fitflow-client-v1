'use client';
import { StylerRegisterForm } from '@/components/auth/StylerRegisterForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();

  const handleSwitchToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="FitFlow Logo" width={200} height={60} className="h-16 w-auto" priority />
      </Link>
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg border border-border">
        <StylerRegisterForm onSwitchToLogin={handleSwitchToLogin} />
      </div>
    </div>
  );
}
