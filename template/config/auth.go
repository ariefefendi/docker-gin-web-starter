package config

import "github.com/gin-gonic/gin"

// AuthUser menghasilkan data user + permission untuk frontend (window.AUTH_USER).
// Padanan: auth()->user() + getFrontendPermissions() di head.blade.php.
//
// TODO: ini data contoh (semua akses diizinkan). Ganti dengan user dari
// session/JWT dan role + permission dari database.
//
// PENTING: permission di frontend hanya mengatur tampilan (tombol disabled).
// Penegakan sebenarnya harus dilakukan di sisi server (middleware per route).
func AuthUser(ctx *gin.Context) gin.H {

	allowAll := gin.H{
		"view":   true,
		"read":   true,
		"create": true,
		"update": true,
		"delete": true,
	}

	return gin.H{
		"user_id":   1,
		"role_id":   1,
		"role_name": "admin",
		"permissions": gin.H{
			// key = nama module (sama dengan segmen URL, "-" menjadi "_")
			"units": allowAll,
		},
	}
}
