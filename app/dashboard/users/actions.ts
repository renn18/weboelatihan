'use server'

import { clerkClient } from '@clerk/nextjs/server'
import {prisma} from '@/lib/prisma'

export async function deleteUser(userId: string) {
  if (!userId) {
    throw new Error('User ID required')
  }
  // ✅ Clerk v6: panggil clerkClient()
  const client = await clerkClient()  
  await client.users.deleteUser(userId)

  await prisma.user.delete({
    where: { clerkId: userId },
  })
}

export async function updateUserRole(
  userId: string,
  role: 'admin' | 'user'
) {
  if (!userId) {
    throw new Error('User ID required')
  }

  await prisma.user.updateMany({
    where: { clerkId: userId },
    data: { role },
  })
}
