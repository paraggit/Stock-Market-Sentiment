#!/bin/bash

# Stock Market Sentiment Analyzer - Deployment Script
# This script builds and optionally deploys the application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Stock Sentiment Analyzer Deploy${NC}"
echo -e "${GREEN}================================${NC}\n"

# Function to print error and exit
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if node is installed
if ! command -v node &> /dev/null; then
    error_exit "Node.js is not installed. Please install Node.js first."
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    error_exit "npm is not installed. Please install npm first."
fi

echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install || error_exit "Failed to install dependencies"
success "Dependencies installed"

# Run build
echo ""
echo "🔨 Building application..."
npm run build || error_exit "Build failed"
success "Build completed successfully"

# Check if dist folder was created
if [ ! -d "dist" ]; then
    error_exit "Build output directory 'dist' not found"
fi

success "Build artifacts created in dist/"
echo ""

# Deployment options
echo "Choose deployment target:"
echo "1) Preview locally (vite preview)"
echo "2) Deploy to Vercel"
echo "3) Deploy to Netlify"
echo "4) Deploy to GitHub Pages"
echo "5) Skip deployment (build only)"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting local preview server..."
        npm run preview
        ;;
    2)
        echo ""
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            warning "Vercel CLI not found. Installing..."
            npm install -g vercel || error_exit "Failed to install Vercel CLI"
        fi
        vercel --prod || error_exit "Vercel deployment failed"
        success "Deployed to Vercel!"
        ;;
    3)
        echo ""
        echo "🚀 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            warning "Netlify CLI not found. Installing..."
            npm install -g netlify-cli || error_exit "Failed to install Netlify CLI"
        fi
        netlify deploy --prod --dir=dist || error_exit "Netlify deployment failed"
        success "Deployed to Netlify!"
        ;;
    4)
        echo ""
        echo "🚀 Deploying to GitHub Pages..."

        # Check if gh-pages package is installed
        if ! npm list gh-pages &> /dev/null; then
            warning "gh-pages not found. Installing..."
            npm install --save-dev gh-pages || error_exit "Failed to install gh-pages"
        fi

        # Deploy using gh-pages
        npx gh-pages -d dist || error_exit "GitHub Pages deployment failed"
        success "Deployed to GitHub Pages!"
        ;;
    5)
        echo ""
        success "Build complete. Deployment skipped."
        echo "Build output is in the dist/ directory"
        ;;
    *)
        warning "Invalid choice. Deployment skipped."
        echo "Build output is in the dist/ directory"
        ;;
esac

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment process completed!${NC}"
echo -e "${GREEN}================================${NC}"
