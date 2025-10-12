# Ashramam Vibes<<<<<<< HEAD

# Ashramam Vibes

A private social networking platform for 14 school friends built with React + Firebase.

A private social networking platform for 14 school friends built with React + Firebase.

## 🚀 Quick Start

## 🚀 Quick Start

### 1. Firebase Setup

### 1. Firebase Setup

1. **Create a Firebase Project:**

   - Go to [Firebase Console](https://console.firebase.google.com/)1. **Create a Firebase Project:**

   - Click "Add project" and follow the setup wizard   - Go to [Firebase Console](https://console.firebase.google.com/)

   - Choose a project name (e.g., "ashramam-network")   - Click "Add project" and follow the setup wizard

   - Choose a project name (e.g., "ashramam-network")

2. **Enable Authentication:**

   - In Firebase Console, go to **Authentication** > **Sign-in method**2. **Enable Authentication:**

   - Enable **Email/Password** provider   - In Firebase Console, go to **Authentication** > **Sign-in method**

   - Enable **Email/Password** provider

3. **Set up Firestore Database:**

   - Go to **Firestore Database** > **Create database**3. **Set up Firestore Database:**

   - Choose **Start in test mode** (you can secure it later)   - Go to **Firestore Database** > **Create database**

   - Select a location for your database   - Choose **Start in test mode** (you can secure it later)

   - Select a location for your database

4. **Enable Storage:**

   - Go to **Storage** > **Get started**4. **Enable Storage:**

   - Set up Cloud Storage with default rules   - Go to **Storage** > **Get started**

   - Set up Cloud Storage with default rules

5. **Get Firebase Configuration:**

   - Go to **Project Settings** (gear icon) > **General**5. **Get Firebase Configuration:**

   - Scroll down to "Your apps" section   - Go to **Project Settings** (gear icon) > **General**

   - Click "Web" icon to create a web app   - Scroll down to "Your apps" section

   - Copy the configuration object   - Click "Web" icon to create a web app

   - Copy the configuration object

6. **Update Firebase Config:**

   - Open `src/firebase.js`6. **Update Firebase Config:**

   - Replace the placeholder config with your actual Firebase config:   - Open `src/firebase.js`

   - Replace the placeholder config with your actual Firebase config:

```javascript

const firebaseConfig = {```javascript

  apiKey: "your-actual-api-key",const firebaseConfig = {

  authDomain: "your-project-id.firebaseapp.com",  apiKey: "your-actual-api-key",

  projectId: "your-project-id",  authDomain: "your-project-id.firebaseapp.com",

  storageBucket: "your-project-id.appspot.com",  projectId: "your-project-id",

  messagingSenderId: "123456789",  storageBucket: "your-project-id.appspot.com",

  appId: "your-app-id"  messagingSenderId: "123456789",

};  appId: "your-app-id"

```};

```

### 2. Security Rules (Optional but Recommended)

### 2. Security Rules (Optional but Recommended)

For private access, update your Firebase security rules:

For private access, update your Firebase security rules:

**Firestore Rules** (`Firestore Database` > `Rules`):

```**Firestore Rules** (`Firestore Database` > `Rules`):

rules_version = '2';```

service cloud.firestore {rules_version = '2';

  match /databases/{database}/documents {service cloud.firestore {

    match /{document=**} {  match /databases/{database}/documents {

      allow read, write: if request.auth != null;    match /{document=**} {

    }      allow read, write: if request.auth != null;

  }    }

}  }

```}

```

**Storage Rules** (`Storage` > `Rules`):

```**Storage Rules** (`Storage` > `Rules`):

rules_version = '2';```

service firebase.storage {rules_version = '2';

  match /b/{bucket}/o {service firebase.storage {

    match /{allPaths=**} {  match /b/{bucket}/o {

      allow read, write: if request.auth != null;    match /{allPaths=**} {

    }      allow read, write: if request.auth != null;

  }    }

}  }

```}

```

### 3. Development

### 3. Development

The development server is already running! Open your browser and go to:

- **Login page:** `http://localhost:3001/login` (or whatever port it started on)The development server is already running! Open your browser and go to:

- **Feed:** `http://localhost:3001/feed` (after signing in)- **Login page:** `http://localhost:3001/login` (or whatever port it started on)

- **Feed:** `http://localhost:3001/feed` (after signing in)

### 4. Usage

### 4. Usage

1. **Sign Up:** Create an account with email/password

2. **Share Posts:** Write stories, upload photos/videos1. **Sign Up:** Create an account with email/password

3. **Real-time Feed:** See posts from all friends instantly2. **Share Posts:** Write stories, upload photos/videos

4. **Private Network:** Only authenticated users can access content3. **Real-time Feed:** See posts from all friends instantly

4. **Private Network:** Only authenticated users can access content

## 📁 Project Structure

## 📁 Project Structure

```

school-friends-net/```

├── client/                 # React frontendschool-friends-net/

│   ├── src/├── client/                 # React frontend

│   │   ├── App.tsx        # Main app with routing│   ├── src/

│   │   ├── Login.tsx      # Authentication component│   │   ├── App.tsx        # Main app with routing

│   │   ├── Feed.tsx       # Posts feed with upload│   │   ├── Login.tsx      # Authentication component

│   │   ├── InviteCode.tsx  # Private access control│   │   ├── Feed.tsx       # Posts feed with upload

│   │   ├── firebase.js    # Firebase configuration│   │   ├── InviteCode.tsx  # Private access control

│   │   └── ...│   │   ├── firebase.js    # Firebase configuration

│   └── package.json│   │   └── ...

└── README.md│   └── package.json

```└── README.md

```

## 🛠 Available Scripts

## 🛠 Available Scripts

In the `client` directory:

In the `client` directory:

```bash

npm start      # Start development server```bash

npm run build  # Build for productionnpm start      # Start development server

npm test       # Run testsnpm run build  # Build for production

```npm test       # Run tests

```

## 🎨 Features

## 🎨 Features

- ✅ **User Authentication** - Email/password sign up and login

- ✅ **Private Access Controls** - Invite code system for exclusive access- ✅ **User Authentication** - Email/password sign up and login

- ✅ **User Approval System** - Admin approval required for full access- ✅ **Private Access Controls** - Invite code system for exclusive access

- ✅ **Real-time Posts** - Share stories, photos, and videos- ✅ **User Approval System** - Admin approval required for full access

- ✅ **File Uploads** - Support for images and videos- ✅ **Real-time Posts** - Share stories, photos, and videos

- ✅ **Responsive Design** - Works on desktop and mobile- ✅ **File Uploads** - Support for images and videos

- ✅ **Content Filtering** - Only approved users' posts are visible- ✅ **Responsive Design** - Works on desktop and mobile

- 🔄 **Real-time Updates** - See new posts instantly- ✅ **Content Filtering** - Only approved users' posts are visible

- 🔄 **Real-time Updates** - See new posts instantly

## 🔧 Customization

## 🔧 Customization

### Adding More Features:

### Adding More Features:

1. **Comments System:**

   - Create a `comments` collection in Firestore1. **Comments System:**

   - Add comment components to posts   - Create a `comments` collection in Firestore

   - Add comment components to posts

2. **Like Button:**

   - Add likes count to posts2. **Like Button:**

   - Create like/unlike functionality   - Add likes count to posts

   - Create like/unlike functionality

3. **User Profiles:**

   - Create user profile pages3. **User Profiles:**

   - Add profile pictures   - Create user profile pages

   - Add profile pictures

4. **Memory Lane Section:**

   - Add date filtering for old posts4. **Memory Lane Section:**

   - Create a "memories" component   - Add date filtering for old posts

   - Create a "memories" component

### Styling:

### Styling:

The app uses Tailwind CSS classes for styling. You can:

- Modify colors in component className attributesThe app uses Tailwind CSS classes for styling. You can:

- Add custom CSS in `App.css`- Modify colors in component className attributes

- Install additional UI libraries if needed- Add custom CSS in `App.css`

- Install additional UI libraries if needed

## 🚀 Deployment

## 🚀 Deployment

### Option 1: Vercel Auto-Deployment (Recommended)

### Option 1: Vercel Auto-Deployment (Recommended)

**Automatic deployment** when you push to GitHub:

**Automatic deployment** when you push to GitHub:

1. **Connect your GitHub repo to Vercel:**

   - Go to [vercel.com](https://vercel.com)1. **Connect your GitHub repo to Vercel:**

   - Sign up/Login with GitHub   - Go to [vercel.com](https://vercel.com)

   - Click "Import Project"   - Sign up/Login with GitHub

   - Connect your `Ashramam-Networking` repository   - Click "Import Project"

   - Vercel will auto-detect the settings   - Connect your `Ashramam-Networking` repository

   - Vercel will auto-detect the settings

2. **Set Environment Variables in Vercel:**

   - In Vercel dashboard, go to your project → Settings → Environment Variables2. **Set Environment Variables in Vercel:**

   - Add your Firebase config:   - In Vercel dashboard, go to your project → Settings → Environment Variables

     ```   - Add your Firebase config:

     REACT_APP_FIREBASE_API_KEY=your-api-key     ```

     REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com     REACT_APP_FIREBASE_API_KEY=your-api-key

     REACT_APP_FIREBASE_PROJECT_ID=your-project-id     REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com

     REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com     REACT_APP_FIREBASE_PROJECT_ID=your-project-id

     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789     REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com

     REACT_APP_FIREBASE_APP_ID=your-app-id     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789

     ```     REACT_APP_FIREBASE_APP_ID=your-app-id

     ```

3. **Deploy:**

   - Push to your `main` branch3. **Deploy:**

   - Vercel will automatically build and deploy   - Push to your `main` branch

   - Your site will be live at `https://your-project.vercel.app`   - Vercel will automatically build and deploy

   - Your site will be live at `https://your-project.vercel.app`

### Option 2: Manual Deployment

### Option 2: Manual Deployment

**Build and deploy manually:**

**Build and deploy manually:**

1. **Build the app:**

   ```bash1. **Build the app:**

   cd client   ```bash

   npm run build   cd client

   ```   npm run build

   ```

2. **Deploy to Vercel manually:**

   ```bash2. **Deploy to Vercel manually:**

   npm install -g vercel   ```bash

   vercel login   npm install -g vercel

   vercel --prod   vercel login

   ```   vercel --prod

   ```

### Backend:

### Backend:

Firebase handles all backend services (auth, database, storage) - no server deployment needed!

Firebase handles all backend services (auth, database, storage) - no server deployment needed!

## 🔒 Privacy & Security

## 🔒 Privacy & Security

This setup is designed for private use among 14 school friends:

This setup is designed for private use among 14 school friends:

- **Authentication Required:** All access requires sign-in

- **Private Database:** Only authenticated users can read/write- **Authentication Required:** All access requires sign-in

- **File Security:** Uploaded files are private to authenticated users- **Private Database:** Only authenticated users can read/write

- **No Public Access:** Content is not indexed or accessible publicly- **File Security:** Uploaded files are private to authenticated users

- **No Public Access:** Content is not indexed or accessible publicly

## 📞 Support

## 📞 Support

If you encounter issues:

If you encounter issues:

1. Check browser console for errors

2. Verify Firebase configuration is correct1. Check browser console for errors

3. Ensure all Firebase services are enabled2. Verify Firebase configuration is correct

4. Check that security rules allow access3. Ensure all Firebase services are enabled

4. Check that security rules allow access

## 🎉 Next Steps

## 🎉 Next Steps

1. Set up your Firebase project and update the config

2. Share the login link with your 14 school friends1. Set up your Firebase project and update the config

3. Start posting stories and memories!2. Share the login link with your 14 school friends

4. Consider adding features like comments, likes, or profile pages3. Start posting stories and memories!

4. Consider adding features like comments, likes, or profile pages

Happy networking! 🎓✨
Happy networking! 🎓✨
=======
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
>>>>>>> 056e20bdd4689716b4e073f8a425066b849621da
