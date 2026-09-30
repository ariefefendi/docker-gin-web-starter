# Gin MVC Docker Starter Kit

Starter kit development website berbasis **Go + Gin (MVC) + GORM + MySQL**,
lengkap dengan hot reload (Air) dan phpMyAdmin. Struktur MVC dibuat otomatis
saat build pertama.

---

## Struktur Kit

```
gin-project/
├── Dockerfile
├── docker-compose.yml
├── entrypoint.sh
├── .env
├── rebuild.bat
├── template/          <- MASTER struktur MVC (disalin ke src/ saat build pertama)
└── src/               <- project Anda (kosong di awal, diisi otomatis)
```

## Struktur Project Hasil Scaffold (`src/`)

```
src/
├── main.go                        entry point (tipis)
├── go.mod / go.sum
├── config/                        database.go, view.go (renderer template + layout)
├── routes/                        web.go (halaman HTML), api.go (JSON)
├── controllers/                   home_controller.go, master_data/units_controller.go
├── models/                        struct tabel GORM
├── services/                      logika bisnis + helper (id.go, seeder)
├── resources/                     bentuk respons JSON
├── middleware/                    cors.go
├── views/                         layouts/main.html, home.html, master_data/units.html
├── public/                        css/, js/ (file statis, URL: /public/...)
├── seed_units.sql                 data dummy (impor via phpMyAdmin)
└── tmp/                           biner Air (jangan di-commit)
```

Alur request:

```
Route → Controller → Service → Model (GORM) → MySQL
                 ↘ View (HTML)  atau  Resource (JSON)
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

| Layanan              | URL                                     |
| -------------------- | --------------------------------------- |
| Dashboard            | http://localhost:8100                   |
| Units (contoh modul) | http://localhost:8100/master-data/units |
| Health check         | http://localhost:8100/health            |
| phpMyAdmin           | http://localhost:9192                   |

Port host diatur di `.env`: `HOST_APP_PORT`, `HOST_DB_PORT`, `HOST_PMA_PORT`.

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

| Perubahan                                           | Yang dilakukan                            |
| --------------------------------------------------- | ----------------------------------------- |
| File `.go` atau `.html` di `src/`                   | Tidak perlu apa-apa, Air rebuild otomatis |
| File CSS/JS di `src/public/`                        | Refresh browser (Ctrl+F5)                 |
| Dependency (`go get`)                               | Tidak perlu build image                   |
| `.env`                                              | `docker compose up -d`                    |
| `docker-compose.yml`                                | `docker compose up -d`                    |
| `Dockerfile`, `entrypoint.sh`, atau isi `template/` | `docker compose up -d --build`            |

---

## Menambah Modul Baru (contoh: categories)

1. `models/categories.go` → struct tabel, daftarkan di `AutoMigrate` (`main.go`)
2. `services/categories_service.go` → query dan aturan bisnis
3. `resources/categories_resource.go` → bentuk JSON
4. `controllers/master_data/categories_controller.go`
5. `views/master_data/categories.html` (+ `public/js/categories.js`)
6. Daftarkan route di `routes/web.go` dan `routes/api.go`
7. Tambah link menu di `views/layouts/main.html`

Pola paling mudah: salin file `units` lalu ganti namanya.

Cara pakai template HTML:

```go
ctx.HTML(http.StatusOK, "master_data/categories", config.ViewData("Categories", "categories", nil))
```

Nama template = path file di `views/` tanpa `.html`. Tiap halaman hanya mengisi
`{{define "content"}}` (dan opsional `{{define "scripts"}}`); layout ada di
`views/layouts/main.html`.

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
docker compose exec app air -c .air.toml
docker compose config
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

## Catatan

- Jangan commit `.env` berisi password sungguhan ke Git.
- Password di template ini hanya untuk development lokal.
- Aplikasi contoh belum memiliki login; tambahkan autentikasi sebelum dipakai sungguhan.
- Image ini untuk **development** (berisi toolchain Go + Air). Untuk production
  gunakan build multi-stage yang hanya membawa biner hasil kompilasi.

---

## Credits

**Gin MVC Docker Starter Kit**

Developed by: **Arif Efendi**

Copyright © 2021–2026 Arif Efendi
