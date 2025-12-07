import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="col-span-1">
                        <h3 className="text-2xl font-bold text-white mb-4">FitFlow</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Your personalized virtual styling platform. Find the perfect fit from anywhere.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/auth/register" className="text-sm hover:text-[#e2c2b7] transition-colors">
                                    Get Started
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/login" className="text-sm hover:text-[#e2c2b7] transition-colors">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link href="/partner/register" className="text-sm hover:text-[#e2c2b7] transition-colors">
                                    Become a Partner
                                </Link>
                            </li>
                            <li>
                                <Link href="/#how-it-works" className="text-sm hover:text-[#e2c2b7] transition-colors">
                                    How It Works
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/help" className="text-sm hover:text-[#e2c2b7] transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-sm hover:text-[#e2c2b7] transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-sm hover:text-[#e2c2b7] transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm hover:text-[#e2c2b7] transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-[#e2c2b7]" />
                                <a href="mailto:support@fitflow.com" className="hover:text-[#e2c2b7] transition-colors">
                                    support@fitflow.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-[#e2c2b7]" />
                                <a href="tel:+1234567890" className="hover:text-[#e2c2b7] transition-colors">
                                    +1 (234) 567-890
                                </a>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-[#e2c2b7] mt-0.5" />
                                <span>123 Fashion Ave, Style City, SC 12345</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Social Media & Copyright */}
                <div className="pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} FitFlow. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#e2c2b7] hover:text-gray-900 transition-all"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#e2c2b7] hover:text-gray-900 transition-all"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#e2c2b7] hover:text-gray-900 transition-all"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
