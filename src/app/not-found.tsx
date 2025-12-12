'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <Link href="/" className="mb-8">
                <Image src="/logo.svg" alt="Fitflow Logo" width={120} height={40} className="h-10 w-auto" />
            </Link>
            <h1 className="text-8xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">Oops! Page Not Found.</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Button asChild size="lg" className="bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900 px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/">Go Back to Homepage</Link>
            </Button>
        </div>
    );
}