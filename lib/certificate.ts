
import crypto from 'crypto'
import { prisma } from './prisma'

// Generate unique certificate number
export function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CERT-${timestamp}-${random}`
}

// Generate verification hash
export function generateVerificationHash(
  certificateNumber: string,
  userId: string,
  courseId: string
): string {
  const data = `${certificateNumber}${userId}${courseId}${process.env.CERTIFICATE_SECRET_KEY || 'default-secret'}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

// Create certificate after course completion
export async function createCertificate(
  userId: string,
  enrollmentId: string,
  courseId: string
) {
  try {
    // Generate certificate details
    const certificateNumber = generateCertificateNumber()
    const verificationHash = generateVerificationHash(certificateNumber, userId, courseId)

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        enrollmentId,
      },
    })

    if (existingCertificate) {
      return existingCertificate
    }

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        enrollmentId,
        userId,
        courseId,
        certificateNumber,
        verificationHash,
        issuedAt: new Date(),
        status: 'active',
      },
      include: {
        user: true,
        course: true,
      },
    })

    return certificate
  } catch (error) {
    console.error('Certificate creation error:', error)
    throw new Error('Failed to create certificate')
  }
}

// Verify certificate
export async function verifyCertificate(certificateNumber: string) {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: {
        certificateNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!certificate) {
      return {
        valid: false,
        message: 'Certificate not found',
      }
    }

    // Verify hash
    const expectedHash = generateVerificationHash(certificateNumber, certificate.userId, certificate.courseId)
    const hashValid = expectedHash === certificate.verificationHash

    // Check status
    const isActive = certificate.status === 'active'
    const isNotExpired = !certificate.expiresAt || new Date() < certificate.expiresAt

    const isValid = hashValid && isActive && isNotExpired

    return {
      valid: isValid,
      message: isValid ? 'Certificate is valid' : 'Certificate is invalid or expired',
      certificate: isValid
        ? {
            certificateNumber: certificate.certificateNumber,
            studentName: certificate.user.name,
            studentEmail: certificate.user.email,
            courseName: certificate.course.title,
            issuedAt: certificate.issuedAt,
            expiresAt: certificate.expiresAt,
          }
        : null,
    }
  } catch (error) {
    console.error('Certificate verification error:', error)
    return {
      valid: false,
      message: 'Error verifying certificate',
    }
  }
}

// Generate HTML for certificate
export function generateCertificateHTML(
  studentName: string,
  courseName: string,
  certificateNumber: string,
  issuedDate: Date,
  instituteLogoUrl?: string
): string {
  const formattedDate = issuedDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sertifikat - ${studentName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Georgia', serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .certificate {
          width: 100%;
          max-width: 1000px;
          aspect-ratio: 1.414;
          background: white;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 3px solid #d4af37;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px 80px;
          page-break-after: avoid;
        }
        
        .certificate::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 2px solid #d4af37;
          pointer-events: none;
        }
        
        .content {
          position: relative;
          z-index: 1;
          text-align: center;
        }
        
        .header {
          margin-bottom: 30px;
        }
        
        .logo {
          height: 60px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo img {
          max-height: 60px;
          max-width: 200px;
        }
        
        .institute-name {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }
        
        .certificate-title {
          font-size: 36px;
          font-weight: bold;
          color: #d4af37;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 30px;
          font-style: italic;
        }
        
        .body {
          margin: 40px 0;
        }
        
        .intro-text {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        
        .awarded-text {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
        }
        
        .recipient-name {
          font-size: 32px;
          font-weight: bold;
          color: #000;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
          margin-bottom: 30px;
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .achievement-text {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
          line-height: 1.8;
        }
        
        .course-name {
          font-size: 22px;
          font-weight: bold;
          color: #d4af37;
          margin: 20px 0;
        }
        
        .footer {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 40px;
          margin-top: 50px;
          text-align: center;
        }
        
        .signature-block {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .signature-line {
          width: 150px;
          height: 1px;
          background: #333;
          margin-bottom: 10px;
        }
        
        .signature-name {
          font-size: 14px;
          color: #333;
          font-weight: bold;
        }
        
        .signature-title {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        
        .date-and-seal {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .issue-date {
          font-size: 14px;
          color: #333;
          margin-bottom: 20px;
        }
        
        .seal {
          width: 80px;
          height: 80px;
          border: 2px solid #d4af37;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d4af37;
          font-size: 12px;
          font-weight: bold;
          text-align: center;
          padding: 10px;
        }
        
        .certificate-code {
          position: absolute;
          bottom: 20px;
          right: 30px;
          font-size: 12px;
          color: #999;
          text-align: right;
        }
        
        .certificate-code-text {
          display: block;
          margin-bottom: 5px;
        }
        
        .certificate-number {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #333;
        }
        
        @media print {
          body {
            background: white;
          }
          .certificate {
            box-shadow: none;
            page-break-after: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="content">
          <div class="header">
            ${instituteLogoUrl ? `<div class="logo"><img src="${instituteLogoUrl}" alt="Institute Logo"></div>` : ''}
            <div class="institute-name">Web Pelatihan</div>
          </div>
          
          <div class="certificate-title">Sertifikat Penyelesaian</div>
          
          <div class="body">
            <p class="intro-text">Dengan ini diberikan kepada</p>
            
            <div class="recipient-name">${studentName}</div>
            
            <p class="achievement-text">Telah berhasil menyelesaikan kursus</p>
            
            <div class="course-name">${courseName}</div>
            
            <p class="achievement-text">dengan dedikasi dan komitmen penuh terhadap pembelajaran.</p>
          </div>
          
          <div class="footer">
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-name">Instruktur</div>
              <div class="signature-title">Course Instructor</div>
            </div>
            
            <div class="date-and-seal">
              <div class="issue-date">Dikeluarkan pada<br>${formattedDate}</div>
              <div class="seal">VERIFIED</div>
            </div>
            
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-name">Admin</div>
              <div class="signature-title">Platform Administrator</div>
            </div>
          </div>
        </div>
        
        <div class="certificate-code">
          <span class="certificate-code-text">Certificate No:</span>
          <div class="certificate-number">${certificateNumber}</div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate PDF (requires external library like puppeteer)
export async function generateCertificatePDF(
  studentName: string,
  courseName: string,
  certificateNumber: string,
  issuedDate: Date
): Promise<Buffer> {
  // This requires puppeteer or similar - implementation shown below
  // For now, return HTML and let frontend handle PDF generation

  const html = generateCertificateHTML(studentName, courseName, certificateNumber, issuedDate)

  // If you want server-side PDF generation, uncomment and use:
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.setContent(html);
  // const pdf = await page.pdf({ format: 'A4', landscape: true });
  // await browser.close();
  // return pdf;

  return Buffer.from(html)
}

// Check if user can get certificate (completed all lessons)
export async function checkCompletionStatus(
  userId: string,
  enrollmentId: string,
  courseId: string
): Promise<boolean> {
  try {
    // Get all lessons in course
    const sections = await prisma.section.findMany({
      where: { courseId },
      include: {
        lessons: true,
      },
    })

    const totalLessons = sections.reduce((sum, section) => sum + section.lessons.length, 0)

    if (totalLessons === 0) {
      return false // No lessons in course
    }

    // Get completed lessons for user
    const completedProgress = await prisma.progress.findMany({
      where: {
        userId,
        enrollmentId,
        isCompleted: true,
      },
    })

    // Check if all lessons completed
    return completedProgress.length === totalLessons
  } catch (error) {
    console.error('Completion check error:', error)
    return false
  }
}