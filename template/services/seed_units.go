package services

import (
	"gorm.io/gorm"

	// Sesuaikan dengan baris "module" di go.mod
	"myApp/go-api/models"
)

// SeedUnits mengisi tabel units dengan data dummy.
//
// Aman dipanggil berulang: data dicek berdasarkan kolom code,
// jika sudah ada maka dilewati (tidak dobel, tidak ditimpa).
func SeedUnits(db *gorm.DB) error {

	str := func(s string) *string { return &s }

	items := []models.Units{
		{Code: "PCS", Name: "Pieces", Description: str("Satuan buah"), IsActive: true},
		{Code: "BOX", Name: "Box", Description: str("Satuan kotak"), IsActive: true},
		{Code: "PACK", Name: "Pack", Description: str("Satuan bungkus"), IsActive: true},
		{Code: "DUS", Name: "Dus", Description: str("Satuan dus / karton"), IsActive: true},
		{Code: "LSN", Name: "Lusin", Description: str("Satuan 12 buah"), IsActive: true},
		{Code: "KG", Name: "Kilogram", Description: str("Satuan berat 1000 gram"), IsActive: true},
		{Code: "GR", Name: "Gram", Description: str("Satuan berat"), IsActive: true},
		{Code: "LTR", Name: "Liter", Description: str("Satuan volume"), IsActive: true},
		{Code: "ML", Name: "Mililiter", Description: nil, IsActive: true},
		{Code: "MTR", Name: "Meter", Description: str("Satuan panjang"), IsActive: true},
		{Code: "CM", Name: "Centimeter", Description: nil, IsActive: true},
		{Code: "ROLL", Name: "Roll", Description: str("Satuan gulungan"), IsActive: true},
		{Code: "SET", Name: "Set", Description: str("Satuan paket lengkap"), IsActive: true},
		{Code: "BTL", Name: "Botol", Description: str("Satuan botol"), IsActive: true},
		{Code: "SAK", Name: "Sak", Description: str("Satuan karung"), IsActive: false},
		{Code: "UNIT", Name: "Unit", Description: str("Satuan unit barang"), IsActive: false},
	}

	for _, item := range items {

		var count int64
		if err := db.Model(&models.Units{}).
			Where("code = ?", item.Code).
			Count(&count).Error; err != nil {
			return err
		}

		if count > 0 {
			continue
		}

		item.ID = GenerateUUID()
		item.Reference = GenerateShortID("UN", 5)

		if err := db.Create(&item).Error; err != nil {
			return err
		}
	}

	return nil
}
