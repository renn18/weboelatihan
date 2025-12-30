// fix-slugs.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixSlugs() {
  const courses = await prisma.course.findMany()
  
  for (const course of courses) {
    if (!course.slug) {
      const newSlug = course.title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
      
      await prisma.course.update({
        where: { id: course.id },
        data: { slug: newSlug },
      })
      
      console.log(`✅ Fixed: ${course.title} → ${newSlug}`)
    }
  }
  
  console.log('✅ All slugs fixed!')
}

fixSlugs()
