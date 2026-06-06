import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Shield, Clock, AlertCircle, CheckCircle2, Search, FileDown, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { useScreenInit } from '../useScreenInit'

const StatusBadge = ({ status }: { status: string }) => {
  switch (status?.toLowerCase()) {
    case 'menunggu':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="w-3.5 h-3.5 mr-1" /> Menunggu
        </span>
      )
    case 'sedang diperbaiki':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <AlertCircle className="w-3.5 h-3.5 mr-1" /> Diperbaiki
        </span>
      )
    case 'selesai':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Selesai
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {status}
        </span>
      )
  }
}

export function Admin() {
  useScreenInit()
  const navigate = useNavigate()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [exportStatus, setExportStatus] = useState('Menunggu')
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'admin') {
      toast.error('Akses ditolak. Halaman khusus admin.')
      navigate('/')
      return
    }
    fetchReports()
  }, [navigate])

  const fetchReports = async () => {
    try {
      const data = await api.reports.getAll()
      setReports(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      toast.error('Gagal memuat data laporan')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string | number, newStatus: string) => {
    try {
      const userId = localStorage.getItem('user_id')
      await api.reports.updateStatus(id, {
        user_id: userId,
        status: newStatus,
      })
      toast.success('Status berhasil diperbarui')
      fetchReports()
    } catch (error) {
      toast.error('Gagal memperbarui status')
    }
  }

  const handleExportPdf = async () => {
    setExportLoading(true)
    try {
      const blob = await api.reports.exportPdf(exportStatus)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan_${exportStatus.replace(' ', '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success(`PDF laporan "${exportStatus}" berhasil didownload!`)
    } catch (error) {
      toast.error('Gagal mengexport PDF')
    } finally {
      setExportLoading(false)
    }
  }

  const filteredReports = reports.filter(
    (r) =>
      r.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nama_pelapor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.kategori?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-600" />
              Admin Panel
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Kelola dan perbarui status laporan masyarakat.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 relative rounded-md shadow-sm max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-2 border"
              placeholder="Cari laporan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Export PDF Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
            <FileDown className="w-4 h-4 mr-2 text-blue-600" />
            Export Laporan ke PDF
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={exportStatus}
              onChange={(e) => setExportStatus(e.target.value)}
              className="block pl-3 pr-8 py-2 text-sm border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg border shadow-sm bg-white"
            >
              <option value="Menunggu">Menunggu</option>
              <option value="Sedang Diperbaiki">Sedang Diperbaiki</option>
              <option value="Selesai">Selesai</option>
            </select>
            <button
              onClick={handleExportPdf}
              disabled={exportLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              {exportLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengexport...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Pilih status laporan yang ingin diexport, lalu klik Download PDF.
          </p>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Laporan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Pelapor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                      Tidak ada laporan ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id || report._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {report.foto_url && (
                            <div className="flex-shrink-0 h-12 w-12 mr-4">
                              <img
                                className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                                src={report.foto_url}
                                alt=""
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-slate-900 line-clamp-1 max-w-xs">
                              {report.deskripsi}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {report.jumlah_upvote || report.upvote_count || report.upvotes || 0}{' '}
                              Dukungan
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {report.kategori || report.category?.name || 'Umum'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {report.nama_pelapor || report.user?.nama_lengkap || 'Anonim'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={report.status || 'Menunggu'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <select
                          value={report.status || 'Menunggu'}
                          onChange={(e) => handleStatusChange(report.id || report._id, e.target.value)}
                          className="mt-1 block w-full pl-3 pr-8 py-1.5 text-sm border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md border shadow-sm bg-white"
                        >
                          <option value="Menunggu">Menunggu</option>
                          <option value="Sedang Diperbaiki">Sedang Diperbaiki</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}