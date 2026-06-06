import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, MapPin } from 'lucide-react'

export function VerifyEmail() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    // Supabase mengirim token sebagai hash fragment di URL
    // Contoh: /verify-email#access_token=xxx&refresh_token=yyy&type=signup
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const type = params.get('type')

    if (accessToken && type === 'signup') {
      setStatus('success')
      // Redirect ke login setelah 3 detik
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } else {
      setStatus('error')
    }
  }, [navigate])

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
        </div>

        {status === 'loading' && (
          <>
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Memverifikasi Email...
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Mohon tunggu sebentar.
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Email Berhasil Diverifikasi!
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Akun Anda sudah aktif. Anda akan diarahkan ke halaman login dalam beberapa detik...
              </p>
            </div>
            <Link
              to="/login"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              Login Sekarang
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Link Tidak Valid
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Link verifikasi tidak valid atau sudah expired. Silakan daftar ulang.
              </p>
            </div>
            <Link
              to="/register"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              Kembali ke Register
            </Link>
          </>
        )}
      </div>
    </div>
  )
}