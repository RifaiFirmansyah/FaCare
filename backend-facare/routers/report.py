from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from database import supabase
from schemas.schema import (
    LaporanBaru,
    UpdateStatusLaporan,
)
import uuid

router = APIRouter(prefix="/api/reports", tags=["Reports"])


# 1. Jalur untuk Menerima Laporan (Create)
@router.post("/")
def buat_laporan(data: LaporanBaru):
    try:
        # Memasukkan data laporan ke tabel 'reports'
        respon = (
            supabase.table("reports")
            .insert(
                {
                    "user_id": data.user_id,
                    "category_id": data.category_id,
                    "deskripsi": data.deskripsi,
                    "latitude": data.latitude,
                    "longitude": data.longitude,
                    "foto_url": data.foto_url,
                    "status": "Menunggu",  # Status default saat laporan baru masuk
                }
            )
            .execute()
        )

        return {"pesan": "Laporan berhasil dikirim!", "data": respon.data}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# 2. Jalur untuk Menampilkan Semua Laporan (Read / untuk Heatmap Peta)
@router.get("/")
def ambil_semua_laporan():
    # Menarik data laporan beserta nama kategori dan nama pelapornya
    respon = (
        supabase.table("reports")
        .select("*, categories(nama_kategori), users(nama_lengkap)")
        .execute()
    )

    return {"data": respon.data}


# 3. Jalur khusus Admin untuk mengubah status laporan
@router.put("/{report_id}")
def update_status_laporan(report_id: int, data: UpdateStatusLaporan):
    try:
        # 1. CEK KEAMANAN: Apakah user_id ini adalah admin?
        cek_admin = (
            supabase.table("users").select("role").eq("id", data.user_id).execute()
        )

        # Jika user tidak ditemukan ATAU rolenya bukan admin, tolak mentah-mentah!
        if len(cek_admin.data) == 0 or cek_admin.data[0]["role"] != "admin":
            raise HTTPException(
                status_code=403,
                detail="Akses Ditolak! Hanya Admin yang boleh mengubah status.",
            )

        # 2. Jika dia terbukti admin, baru jalankan update status
        respon = (
            supabase.table("reports")
            .update({"status": data.status})
            .eq("id", report_id)
            .execute()
        )

        if len(respon.data) == 0:
            raise HTTPException(status_code=404, detail="ID Laporan tidak ditemukan")

        return {"pesan": "Status laporan berhasil diperbarui!", "data": respon.data}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# 4. Jalur untuk memberikan Upvote (Dukungan) pada laporan
@router.post("/{report_id}/upvote")
def upvote_laporan(report_id: int):
    try:
        # a. Ambil data laporan saat ini untuk melihat jumlah upvote sekarang
        laporan = (
            supabase.table("reports")
            .select("jumlah_upvote")
            .eq("id", report_id)
            .execute()
        )

        # Jika ID laporan tidak ditemukan
        if len(laporan.data) == 0:
            raise HTTPException(status_code=404, detail="ID Laporan tidak ditemukan")

        # Ambil angka upvote saat ini
        upvote_sekarang = laporan.data[0]["jumlah_upvote"]

        # b. Update tabel dengan menambahkan angka upvote (+1)
        respon = (
            supabase.table("reports")
            .update({"jumlah_upvote": upvote_sekarang + 1})
            .eq("id", report_id)
            .execute()
        )

        return {
            "pesan": "Berhasil memberikan upvote!",
            "jumlah_upvote_baru": respon.data[0]["jumlah_upvote"],
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# 5. Jalur untuk Upload Foto Laporan
@router.post("/upload-foto")
async def upload_foto(file: UploadFile = File(...)):
    try:
        # a. Ambil ekstensi file-nya (misal: .jpg atau .png)
        ekstensi_file = file.filename.split(".")[-1]

        # b. Buat nama file unik agar tidak tertimpa jika ada nama file yang sama
        nama_file_unik = f"{uuid.uuid4()}.{ekstensi_file}"

        # c. Baca isi file-nya
        isi_file = await file.read()

        # d. Upload ke Supabase Storage (ke dalam bucket 'laporan')
        supabase.storage.from_("laporan").upload(
            path=nama_file_unik,
            file=isi_file,
            file_options={"content-type": file.content_type},
        )

        # e. Dapatkan URL Publik dari foto yang baru di-upload
        url_publik = supabase.storage.from_("laporan").get_public_url(nama_file_unik)

        return {"pesan": "Foto berhasil diunggah!", "foto_url": url_publik}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
