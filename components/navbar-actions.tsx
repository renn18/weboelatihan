"use client"

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { ThemeToggle } from "@/components/theme-toggle"

export function NavbarActions() {
    return (
        <div className='flex justify-end items-center space-x-4 p-4'>
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

    )
}
