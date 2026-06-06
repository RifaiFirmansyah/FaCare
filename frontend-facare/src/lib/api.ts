const BASE_URL = 'https://backend-facere-production.up.railway.app/api'

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = {
  auth: {
    register: async (data: any) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Registration failed')
      return res.json()
    },
    login: async (data: any) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Login failed')
      return res.json()
    },
    forgotPassword: async (email: string) => {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Gagal mengirim email reset')
      return res.json()
    },
    resetPassword: async (data: {
      access_token: string
      refresh_token: string
      new_password: string
    }) => {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Gagal reset password')
      return res.json()
    },
    logout: async () => {
      const res = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      if (!res.ok) throw new Error('Gagal logout')
      return res.json()
    },
    getProfile: async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      if (!res.ok) throw new Error('Gagal mengambil profil')
      return res.json()
    },

    updateProfile: async (data: { nama_lengkap: string }) => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      return res.json()
    },
    changePassword: async (data: { old_password: string; new_password: string }) => {
      const res = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to change password')
      }
      return res.json()
    },
  },
  reports: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/reports/`)
      if (!res.ok) throw new Error('Failed to fetch reports')
      return res.json()
    },
    upvote: async (id: string | number) => {
      const res = await fetch(`${BASE_URL}/reports/${id}/upvote`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
      })
      if (!res.ok) throw new Error('Failed to upvote')
      return res.json()
    },
    uploadPhoto: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${BASE_URL}/reports/upload-foto`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: formData,
      })
      if (!res.ok) throw new Error('Failed to upload photo')
      return res.json()
    },
    create: async (data: any) => {
      const res = await fetch(`${BASE_URL}/reports/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create report')
      return res.json()
    },
    updateStatus: async (id: string | number, data: any) => {
      const res = await fetch(`${BASE_URL}/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
  },
  categories: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/categories/`)
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  },
}
