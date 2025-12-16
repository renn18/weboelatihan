// lib/prisma.ts

import { PrismaClient } from '../app/generated/prisma';

// Tambahkan deklarasi ini ke Global Object
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined; 
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Pastikan global.prisma terinisialisasi HANYA SEKALI
  if (!global.prisma) {
    global.prisma = new PrismaClient({
        // Opsional: Anda dapat menghapus log jika tidak diperlukan
        // log: ['query', 'error', 'warn'], 
    });
  }
  prisma = global.prisma;
}

export default prisma;