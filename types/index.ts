export interface UserProfile {
  id: string
  clerkId: string
  name: string | null
  email: string | null
  image: string | null
  role: 'user' | 'instructor' | 'admin'
}

// ==================== COURSE TYPES ====================

export interface CourseData {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  duration: number | null
  isPublished: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface SectionData {
  id: string
  title: string
  description: string | null
  order: number
  courseId: string
  lessons: LessonData[]
}

export interface LessonData {
  id: string
  title: string
  description: string | null
  content: string | null
  videoUrl: string | null
  duration: number | null
  order: number
  isFree: boolean
  sectionId: string
}

export interface CourseWithSections extends CourseData {
  sections: SectionData[]
  instructor: UserProfile
}

// ==================== ENROLLMENT TYPES ====================

export interface EnrollmentData {
  id: string
  userId: string
  courseId: string
  status: 'active' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface EnrollmentWithDetails extends EnrollmentData {
  user: UserProfile
  course: CourseData
  payment: PaymentData | null
  certificate: CertificateData | null
  progress: ProgressData[]
}

// ==================== PAYMENT TYPES ====================

export interface PaymentData {
  id: string
  enrollmentId: string
  userId: string
  courseId: string
  amount: number
  currency: string
  paymentMethod: string | null
  midtransOrderId: string | null
  transactionToken: string | null
  redirectUrl: string | null
  status: 'pending' | 'settlement' | 'capture' | 'denied' | 'cancel' | 'expire'
  createdAt: Date
  updatedAt: Date
  settledAt: Date | null
}

// Midtrans Types
export interface MidtransItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface MidtransCustomerDetails {
  first_name: string
  email: string
  phone?: string
}

export interface MidtransTransactionData {
  transaction_details: {
    order_id: string
    gross_amount: number
  }
  customer_details: MidtransCustomerDetails
  item_details: MidtransItem[]
  callbacks?: {
    finish: string
    error?: string
    pending?: string
  }
}

export interface MidtransResponse {
  status_code: string
  status_message: string
  transaction_id: string
  order_id: string
  merchant_id: string
  gross_amount: string
  payment_type: string
  transaction_time: string
  transaction_status: string
  fraud_status: string
  transaction_token?: string
  redirect_url?: string
}

export interface MidtransNotification {
  transaction_time: string
  transaction_status: string
  transaction_id: string
  status_message: string
  status_code: string
  signature_key: string
  server_key?: string
  order_id: string
  merchant_id: string
  gross_amount: string
  currency: string
  payment_type: string
  fraud_status?: string
}

// ==================== CERTIFICATE TYPES ====================

export interface CertificateData {
  id: string
  enrollmentId: string
  userId: string
  courseId: string
  certificateNumber: string
  issuedAt: Date
  expiresAt: Date | null
  verificationHash: string
  isVerified: boolean
  status: 'active' | 'revoked' | 'expired'
}

export interface CertificateWithDetails extends CertificateData {
  user: UserProfile
  course: CourseData
}

// Certificate generation request
export interface CertificateRequest {
  userId: string
  enrollmentId: string
  courseId: string
}

// ==================== PROGRESS TYPES ====================

export interface ProgressData {
  id: string
  userId: string
  enrollmentId: string
  lessonId: string
  isCompleted: boolean
  completedAt: Date | null
  timeSpent: number
  createdAt: Date
  updatedAt: Date
}

// ==================== ENROLLMENT REQUEST TYPES ====================

export interface CreateEnrollmentRequest {
  userId: string
  courseId: string
}

export interface EnrollmentResponse {
  success: boolean
  message: string
  data?: {
    enrollment: EnrollmentData
    payment: PaymentData
  }
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// ==================== ERROR TYPES ====================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}