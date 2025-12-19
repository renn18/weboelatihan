'use server'

import { clerkClient } from '@clerk/nextjs/server'

export async function updateUserRole(
  userId: string,
  role: 'admin' | 'user'
) {
  if (!userId) {
    throw new Error('User ID required')
  }

  // ✅ Clerk v6: panggil clerkClient()
  const client = await clerkClient()

  await client.users.updateUser(userId, {
    publicMetadata: {
      role,
    },
  })
}
