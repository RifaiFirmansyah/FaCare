import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { toast } from 'sonner'
import { Camera, MapPin, Send, Loader2, PlusCircle, X } from 'lucide-react'
import { api } from '../lib/api'
import { useScreenInit } from '../useScreenInit'
import * as L from 'leaflet'
const PEKANBARU_CENTER: [number, number] = [0.5071, 101.4478]
function LocationPicker({
  position,
  setPosition,
}: {
  position: L.LatLng | null
  setPosition: (pos: L.LatLng) => void
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })
  return position === null ? null : <Marker position={position} />
}
export function CreateReport() {
  useScreenInit()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    category_id: '',
    deskripsi: '',
  })
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.categories.getAll()
        console.log("CATEGORIES DARI API:", data) // 🔥 TAMBAH DI SINI
        setCategories(Array.isArray(data) ? data : data.data || [])
      } catch (error) {
        toast.error('Gagal memuat kategori')
      }
    }
    fetchCategories()
  }, [])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!position) {
      toast.error('Silakan pilih lokasi pada peta')
      return
    }
    if (!file) {
      toast.error('Silakan unggah foto kerusakan')
      return
    }
    if (!formData.category_id) {
      toast.error('Silakan pilih kategori')
      return
    }
    setLoading(true)
    try {
      // Get user_id from localStorage (set when user login)
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        toast.error('Anda harus login terlebih dahulu')
        navigate('/login')
        return
      }

      // Step 1: Upload photo
      const uploadRes = await api.reports.uploadPhoto(file)
      const foto_url = uploadRes.foto_url || uploadRes.url

      // Step 2: Create report with actual user_id and category_id
      await api.reports.create({
        user_id: userId,
        category_id: String(formData.category_id),
        deskripsi: formData.deskripsi,
        latitude: position.lat,
        longitude: position.lng,
        foto_url: foto_url,
      })
      toast.success('Laporan berhasil dikirim')
      navigate('/')
    } catch (error) {
      toast.error('Gagal mengirim laporan')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-white">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <PlusCircle className="w-5 h-5 mr-2 text-blue-600" />
              Buat Laporan Baru
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Laporkan kerusakan fasilitas umum di sekitar Anda untuk segera
              ditindaklanjuti.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Foto Kerusakan
              </label>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-blue-400 transition-colors bg-slate-50">
                <div className="space-y-1 text-center">
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="mx-auto h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null)
                          setPreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1"
                        >
                          <span>Unggah foto</span>

                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Category */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Kategori Fasilitas
                </label>
                <select
                  id="category"
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border shadow-sm"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_id: e.target.value,
                    })
                  }
                >
                  <option value="">Pilih Kategori...</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                      {cat.nama || cat.name}
                    </option>
                  ))}
                  {/* Fallback if API fails or empty */}
                </select>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="deskripsi"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Deskripsi Detail
                </label>
                <textarea
                  id="deskripsi"
                  rows={4}
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-slate-300 rounded-lg p-3"
                  placeholder="Jelaskan detail kerusakan yang terjadi..."
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deskripsi: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Map Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                Tandai Lokasi di Peta
              </label>
              <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm relative">
                {!position && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm pointer-events-none">
                    Klik pada peta untuk menandai lokasi
                  </div>
                )}
                <MapContainer
                  center={PEKANBARU_CENTER}
                  zoom={13}
                  style={{
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <LocationPicker
                    position={position}
                    setPosition={setPosition}
                  />
                </MapContainer>
              </div>
              {position && (
                <p className="mt-2 text-xs text-slate-500">
                  Koordinat: {position.lat.toFixed(6)},{' '}
                  {position.lng.toFixed(6)}
                </p>
              )}
            </div>

            {/* MAP COMPONENT PLACEHOLDER */}
            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />{' '}
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" /> Kirim Laporan
                  </>
                )}
              </button>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => navigate(-1)}
              >
                <X className="h-5 w-5 mr-2" /> Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Kirim Laporan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
