# Ashramam Vibes

A private social networking platform for 14 school friends built with React + Firebase.

## 🚀 Quick Start

### 1. Firebase Setup

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Choose a project name (e.g., "ashramam-network")

2. **Enable Authentication:**
   - In Firebase Console, go to **Authentication** > **Sign-in method**
   - Enable **Email/Password** provider

3. **Set up Firestore Database:**
   - Go to **Firestore Database** > **Create database**
   - Choose **Start in test mode** (you can secure it later)
   - Select a location for your database

4. **Enable Storage:**
   - Go to **Storage** > **Get started**
   - Set up Cloud Storage with default rules

5. **Get Firebase Configuration:**
   - Go to **Project Settings** (gear icon) > **General**
   - Scroll down to "Your apps" section
   - Click "Web" icon to create a web app
   - Copy the configuration object

6. **Update Firebase Config:**
   - Open `src/firebase.js`
   - Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 2. Security Rules (Optional but Recommended)

For private access, update your Firebase security rules:

**Firestore Rules** (`Firestore Database` > `Rules`):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Storage Rules** (`Storage` > `Rules`):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Development

The development server is already running! Open your browser and go to:
- **Login page:** `http://localhost:3001/login` (or whatever port it started on)
- **Feed:** `http://localhost:3001/feed` (after signing in)

### 4. Usage

1. **Sign Up:** Create an account with email/password
2. **Share Posts:** Write stories, upload photos/videos
3. **Real-time Feed:** See posts from all friends instantly
4. **Private Network:** Only authenticated users can access content

## 📁 Project Structure

```
school-friends-net/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main app with routing
│   │   ├── Login.tsx      # Authentication component
│   │   ├── Feed.tsx       # Posts feed with upload
│   │   ├── InviteCode.tsx  # Private access control
│   │   ├── firebase.js    # Firebase configuration
│   │   └── ...
│   └── package.json
└── README.md
```

## 🛠 Available Scripts

In the `client` directory:

```bash
npm start      # Start development server
npm run build  # Build for production
npm test       # Run tests
```

## 🎨 Features

- ✅ **User Authentication** - Email/password sign up and login
- ✅ **Private Access Controls** - Invite code system for exclusive access
- ✅ **User Approval System** - Admin approval required for full access
- ✅ **Real-time Posts** - Share stories, photos, and videos
- ✅ **File Uploads** - Support for images and videos
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Content Filtering** - Only approved users' posts are visible
- 🔄 **Real-time Updates** - See new posts instantly

## 🔧 Customization

### Adding More Features:

1. **Comments System:**
   - Create a `comments` collection in Firestore
   - Add comment components to posts

2. **Like Button:**
   - Add likes count to posts
   - Create like/unlike functionality

3. **User Profiles:**
   - Create user profile pages
   - Add profile pictures

4. **Memory Lane Section:**
   - Add date filtering for old posts
   - Create a "memories" component

### Styling:

The app uses Tailwind CSS classes for styling. You can:
- Modify colors in component className attributes
- Add custom CSS in `App.css`
- Install additional UI libraries if needed

## 🚀 Deployment

### Option 1: Vercel Auto-Deployment (Recommended)

**Automatic deployment** when you push to GitHub:

1. **Connect your GitHub repo to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Import Project"
   - Connect your `Ashramam-Networking` repository
   - Vercel will auto-detect the settings

2. **Set Environment Variables in Vercel:**
   - In Vercel dashboard, go to your project → Settings → Environment Variables
   - Add your Firebase config:
     ```
     REACT_APP_FIREBASE_API_KEY=your-api-key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     REACT_APP_FIREBASE_PROJECT_ID=your-project-id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
     REACT_APP_FIREBASE_APP_ID=your-app-id
     ```

3. **Deploy:**
   - Push to your `main` branch
   - Vercel will automatically build and deploy
   - Your site will be live at `https://your-project.vercel.app`

### Option 2: Manual Deployment

**Build and deploy manually:**

1. **Build the app:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel manually:**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

### Backend:

Firebase handles all backend services (auth, database, storage) - no server deployment needed!

## 🔒 Privacy & Security

This setup is designed for private use among 14 school friends:

- **Authentication Required:** All access requires sign-in
- **Private Database:** Only authenticated users can read/write
- **File Security:** Uploaded files are private to authenticated users
- **No Public Access:** Content is not indexed or accessible publicly

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify Firebase configuration is correct
3. Ensure all Firebase services are enabled
4. Check that security rules allow access

## 🎉 Next Steps

1. Set up your Firebase project and update the config
2. Share the login link with your 14 school friends
3. Start posting stories and memories!
4. Consider adding features like comments, likes, or profile pages

Happy networking! 🎓✨
