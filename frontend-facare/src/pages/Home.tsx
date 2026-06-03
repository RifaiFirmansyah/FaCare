import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useSearchParams } from 'react-router-dom'
import L from 'leaflet'
import { toast } from 'sonner'
import {
  ThumbsUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  Share2,
  MapPin,
  User,
  Tag,
} from 'lucide-react'
import { api } from '../lib/api'
import { useScreenInit } from '../useScreenInit'
// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
const PEKANBARU_CENTER: [number, number] = [0.5071, 101.4478]
const getReportId = (r: any) => r?.id ?? r?._id
const StatusBadge = ({ status }: { status: string }) => {
  switch (status?.toLowerCase()) {
    case 'menunggu':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3 mr-1" /> Menunggu
        </span>
      )
    case 'sedang diperbaiki':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <AlertCircle className="w-3 h-3 mr-1" /> Diperbaiki
        </span>
      )
    case 'selesai':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Selesai
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {status}
        </span>
      )
  }
}
function ReportDetailModal({
  report,
  onClose,
  onUpvote,
}: {
  report: any
  onClose: () => void
  onUpvote: (id: string | number) => void
}) {
  // Lock body scroll while modal open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])
  // Close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?laporan=${getReportId(report)}`
    const shareData = {
      title: 'Laporan FaCare',
      text: `${report.deskripsi?.slice(0, 120) || 'Lihat laporan ini di FaCare'}`,
      url: shareUrl,
    }
    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData)
        return
      }
    } catch {
      // user cancelled native share — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Tautan laporan disalin ke clipboard')
    } catch {
      toast.error('Gagal menyalin tautan')
    }
  }
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Detail Laporan"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-base font-semibold text-slate-900">
            Detail Laporan
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Bagikan laporan"
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              Bagikan
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div className="overflow-y-auto">
          {report.foto_url ? (
            <div className="bg-slate-100">
              <img
                src={report.foto_url}
                alt="Foto laporan"
                className="w-full max-h-[420px] object-contain bg-slate-900"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
              Tidak ada foto
            </div>
          )}

          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                <Tag className="w-3 h-3 mr-1" />
                {report.kategori ||
                  report.category?.name ||
                  report.category?.nama ||
                  'Umum'}
              </span>
              <StatusBadge status={report.status || 'Menunggu'} />
            </div>

            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Deskripsi
              </h3>
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                {report.deskripsi}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Pelapor</div>
                  <div className="text-sm font-medium text-slate-800">
                    {report.nama_pelapor ||
                      report.user?.nama_lengkap ||
                      'Anonim'}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Koordinat</div>
                  <div className="text-sm font-medium text-slate-800">
                    {Number(report.latitude).toFixed(5)},{' '}
                    {Number(report.longitude).toFixed(5)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <span className="text-sm font-medium text-slate-600 flex items-center">
            <ThumbsUp className="w-4 h-4 mr-1.5 text-slate-400" />
            {report.jumlah_upvote || report.upvote_count || report.upvotes || 0} Dukungan
          </span>
          <button
            onClick={() => onUpvote(getReportId(report))}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ThumbsUp className="w-4 h-4 mr-1.5" />
            Dukung
          </button>
        </div>
      </div>
    </div>
  )
}
export function Home() {
  useScreenInit()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const token = localStorage.getItem('token')
  const selectedId = searchParams.get('laporan')
  const selectedReport = useMemo(
    () =>
      selectedId
        ? reports.find((r) => String(getReportId(r)) === String(selectedId))
        : null,
    [reports, selectedId],
  )
  const fetchReports = async () => {
    try {
      const data = await api.reports.getAll()
      setReports(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      toast.error('Gagal memuat data laporan')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchReports()
  }, [])
  const openDetail = (id: string | number) => {
    setSearchParams(
      {
        laporan: String(id),
      },
      {
        replace: false,
      },
    )
  }
  const closeDetail = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('laporan')
    setSearchParams(next, {
      replace: false,
    })
  }
  const handleUpvote = async (id: string | number) => {
    if (!token) {
      toast.error('Silakan login untuk mendukung laporan')
      return
    }
    try {
      await api.reports.upvote(id)
      toast.success('Berhasil mendukung laporan')
      fetchReports()
    } catch (error) {
      toast.error('Gagal mendukung laporan')
    }
  }
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  return (
    <div className="flex-1 relative">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white px-4 py-2 rounded-full shadow-md border border-slate-200 pointer-events-none">
        <p className="text-sm font-medium text-slate-700">
          Menampilkan {reports.length} laporan di Pekanbaru
        </p>
      </div>
      <MapContainer
        center={PEKANBARU_CENTER}
        zoom={13}
        style={{
          height: '100%',
          width: '100%',
          minHeight: 'calc(100vh - 64px)',
        }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {reports.map((report) => {
          const rid = getReportId(report)
          return (
            <Marker
              key={rid}
              position={[
                parseFloat(report.latitude),
                parseFloat(report.longitude),
              ]}
            >
              <Popup className="custom-popup">
                <div className="w-64">
                  {report.foto_url && (
                    <img
                      src={report.foto_url}
                      alt="Foto Laporan"
                      className="w-full h-32 object-cover rounded-t-md mb-3 cursor-pointer"
                      onClick={() => openDetail(rid)}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  <div className="px-1 pb-1">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {report.kategori || report.category?.name || 'Umum'}
                      </span>
                      <StatusBadge status={report.status || 'Menunggu'} />
                    </div>
                    <p className="text-sm text-slate-800 font-medium mb-2 line-clamp-3">
                      {report.deskripsi}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      Dilaporkan oleh:{' '}
                      <span className="font-medium text-slate-700">
                        {report.nama_pelapor ||
                          report.user?.nama_lengkap ||
                          'Anonim'}
                      </span>
                    </p>

                    <button
                      onClick={() => openDetail(rid)}
                      className="w-full mb-2 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Lihat Detail
                    </button>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-sm font-medium text-slate-600 flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-1.5 text-slate-400" />
                        {report.jumlah_upvote || report.upvote_count || report.upvotes || 0}
                      </span>
                      <button
                        onClick={() => handleUpvote(rid)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Dukung
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={closeDetail}
          onUpvote={handleUpvote}
        />
      )}
    </div>
  )
}
