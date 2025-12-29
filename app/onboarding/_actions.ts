'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export async function completeOnboarding(formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { error: 'Not authenticated' }

  const applicationName = formData.get('applicationName') as string
  const applicationType = formData.get('applicationType') as string

  if (!applicationName || !applicationType) {
    return { error: 'Data tidak lengkap' }
  }

  try {
    const client = await clerkClient()
    client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        applicationName,
        applicationType,
      },
    })

//  console.log('PRISMA INSTANCE:', prisma)
    const userDb = await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        role: 'user',
        name: applicationName,
        fav: [ applicationType  ],
        
      },
      update: {},
    })

    console.log('USER DB SAVED:', userDb)

    return { success: true }
  } catch (err) {
    console.error('ONBOARDING ERROR:', err)
    return { error: 'Gagal onboarding' }
  }
}
