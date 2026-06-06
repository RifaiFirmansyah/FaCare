import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { KeyRound, Mail, ArrowLeft } from 'lucide-react'
import { api } from '../lib/api'
import { useScreenInit } from '../useScreenInit'
export function ForgotPassword() {
  useScreenInit()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.auth.forgotPassword(email)
      toast.success(
        'Jika email terdaftar, link reset password telah dikirim. Silakan cek inbox dan folder spam Anda.',
      )
    } catch (error) {
      toast.error('Gagal mengirim email reset. Coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Lupa Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Masukkan email Anda dan kami akan mengirimkan link untuk mereset
            password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="anda@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
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
