'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import nodemailer from 'nodemailer'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

// ✅ Setup email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

/**
 * Send contact form email
 */
export async function sendContactEmail(formData: ContactFormData) {
  try {
    // ✅ 1. Validate input
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      throw new Error('Semua bidang wajib diisi')
    }

    // ✅ 2. Verify email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      throw new Error('Email tidak valid')
    }

    // ✅ 3. Get current user (optional)
    const { userId: clerkUserId } = await auth()

    // ✅ 4. Save to database (for records)
    const contact = await prisma.contact.create({
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        userId: clerkUserId || null,
        status: 'pending',
      },
    })

    // ✅ 5. Send email to support
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.SUPPORT_EMAIL,
      subject: `[EduFlow Contact] ${formData.subject}`,
      html: `
        <h2>Pesan Kontak Baru</h2>
        <p><strong>Nama:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        ${formData.phone ? `<p><strong>Telepon:</strong> ${formData.phone}</p>` : ''}
        <p><strong>Subjek:</strong> ${formData.subject}</p>
        <p><strong>Pesan:</strong></p>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
        <hr />
        <p><small>ID Kontak: ${contact.id}</small></p>
      `,
    })

    // ✅ 6. Send confirmation email to user
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: formData.email,
      subject: 'Terima kasih telah menghubungi EduFlow',
      html: `
        <h2>Terima Kasih!</h2>
        <p>Halo ${formData.name},</p>
        <p>Kami telah menerima pesan Anda. Tim support kami akan merespons dalam 24 jam kerja.</p>
        <p><strong>Nomor Referensi:</strong> ${contact.id}</p>
        <p>Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi kami di support@eduflow.id</p>
        <p>Salam,<br/>Tim EduFlow</p>
      `,
    })

    console.log(`✅ Contact message saved: ${contact.id}`)

    return {
      success: true,
      message: 'Pesan Anda telah terkirim',
      contactId: contact.id,
    }
  } catch (error: any) {
    console.error('❌ Contact form error:', error.message)
    return {
      success: false,
      error: error.message || 'Gagal mengirim pesan. Silakan coba lagi.',
    }
  }
}

/**
 * Get contact messages (admin)
 */
export async function getContactMessages(limit: number = 20) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { role: true },
    })

    if (user?.role !== 'admin') {
      throw new Error('Anda tidak memiliki akses')
    }

    const messages = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return { success: true, messages }
  } catch (error: any) {
    console.error('Error fetching messages:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Update contact status
 */
export async function updateContactStatus(contactId: string, status: 'pending' | 'resolved') {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { role: true },
    })

    if (user?.role !== 'admin') {
      throw new Error('Anda tidak memiliki akses')
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: { status },
    })

    return { success: true, contact }
  } catch (error: any) {
    console.error('Error updating contact:', error.message)
    return { success: false, error: error.message }
  }
}
