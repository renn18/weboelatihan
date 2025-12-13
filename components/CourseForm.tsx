"use client";

import React, { useState } from 'react';

// Interface untuk state form
interface FormData {
    title: string;
    description: string;
    price: number | ''; // Gunakan string kosong untuk input kosong
}

export default function CourseForm() {
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        price: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // 1. Fungsi untuk menangani perubahan input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            // Konversi harga ke number atau string kosong
            [name]: name === 'price' ? (value === '' ? '' : parseInt(value, 10)) : value,
        }));
    };

    // 2. Fungsi untuk menangani submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validasi Sederhana
        if (!formData.title || formData.price === '') {
            setMessage({ type: 'error', text: 'Judul dan Harga harus diisi.' });
            setLoading(false);
            return;
        }

        try {
            // 3. Panggil Route Handler POST /api/courses
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    price: formData.price,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: `Kursus "${result.title}" berhasil dibuat!` });
                // Reset form setelah sukses
                setFormData({ title: '', description: '', price: '' });
            } else {
                setMessage({ type: 'error', text: result.message || 'Gagal membuat kursus. Silakan coba lagi.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan atau server.' });
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-6 bg-teal-600 shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Buat Kursus Baru</h2>

            {/* Pesan Status */}
            {message && (
                <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Input Judul */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Kursus</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>

            {/* Input Deskripsi */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>

            {/* Input Harga */}
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>

            {/* Tombol Submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Sedang Menyimpan...' : 'Buat Kursus'}
            </button>
        </form>
    );
}