package config

import (
	"fmt"
	"html/template"
	"io/fs"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/render"
)

// ViewRenderer memuat template HTML dengan sistem layout.
//
// Aturan folder (dir = "views"):
//
//	views/layouts/*.html   -> layout; wajib berisi {{define "layout"}}...{{end}}
//	views/home.html        -> halaman, nama: "home"
//	views/master_data/units.html -> halaman, nama: "master_data/units"
//	file berawalan "_"     -> diabaikan (untuk partial di masa depan)
//
// Setiap halaman mengisi {{define "content"}} (dan opsional {{define "scripts"}}).
// Dipakai lewat: ctx.HTML(http.StatusOK, "master_data/units", data)
type ViewRenderer struct {
	templates map[string]*template.Template
}

// NewViewRenderer memparse semua halaman + layout saat aplikasi start.
func NewViewRenderer(dir string) (*ViewRenderer, error) {

	funcs := template.FuncMap{
		"year": func() int { return time.Now().Year() },
	}

	layouts, err := filepath.Glob(filepath.Join(dir, "layouts", "*.html"))
	if err != nil {
		return nil, err
	}
	if len(layouts) == 0 {
		return nil, fmt.Errorf("tidak ada layout di %s/layouts", dir)
	}

	templates := map[string]*template.Template{}

	err = filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			if d.Name() == "layouts" {
				return filepath.SkipDir
			}
			return nil
		}
		if !strings.HasSuffix(path, ".html") || strings.HasPrefix(d.Name(), "_") {
			return nil
		}

		rel, _ := filepath.Rel(dir, path)
		name := strings.TrimSuffix(filepath.ToSlash(rel), ".html")

		files := append(append([]string{}, layouts...), path)
		t, err := template.New(name).Funcs(funcs).ParseFiles(files...)
		if err != nil {
			return fmt.Errorf("parse %s: %w", path, err)
		}
		templates[name] = t
		return nil
	})
	if err != nil {
		return nil, err
	}

	return &ViewRenderer{templates: templates}, nil
}

// Instance mengimplementasikan gin render.HTMLRender.
func (v *ViewRenderer) Instance(name string, data any) render.Render {
	t, ok := v.templates[name]
	if !ok {
		return render.String{Format: "template %q tidak ditemukan", Data: []any{name}}
	}
	return render.HTML{Template: t, Name: "layout", Data: data}
}

// ViewData membuat data dasar untuk semua halaman:
//
//	Title         judul halaman
//	Active        menu aktif sekaligus nama module (key permission)
//	AppName       nama aplikasi
//	AuthUser      data user + permission -> window.AUTH_USER
//	CurrentModule module aktif            -> window.CURRENT_MODULE
//	CSRFToken     token CSRF (kosong; isi jika memasang middleware CSRF)
//
// extra digabung di atasnya.
func ViewData(ctx *gin.Context, title, active string, extra gin.H) gin.H {
	data := gin.H{
		"Title":         title,
		"Active":        active,
		"AppName":       Env("APP_NAME", "Go Web"),
		"AuthUser":      AuthUser(ctx),
		"CurrentModule": active,
		"CSRFToken":     "",
	}
	for k, v := range extra {
		data[k] = v
	}
	return data
}
