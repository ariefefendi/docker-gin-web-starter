# Gin MVVM Docker Starter Kit

**Versi 2.0.0**

Starter kit development website berbasis **Go + Gin + GORM + MySQL** dengan
frontend **MVVM (Knockout.js)**, lengkap dengan hot reload (Air) dan phpMyAdmin.
Struktur project dibuat otomatis saat build pertama.

---

## Arsitektur

Backend memakai pola MVC, frontend memakai pola MVVM:

```
BROWSER                                              SERVER (Gin)
┌───────────────────────────────────────┐
│ View       HTML + data-bind           │
│    ⇅                                  │
│ ViewModel  Knockout.js                │   JSON    ┌─────────────────────────┐
│            model (global)             │ ◄───────► │ Route                   │
│            units (per halaman)        │   (AJAX)  │  → Controller           │
└───────────────────────────────────────┘           │  → Service              │
                                                    │  → Model (GORM) → MySQL │
                                                    │  → Resource (bentuk JSON)│
                                                    └─────────────────────────┘
```

| Lapisan | Isi | Lokasi |
|---|---|---|
| Model | struct GORM, service (logika bisnis), resource (bentuk JSON) | `models/`, `services/`, `resources/` |
| View | template HTML + layout | `views/` |
| ViewModel | objek Knockout: `model` (global) dan satu objek per halaman | `public/js/` |

---

## Struktur Kit

```
gin-project/
├── Dockerfile
├── docker-compose.yml
├── entrypoint.sh
├── .env
├── rebuild.bat
├── template/          <- MASTER struktur project (disalin ke src/ saat build pertama)
└── src/               <- project Anda (kosong di awal, diisi otomatis)
```

## Struktur Project Hasil Scaffold (`src/`)

```
src/
├── main.go                        entry point (tipis)
├── go.mod / go.sum
├── config/                        database.go, view.go (renderer template + layout),
│                                  auth.go (user + permission untuk frontend)
├── routes/                        web.go (halaman HTML), api.go (JSON)
├── controllers/                   home_controller.go, master_data/units_controller.go
├── models/                        struct tabel GORM
├── services/                      logika bisnis + helper (id.go, seeder)
├── resources/                     bentuk respons JSON
├── middleware/                    cors.go
├── views/
│   ├── layouts/main.html          layout: library, preloader, header
│   ├── home.html
│   └── master_data/units.html     halaman Units (HTML + data-bind)
├── public/                        URL: /public/...
│   ├── css/head.css               style preloader & permission-disabled
│   ├── js/model_head.js           objek global `model` (auth, permission, helper)
│   ├── js/applyBindings_Main.js   core Knockout (ko.applyBindings)
│   ├── js/units.js                ViewModel halaman Units
│   ├── assets/                    <- salin dari public/assets Laravel (Hope UI)
│   └── assetsadmin/               <- salin dari public/assetsadmin Laravel
├── seed_units.sql                 data dummy (impor via phpMyAdmin)
└── tmp/                           biner Air (jangan di-commit)
```

---

## Cara Kerja Build Pertama

```
docker compose up -d --build
        ↓
MySQL start + healthcheck
        ↓
entrypoint.sh
        ↓
src/go.mod ada?
   ├─ belum → go mod init
   │          salin /opt/template → src/  (file yang sudah ada tidak ditimpa)
   │          ganti nama module sesuai GO_MODULE
   │          go mod tidy
   └─ sudah → go mod download (project Anda tidak disentuh)
        ↓
buat .air.toml (jika belum ada)
        ↓
Air: build + hot reload → port 8000 (container)
```

Build pertama butuh waktu lebih lama (download dependency Go).
Pantau dengan: `docker compose logs -f app` sampai muncul `listening on :8000`.

---

## Alamat (default dari .env)

| Layanan | URL |
|---|---|
| Dashboard | http://localhost:8100 |
| Units (contoh modul) | http://localhost:8100/master-data/units |
| Health check | http://localhost:8100/health |
| phpMyAdmin | http://localhost:9192 |

Port host diatur di `.env`: `HOST_APP_PORT`, `HOST_DB_PORT`, `HOST_PMA_PORT`.

---

## Frontend MVVM (Knockout.js)

Frontend memakai Hope UI + Knockout.js + jQuery DataTables. Padanannya dengan
project Laravel:

| Laravel | Gin |
|---|---|
| `head.blade.php` + `template_admin` | `views/layouts/main.html` |
| `<script>` di `head.blade.php` (objek `model`) | `public/js/model_head.js` |
| `@extends` + `@section('content')` | `{{define "content"}}` di `views/.../*.html` |
| `<script>` di `UnitsView.blade.php` | `public/js/units.js` |
| `applyBindings_Main.js` | `public/js/applyBindings_Main.js` (tanpa perubahan) |
| `asset('x')` | `/public/x` |
| `@json(auth()->user()...)` | `config.AuthUser(ctx)` → `window.AUTH_USER` |
| `model.role + "/units/..."` | `model.api + "/master-data/units/..."` (`model.api = "/api"`) |

