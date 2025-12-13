"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FaGoogle } from 'react-icons/fa'; // Anda mungkin perlu menginstal react-icons

export default function LoginPage() {
    // Ambil parameter URL, berguna untuk redirect setelah login
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || "/dashboard";

    // Fungsi untuk menangani login menggunakan provider (contoh: Google)
    const handleGoogleSignIn = () => {
        // 1. Panggil fungsi signIn dari next-auth
        // 2. Tentukan nama provider ('google')
        // 3. Sertakan callbackUrl agar pengguna diarahkan kembali ke halaman sebelumnya (atau /dashboard)
        signIn('google', { callbackUrl });
    };

    // (Opsional) Fungsi untuk Credentials Login (Email/Password) - Jika Anda mengaktifkannya
    const handleCredentialsSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        // signIn('credentials', { email: '...', password: '...', callbackUrl });
        alert("Fitur login Email/Password belum diimplementasikan.");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Masuk ke Pelatihan
                </h1>

                {/* Tombol Login Google */}
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150 mb-4"
                >
                    <FaGoogle className="mr-3 h-5 w-5 text-red-500" />
                    Masuk dengan Google
                </button>

                <div className="relative flex py-5 items-center">
                    <div className="grow border-t border-gray-400"></div>
                    <span className="shrink mx-4 text-gray-500 text-sm">ATAU</span>
                    <div className="grow border-t border-gray-400"></div>
                </div>

                {/* Form Login Email/Password (Skelet) */}
                <form onSubmit={handleCredentialsSignIn} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="nama@contoh.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    );
}