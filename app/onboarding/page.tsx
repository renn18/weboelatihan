'use client'

import * as React from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from './_actions'

export default function OnboardingComponent() {
    const [error, setError] = React.useState('')
    const { user } = useUser()
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        const res = await completeOnboarding(formData)
        if (res?.message) {
            // Forces a token refresh and refreshes the `User` object
            await user?.reload()
            router.push('/')
        }
        if (res?.error) {
            setError(res?.error)
        }
    }
    return (
        <div>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <h1>Welcome</h1>
                    <form action={handleSubmit}>
                        <div>
                            <label>Application Name</label>
                            <p>Enter the name of your application.</p>
                            <input type="text" name="applicationName" required />
                        </div>

                        <div>
                            <label>Application Type</label>
                            <p>Describe the type of your application.</p>
                            <input type="text" name="applicationType" required />
                        </div>
                        {error && <p className="text-red-600">Error: {error}</p>}
                        <button type="submit">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    )
}