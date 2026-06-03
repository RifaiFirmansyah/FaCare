import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  MapPin,
  PlusCircle,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
} from 'lucide-react'
export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const nama_lengkap = localStorage.getItem('nama_lengkap')
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('role')
    localStorage.removeItem('nama_lengkap')
    navigate('/login')
  }
  const navLinks = [
    {
      name: 'Peta Laporan',
      path: '/',
      icon: <MapPin className="w-4 h-4 mr-2" />,
    },
    ...(token
      ? [
          {
            name: 'Buat Laporan',
            path: '/buat-laporan',
            icon: <PlusCircle className="w-4 h-4 mr-2" />,
          },
        ]
      : []),
    ...(role === 'admin'
      ? [
          {
            name: 'Admin Panel',
            path: '/admin',
            icon: <Shield className="w-4 h-4 mr-2" />,
          },
        ]
      : []),
  ]
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">
                  FaCare
                </span>
              </Link>
              <nav className="hidden md:ml-8 md:flex md:space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === link.path ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {token ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600 font-medium">
                    Hi, {nama_lengkap || 'User'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Daftar
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
              >
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === link.path ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center">
                    {link.icon}
                    {link.name}
                  </div>
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-slate-200">
              {token ? (
                <div className="px-5 space-y-3">
                  <div className="text-base font-medium text-slate-800">
                    {nama_lengkap || 'User'}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="px-5 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}
