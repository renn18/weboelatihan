export interface Enrollment {
  id: string
  userId: string
  courseId: string
  status?: string  // ✅ ADD jika ada di DB
  createdAt: Date
  updatedAt: Date
}

export interface Lesson {
  id: string
  sectionId: string
  title: string
  description?: string | null  // ✅ UBAH ke nullable
  videoUrl?: string | null
  duration?: number | null
  difficulty?: string | null
  objectives?: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Section {
  id: string
  courseId: string
  title: string
  description?: string | null  // ✅ UBAH ke nullable
  order: number
  lessons: Lesson[]
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id: string
  userId: string
  title: string
  slug: string
  description: string
  price: number
  isPublished: boolean
  thumbnail?: string | null  // ✅ UBAH ke nullable
  category?: string | null    // ✅ UBAH to nullable
  enrollments: Enrollment[]
  sections: Section[]
  createdAt: Date
  updatedAt: Date
}
