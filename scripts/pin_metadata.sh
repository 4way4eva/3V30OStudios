#!/usr/bin/env bash
set -e

if [[ -z "$PINATA_API_KEY" || -z "$PINATA_API_SECRET" ]]; then
  echo "Set PINATA_API_KEY and PINATA_API_SECRET as env vars"
  exit 1
fi

METADATA_DIR=${1:-metadata}
if [ ! -d "$METADATA_DIR" ]; then
  echo "Metadata dir not found: $METADATA_DIR"
  exit 1
fi

for f in "$METADATA_DIR"/*.json; do
  echo "Pinning $f"
  curl -s -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" \
    -H "pinata_api_key: $PINATA_API_KEY" \
    -H "pinata_secret_api_key: $PINATA_API_SECRET" \
    -F file=@"$f"
  echo
  done
