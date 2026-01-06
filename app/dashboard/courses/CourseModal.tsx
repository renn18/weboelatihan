'use client'

import { useState } from 'react'
import type { Course } from '@/app/generated/prisma'
import { createCourse, updateCourse } from './actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  course?: Course
}

export default function CourseModal({ course }: Props) {
  const isEdit = !!course

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isEdit ? 'outline' : 'default'}>
          {isEdit ? 'Edit' : 'Tambah Kelas'}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Kelas' : 'Tambah Kelas'}
          </DialogTitle>
        </DialogHeader>

        <form
          action={isEdit ? updateCourse : createCourse}
          className="space-y-4"
        >
          {isEdit && (
            <input type="hidden" name="id" value={course.id} />
          )}

          <Input
            name="title"
            defaultValue={course?.title}
            placeholder="Judul kelas"
            required
          />

          <Input
            name="description"
            defaultValue={course?.description ?? ''}
            placeholder="Deskripsi"
            required
          />

          <Input
            name="price"
            type="number"
            defaultValue={course?.price ?? 0}
            placeholder="Harga"
          />

          <Button className="w-full">
            {isEdit ? 'Simpan Perubahan' : 'Simpan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
