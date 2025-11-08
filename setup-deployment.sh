#!/bin/bash

# Vercel Auto-Deployment Setup Script
# This script sets up automatic deployment to Vercel when you push code

echo "🚀 Setting up Vercel Auto-Deployment..."

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Make sure you're in the project root."
    exit 1
fi

# Check if Git is available
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git (Xcode Command Line Tools)..."
    xcode-select --install
    echo "⏳ Please complete the Xcode Command Line Tools installation, then run this script again."
    exit 1
fi

echo "✅ Git is available"

# Initialize Git if not already done
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
fi

# Check if there's already a remote
if git remote | grep -q origin; then
    echo "✅ Git remote 'origin' already exists"
    git remote -v
else
    echo "⚠️  No Git remote found. You'll need to:"
    echo "   1. Create a GitHub repository"
    echo "   2. Add it as origin: git remote add origin <your-repo-url>"
    echo ""
    echo "🔗 Quick GitHub setup:"
    echo "   - Go to https://github.com/new"
    echo "   - Create a new repository named 'ashramam-fresh'"
    echo "   - Copy the repository URL"
    echo ""
    read -p "📝 Enter your GitHub repository URL (or press Enter to skip): " repo_url
    
    if [ ! -z "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo "✅ Added remote origin: $repo_url"
    fi
fi

# Set up gitignore if it doesn't exist or is incomplete
if [ ! -f ".gitignore" ]; then
    echo "📄 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Vercel
.vercel

# Firebase
.firebase
firebase-debug.log*
.firebaserc

# IDE
.vscode/
.idea/

# OS
Thumbs.db
EOF
fi

# Check current status
echo ""
echo "📊 Current Git Status:"
git status --porcelain

# Add and commit current changes
echo ""
echo "📦 Staging current changes..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Setup: Fix voice room participant visibility and add auto-deployment"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. If you added a GitHub remote, push your code:"
echo "   git push -u origin main"
echo ""
echo "2. Connect your GitHub repo to Vercel:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Click 'Add New Project'"
echo "   - Import your GitHub repository"
echo "   - Vercel will automatically deploy on every push"
echo ""
echo "3. For manual deployment without GitHub:"
echo "   - Use 'vercel' command (install with: npm i -g vercel)"
echo "   - Or upload files directly at vercel.com"
echo ""
echo "🔄 Auto-deployment will work once GitHub repo is connected to Vercel!"