#!/bin/bash

set -e

# ==========================================================
# CONFIGURATION
# ==========================================================

APP_DIR="/app"
TEMPLATE_DIR="/opt/template"

# Nama module Go (bisa diubah lewat GO_MODULE di .env)
GO_MODULE="${GO_MODULE:-myApp/go-api}"

# Nama module yang tertulis di file template.
TEMPLATE_MODULE="myApp/go-api"

cd "$APP_DIR"


# ==========================================================
# INIT PROJECT DARI TEMPLATE (GIN + GORM + MVC)
# ==========================================================
# Indikator project: go.mod
#
# Belum ada go.mod -> salin struktur MVC dari /opt/template
#                     ke src/, lalu go mod tidy.
# Sudah ada go.mod -> project Anda TIDAK ditimpa.
# ==========================================================

if [ ! -f "go.mod" ]; then

    echo "======================================"
    echo " Creating new Go (Gin MVC) project..."
    echo "======================================"

    if [ ! -d "$TEMPLATE_DIR" ]; then
        echo "ERROR: template tidak ditemukan di $TEMPLATE_DIR"
        echo "Build ulang image: docker compose up -d --build"
        exit 1
    fi

    go mod init "$GO_MODULE"

    # Salin template ke folder sementara, ganti nama module,
    # baru salin ke src/.
    TMP_DIR="$(mktemp -d)"
    cp -a "$TEMPLATE_DIR"/. "$TMP_DIR"/

    if [ "$GO_MODULE" != "$TEMPLATE_MODULE" ]; then
        find "$TMP_DIR" -type f -name '*.go' \
            -exec sed -i "s#${TEMPLATE_MODULE}#${GO_MODULE}#g" {} +
    fi

    # -n : file yang SUDAH ada di src/ tidak ditimpa
    cp -an "$TMP_DIR"/. "$APP_DIR"/
    rm -rf "$TMP_DIR"

    # Ambil semua dependency yang dipakai template
    # (gin, gorm, driver mysql, uuid).
    go mod tidy

    echo "Go (Gin MVC) project created."

else

    echo "======================================"
    echo " Existing Go project detected."
    echo "======================================"

    go mod download

fi


# ==========================================================
# AIR CONFIG (HOT RELOAD)
# ==========================================================
# poll = true dipakai karena bind mount dari Windows/macOS
# sering tidak mengirim event perubahan file.
# ==========================================================

if [ ! -f ".air.toml" ]; then

    echo "Creating .air.toml..."

cat > .air.toml <<'AIREOF'
root = "."
tmp_dir = "tmp"

[build]
  cmd = "go build -o ./tmp/main ."
  bin = "./tmp/main"
  include_ext = ["go", "tpl", "tmpl", "html"]
  exclude_dir = ["tmp", "vendor", "testdata", "public"]
  delay = 500
  poll = true
  poll_interval = 500

[log]
  time = true

[misc]
  clean_on_exit = true
AIREOF

fi

mkdir -p tmp


# ==========================================================
# INFORMATION
# ==========================================================
# Port host dibaca dari .env (HOST_*), diteruskan compose
# lewat env_file.
# ==========================================================

GREEN='\033[0;32m'
BLUE='\033[1;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""

echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}🚀 Gin MVC Docker Starter Kit${NC}"
echo -e "${GREEN}============================================================${NC}"

echo ""

echo -e "${BLUE}Application :${NC} http://localhost:${HOST_APP_PORT:-8100}"
echo -e "${BLUE}Health      :${NC} http://localhost:${HOST_APP_PORT:-8100}/health"
echo -e "${BLUE}phpMyAdmin  :${NC} http://localhost:${HOST_PMA_PORT:-9192}"

echo ""

echo -e "${YELLOW}MySQL${NC}"
echo "Host       : ${DB_HOST:-kazuya-mysql}"
echo "Port       : ${DB_PORT:-3306} (host: ${HOST_DB_PORT:-3109})"
echo "Database   : ${DB_DATABASE}"
echo "Username   : ${DB_USERNAME}"

echo ""

echo -e "${GREEN}Ready for Development 🚀${NC}"

echo ""


# ==========================================================
# START (Air / perintah dari CMD)
# ==========================================================

echo "Starting: $*"

exec "$@"
