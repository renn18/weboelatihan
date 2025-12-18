'use client'

import { useState } from 'react'
import { updateThumbnail } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ThumbnailUpload({ id }: { id: string }) {
    const [file, setFile] = useState<File | null>(null)

    return (
        <form
            action={async (formData: FormData) => {
                formData.append('id', id)

                if (file) {
                    formData.append('file', file)
                }

                await updateThumbnail(formData)
            }}
            className="space-y-2"
        >
            <Input
                type="file"
                name="file"          // ⬅️ WAJIB
                accept="image/*"
                onChange={e => setFile(e.target.files?.[0] || null)}
            />

            <Button type="submit" size="sm">
                Upload Thumbnail
            </Button>
        </form>
    )
}
