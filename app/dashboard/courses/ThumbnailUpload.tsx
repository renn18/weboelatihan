'use client'

import { useState } from 'react'
import { updateThumbnail } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteThumbnail } from './actions'
import Image from 'next/image'

type Props = {
    id: string
    currentThumbnail?: string | null
}

async function resizeImage(file: File): Promise<File> {
    const img = document.createElement('img')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    img.src = URL.createObjectURL(file)
    await new Promise(resolve => (img.onload = resolve))

    const MAX_WIDTH = 1280
    const MAX_HEIGHT = 720

    let { width, height } = img

    const ratio = Math.min(
        MAX_WIDTH / width,
        MAX_HEIGHT / height,
        1
    )

    width = width * ratio
    height = height * ratio

    canvas.width = width
    canvas.height = height

    ctx.drawImage(img, 0, 0, width, height)

    return new Promise(resolve => {
        canvas.toBlob(
            blob => {
                resolve(
                    new File([blob!], file.name, {
                        type: 'image/jpeg',
                    })
                )
            },
            'image/jpeg',
            0.75
        )
    })
}

export default function ThumbnailUpload({ id, currentThumbnail, }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0]
        if (!selected) return

        const resized = await resizeImage(selected)

        setFile(resized)
        setPreview(URL.createObjectURL(resized))
    }

    return (
        <form
            action={async (formData: FormData) => {
                formData.append('id', id)
                if (file) formData.append('file', file)
                await updateThumbnail(formData)

                // reset preview
                setFile(null)
                setPreview(null)
            }}
            className="space-y-3"
        >
            {/* PREVIEW */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                {preview ? (
                    <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                    />
                ) : currentThumbnail ? (
                    <Image
                        src={currentThumbnail}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        Belum ada thumbnail
                    </div>
                )}
            </div>

            {/* INPUT */}
            <Input
                type="file"
                name="file"
                accept="image/*"
                onChange={handleFileChange}
            />

            <Button type="submit" size="sm" disabled={!file || loading}>
                {loading ? 'Uploading...' : 'Upload Thumbnail'}
            </Button>
        </form>
    )
}

export function DeleteThumbnailButton({ id }: { id: string }) {
    return (
        <form
            action={async () => {
                await deleteThumbnail(id)
            }}
        >
            <Button
                type="submit"
                variant="destructive"
                size="sm"
            >
                Hapus Thumbnail
            </Button>
        </form>
    )
}