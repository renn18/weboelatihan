import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCertificatePDF } from '@/lib/certificate'

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { id: certificateId } = await params

    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: true,
        course: {
          include: {
            user: true,
          },
        },
        enrollment: {
          include: {
            progress: true,
          },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Check if certificate is still valid
    if (certificate.status !== 'active') {
      return NextResponse.json(
        { error: `Certificate is ${certificate.status}` },
        { status: 400 }
      )
    }

    if (certificate.expiresAt && certificate.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Certificate has expired' },
        { status: 400 }
      )
    }

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF({
      studentName: certificate.user.name || 'Student',
      studentId: certificate.userId,
      courseName: certificate.course.title,
      instructorName: certificate.course.user?.name || 'Instructor',
      certificateNumber: certificate.certificateNumber,
      issuedDate: certificate.issuedAt,
      completionDate: new Date(),
      expiresAt: certificate.expiresAt,
      verificationHash: certificate.verificationHash,
    })

    // Return PDF file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate_${certificate.certificateNumber.substring(0, 8)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('❌ Download certificate error:', error)
    return NextResponse.json(
      { error: 'Failed to generate certificate PDF' },
      { status: 500 }
    )
  }
}
