import puppeteer from 'puppeteer'

export interface CertificateData {
  studentName: string
  studentId: string
  courseName: string
  instructorName: string
  certificateNumber: string
  issuedDate: Date
  completionDate: Date
  expiresAt?: Date | null
  verificationHash: string
}

export async function generateCertificatePDF(
  data: CertificateData
): Promise<Buffer> {
  let browser = null
  let page = null

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    })

    // ✅ GUNAKAN newPage() bukan createPage()
    page = await browser.newPage()

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificate</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              width: 100%;
              height: 100%;
            }
            
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              background: #f8f4f0;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
              margin: 0;
            }
            
            .certificate {
              width: 100%;
              aspect-ratio: 1.414 / 1;
              background: #f8f4f0;
              border: 8px solid #D4AF37;
              padding: 60px;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            
            .certificate::before {
              content: '';
              position: absolute;
              top: 15px;
              left: 15px;
              right: 15px;
              bottom: 15px;
              border: 2px solid #8B7500;
              pointer-events: none;
            }
            
            .content {
              position: relative;
              z-index: 1;
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 100%;
            }
            
            .header {
              padding-top: 20px;
            }
            
            .title {
              font-size: 56px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 20px;
              letter-spacing: 2px;
            }
            
            .divider {
              width: 300px;
              height: 3px;
              background: #D4AF37;
              margin: 0 auto 30px;
            }
            
            .subtitle {
              font-size: 16px;
              color: #333;
              margin-bottom: 20px;
            }
            
            .name {
              font-size: 42px;
              font-weight: bold;
              color: #8B4513;
              margin: 30px 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .course-text {
              font-size: 14px;
              color: #333;
              margin: 20px 0 15px 0;
            }
            
            .course-name {
              font-size: 22px;
              font-weight: bold;
              color: #8B4513;
              margin-bottom: 40px;
            }
            
            .details {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin: 40px 0 20px 0;
              padding: 0 40px;
            }
            
            .detail-item {
              text-align: center;
              flex: 1;
            }
            
            .detail-label {
              font-size: 11px;
              font-weight: bold;
              color: #333;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .signature-line {
              border-top: 2px solid #333;
              height: 40px;
              width: 150px;
              margin: 0 auto;
              position: relative;
              top: -15px;
            }
            
            .detail-value {
              font-size: 11px;
              color: #555;
              margin-top: -10px;
            }
            
            .footer {
              font-size: 9px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            
            .cert-number {
              margin-bottom: 8px;
              word-break: break-all;
            }
            
            .verify-text {
              color: #0066cc;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="content">
              <div class="header">
                <div class="title">Certificate of Completion</div>
                <div class="divider"></div>
                <div class="subtitle">This is to certify that</div>
                <div class="name">${data.studentName}</div>
                <div class="course-text">has successfully completed the course</div>
                <div class="course-name">${data.courseName}</div>
              </div>
              
              <div class="details">
                <div class="detail-item">
                  <div class="detail-label">Issued Date</div>
                  <div class="signature-line"></div>
                  <div class="detail-value">
                    ${data.issuedDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Instructor</div>
                  <div class="signature-line"></div>
                  <div class="detail-value">${data.instructorName}</div>
                </div>
              </div>
              
              <div class="footer">
                <div class="cert-number"><strong>Certificate #:</strong> ${data.certificateNumber}</div>
                <div class="cert-number"><strong>Verification:</strong> ${data.verificationHash.substring(0, 32)}...</div>
                ${
                  data.expiresAt
                    ? `<div class="cert-number"><strong>Expires:</strong> ${data.expiresAt.toLocaleDateString('en-US')}</div>`
                    : ''
                }
                <div class="verify-text">Verify at: yoursite.com/verify-certificate</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // ✅ setContent dengan waitUntil
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })

    // ✅ Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      printBackground: true,
    })

    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('❌ PDF Generation Error:', error)
    throw error
  } finally {
    // ✅ Cleanup
    if (page) {
      await page.close()
    }
    if (browser) {
      await browser.close()
    }
  }
}
