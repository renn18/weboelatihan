import { prisma } from '@/lib/prisma'
import CourseList from '@/components/CourseList'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Users, GraduationCap } from 'lucide-react'

export default async function DashboardClient() {
    const users = await prisma.user.findFirst({
        select: {
            name: true,
            role: true,
        },
    })

    return (
        <div className='w-full'>
            <div className=" p-6 space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Selamat Datang, {users?.name}</h1>
                    <p className="text-muted-foreground">
                        Login sebagai {users?.role === 'admin' ? 'Admin' : 'Peserta'}
                    </p>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: 'Total Kelas', value: '24', icon: <BookOpen className="w-5 h-5" /> },
                        { title: 'Peserta Aktif', value: '1.240', icon: <Users className="w-5 h-5" /> },
                        { title: 'Instruktur', value: '18', icon: <GraduationCap className="w-5 h-5" /> },
                    ].map((item, i) => (
                        <Card key={i} className="rounded-2xl">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{item.title}</p>
                                    <p className="text-2xl font-semibold">{item.value}</p>
                                </div>
                                <div className="text-muted-foreground">{item.icon}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* List */}
                <Card className="rounded-2xl">
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-xl font-semibold">Daftar Kelas Terbaru</h2>
                        <CourseList />
                    </CardContent>
                </Card>
            </div>
        </div>

    )
}
