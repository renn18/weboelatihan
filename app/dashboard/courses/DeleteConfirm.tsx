'use client'

import Swal from 'sweetalert2'
import { deleteCourse } from './actions'

export default function DeleteConfirm({ id }: { id: string }) {
    const handleDelete = async () => {
        const res = await Swal.fire({
            title: 'Hapus kelas?',
            text: 'Data tidak bisa dikembalikan',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        })

        if (res.isConfirmed) {
            await deleteCourse(id)
            Swal.fire('Berhasil', 'Kelas dihapus', 'success')
        }
    }

    return (
        <button onClick={handleDelete} className="text-red-600">
            Hapus
        </button>
    )
}
