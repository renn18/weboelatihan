import { useState } from 'react'

interface UpdateRoleResponse {
  success: boolean
  message: string
  user: {
    id: string
    role: string
    email: string
    name: string
  }
}

export function useUpdateRole() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateRole = async (role: 'user' | 'instructor' | 'admin') => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/users/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      const data: UpdateRoleResponse = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to update role')
        return null
      }

      setSuccess(data.message)
      return data.user
    } catch (err: any) {
      setError(err.message || 'Error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateRole, loading, error, success }
}
