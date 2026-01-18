'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ThumbnailUploaderProps {
    onUpload: (url: string) => void
    initialUrl?: string
}

export default function ThumbnailUploader({ onUpload, initialUrl }: ThumbnailUploaderProps) {
    const [preview, setPreview] = useState(initialUrl || '')
    const [uploading, setUploading] = useState(false)
    const router = useRouter()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('thumbnail', file)

        try {
            const res = await fetch('/api/thumbnail-upload', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            if (data.success) {
                setPreview(data.url)
                onUpload(data.url)
            } else {
                alert(data.error)
            }
        } catch (error) {
            alert('Upload gagal')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
                Thumbnail Course
            </label>
            <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {preview && (
                <div className="relative">
                    <Image
                        width={192}
                        height={128}
                        src={preview}
                        alt="Preview"
                        className="w-48 h-32 object-cover rounded-lg"
                    />
                    <button
                        onClick={() => {
                            setPreview('')
                            onUpload('')
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs"
                    >
                        ×
                    </button>
                </div>
            )}
            {uploading && <p className="text-sm text-indigo-600">Uploading...</p>}
        </div>
    )
}
