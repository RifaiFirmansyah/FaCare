import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Lock,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Edit2,
} from 'lucide-react'
import { api } from '../lib/api'

export function Profile() {
  const navigate = useNavigate()
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingUpdate, setLoadingUpdate] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [profile, setProfile] = useState({
    nama_lengkap: '',
    email: '',
    role: '',
  })

  const [profileForm, setProfileForm] = useState({
    nama_lengkap: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoadingProfile(true)
    try {
      const res = await api.auth.getProfile()
      const data = res.data
      setProfile({
        nama_lengkap: data.nama_lengkap || '',
        email: data.email || '',
        role: data.role || 'masyarakat',
      })
      setProfileForm({ nama_lengkap: data.nama_lengkap || '' })
    } catch (error) {
      toast.error('Gagal memuat profil')
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileForm.nama_lengkap.trim()) {
      toast.error('Nama lengkap tidak boleh kosong')
      return
    }
    setLoadingUpdate(true)
    try {
      await api.auth.updateProfile({ nama_lengkap: profileForm.nama_lengkap })
      localStorage.setItem('nama_lengkap', profileForm.nama_lengkap)
      setProfile({ ...profile, nama_lengkap: profileForm.nama_lengkap })
      toast.success('Profil berhasil diperbarui!')
      setEditMode(false)
    } catch (error) {
      toast.error('Gagal memperbarui profil')
    } finally {
      setLoadingUpdate(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Password baru dan konfirmasi tidak cocok')
      return
    }
    if (passwordForm.new_password.length < 6) {
      toast.error('Password baru minimal 6 karakter')
      return
    }
    if (passwordForm.old_password === passwordForm.new_password) {
      toast.error('Password baru tidak boleh sama dengan password lama')
      return
    }
    setLoadingPassword(true)
    try {
      await api.auth.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      })
      toast.success('Password berhasil diubah!')
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (error) {
      toast.error('Gagal mengubah password. Pastikan password lama benar.')
    } finally {
      setLoadingPassword(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola informasi akun dan keamanan Anda.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Informasi Profil
            </h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-1.5" />
                Edit
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Avatar */}
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-blue-600">
                  {profile.nama_lengkap.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{profile.nama_lengkap}</p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    profile.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {profile.role === 'admin' ? 'Admin' : 'Masyarakat'}
                  </span>
                </div>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 sm:text-sm cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Email tidak dapat diubah.</p>
            </div>

            {/* Nama Lengkap */}
            {editMode ? (
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={profileForm.nama_lengkap}
                      onChange={(e) =>
                        setProfileForm({ nama_lengkap: e.target.value })
                      }
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      placeholder="Nama lengkap Anda"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={loadingUpdate}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {loadingUpdate ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false)
                      setProfileForm({ nama_lengkap: profile.nama_lengkap })
                    }}
                    className="inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    disabled
                    value={profile.nama_lengkap}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 sm:text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-blue-600" />
              Ubah Password
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pastikan password baru Anda minimal 6 karakter.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password Lama
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.old_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, old_password: e.target.value })
                  }
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="Masukkan password lama"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, new_password: e.target.value })
                  }
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                  }
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="Ulangi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loadingPassword}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loadingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Ubah Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}