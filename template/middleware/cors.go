// Package middleware berisi fungsi yang berjalan sebelum controller.
package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORS mengizinkan request lintas origin ke route API.
// Dipakai jika frontend terpisah (mis. React) memanggil API ini.
// Aplikasi web yang sama-origin tidak membutuhkannya.
func CORS(allowOrigin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		h := c.Writer.Header()
		h.Set("Access-Control-Allow-Origin", allowOrigin)
		h.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		h.Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
