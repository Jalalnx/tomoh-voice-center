#!/bin/bash

# One-time server provisioning for the Tomoh Voice Center SPA.
# Modelled on tomoh-platform-main/remote-setup.sh, but with the domain and
# web root fixed to this app's deploy target (see .github/workflows/deploy.yml).
#
# Run ONCE by hand on the server — never from CI:
#   sudo ./deploy/remote-setup.sh
#
# It writes the nginx vhost whose `try_files $uri $uri/ /index.html` rewrite is
# what makes the deep links in public/sitemap.xml (/bug-report, /suggestion,
# /course-request, /satisfaction, /features, /roadmap) resolve on first load.
# Without it every one of them 404s and drops out of the index.

set -e  # Exit on any error

DOMAIN="feedback.tomoh.io"
WEB_ROOT="/opt/apps/tomoh-voice"

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then
    echo "ERROR: This script must be run with sudo"
    exit 1
fi

# Get the server's public IP address
IP_ADDRESS=$(curl -s http://checkip.amazonaws.com)

echo "=========================================="
echo "Remote Setup for $DOMAIN"
echo "Web Root: $WEB_ROOT"
echo "Public IP: $IP_ADDRESS"
echo "=========================================="

echo "[1/6] Installing nginx if missing..."
if ! command -v nginx >/dev/null 2>&1; then
    apt update -qq
    apt install -y nginx
    echo "✅ Nginx installed"
else
    echo "✅ Nginx already installed"
fi

echo "[2/6] Creating web directory..."
mkdir -p "$WEB_ROOT"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"
echo "✅ Web directory ready: $WEB_ROOT"

echo "[3/6] Writing initial Nginx HTTP config for Let's Encrypt..."
cat > "/etc/nginx/sites-available/$DOMAIN" << NGINX
server {
    listen 80;
    listen [::]:80;

    server_name $DOMAIN $IP_ADDRESS;
    root $WEB_ROOT;
    index index.html index.htm;

    # SPA rewrite: react-router owns the 8 client routes.
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~ /\.well-known/acme-challenge/ {
        allow all;
    }

    access_log /var/log/nginx/${DOMAIN}_access.log;
    error_log /var/log/nginx/${DOMAIN}_error.log;
}
NGINX
echo "✅ Nginx config created for $DOMAIN"

echo "[4/6] Enabling Nginx site..."
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
echo "✅ Site enabled"

echo "[5/6] Testing and reloading nginx..."
nginx -t && systemctl reload nginx
echo "✅ Nginx reloaded"

echo "[6/6] Installing Certbot and requesting the certificate..."
if ! command -v certbot >/dev/null 2>&1; then
    apt install -y certbot python3-certbot-nginx
    echo "✅ Certbot installed"
else
    echo "✅ Certbot already installed"
fi

certbot --nginx -d "$DOMAIN" --redirect --non-interactive --agree-tos -m "admin@$DOMAIN" || {
    echo "❌ Certbot failed. Check DNS for $DOMAIN and the Nginx config."
    exit 1
}

echo ""
echo "=========================================="
echo "🎉 SETUP COMPLETED SUCCESSFULLY!"
echo "=========================================="
echo "Site: https://$DOMAIN"
echo "Web root: $WEB_ROOT"
echo "Nginx config: /etc/nginx/sites-available/$DOMAIN"
echo ""
echo "Next steps:"
echo "• Push to main — CI uploads the build to $WEB_ROOT"
echo "• Certificate auto-renewal is handled by Certbot"
echo "=========================================="
