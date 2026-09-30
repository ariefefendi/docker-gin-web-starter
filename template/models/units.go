// Package models berisi struct tabel database (GORM).
package models

import "time"

// Units adalah master satuan barang. Nama tabel: units.
type Units struct {
	ID          string    `gorm:"type:char(36);primaryKey" json:"id"`
	Reference   string    `gorm:"size:20;uniqueIndex" json:"reference"`
	Code        string    `gorm:"size:50;uniqueIndex" json:"code"`
	Name        string    `gorm:"size:100" json:"name"`
	Description *string   `json:"description"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
