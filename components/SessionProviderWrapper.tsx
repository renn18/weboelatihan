"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function SessionProviderWrapper({ children }: Props) {
    // NextAuth/Auth.js memerlukan SessionProvider untuk membuat konteks di Client
    return <SessionProvider>{children}</SessionProvider>;
}