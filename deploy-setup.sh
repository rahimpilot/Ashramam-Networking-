#!/bin/bash

# Ashramam Vibes - Deployment Setup Script
echo "🚀 Setting up automatic deployment for Ashramam Vibes..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Ashramam Vibes social network"
else
    echo "✅ Git repository already initialized"
fi

# Create GitHub repository connection
echo ""
echo "🔗 GitHub Repository Setup:"
echo "Repository URL: https://github.com/rahimpilot/Ashramam-Networking-.git"
echo ""
echo "📋 Next steps to connect to GitHub:"
echo "1. Create a new repository on GitHub named 'Ashramam-Networking-'"
echo "2. Run these commands:"
echo "   git remote add origin https://github.com/rahimpilot/Ashramam-Networking-.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""

# Vercel deployment setup
echo "🌐 Vercel Deployment Setup:"
echo ""
echo "📋 Steps to deploy on Vercel:"
echo ""
echo "1. Go to https://vercel.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'Import Project'"
echo "4. Connect your 'Ashramam-Networking' repository"
echo "5. Vercel will auto-detect the settings"
echo ""
echo "📝 Environment Variables to add in Vercel:"
echo "   Go to Project Settings → Environment Variables"
echo "   Add these variables from your Firebase config:"
echo ""
echo "   REACT_APP_FIREBASE_API_KEY=AIzaSyAto1Q5Bq2nHNNecCdsXLkLmpdNR2X_RdI"
echo "   REACT_APP_FIREBASE_AUTH_DOMAIN=ashramam-network.firebaseapp.com"
echo "   REACT_APP_FIREBASE_PROJECT_ID=ashramam-network"
echo "   REACT_APP_FIREBASE_STORAGE_BUCKET=ashramam-network.firebasestorage.app"
echo "   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=135445089005"
echo "   REACT_APP_FIREBASE_APP_ID=1:135445089005:web:e4205845f78ecf99291ae4"
echo ""
echo "🚀 After setup:"
echo "   - Push to main branch"
echo "   - Vercel will auto-deploy"
echo "   - Site will be live at: https://ashramam-networking.vercel.app"
echo ""
echo "✅ Deployment setup complete!"
echo ""
echo "🎯 Ready to deploy Ashramam Vibes! 🎉"
