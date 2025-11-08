#!/bin/bash
# Auto-deploy script - Run after Xcode installation completes

echo "🚀 Deploying Voice Room fixes..."

# Check if Git is available
if ! git --version &> /dev/null; then
    echo "❌ Git still not available. Please wait for Xcode installation to complete."
    exit 1
fi

echo "✅ Git is ready"

# Add and commit the changes
echo "📦 Staging changes..."
git add src/VoiceRoom.tsx src/deploymentTest.ts

echo "💾 Committing voice room fixes..."
git commit -m "🔧 Fix: Voice room participant visibility issue

- Remove timeout logic causing offline mode
- Add real-time participant sync debugging  
- Enhance connection status indicators
- Improve WebRTC peer connection handling
- Add comprehensive error handling
- Include debug panel for troubleshooting

Fixes issue where users could only see themselves in voice room."

echo "🚀 Pushing to deploy..."
# Check if remote exists
if git remote get-url origin &> /dev/null; then
    git push origin main
    echo "✅ Deployed! Check Vercel dashboard for build status."
else
    echo "⚠️  No remote repository configured."
    echo "   Set up GitHub integration first, then run this script."
fi