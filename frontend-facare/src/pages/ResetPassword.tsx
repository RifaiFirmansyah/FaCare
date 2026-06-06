import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { LockKeyhole, Lock, ArrowLeft } from 'lucide-react'
import { api } from '../lib/api'
import { useScreenInit } from '../useScreenInit'
export function ResetPassword() {
  useScreenInit()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const hash = window.location.hash.substring(1)
  const hashParams = new URLSearchParams(hash)
  const accessToken = searchParams.get('access_token') || hashParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token')
  useEffect(() => {
  if (!accessToken && !success) {
    toast.error('Token reset tidak valid atau sudah kedaluwarsa.')
    navigate('/forgot-password')
    }
  }, [accessToken, navigate, success])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter.')
      return
    }
    setLoading(true)
    try {
      await api.auth.resetPassword({
        access_token: accessToken || '',
        refresh_token: refreshToken || '',
        new_password: newPassword,
      })
      toast.success('Password berhasil diubah. Silakan masuk kembali.')
      setSuccess(true)
      navigate('/login')
    } catch (error) {
      toast.error('Gagal mereset password. Token mungkin sudah kedaluwarsa.')
    } finally {
      setLoading(false)
    }
  }
  if (!accessToken) return null
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <LockKeyhole className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Buat password baru untuk akun Anda.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? 'Memproses...' : 'Simpan Password Baru'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    </div>
  )
}
