#!/bin/bash

# Build script for all 5 new theme variations
# This script builds each theme with its corresponding CSS file

set -e

echo "========================================="
echo "  Building All Theme Variations"
echo "========================================="
echo ""

# Array of theme names
themes=("magazine-editorial" "card-masonry" "fullscreen-sections" "sidebar-navigation" "split-screen-hero")

# Build each theme
for theme in "${themes[@]}"; do
  echo "Building theme: $theme"
  echo "---"
  
  # Copy the theme CSS to index.css temporarily
  cp "frontend/src/themes/${theme}.css" "frontend/src/index.css"
  
  # Build the frontend
  cd frontend
  npm run build
  cd ..
  
  # Move the build to the theme-specific directory
  rm -rf "frontend/dist-${theme}"
  mv "frontend/dist" "frontend/dist-${theme}"
  
  echo "✓ Built: frontend/dist-${theme}"
  echo ""
done

echo "========================================="
echo "  All Themes Built Successfully!"
echo "========================================="
echo ""
echo "Theme build directories:"
for theme in "${themes[@]}"; do
  echo "  - frontend/dist-${theme}"
done
echo ""
echo "Next steps:"
echo "  1. Clean up old test environments: cd aws/deployment && ./cleanup-test-environments.sh"
echo "  2. Set up new infrastructure: ./setup-test-environments.sh"
echo "  3. Deploy all themes: ./deploy-all-themes.sh"
