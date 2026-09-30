package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"myApp/go-api/config"
	"myApp/go-api/controllers/master_data"
	"myApp/go-api/middleware"
)

// RegisterAPI mendaftarkan route JSON (/health dan /api/...).
func RegisterAPI(r *gin.Engine, db *gorm.DB) {

	// GET /health -> cek aplikasi + koneksi database
	r.GET("/health", func(c *gin.Context) {
		sqlDB, err := db.DB()
		if err == nil {
			err = sqlDB.PingContext(c.Request.Context())
		}
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status": "error", "database": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok", "database": "connected"})
	})

	api := r.Group("/api")

	// CORS hanya aktif jika CORS_ORIGIN diisi di .env (mis. http://localhost:3000)
	if origin := config.Env("CORS_ORIGIN", ""); origin != "" {
		api.Use(middleware.CORS(origin))
	}

	// ---------- Master Data : Units ----------
	units := master_data.NewUnitsController(db)
	g := api.Group("/master-data/units")
	{
		g.GET("/data", units.GetDataAll)      // datatable server side
		g.GET("/select", units.GetDataSelect) // satu data (?reference=)
		g.POST("", units.Insert)              // tambah
		g.PUT("", units.Update)               // ubah
		g.DELETE("", units.Destroy)           // hapus (?reference=)
	}
}
