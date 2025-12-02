#!/bin/bash
# Script para instalar manualmente las dependencias de @angular-devkit
# que npm no está instalando correctamente

cd "$(dirname "$0")"

echo "🔧 Instalando dependencias de @angular-devkit manualmente..."

# Crear directorio si no existe
mkdir -p node_modules/@angular-devkit

cd node_modules/@angular-devkit

# Función para instalar un paquete manualmente
install_package() {
    local package=$1
    local version=$2
    local dir_name=$3
    
    if [ ! -d "$dir_name" ]; then
        echo "📦 Instalando $package@$version..."
        npm pack "$package@$version" > /dev/null 2>&1
        if [ -f *.tgz ]; then
            tar -xzf *.tgz
            mv package "$dir_name"
            rm *.tgz
            echo "✅ $package instalado"
        else
            echo "❌ Error instalando $package"
        fi
    else
        echo "✅ $package ya está instalado"
    fi
}

# Instalar todos los paquetes necesarios
install_package "@angular-devkit/build-angular" "17.0.10" "build-angular"
install_package "@angular-devkit/architect" "0.1700.10" "architect"
install_package "@angular-devkit/core" "17.0.10" "core"
install_package "@angular-devkit/build-webpack" "0.1700.10" "build-webpack"

cd ../..

# Instalar dependencias faltantes
echo "📦 Instalando dependencias faltantes..."
npm install ajv@^8.17.1 --save-dev --legacy-peer-deps > /dev/null 2>&1

echo "✅ Instalación completada"
echo "💡 Ejecuta: npm install --legacy-peer-deps para instalar el resto de dependencias"

