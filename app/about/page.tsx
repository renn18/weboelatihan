import Link from 'next/link'
import Image from 'next/image'
import { Check, Users, Zap, Globe, Award, Heart } from 'lucide-react'
import Header from '@/components/Header'

export default function AboutPage() {
    const features = [
        {
            icon: Globe,
            title: 'Platform Global',
            description: 'Akses pembelajaran dari mana saja, kapan saja dengan teknologi terkini'
        },
        {
            icon: Users,
            title: 'Komunitas Besar',
            description: 'Belajar bersama ribuan siswa dan instruktur berpengalaman'
        },
        {
            icon: Zap,
            title: 'Cepat & Efisien',
            description: 'Sistem pembelajaran yang responsif dan mudah digunakan'
        },
        {
            icon: Award,
            title: 'Sertifikat Resmi',
            description: 'Dapatkan sertifikat yang diakui setelah menyelesaikan kursus'
        },
        {
            icon: Heart,
            title: 'Dukungan 24/7',
            description: 'Tim support siap membantu Anda kapan pun dibutuhkan'
        },
        {
            icon: Check,
            title: 'Konten Berkualitas',
            description: 'Materi pembelajaran dari para ahli di bidangnya'
        }
    ]

    const stats = [
        { number: '10K+', label: 'Siswa Aktif', color: 'from-blue-500 to-indigo-600' },
        { number: '500+', label: 'Kursus', color: 'from-emerald-500 to-teal-600' },
        { number: '200+', label: 'Instruktur', color: 'from-purple-500 to-pink-600' },
        { number: '95%', label: 'Kepuasan', color: 'from-orange-500 to-red-600' }
    ]

    const team = [
        {
            name: 'Budi Santoso',
            role: 'Founder & CEO',
            bio: 'Visioner dalam dunia pendidikan digital dengan 10+ tahun pengalaman',
            image: '👨'
        },
        {
            name: 'Muhammad Putra Pratama',
            role: 'Software Engineer',
            bio: 'Expert dalam teknologi pembelajaran dengan passion untuk inovasi',
            image: '👨‍💻'
        },
    ]

    const values = [
        {
            title: 'Inklusif',
            description: 'Pendidikan berkualitas untuk semua orang tanpa terkecuali'
        },
        {
            title: 'Inovatif',
            description: 'Terus berkembang dengan teknologi dan metodologi terbaru'
        },
        {
            title: 'Terpercaya',
            description: 'Komitmen pada kualitas dan transparansi dalam setiap aspek'
        },
        {
            title: 'Berdampak',
            description: 'Membuat perbedaan nyata dalam kehidupan siswa kami'
        }
    ]

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 pt-20 pb-32">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
                        📚 Tentang EduHub
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                        Platform pembelajaran online yang mengubah cara orang belajar dan berkembang di era digital
                    </p>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12">

                        {/* Mission */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800/50">
                            <div className="text-5xl mb-4">🎯</div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Misi Kami
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                Memberdayakan setiap individu untuk mencapai potensi penuh mereka melalui pendidikan berkualitas tinggi yang dapat diakses oleh semua orang, di mana pun mereka berada.
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-800/50">
                            <div className="text-5xl mb-4">🌟</div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Visi Kami
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                Menjadi platform pembelajaran global terdepan yang menghubungkan jutaan pelajar dengan instruktur terbaik, menciptakan dampak positif dalam dunia pendidikan.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
                        📊 Pencapaian Kami
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="group bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-200 dark:border-gray-700"
                            >
                                <div className={`h-16 w-16 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                                    <span className="text-2xl font-bold">📈</span>
                                </div>
                                <p className={`text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                                    {stat.number}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 font-semibold">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
                        💡 Mengapa Memilih EduHub?
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <div
                                    key={index}
                                    className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {feature.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
                        🌈 Nilai-Nilai Kami
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
                            >
                                <div className="text-4xl mb-4">
                                    {index === 0 && '🤝'}
                                    {index === 1 && '⚡'}
                                    {index === 2 && '🔐'}
                                    {index === 3 && '🎯'}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
                        👥 Tim Kami
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 ">
                        {team.map((member, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-200 dark:border-gray-700"
                            >
                                <div className="text-6xl mb-4 mx-auto">
                                    {member.image}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {member.name}
                                </h3>
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">
                                    {member.role}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {member.bio}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* History Section */}
            <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
                        📖 Perjalanan Kami
                    </h2>

                    <div className="space-y-8">
                        {[
                            {
                                year: '2020',
                                title: 'Awal Mula',
                                description: 'EduHub didirikan dengan visi untuk demokratisasi pendidikan'
                            },
                            {
                                year: '2021',
                                title: 'Ekspansi',
                                description: 'Kami mencapai 1000+ siswa dan 50+ kursus berkualitas tinggi'
                            },
                            {
                                year: '2022',
                                title: 'Pertumbuhan',
                                description: 'Platform EduHub berkembang menjadi ekosistem pembelajaran yang solid'
                            },
                            {
                                year: '2024',
                                title: 'Inovasi',
                                description: 'Meluncurkan fitur-fitur revolusioner dan mencapai 10K+ pengguna aktif'
                            }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="flex gap-6 items-start"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                        {item.year.slice(-2)}
                                    </div>
                                    {index < 3 && (
                                        <div className="w-1 h-16 bg-gradient-to-b from-blue-500 to-transparent mt-2"></div>
                                    )}
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 flex-1">
                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">
                                        {item.year}
                                    </p>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Bergabunglah dengan EduHub Hari Ini
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
                        Mulai perjalanan pembelajaran Anda dan raih potensi maksimal bersama ribuan siswa lainnya
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/courses"
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                            Lihat Kursus
                        </Link>
                        <Link
                            href="/contact"
                            className="px-8 py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
                        >
                            Hubungi Kami
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
                        ❓ Pertanyaan Umum
                    </h2>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'Apakah EduHub gratis?',
                                a: 'EduHub menawarkan model freemium. Banyak kursus gratis tersedia, dan untuk akses penuh ke semua konten premium, tersedia paket berlangganan dengan harga terjangkau.'
                            },
                            {
                                q: 'Apakah sertifikat diakui?',
                                a: 'Ya, sertifikat EduHub diakui oleh banyak perusahaan dan institusi pendidikan. Setiap sertifikat mencantumkan detail skill yang telah dikuasai.'
                            },
                            {
                                q: 'Bagaimana jika saya tertinggal?',
                                a: 'Anda dapat mempelajari materi dengan kecepatan Anda sendiri. Video dapat dipause, diputar ulang, dan materi tersedia 24/7 untuk akses kapan saja.'
                            },
                            {
                                q: 'Bagaimana dengan dukungan teknis?',
                                a: 'Tim support kami siap membantu 24/7 melalui email, chat, atau forum komunitas. Kami berkomitmen untuk memberikan respons cepat dan solusi efektif.'
                            }
                        ].map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                    {faq.q}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Siap untuk Memulai?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Daftar sekarang dan dapatkan akses ke ribuan kursus berkualitas
                    </p>
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <span>🚀</span>
                        Daftar Gratis
                    </Link>
                </div>
            </section>
        </div>
    )
}
