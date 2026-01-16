import { prisma as db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ✅ Revalidate setiap 30 menit untuk statistics
export const revalidate = 1800;

export async function GET(req: NextRequest) {
  try {
    console.log('📡 API: Fetching statistics...');

    // ✅ Parallel queries untuk performa
    const [
      totalInstructors,
      totalVideoModules,
      totalEnrollments,
      totalPartnerCompanies,
    ] = await Promise.all([
      // Total instruktur (unique users yang punya course)
      db.course.findMany({
        distinct: ['userId'],
        where: {
          isPublished: true,
        },
      }).then((courses: { userId: string }[]) => new Set(courses.map(c => c.userId)).size),

      // Total video modules (sum dari semua module yang published)
      db.user.count(),

      // Total enrollments
      db.enrollment.count(),

      // Total partner companies (hardcoded untuk sekarang, bisa integrate ke DB later)
      Promise.resolve(100), // Or fetch dari table companies jika ada
    ]);

    console.log('✅ API: Statistics calculated', {
      totalInstructors,
      totalVideoModules,
      totalEnrollments,
      totalPartnerCompanies,
    });

    // ✅ Response dengan formatted data
    const response = {
      success: true,
      data: {
        instructors: totalInstructors,
        videos: totalVideoModules,
        enrollments: totalEnrollments,
        partners: totalPartnerCompanies,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    // ✅ Set cache headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');

    return NextResponse.json(response, { headers });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ API Error:', errorMessage, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch statistics',
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}