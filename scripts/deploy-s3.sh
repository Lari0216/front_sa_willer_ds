#!/usr/bin/env bash
# Publica o build (pasta dist/) em um bucket S3 configurado como site estático.
# Pré-requisitos: AWS CLI instalado e autenticado (aws configure).
#
# Uso:
#   S3_BUCKET=meu-bucket ./scripts/deploy-s3.sh
#   S3_BUCKET=meu-bucket CLOUDFRONT_ID=E123ABC ./scripts/deploy-s3.sh   # também invalida o cache do CloudFront
set -euo pipefail

: "${S3_BUCKET:?Defina a variável S3_BUCKET com o nome do bucket}"

npm run build

# 1) Arquivos com hash (JS/CSS/imagens): cache longo
aws s3 sync dist/ "s3://${S3_BUCKET}" --delete \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable"

# 2) index.html: sempre buscar a versão nova
aws s3 cp dist/index.html "s3://${S3_BUCKET}/index.html" \
  --cache-control "no-cache" \
  --content-type "text/html; charset=utf-8"

if [[ -n "${CLOUDFRONT_ID:-}" ]]; then
  aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_ID}" --paths "/index.html" > /dev/null
  echo "Cache do CloudFront invalidado."
fi

echo "Deploy concluído: s3://${S3_BUCKET}"
