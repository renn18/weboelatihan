'use client'

import { createCourse } from './actions'

export default function CourseForm() {
    return (
        <form action={createCourse} className="space-y-4 max-w-md">
            <input
                name="title"
                placeholder="Judul kelas"
                required
                className="w-full border rounded p-2"
            />

            <textarea
                name="description"
                placeholder="Deskripsi"
                required
                className="w-full border rounded p-2"
            />

            <input
                name="price"
                type="number"
                placeholder="Harga"
                className="w-full border rounded p-2"
            />

            <button className="bg-black text-white px-4 py-2 rounded">
                Tambah Kelas
            </button>
        </form>
    )
}
