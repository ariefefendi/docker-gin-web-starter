// Package main adalah entry point aplikasi web Gin (MVC).
//
// Alur:
//  1. Koneksi database (config)
//  2. AutoMigrate model
//  3. Siapkan template HTML (views) dan file statis (public)
//  4. Daftarkan route web + API (routes)
//  5. Jalankan server
//
// Environment variable: lihat .env (APP_NAME, APP_PORT, GIN_MODE, DB_*, SEED, CORS_ORIGIN)
package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"myApp/go-api/config"
	"myApp/go-api/models"
	"myApp/go-api/routes"
	"myApp/go-api/services"
)

func main() {

	// ---------- Database ----------
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("db: %v", err)
	}

	// Tambahkan model baru di sini: db.AutoMigrate(&models.Units{}, &models.Xxx{})
	if err := db.AutoMigrate(&models.Units{}); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	// Isi data dummy jika SEED=true di .env (aman dipanggil berulang)
	if config.Env("SEED", "false") == "true" {
		if err := services.SeedUnits(db); err != nil {
			log.Fatalf("seed units: %v", err)
		}
	}

	// ---------- Gin ----------
	r := gin.Default()

	// Hilangkan warning "trusted all proxies" saat development.
	// Jika aplikasi di belakang reverse proxy, atur daftar proxy yang dipercaya.
	_ = r.SetTrustedProxies(nil)

	// View: template HTML dengan layout (lihat config/view.go)
	views, err := config.NewViewRenderer("views")
	if err != nil {
		log.Fatalf("views: %v", err)
	}
	r.HTMLRender = views

	// File statis: /public/css/app.css -> ./public/css/app.css
	r.Static("/public", "./public")

	// ---------- Routes ----------
	routes.RegisterWeb(r, db)
	routes.RegisterAPI(r, db)

	addr := ":" + config.Env("APP_PORT", "8000")
	log.Printf("listening on %s", addr)
	log.Fatal(r.Run(addr))
}
