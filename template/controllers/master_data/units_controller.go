package master_data

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"myApp/go-api/config"
	"myApp/go-api/resources"
	"myApp/go-api/services"
)

type UnitsController struct {
	service *services.UnitsService
}

func NewUnitsController(db *gorm.DB) *UnitsController {
	return &UnitsController{service: services.NewUnitsService(db)}
}

// unitRequest adalah body JSON untuk Insert dan Update.
type unitRequest struct {
	ID          string  `json:"id"`
	Code        string  `json:"code" binding:"required,max=50"`
	Name        string  `json:"name" binding:"required,max=100"`
	Description *string `json:"description"`
	IsActive    *bool   `json:"is_active"`
}

func (r unitRequest) input() services.UnitInput {
	return services.UnitInput{
		Code:        strings.TrimSpace(r.Code),
		Name:        strings.TrimSpace(r.Name),
		Description: r.Description,
		IsActive:    r.IsActive,
	}
}

// Index (WEB) menampilkan halaman daftar units.
func (c *UnitsController) Index(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "master_data/units", config.ViewData(ctx, "Units", "units", nil))
}

// GetDataAll (API) datatable server side.
// Parameter (query GET atau form POST dari jQuery DataTables):
// filtertext, start, length, draw.
func (c *UnitsController) GetDataAll(ctx *gin.Context) {

	// Request.FormValue membaca query string (GET) maupun body form (POST).
	filter := strings.TrimSpace(ctx.Request.FormValue("filtertext"))
	start := clamp(atoi(ctx.Request.FormValue("start"), 0), 0, 1_000_000)
	length := clamp(atoi(ctx.Request.FormValue("length"), 10), 1, 100)
	draw := atoi(ctx.Request.FormValue("draw"), 0)

	items, total, filtered, err := c.service.Paginate(filter, start, length)
	if err != nil {
		serverError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"draw":            draw,
		"RecordsTotal":    total,
		"RecordsFiltered": filtered,
		"Data":            resources.NewUnitCollection(items),
	})
}

// GetDataSelect (API) mengambil satu data. Query: reference.
func (c *UnitsController) GetDataSelect(ctx *gin.Context) {

	unit, err := c.service.FindByReference(ctx.Query("reference"))
	if err != nil {
		handleServiceError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, resources.NewUnitResource(*unit))
}

// Insert (API) menambah data baru. Body: unitRequest.
func (c *UnitsController) Insert(ctx *gin.Context) {

	var req unitRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		validationError(ctx, err.Error())
		return
	}

	if _, err := c.service.Create(req.input()); err != nil {
		handleServiceError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"result": "OK"})
}

// Update (API) mengubah data. Body: unitRequest (wajib "id").
func (c *UnitsController) Update(ctx *gin.Context) {

	var req unitRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		validationError(ctx, err.Error())
		return
	}
	if req.ID == "" {
		validationError(ctx, "id is required")
		return
	}

	if err := c.service.Update(req.ID, req.input()); err != nil {
		handleServiceError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"result": "OK"})
}

// Destroy (API) menghapus data. Query: reference.
func (c *UnitsController) Destroy(ctx *gin.Context) {

	if err := c.service.Delete(ctx.Query("reference")); err != nil {
		handleServiceError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"result": "OK"})
}

// ---------------------------------------------------------
// Helper respons error
// ---------------------------------------------------------

func handleServiceError(ctx *gin.Context, err error) {
	switch {
	case errors.Is(err, services.ErrNotFound):
		ctx.JSON(http.StatusNotFound, gin.H{
			"result": "NOT_FOUND", "message": "Data not found",
		})
	case errors.Is(err, services.ErrDuplicateCode):
		ctx.JSON(http.StatusUnprocessableEntity, gin.H{
			"result": "VALIDATION_ERROR",
			"errors": gin.H{"code": "The code has already been taken."},
		})
	default:
		serverError(ctx, err)
	}
}

func validationError(ctx *gin.Context, msg string) {
	ctx.JSON(http.StatusUnprocessableEntity, gin.H{
		"result": "VALIDATION_ERROR", "errors": msg,
	})
}

// serverError mencatat error asli di log, tetapi tidak membocorkannya ke client.
func serverError(ctx *gin.Context, err error) {
	log.Printf("units: %v", err)
	ctx.JSON(http.StatusInternalServerError, gin.H{
		"result": "ERROR", "message": "Internal server error",
	})
}

func atoi(s string, def int) int {
	n, err := strconv.Atoi(s)
	if err != nil {
		return def
	}
	return n
}

func clamp(n, min, max int) int {
	if n < min {
		return min
	}
	if n > max {
		return max
	}
	return n
}
