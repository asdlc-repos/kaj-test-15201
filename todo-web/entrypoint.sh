#!/bin/sh

# Substitute $TODO_API_URL into nginx config template
envsubst '$TODO_API_URL' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Write runtime env for SPA — browser always uses the nginx proxy path
cat <<EOF > /usr/share/nginx/html/env.js
window.RUNTIME_TODO_API_URL = "/api";
EOF

exec "$@"
