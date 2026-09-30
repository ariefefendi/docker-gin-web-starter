// Package resources menentukan bentuk JSON yang dikirim ke client,
// sehingga struct database tidak bocor langsung ke respons.
package resources

import (
	"time"

	"myApp/go-api/models"
)

type UnitResource struct {
	ID          string    `json:"id"`
	Reference   string    `json:"reference"`
	Code        string    `json:"code"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}

func NewUnitResource(m models.Units) UnitResource {
	return UnitResource{
		ID:          m.ID,
		Reference:   m.Reference,
		Code:        m.Code,
		Name:        m.Name,
		Description: m.Description,
		IsActive:    m.IsActive,
		CreatedAt:   m.CreatedAt,
	}
}

func NewUnitCollection(items []models.Units) []UnitResource {
	out := make([]UnitResource, 0, len(items))
	for _, m := range items {
		out = append(out, NewUnitResource(m))
	}
	return out
}
