#!/bin/bash

# =============================================================================
# Server Setup Script for MyExamTest (Nginx + SSL)
# =============================================================================
# Run this script ONCE on your server to set up Nginx
# Usage: sudo bash server-setup.sh [domain]
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DOMAIN="${1:-ai-exam.cloud}"
WEB_ROOT="/var/www/myexamtest"
SSL_DIR="/etc/letsencrypt/live/$DOMAIN"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setting up Nginx for $DOMAIN${NC}"
echo -e "${GREEN}========================================${NC}"

# Step 1: Install Nginx
echo -e "\n${YELLOW}[1/4] Installing Nginx...${NC}"
apt update
apt install -y nginx

# Step 2: Create web directory
echo -e "\n${YELLOW}[2/4] Creating web directory...${NC}"
mkdir -p $WEB_ROOT
chown -R www-data:www-data $WEB_ROOT
chmod -R 755 $WEB_ROOT

# Step 3: SSL Check
echo -e "\n${YELLOW}[3/4] Checking SSL Certificates...${NC}"
if [ ! -f "$SSL_DIR/fullchain.pem" ]; then
    echo -e "${RED}Error: SSL certificates not found in $SSL_DIR${NC}"
    echo "You stated you have SSL certificates. Please upload them to:"
    echo "  1. Certificate + Chain -> $SSL_DIR/fullchain.pem"
    echo "  2. Private Key        -> $SSL_DIR/privkey.pem"
    echo ""
    echo -e "${YELLOW}Create directory first:${NC}"
    echo "mkdir -p $SSL_DIR"
    echo ""
    echo "Start setup again after uploading certificates."
    exit 1
fi

# Step 4: Create Nginx config
echo -e "\n${YELLOW}[4/4] Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/myexamtest << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN www.$DOMAIN;
    root /var/www/myexamtest;
    index index.html;

    # SSL Configuration
    ssl_certificate $SSL_DIR/fullchain.pem;
    ssl_certificate_key $SSL_DIR/privkey.pem;
    
    # SSL Best Practices
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle React Router - serve index.html for all routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/myexamtest /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Restart Nginx
nginx -t
systemctl restart nginx

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete for $DOMAIN!${NC}"
echo -e "${GREEN}========================================${NC}"
