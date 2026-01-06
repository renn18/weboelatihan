'use client';

import Link from "next/link";
import {
  BookOpen,
  Code,
  Layers,
  Layout,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Search,
  Menu,
  X,
  PlayCircle,
  Award,
  TrendingUp,
  Globe,
  Loader
} from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { getCourses, getEnrollmentStatus } from "@/app/courses/[slug]/action";
import { enrollCourse, enrollAndPay } from "@/app/courses/[slug]/action";

// ✅ Types dari database
interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  isPublished: boolean;
  user: {
    name: string | null;
  };
  _count?: {
    enrollments: number;
  };
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  isLoading = false,
  disabled = false,
  ...props
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",
    outline: "border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader size={16} className="animate-spin" />}
      {children}
    </button>
  );
};

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = "" }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 ${className}`}>
    {children}
  </span>
);

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

interface Category {
  name: string;
  icon: ReactNode;
  count: string;
  color: string;
}

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [userEnrollments, setUserEnrollments] = useState<Map<string, string>>(new Map());

  const router = useRouter();

  // ✅ Load courses dari database
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        // Server action untuk get all published courses
        const response = await fetch('/api/courses', {
          method: 'GET',
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data.slice(0, 3)); // Ambil 3 teratas
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        // Fallback ke dummy data jika API error
        setCourses(mockCourses);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // ✅ Check enrollment status saat component mount
  useEffect(() => {
    const checkEnrollments = async () => {
      for (const course of courses) {
        try {
          const status = await getEnrollmentStatus(course.id);
          if (status) {
            setUserEnrollments(prev => new Map(prev).set(course.id, status));
          }
        } catch (error) {
          console.error(`Error checking enrollment for ${course.id}:`, error);
        }
      }
    };

    if (courses.length > 0) {
      checkEnrollments();
    }
  }, [courses]);

  const handleEnroll = async (courseId: string, price: number) => {
    try {
      setEnrollingCourseId(courseId);

      if (price === 0) {
        // ✅ Enroll di kursus gratis
        const result = await enrollCourse(courseId);
        if (result) {
          alert('Berhasil didaftarkan! Akses kursus di dashboard Anda.');
          setUserEnrollments(prev => new Map(prev).set(courseId, 'enrolled'));
          router.refresh();
        }
      } else {
        // ✅ Enroll di kursus berbayar - buka pembayaran
        const result = await enrollAndPay(courseId);
        if (result) {
          // Open Midtrans Snap
          if ((window as any).snap && 'transactionToken' in result) {
            (window as any).snap.pay(result.transactionToken, {
              onSuccess: () => {
                alert('Pembayaran berhasil! Akses kursus sekarang.');
                setUserEnrollments(prev => new Map(prev).set(courseId, 'enrolled'));
                router.refresh();
              },
              onError: () => {
                alert('Pembayaran gagal. Silakan coba lagi.');
              },
            });
          } else if ('redirectUrl' in result) {
            window.location.href = result.redirectUrl;
          }
        }
      }
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories: Category[] = [
    { name: 'Pengembangan Web', icon: <Code size={24} />, count: '120+ Kursus', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    { name: 'Desain UI/UX', icon: <Layout size={24} />, count: '85+ Kursus', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
    { name: 'Data Science', icon: <Layers size={24} />, count: '64+ Kursus', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
    { name: 'Pemasaran Digital', icon: <TrendingUp size={24} />, count: '92+ Kursus', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
  ];

  // ✅ Mock data (fallback)
  const mockCourses: CourseData[] = [
    {
      id: '1',
      title: "Mastering React & Next.js 15",
      slug: "mastering-react-next",
      description: "Pelajari React dan Next.js secara mendalam",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
      price: 499000,
      isPublished: true,
      user: { name: "Alex Chandra" },
      _count: { enrollments: 12400 }
    },
    {
      id: '2',
      title: "UI Design dengan Figma: Pro Level",
      slug: "ui-design-figma",
      description: "Desain UI profesional menggunakan Figma",
      thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&w=800&q=80",
      price: 350000,
      isPublished: true,
      user: { name: "Siska Amelia" },
      _count: { enrollments: 8200 }
    },
    {
      id: '3',
      title: "Analisis Data dengan Python",
      slug: "analisis-data-python",
      description: "Data analysis dan visualization dengan Python",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&w=800&q=80",
      price: 425000,
      isPublished: true,
      user: { name: "Budi Santoso" },
      _count: { enrollments: 5600 }
    }
  ];

  return (
    <>
      <Header />

      {/* Midtrans Script */}
      <script src="https://app.sandbox.midtrans.com/snap/snap.js" async></script>

      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 py-1.5 px-4 text-sm">Pelatihan Terakreditasi 2025</Badge>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Tingkatkan Keahlianmu Bersama <span className="text-blue-600 dark:text-blue-400">EduFlow</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
                Akses ribuan kursus berkualitas tinggi yang diajarkan oleh para profesional industri. Mulai belajar hari ini dan bangun karir impianmu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button onClick={() => router.push('/dashboard')} className="text-lg px-8">Mulai Belajar <ArrowRight size={20} /></Button>
                <Button onClick={() => router.push('/courses')} variant="secondary" className="text-lg px-8">Lihat Kursus <PlayCircle size={20} /></Button>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <Image width={500} height={500} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <p>Bergabung dengan <strong>45,000+</strong> alumni sukses</p>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800">
                <Image width={500} height={500}
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                  alt="Learning"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-100 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

              <div className="absolute bottom-10 right-[-20px] bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 hidden sm:block animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sertifikat Resmi</p>
                    <p className="text-sm font-bold">Lulus & Diakui</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Instruktur Ahli</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">20K+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Video Materi</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">95%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kepuasan Siswa</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">100+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mitra Perusahaan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-4">Kategori Populer</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg">Pilih jalur karirmu dan mulai belajar dari dasar hingga mahir dengan kurikulum standar industri.</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/courses')}>Lihat Semua Kategori</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <div key={idx} className="group p-8 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className={`${cat.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section - ✅ DARI DATABASE */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Kursus Terlaris Kami</h2>
            <p className="text-gray-600 dark:text-gray-400">Investasi terbaik adalah investasi pada dirimu sendiri.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader size={40} className="animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(courses.length > 0 ? courses : mockCourses).map((course) => {
                const enrollmentStatus = userEnrollments.get(course.id);
                const isEnrolling = enrollingCourseId === course.id;
                const formattedPrice = new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(course.price);

                return (
                  <Card key={course.id} className="overflow-hidden flex flex-col group">
                    <div className="relative overflow-hidden h-48">
                      <Image
                        width={500}
                        height={500}
                        src={course.thumbnail || "https://via.placeholder.com/500x300"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-blue-600 dark:text-blue-400">
                          {course.price === 0 ? 'Gratis' : 'Berbayar'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-1 text-orange-400 mb-2">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">4.8</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">({course._count?.enrollments || 0} Siswa)</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Oleh {course.user?.name || 'Instruktur'}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{course.description}</p>
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {course.price === 0 ? 'Gratis' : formattedPrice}
                        </span>
                        <Button
                          onClick={() => handleEnroll(course.id, course.price)}
                          isLoading={isEnrolling}
                          disabled={enrollmentStatus === 'enrolled' || isEnrolling}
                          className={`p-2 ${enrollmentStatus === 'enrolled' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        >
                          {enrollmentStatus === 'enrolled' ? (
                            <CheckCircle size={20} />
                          ) : (
                            <BookOpen size={20} />
                          )}
                        </Button>
                      </div>
                      {enrollmentStatus === 'enrolled' && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-semibold">✓ Sudah terdaftar</p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button variant="secondary" className="mx-auto" onClick={() => router.push('/courses')}>Jelajahi Semua Kursus</Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-8">Mengapa Belajar di EduFlow?</h2>
              <div className="space-y-6">
                {[
                  { title: "Kurikulum Ter-update", desc: "Materi disesuaikan dengan kebutuhan industri teknologi saat ini.", icon: <CheckCircle className="text-green-500 dark:text-green-400" /> },
                  { title: "Mentor Berpengalaman", desc: "Belajar langsung dari praktisi yang bekerja di top tech companies.", icon: <CheckCircle className="text-green-500 dark:text-green-400" /> },
                  { title: "Akses Seumur Hidup", desc: "Sekali beli, akses materi kapan saja dan di mana saja tanpa batas.", icon: <CheckCircle className="text-green-500 dark:text-green-400" /> },
                  { title: "Bantuan Penyaluran Kerja", desc: "Kami membantu menghubungkan lulusan terbaik dengan mitra kami.", icon: <CheckCircle className="text-green-500 dark:text-green-400" /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-8">
                <div className="bg-blue-600 rounded-2xl p-1 h-64 overflow-hidden shadow-xl">
                  <Image width={500} height={500} src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover rounded-xl" alt="Siswa" />
                </div>
                <div className="bg-orange-400 dark:bg-orange-500 rounded-2xl h-40 flex items-center justify-center p-6 text-white text-center">
                  <p className="font-bold text-xl leading-tight">100% Online & Fleksibel</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-40 flex flex-col items-center justify-center p-6">
                  <Globe size={40} className="text-blue-600 dark:text-blue-400 mb-2" />
                  <p className="font-bold">Akses Global</p>
                </div>
                <div className="bg-purple-600 dark:bg-purple-500 rounded-2xl p-1 h-64 overflow-hidden shadow-xl">
                  <Image width={500} height={500} src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover rounded-xl" alt="Pengajar" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 dark:bg-blue-700 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Siap Memulai Perjalanan Karirmu?</h2>
              <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
                Jangan tunda lagi. Dapatkan diskon 50% untuk kursus pertama bagi pendaftar baru bulan ini.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => router.push('/sign-up')} className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
                  Daftar Sekarang — Gratis
                </button>
                <button className="bg-blue-800 dark:bg-blue-900 text-white border border-blue-500 dark:border-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-colors">
                  Konsultasi Karir
                </button>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-20 pb-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <BookOpen className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">EduFlow</span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                EduFlow adalah platform edukasi terkemuka di Indonesia yang fokus pada pengembangan skill digital untuk masa depan.
              </p>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors">
                    <Globe size={18} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Tautan Cepat</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="/courses" className="hover:text-blue-500">Semua Kursus</Link></li>
                <li><Link href="#" className="hover:text-blue-500">Program Bootcamp</Link></li>
                <li><Link href="#" className="hover:text-blue-500">Menjadi Instruktur</Link></li>
                <li><Link href="#" className="hover:text-blue-500">Berlangganan B2B</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Dukungan</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-blue-500">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-blue-500">FAQ</a></li>
                <li><a href="#" className="hover:text-blue-500">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-blue-500">Ketentuan Layanan</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Newsletter</h4>
              <p className="text-sm mb-4">Dapatkan update materi terbaru dan info promo menarik.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="bg-gray-800 border-none rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-600 text-white"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Ikuti
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-xs">
            <p>&copy; 2025 EduFlow Indonesia. Dibuat dengan dedikasi untuk masa depan bangsa.</p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}} />
    </>
  );
}
