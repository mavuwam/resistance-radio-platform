#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}GitHub Repository Creation${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI (gh) is not installed.${NC}"
    echo ""
    echo "Please install it:"
    echo "  macOS: brew install gh"
    echo "  Or visit: https://cli.github.com/"
    echo ""
    echo "After installation, run: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}Not authenticated with GitHub.${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Repository details
REPO_NAME="resistance-radio-platform"
DESCRIPTION="Zimbabwe Voice - Advocacy platform and community radio station empowering citizens to defend democracy and constitutional term limits"

echo "Creating GitHub repository: $REPO_NAME"
echo ""

# Create repository
gh repo create "$REPO_NAME" \
    --public \
    --description "$DESCRIPTION" \
    --source=. \
    --remote=origin \
    --push

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Repository created successfully!${NC}"
    echo ""
    echo "Repository URL: https://github.com/$(gh api user -q .login)/$REPO_NAME"
    echo ""
else
    echo "Failed to create repository"
    exit 1
fi
