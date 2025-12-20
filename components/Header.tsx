'use client';

import { BookOpen, Menu, X } from 'lucide-react'
import React, { ButtonHTMLAttributes, ReactNode, useEffect, useState } from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { ThemeToggle } from "@/components/theme-toggle"
import Link from 'next/link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
        secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
        ghost: "text-gray-600 hover:bg-gray-100"
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [scrolled, setScrolled] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <BookOpen className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-bold tracking-tight">EduFlow</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">Beranda</Link>
                        <Link href="#" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">Kursus</Link>
                        <Link href="#" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">Mentor</Link>
                        <Link href="#" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">Tentang Kami</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle />
                        <SignedOut>
                            <SignInButton />
                            <SignUpButton>
                                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                                    Sign Up
                                </button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>

                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Menu Mobile */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 absolute w-full animate-in fade-in slide-in-from-top-4">
                    <div className="flex flex-col gap-4">
                        <Link href="#" className="text-lg font-medium">Beranda</Link>
                        <Link href="#" className="text-lg font-medium">Kursus</Link>
                        <Link href="#" className="text-lg font-medium">Mentor</Link>
                        <Button className="w-full">Daftar Sekarang</Button>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Header