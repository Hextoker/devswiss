#!/bin/bash
set -euo pipefail

# Configuraciones personalizables
BUCKET_NAME="vgroup-static-lab"
CLOUDFRONT_DISTRIBUTION_ID="E3TTVP95C4ZEC6"  # Coloca el ID si usas CloudFront
BUILD_DIR="out"

echo "🚀 Iniciando despliegue de aplicación Next.js..."

# 1. Compilar y exportar en modo estático
echo "🔧 Compilando aplicación (output: export genera ./out)..."
npm run build

# 2. Subir al bucket S3
echo "☁️ Subiendo archivos al bucket S3: $BUCKET_NAME"
aws s3 sync "$BUILD_DIR/" "s3://$BUCKET_NAME" --delete

# 3. Invalidar caché de CloudFront (opcional)
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "🧹 Invalidando caché de CloudFront: $CLOUDFRONT_DISTRIBUTION_ID"
  aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*"
fi

echo "✅ Despliegue completado exitosamente."
