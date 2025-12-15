// app/dashboard/page.tsx

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CourseForm from '@/components/CourseForm';
import CourseList from '@/components/CourseList';

export default async function DashboardPage() {
    if ((await auth()).sessionClaims?.metadata.onboardingComplete === true) {
        redirect('/')
    }
    return (
        <div className="p-8 space-y-12">
            <h1 className="text-4xl font-extrabold text-center text-gray-800">Dashboard Admin Pelatihan</h1>
            <CourseForm />
            <hr className="border-gray-300" />
            <CourseList />

        </div>
    );
}