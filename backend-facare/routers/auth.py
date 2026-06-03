from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase
from schemas.schema import RegisterUser, LoginUser  # Memanggil skema dari file sebelah

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# 2. Jalur untuk Mendaftar (Register)
@router.post("/register")
def register(user_data: RegisterUser):
    try:
        # a. Mendaftarkan email & password ke sistem Auth bawaan Supabase
        auth_response = supabase.auth.sign_up(
            {"email": user_data.email, "password": user_data.password}
        )

        # b. Mengambil ID unik yang baru saja dibuat Supabase
        user_id = auth_response.user.id

        # c. Menyimpan nama_lengkap ke tabel 'users' milik kita
        supabase.table("users").insert(
            {
                "id": user_id,
                "nama_lengkap": user_data.nama_lengkap,
                "role": "masyarakat",  # Nilai awal selalu masyarakat
            }
        ).execute()

        return {"pesan": "Registrasi berhasil!", "user_id": user_id}

    except Exception as e:
        # Jika email sudah terdaftar atau password terlalu pendek
        raise HTTPException(status_code=400, detail=str(e))


# 3. Jalur untuk Masuk (Login)
@router.post("/login")
def login(user_data: LoginUser):
    try:
        # Mengecek email dan password ke Supabase
        auth_response = supabase.auth.sign_in_with_password(
            {"email": user_data.email, "password": user_data.password}
        )

        # Jika berhasil, Supabase akan memberikan Token (kunci masuk)
        user_id = auth_response.user.id
        
        # Ambil data user dari tabel users untuk mendapatkan role dan nama
        user_data = supabase.table("users").select("*").eq("id", user_id).execute()
        
        return {
            "pesan": "Login berhasil!",
            "token": auth_response.session.access_token,
            "user_id": user_id,
            "role": user_data.data[0]["role"] if user_data.data else "masyarakat",
            "nama_lengkap": user_data.data[0]["nama_lengkap"] if user_data.data else ""
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Email atau password salah")
