from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- 1. Tambahkan ini
from routers import categories, auth, report

app = FastAPI(title="API Lapor Fasilitas Pekanbaru")

# 2. Tambahkan blok kode ini untuk membuka pintu CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Mengizinkan semua alamat frontend (React/Nextjs) mengakses API ini
    allow_credentials=True,
    allow_methods=["*"],  # Mengizinkan semua metode (GET, POST, PUT, DELETE)
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(auth.router)
app.include_router(report.router)


@app.get("/")
def read_root():
    return {"pesan": "Halo Pekanbaru! Backend FastAPI sudah rapi dan terhubung."}
