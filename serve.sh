#!/bin/bash
# Ejecutar con: ./serve.sh  (evita ENOSPC usando polling en lugar de inotify)
export CHOKIDAR_USEPOLLING=true
exec npx ng serve --proxy-config proxy.conf.json "$@"
