'use client';

import { RegisterForm } from "@/components/auth/RegisterForm"
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function PartnerRegisterPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/login');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <Link href="/" className="mb-8">
                <img src="/logo.png" alt="FitFlow Logo" className="h-16 w-auto" />
            </Link>
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <RegisterForm isPartnerPage={true} onSuccess={handleSuccess} />
            </div>
        </div>
    )
}
