#!/bin/bash

# Script to view theme variations locally with a simple HTTP server

echo "🎨 Resistance Radio - Theme Viewer"
echo "=================================="
echo ""
echo "Choose a theme to view:"
echo ""
echo "1. Engagement-Centric (vibrant, interactive)"
echo "2. Informational Hub (clean, professional)"
echo "3. Multimedia Experience (cinematic)"
echo "4. Community-Driven (warm, welcoming)"
echo "5. Accessible & Responsive (high contrast)"
echo "6. Default (Compact - current design)"
echo ""
read -p "Enter theme number (1-6): " choice

case $choice in
  1)
    THEME="engagement-centric"
    THEME_NAME="Engagement-Centric"
    ;;
  2)
    THEME="informational-hub"
    THEME_NAME="Informational Hub"
    ;;
  3)
    THEME="multimedia-experience"
    THEME_NAME="Multimedia Experience"
    ;;
  4)
    THEME="community-driven"
    THEME_NAME="Community-Driven"
    ;;
  5)
    THEME="accessible-responsive"
    THEME_NAME="Accessible & Responsive"
    ;;
  6)
    THEME="default"
    THEME_NAME="Default (Compact)"
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

THEME_DIR="frontend/dist-$THEME"

if [ ! -d "$THEME_DIR" ]; then
  echo "❌ Theme directory not found: $THEME_DIR"
  echo "Please run ./build-all-themes.sh first"
  exit 1
fi

echo ""
echo "🚀 Starting server for: $THEME_NAME"
echo "📁 Directory: $THEME_DIR"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
  echo "✅ Using Python 3 HTTP server"
  echo "🌐 Open your browser to: http://localhost:8000"
  echo ""
  echo "Press Ctrl+C to stop the server"
  echo ""
  cd "$THEME_DIR" && python3 -m http.server 8000
elif command -v python &> /dev/null; then
  echo "✅ Using Python 2 HTTP server"
  echo "🌐 Open your browser to: http://localhost:8000"
  echo ""
  echo "Press Ctrl+C to stop the server"
  echo ""
  cd "$THEME_DIR" && python -m SimpleHTTPServer 8000
elif command -v php &> /dev/null; then
  echo "✅ Using PHP built-in server"
  echo "🌐 Open your browser to: http://localhost:8000"
  echo ""
  echo "Press Ctrl+C to stop the server"
  echo ""
  cd "$THEME_DIR" && php -S localhost:8000
else
  echo "❌ No suitable HTTP server found."
  echo ""
  echo "Please install one of the following:"
  echo "  - Python 3: brew install python3"
  echo "  - Node.js http-server: npm install -g http-server"
  echo ""
  echo "Or run manually:"
  echo "  cd $THEME_DIR"
  echo "  python3 -m http.server 8000"
  exit 1
fi
