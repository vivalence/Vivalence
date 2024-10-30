#!/bin/bash

# Paths to the new certificate and key
CERT_PATH="/etc/letsencrypt/live/vivalence.com/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/vivalence.com/privkey.pem"
KONG_YML_PATH="/opt/server/supabase/volumes/api/kong.yml"

# Number of days before certificate expiration to renew
RENEW_DAYS=30

# Get the expiration date of the certificate
CERT_EXPIRATION_DATE=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2-)

# Calculate the current date in seconds since epoch
CURRENT_DATE=$(date +%s)

# Calculate the expiration date in seconds since epoch
CERT_EXPIRATION_SECONDS=$(date -d "$CERT_EXPIRATION_DATE" +%s)

# Calculate the number of days until expiration
DAYS_UNTIL_EXPIRATION=$(( ($CERT_EXPIRATION_SECONDS - $CURRENT_DATE) / 86400 ))

# Check if the certificate needs to be renewed
if [ $DAYS_UNTIL_EXPIRATION -lt $RENEW_DAYS ]; then
    # Certificate needs to be renewed
    sudo certbot renew

    # Read the new cert and key into variables
    NEW_CERT_CONTENT=$(cat "${CERT_PATH}")
    NEW_KEY_CONTENT=$(cat "${KEY_PATH}")

    # Replace the content of certificates in the kong.yml
    yq eval ".certificates[].cert = \"${NEW_CERT_CONTENT}\"" -i "${KONG_YML_PATH}"
    yq eval ".certificates[].key = \"${NEW_KEY_CONTENT}\"" -i "${KONG_YML_PATH}"

    docker compose restart kong

    echo "Certificate renewed and Kong restarted"
else
    echo "Certificate does not need to be renewed yet. Days until expiration: $DAYS_UNTIL_EXPIRATION"
fi
