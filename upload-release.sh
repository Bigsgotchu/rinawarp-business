#!/bin/bash

BUCKET="rinawarp-releases/releases"
DIST="./build-output"

echo "Uploading RinaWarp releases to Cloudflare R2..."

aws s3 cp "$DIST" "s3://$BUCKET" --recursive --endpoint-url https://<YOUR_R2_ACCOUNT_ID>.r2.cloudflarestorage.com

echo "Upload complete!"