### Urutan script (penting)

```
library → window.AUTH_USER → model_head.js → script halaman → applyBindings_Main.js
```

Script halaman (`units.js`) harus dimuat **sebelum** `applyBindings_Main.js`,
karena `ko.applyBindings(model)` membutuhkan objek `units` sudah ada.

### Endpoint Units

| Method | URL | Fungsi |
|---|---|---|
| POST (GET) | `/api/master-data/units/data` | datatable server side |
| GET | `/api/master-data/units/select?reference=` | satu data |
| POST | `/api/master-data/units` | tambah (JSON) |
| PUT | `/api/master-data/units` | ubah (JSON, wajib `id`) |
| DELETE | `/api/master-data/units?reference=` | hapus |

### Asset vendor (wajib)

Folder `assets/` dan `assetsadmin/` **tidak termasuk** di kit ini. Salin dari
`public/` project Laravel ke `src/public/`:

```
Copy-Item -Recurse "F:\path\laravel\public\assets"      .\src\public\
Copy-Item -Recurse "F:\path\laravel\public\assetsadmin" .\src\public\
```

Tujuan penyalinan adalah folder induk `.\src\public\`, agar tidak bertumpuk
(`assetsadmin\assetsadmin`). Agar ikut ke setiap project baru, taruh di
`template/public/` lalu build ulang image.

Nama file/folder **peka huruf besar-kecil** di dalam container Linux; harus
sama persis dengan yang tertulis di `views/layouts/main.html`.

### Permission

`config/auth.go` berisi data contoh (semua akses diizinkan). Ganti dengan user
dan permission dari session/database. Permission di frontend hanya mengatur
tampilan (tombol disabled); pembatasan sebenarnya harus dipasang di server
(middleware).

### Header dan sidebar

Bagian header di `views/layouts/main.html` hanya placeholder. Tempel markup
dari `template_admin.blade.php` Anda di tempat yang sudah ditandai.

---

## Menambah Modul Baru (contoh: categories)

Backend:

1. `models/categories.go` → struct tabel, daftarkan di `AutoMigrate` (`main.go`)
2. `services/categories_service.go` → query dan aturan bisnis
3. `resources/categories_resource.go` → bentuk JSON
4. `controllers/master_data/categories_controller.go`
5. Daftarkan route di `routes/web.go` (halaman) dan `routes/api.go` (JSON)

Frontend:

6. `views/master_data/categories.html` → salin `units.html`, ganti nama objek
7. `public/js/categories.js` → salin `units.js`, ganti `units` dan URL API
8. Tambah key permission `categories` di `config/auth.go`
9. Tambah link menu di `views/layouts/main.html`

Pola paling mudah: salin file `units` lalu ganti namanya.

Cara pakai template HTML dari controller:

```go
ctx.HTML(http.StatusOK, "master_data/categories",
    config.ViewData(ctx, "Categories", "categories", nil))
```

Nama template = path file di `views/` tanpa `.html`. Argumen ke-3 (`"categories"`)
menentukan menu aktif sekaligus nama module untuk permission.

---

## Perintah Sehari-hari

```
docker compose ps
docker compose logs -f app
docker compose exec app bash
docker compose restart app
```

Menambah dependency Go:

```
docker compose exec app go get github.com/xxx/yyy
docker compose exec app go mod tidy
```

Data dummy (16 units): set `SEED=true` di `.env`, jalankan `docker compose up -d`,
lalu kembalikan ke `false` setelah data masuk. Atau impor `src/seed_units.sql`
lewat phpMyAdmin.

---

## Development

| Perubahan | Yang dilakukan |
|---|---|
| File `.go` atau `.html` di `src/` | Tidak perlu apa-apa, Air rebuild otomatis |
| File CSS/JS di `src/public/` | Refresh browser (Ctrl+F5) |
| Dependency (`go get`) | Tidak perlu build image |
| `.env` | `docker compose up -d` (bukan `restart`) |
| `docker-compose.yml` | `docker compose up -d` |
| `Dockerfile`, `entrypoint.sh`, atau isi `template/` | `docker compose up -d --build` |

---

## Mengubah Master Template

Yang disalin ke project baru adalah isi folder `template/`. Untuk mengubah
struktur default (misalnya menambah middleware login):

1. Edit file di `template/`
2. Hapus isi `src/` (kecuali `.gitkeep`) jika ingin scaffold ulang
3. `docker compose up -d --build`

> Scaffold hanya berjalan jika `src/go.mod` belum ada. Project yang sudah
> berjalan tidak ditimpa. Jika `GO_MODULE` di `.env` diubah, isi
> `template/` tetap memakai nama module `myApp/go-api`; entrypoint
> menggantinya otomatis saat menyalin.

---

## Stop / Down / Rebuild

```
docker compose stop
docker compose down
```

Rebuild total (atau jalankan `rebuild.bat`):

```
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Reset Database

