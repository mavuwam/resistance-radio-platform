#!/bin/bash

# Script to invalidate CloudFront cache
# Run this after deploying to ensure users get the latest version

echo "Invalidating CloudFront cache..."
echo "Distribution ID: EYKP4STY3RIHX"
echo ""

aws cloudfront create-invalidation \
  --distribution-id EYKP4STY3RIHX \
  --paths "/*" \
  --profile Personal_Account_734110488556

echo ""
echo "✓ Cache invalidation created!"
echo ""
echo "It will take 2-5 minutes for the invalidation to complete."
echo "After that, hard refresh your browser (Ctrl+Shift+R) to see the latest version."
