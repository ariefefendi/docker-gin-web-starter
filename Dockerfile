# ==========================================================
# BASE IMAGE
# ==========================================================
FROM golang:1.26-bookworm


# ==========================================================
# INSTALL SYSTEM DEPENDENCIES
# ==========================================================
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# ==========================================================
# AIR (HOT RELOAD)
# ==========================================================
# Versi dikunci agar build tetap stabil. Air versi baru bisa
# mewajibkan Go yang lebih baru dari image ini.
# Jika ingin naik versi, naikkan juga versi Go di FROM (atas).
ARG AIR_VERSION=v1.61.7
RUN go install github.com/air-verse/air@${AIR_VERSION}


# ==========================================================
# WORKING DIRECTORY
# ==========================================================
WORKDIR /app


# ==========================================================
# TEMPLATE PROJECT (MVC)
# ==========================================================
# Isi folder template/ disalin ke /app (src/) oleh entrypoint.sh
# pada start pertama, jika src/go.mod belum ada.
# Mengubah template/ butuh build ulang image (--build).
COPY template /opt/template


# ==========================================================
# ENTRYPOINT
# ==========================================================
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# sed: buang CRLF (file dari Windows) supaya script bisa jalan di Linux
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh


# ==========================================================
# START CONTAINER
# ==========================================================
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["air", "-c", ".air.toml"]
