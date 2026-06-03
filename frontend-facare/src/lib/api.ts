const BASE_URL = 'http://127.0.0.1:8000/api'

const getAuthHeaders = () => {
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
      const data = await res.json()
      if (!res.ok) {
        const errorMessage = data?.detail ? JSON.stringify(data.detail) : 'Failed to upload photo'
        throw new Error(errorMessage)
      }
      const foto_url =
        typeof data.foto_url === 'string'
          ? data.foto_url
          : data.foto_url?.publicUrl ?? data.foto_url?.data?.publicUrl ?? data.url ?? data.publicUrl
      return { ...data, foto_url }
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
      const json = await res.json()
      if (!res.ok) {
        const errorMessage = json?.detail ? JSON.stringify(json.detail) : 'Failed to create report'
        throw new Error(errorMessage)
      }
      return json
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
