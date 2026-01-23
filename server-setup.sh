#!/bin/bash

# =============================================================================
# Server Setup Script for MyExamTest (Nginx + Let's Encrypt SSL)
# =============================================================================
# Run this script ONCE on your server to set up Nginx and Auto-SSL
# Usage: sudo bash server-setup.sh [domain] [email]
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DOMAIN="${1:-ai-exam.cloud}"
EMAIL="${2:-contact@ai-exam.cloud}" # Email needed for Certbot
WEB_ROOT="/var/www/myexamtest"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setting up Nginx & SSL for $DOMAIN${NC}"
echo -e "${GREEN}========================================${NC}"

# Step 1: Install Nginx & Certbot
echo -e "\n${YELLOW}[1/4] Installing Nginx & Certbot...${NC}"
apt update
apt install -y nginx certbot python3-certbot-nginx

# Step 2: Create web directory
echo -e "\n${YELLOW}[2/4] Creating web directory...${NC}"
mkdir -p $WEB_ROOT
chown -R www-data:www-data $WEB_ROOT
chmod -R 755 $WEB_ROOT

# Create index.html placeholder to avoid 403 Forbidden during initial check
echo "<h1>Deployed via Antigravity</h1>" > $WEB_ROOT/index.html

# Step 3: Configure Basic Nginx (HTTP only first)
echo -e "\n${YELLOW}[3/4] Configuring Nginx (HTTP)...${NC}"
cat > /etc/nginx/sites-available/myexamtest << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root /var/www/myexamtest;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/myexamtest /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl reload nginx

# Step 4: Request SSL Certificate
echo -e "\n${YELLOW}[4/4] Obtaining SSL Certificate...${NC}"

# Check if cert already exists
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo -e "${GREEN}Certificate already exists. Skipping request.${NC}"
else
    echo "Requesting new certificate from Let's Encrypt..."
    certbot --nginx \
        --non-interactive \
        --agree-tos \
        --redirect \
        --email "$EMAIL" \
        -d "$DOMAIN" -d "www.$DOMAIN"
fi

# Step 5: Final Nginx Adjustments (Adding React specific config)
# Certbot modifies the file, so we append/update our React routing rules if needed
# But Certbot usually keeps existing location blocks.
# We will verify and reload.

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete for $DOMAIN!${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Auto-renewal is enabled by default with Certbot."
