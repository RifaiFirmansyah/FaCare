# Isi dari routers/categories.py
from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter(prefix="/api/categories", tags=["Categories"])


# Jalur untuk Frontend mengambil daftar kategori untuk dropdown
@router.get("/")
def ambil_semua_kategori():
    try:
        respon = supabase.table("categories").select("*").execute()
        return {"data": respon.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
