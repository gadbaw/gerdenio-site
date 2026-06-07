#!/bin/bash
# Static file server for the Gerdenio Manuel Center site
cd "$(dirname "$0")" || exit 1
exec python3 -m http.server "${1:-4178}"