**HATI-HATI!** Menghapus volume database.

```
docker compose down -v
```

---

## Project Baru dari Template

1. Salin `Dockerfile`, `docker-compose.yml`, `entrypoint.sh`, `.env`,
   `.dockerignore`, folder `template/`, dan folder `src/` kosong
2. Sesuaikan yang harus dibedakan (lihat bawah)
3. `docker compose up -d --build`

### Yang harus dibedakan per project

- `container_name` (app, MySQL, phpMyAdmin)
- `HOST_APP_PORT`, `HOST_DB_PORT`, `HOST_PMA_PORT` di `.env`
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- Nama volume (`db_data_gin`, `gin_mod_cache`)
- Nama network (`kazuya-net`)
- `GO_MODULE`, `APP_NAME`

Nama network dan volume otomatis diawali nama folder project oleh Docker
Compose. Pastikan tiap project berada di folder dengan nama berbeda.

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| 404 pada `/public/assets/...` dan `/public/assetsadmin/...`; `jQuery is not defined`, `ko is not defined` | Folder asset belum disalin | Salin `assets/` dan `assetsadmin/` ke `src/public/` (lihat bagian Asset vendor) |
| Satu file asset 404 padahal folder ada | Salinan bertumpuk, atau beda huruf besar-kecil | Cek dengan `docker compose exec app ls /app/public/assetsadmin/knockout` |
| `Error 1044 Access denied ... to database` | Volume MySQL lama dibuat dengan `.env` berbeda | `docker compose down -v` lalu `up -d --build` (data hilang), atau beri hak akses manual lewat root |
| `container name ... is already in use` | Container project lain memakai nama yang sama | `docker rm -f <nama>`, atau ubah `container_name` dan port |
| `ERR_EMPTY_RESPONSE` / port tidak menjawab | Aplikasi mati atau build gagal | `docker compose logs --tail=40 app`; baris `failed to build` atau `db: Error` menunjukkan sebabnya |
| Perubahan `.env` tidak terbaca | `restart` tidak membaca ulang `.env` | `docker compose up -d` |

---

## Catatan

- Jangan commit `.env` berisi password sungguhan ke Git.
- Password di template ini hanya untuk development lokal.
- Aplikasi contoh belum memiliki login; permission di `config/auth.go` masih
  data contoh. Tambahkan autentikasi sebelum dipakai sungguhan.
- CSRF belum aktif; meta `csrf-token` dan header `X-CSRF-TOKEN` sudah
  tersambung, tinggal isi `CSRFToken` di `config.ViewData` saat memasang middleware.
- Image ini untuk **development** (berisi toolchain Go + Air). Untuk production
  gunakan build multi-stage yang hanya membawa biner hasil kompilasi.

---

## Changelog

### v2.0.0: Frontend MVVM (Knockout.js)

- Layout Hope UI (`views/layouts/main.html`) dan objek global `model`
  (`public/js/model_head.js`)
- ViewModel per halaman (`public/js/units.js`) dengan form, list, dan
  jQuery DataTables server side
- Permission engine per modul (view, read, create, update, delete)
- `config/auth.go` mengirim user dan permission ke frontend (`window.AUTH_USER`)
- Endpoint `POST /api/master-data/units/data` untuk DataTables
- Insert dan update memakai JSON (update = PUT); `is_active` bertipe boolean
- Nama dan kode di DataTable di-escape (cegah XSS); error server tampil lewat SweetAlert
- `config.ViewData` sekarang menerima `ctx` sebagai argumen pertama
- Port host diatur lewat `HOST_APP_PORT`, `HOST_DB_PORT`, `HOST_PMA_PORT` di `.env`

Upgrade dari v1: salin asset vendor ke `public/`, lalu `docker compose up -d --build`.
Project yang sudah punya `src/go.mod` tidak ter-scaffold ulang; salin file yang
berubah dari `template/` ke `src/` secara manual.

### v1.0.0: Gin MVC

- Scaffold otomatis Gin + GORM + MySQL, hot reload Air, phpMyAdmin
- Contoh modul Units (controller, service, resource, view)

---

## Credits

**Gin MVVM Docker Starter Kit**

Developed by: **Arif Efendi**

Copyright © 2021–2026 Arif Efendi
