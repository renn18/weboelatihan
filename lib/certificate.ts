import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { join } from 'path';
import os from 'os';

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
export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  let page: Awaited<ReturnType<Awaited<ReturnType<typeof puppeteer.launch>>['newPage']>> | null = null;

  try {
    const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions',
      ],
    };

    // ✅ LOCAL WINDOWS: Pakai Chrome dari puppeteer browsers
    if (process.platform === 'win32' && process.env.NODE_ENV !== 'production') {
      // Path default dari npx puppeteer browsers install chrome
      const puppeteerPath = join(os.homedir(), '.cache', 'puppeteer', 'chrome');
      launchOptions.executablePath = 'C:\\Users\\ASUS\\.cache\\puppeteer\\chrome\\win64-143.0.7499.169\\chrome-win64\\chrome.exe'.replace('*', '143');  // Ganti versi dari output npx
    } 
    // ✅ VERCEL/PRODUCTION: @sparticuz/chromium
    else if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      launchOptions.executablePath = await chromium.executablePath();
      launchOptions.args = chromium.args;
      launchOptions.defaultViewport = chromium.defaultViewport;
    }

    browser = await puppeteer.launch(launchOptions);
    page = await browser!.newPage();

    // HTML template + rest code sama...
    const html = `...`;
    await page.setContent(html, { waitUntil: ['load', 'domcontentloaded', 'networkidle0'] });

    // ✅ DEBUG: Cek apakah HTML render
const pageContent = await page.content();
console.log('📄 PAGE HTML LENGTH:', pageContent.length);
console.log('📄 PAGE TITLE:', await page.title());

// ✅ DEBUG: Screenshot sebelum PDF
await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
console.log('📸 Screenshot saved: debug-screenshot.png');

// ✅ Emulate screen media (penting untuk CSS!)
await page.emulateMediaType('screen');
    
    const pdfBuffer = await page.pdf({
      format: 'A4', landscape: true, printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('❌ PDF Error:', error);
    throw error;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}
