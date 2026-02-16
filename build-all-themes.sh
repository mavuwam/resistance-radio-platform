#!/bin/bash

# Build All Design Themes Script
# This script creates 5 separate builds, one for each design theme

echo "🎨 Building all design theme variations..."
echo ""

# Array of themes
themes=("engagement-centric" "informational-hub" "multimedia-experience" "community-driven" "accessible-responsive")
labels=("Engagement-Centric" "Informational Hub" "Multimedia Experience" "Community-Driven" "Accessible & Responsive")

# Backup original index.css
echo "📦 Backing up original index.css..."
cp frontend/src/index.css frontend/src/index.css.backup

# Build each theme
for i in "${!themes[@]}"; do
  theme="${themes[$i]}"
  label="${labels[$i]}"
  
  echo ""
  echo "🔨 Building theme $((i+1))/5: $label"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Add theme import to index.css
  echo "@import './themes/$theme.css';" | cat - frontend/src/index.css.backup > frontend/src/index.css
  
  # Build
  npm run build --workspace=frontend
  
  # Move dist folder
  if [ -d "frontend/dist" ]; then
    mv frontend/dist "frontend/dist-$theme"
    echo "✅ Build complete: frontend/dist-$theme"
  else
    echo "❌ Build failed for $theme"
  fi
done

# Build default (no theme)
echo ""
echo "🔨 Building theme 6/6: Default (Compact)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cp frontend/src/index.css.backup frontend/src/index.css
npm run build --workspace=frontend
if [ -d "frontend/dist" ]; then
  mv frontend/dist "frontend/dist-default"
  echo "✅ Build complete: frontend/dist-default"
fi

# Restore original
echo ""
echo "🔄 Restoring original index.css..."
mv frontend/src/index.css.backup frontend/src/index.css

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ All builds complete!"
echo ""
echo "📁 Build directories created:"
echo "   - frontend/dist-engagement-centric"
echo "   - frontend/dist-informational-hub"
echo "   - frontend/dist-multimedia-experience"
echo "   - frontend/dist-community-driven"
echo "   - frontend/dist-accessible-responsive"
echo "   - frontend/dist-default"
echo ""
echo "🚀 To deploy a specific theme to AWS:"
echo "   aws s3 sync frontend/dist-[theme-name]/ s3://resistance-radio-website-dev-734110488556/ --delete --profile Personal_Account_734110488556"
echo ""
echo "🔄 Then invalidate CloudFront cache:"
echo "   aws cloudfront create-invalidation --distribution-id EYKP4STY3RIHX --paths '/*' --profile Personal_Account_734110488556"
echo ""
