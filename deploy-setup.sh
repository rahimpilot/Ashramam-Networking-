#!/bin/bash

# Quick Auto-Deployment Setup
# Run this after Xcode Command Line Tools installation is complete

echo "🚀 Setting up auto-deployment for Ashramam Voice Room..."
echo ""

# Check if Git is available
if ! git --version &> /dev/null; then
    echo "❌ Git not available. Please complete Xcode Command Line Tools installation first."
    echo "   Run: xcode-select --install"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ Git is available"
echo ""

# Show current project info
echo "📋 Project Information:"
echo "   Local Path: $(pwd)"
echo "   Vercel Project: ashramam-fresh"
echo "   Project ID: prj_Hu7I27YCa7JJggnM28tYKSebYMPT"
echo ""

# Check Git status
echo "📊 Current Git Status:"
git status --short
echo ""

# Stage the voice room fix
echo "📦 Staging VoiceRoom.tsx changes..."
git add src/VoiceRoom.tsx

# Commit the changes
echo "💾 Committing voice room fixes..."
git commit -m "Fix: Voice room participant visibility and connection issues

- Remove problematic timeout logic that caused offline mode
- Add comprehensive logging for debugging participant sync
- Enhance error handling and user feedback
- Add real-time connection status indicator
- Include debug panel for troubleshooting
- Improve WebRTC peer connection management"

echo ""
echo "✅ Changes committed locally!"
echo ""

# Check for remote
if git remote | grep -q origin; then
    echo "🔗 Git remote exists:"
    git remote -v
    echo ""
    echo "🚀 To deploy, run:"
    echo "   git push origin main"
else
    echo "⚠️  No Git remote configured for auto-deployment."
    echo ""
    echo "🔧 To set up auto-deployment:"
    echo "1. Create GitHub repository at: https://github.com/new"
    echo "2. Add remote: git remote add origin <your-repo-url>"
    echo "3. Push code: git push -u origin main"
    echo "4. Connect GitHub repo to Vercel at: https://vercel.com/dashboard"
    echo ""
    echo "🔄 Alternative: Manual deployment"
    echo "   - Install Vercel CLI: npm i -g vercel"
    echo "   - Deploy: vercel --prod"
fi

echo ""
echo "📝 Next time you make changes:"
echo "   git add ."
echo "   git commit -m \"Your change description\""
echo "   git push"
echo "   ↳ Vercel will auto-deploy! 🎉"