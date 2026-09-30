// Package controllers berisi handler HTTP: baca request, panggil service,
// kirim respons (HTML atau JSON). Tidak berisi query database langsung.
package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"myApp/go-api/config"
)

// Home menampilkan halaman dashboard (views/home.html).
func Home(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "home", config.ViewData("Dashboard", "home", nil))
}
