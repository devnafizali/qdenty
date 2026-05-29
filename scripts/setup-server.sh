#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# qdenty — one-time server setup
# Run once as a user with sudo: bash scripts/setup-server.sh
# ─────────────────────────────────────────────────────────────────
set -e

echo "╔══════════════════════════════════════════╗"
echo "║   qdenty server setup                    ║"
echo "╚══════════════════════════════════════════╝"

# ── PostgreSQL 16 ───────────────────────────────────────────────
echo ""
echo "▶ Installing PostgreSQL 16…"
sudo apt-get update -q
sudo apt-get install -y postgresql-16 postgresql-client-16

echo "▶ Creating qdenty database user and database…"
sudo -u postgres psql -c "DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'qdenty') THEN
    CREATE USER qdenty WITH PASSWORD 'qdenty_secret_2024';
  END IF;
END \$\$;"
sudo -u postgres psql -c "CREATE DATABASE qdenty_db OWNER qdenty;" 2>/dev/null || echo "   (database already exists)"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE qdenty_db TO qdenty;"
sudo -u postgres psql -c "ALTER USER qdenty CREATEDB;"

# Allow local connections with password
PG_HBA=$(sudo -u postgres psql -t -c "SHOW hba_file;" | tr -d ' ')
echo "host  qdenty_db  qdenty  127.0.0.1/32  scram-sha-256" | sudo tee -a "$PG_HBA" > /dev/null
sudo systemctl reload postgresql

echo "   ✓  PostgreSQL ready  (port 5432)"

# ── Redis 7 ─────────────────────────────────────────────────────
echo ""
echo "▶ Installing Redis 7…"
sudo apt-get install -y redis-server

REDIS_CONF="/etc/redis/redis.conf"
# Set password
if grep -q "^requirepass" "$REDIS_CONF"; then
  sudo sed -i 's/^requirepass.*/requirepass qdenty_redis_2024/' "$REDIS_CONF"
else
  echo "requirepass qdenty_redis_2024" | sudo tee -a "$REDIS_CONF" > /dev/null
fi
# Enable persistence
sudo sed -i 's/^# save 60 1000/save 60 1/' "$REDIS_CONF" 2>/dev/null || true

sudo systemctl restart redis-server
sudo systemctl enable redis-server

echo "   ✓  Redis ready  (port 6379)"

# ── Apache reverse proxy ─────────────────────────────────────────
echo ""
echo "▶ Configuring Apache reverse proxy → Next.js :3000…"
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers

VHOST_CONF="/etc/apache2/sites-enabled/000-default.conf"
sudo tee "$VHOST_CONF" > /dev/null << 'APACHEEOF'
<VirtualHost *:80>
    ServerAdmin webmaster@localhost

    # Proxy to Next.js
    ProxyPreserveHost On
    ProxyRequests Off

    # WebSocket support (Next.js HMR + future use)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteRule /(.*) ws://localhost:3000/$1 [P,L]

    # All other traffic
    ProxyPass        / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # Forward real IP to Next.js
    RequestHeader set X-Forwarded-Proto "http"
    RequestHeader set X-Real-IP "%{REMOTE_ADDR}s"

    ErrorLog  ${APACHE_LOG_DIR}/qdenty_error.log
    CustomLog ${APACHE_LOG_DIR}/qdenty_access.log combined
</VirtualHost>
APACHEEOF

sudo systemctl reload apache2
echo "   ✓  Apache configured  (port 80 → 3000)"

# ── PM2 (process manager) ────────────────────────────────────────
echo ""
echo "▶ Installing PM2 globally…"
sudo npm install -g pm2 2>/dev/null || true
echo "   ✓  PM2 installed"

echo ""
echo "═══════════════════════════════════════════"
echo "  Setup complete!  Next steps:"
echo ""
echo "  1. cd /var/www/html/qdenty"
echo "  2. npm install"
echo "  3. npm run db:push"
echo "  4. npm run db:seed"
echo "  5. npm run build"
echo "  6. pm2 start npm --name qdenty -- start"
echo ""
echo "  Dev mode: npm run dev"
echo "═══════════════════════════════════════════"
