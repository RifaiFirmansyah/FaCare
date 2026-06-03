from pydantic import BaseModel
from typing import Optional


# --- SKEMA UNTUK AUTHENTICATION ---
class RegisterUser(BaseModel):
    email: str
    password: str
    nama_lengkap: str


class LoginUser(BaseModel):
    email: str
    password: str


# --- SKEMA UNTUK Laporan (REPORTS) ---
class LaporanBaru(BaseModel):
    user_id: str
    category_id: str  # Bisa UUID atau ID dari Supabase
    deskripsi: str
    latitude: float
    longitude: float
    foto_url: Optional[str] = None


# --- SKEMA UNTUK ADMIN (UPDATE STATUS) ---
class UpdateStatusLaporan(BaseModel):
    user_id: str
    status: str  # Nilainya nanti bisa: "Sedang Diperbaiki" atau "Selesai"
