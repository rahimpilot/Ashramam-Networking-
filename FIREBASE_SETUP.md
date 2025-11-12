# Firebase Realtime Database Setup for Voice Room

## 🚨 IMPORTANT: Database Rules Update Required

The voice room feature requires updated Firebase Realtime Database security rules.

### Steps to Update:

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Select your project: **ashramam-network**
3. Click **Realtime Database** in the left menu
4. Click the **Rules** tab
5. **Replace** the existing rules with the following:

```json
{
  "rules": {
    "voiceRooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

6. Click **Publish** button
7. Wait 1-2 minutes for rules to propagate
8. Refresh the voice room page

### What These Rules Do:
- Allow any authenticated user to read/write to voice rooms
- Enable real-time communication between participants
- Support WebRTC signaling (offers, answers, ICE candidates)

### Verification:
After updating rules, you should see:
- ✅ "Database Connected: ✅" in the debug info
- Participants list updating in real-time
- Voice communication working between users

### Troubleshooting:
If still showing database connection error:
1. Check browser console for detailed error messages
2. Verify you're logged in to the app
3. Confirm rules were published successfully in Firebase Console
4. Try clearing browser cache and refreshing
