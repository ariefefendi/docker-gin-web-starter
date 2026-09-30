// Package services berisi logika bisnis dan helper.
// Package ini tidak boleh tahu soal Gin (gin.Context).
package services

import (
	"crypto/rand"
	"math/big"

	"github.com/google/uuid"
)

// GenerateUUID membuat UUID v4.
func GenerateUUID() string {
	return uuid.NewString()
}

// GenerateShortID membuat kode acak berawalan prefix.
// Contoh: GenerateShortID("UN", 5) -> "UN7K2QX"
func GenerateShortID(prefix string, length int) string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	b := make([]byte, length)
	for i := range b {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		b[i] = chars[n.Int64()]
	}
	return prefix + string(b)
}
