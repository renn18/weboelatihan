import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isOnboardingRoute = createRouteMatcher(['/onboarding'])
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)'
])

export default clerkMiddleware(async (auth, req: NextRequest) => {

  const { isAuthenticated, sessionClaims, redirectToSignIn } = await auth()

 // belum login → login dulu
  if (!isAuthenticated && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // sudah login tapi belum onboarding → paksa ke /onboarding
  if (
    isAuthenticated &&
    !sessionClaims?.metadata?.onboardingComplete &&
    !isOnboardingRoute(req)
  ) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // sudah onboarding tapi masih buka /onboarding → lempar ke dashboard
  if (
    isAuthenticated &&
    sessionClaims?.metadata?.onboardingComplete &&
    isOnboardingRoute(req)
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}