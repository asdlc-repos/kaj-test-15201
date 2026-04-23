#!/bin/sh
# Inject runtime env variable into env.js before starting nginx

API_URL=${TODO_API_URL:-""}

cat <<EOF > /usr/share/nginx/html/env.js
window.RUNTIME_TODO_API_URL = "${API_URL}";
EOF

exec "$@"
