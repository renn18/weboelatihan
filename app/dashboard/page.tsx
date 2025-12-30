import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
    const { sessionClaims } = await auth()
    if (sessionClaims?.metadata.onboardingComplete !== true) {
        redirect('/onboarding')
    }

    return <DashboardClient />
}