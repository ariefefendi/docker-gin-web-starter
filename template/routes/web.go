// Package routes memetakan URL ke controller. Tidak berisi logika.
package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"myApp/go-api/controllers"
	"myApp/go-api/controllers/master_data"
)

// RegisterWeb mendaftarkan route halaman HTML.
func RegisterWeb(r *gin.Engine, db *gorm.DB) {

	r.GET("/", controllers.Home)

	units := master_data.NewUnitsController(db)
	r.GET("/master-data/units", units.Index)
}
