const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAto1Q5Bq2nHNNecCdsXLkLmpdNR2X_RdI",
  authDomain: "ashramam-network.firebaseapp.com",
  projectId: "ashramam-network",
  storageBucket: "ashramam-network.firebasestorage.app",
  messagingSenderId: "135445089005",
  appId: "1:135445089005:web:e4205845f78ecf99291ae4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Merge duplicate profiles
async function mergeDuplicateProfiles() {
  console.log('🔄 Starting profile merge process...');
  
  // Define the duplicates to merge
  const mergeOperations = [
    {
      keepEmail: 'riaz986@gmail.com',
      duplicateEmail: 'riyazummer@gmail.com', // Assuming this might be the duplicate
      name: 'Riyaz Ummer'
    },
    {
      keepEmail: 'raimu456@gmail.com', 
      duplicateEmail: 'rahimhamza@gmail.com', // Assuming this might be the duplicate
      name: 'Rahim Hamza'
    }
  ];

  for (const operation of mergeOperations) {
    console.log(`\n📋 Processing merge for ${operation.name}...`);
    await mergeSingleProfile(operation.keepEmail, operation.duplicateEmail, operation.name);
  }
  
  console.log('\n✅ Profile merge process completed!');
}

async function mergeSingleProfile(keepEmail, duplicateEmail, userName) {
  try {
    // 1. Check both profiles exist
    const keepUserQuery = query(collection(db, 'pendingUsers'), where('email', '==', keepEmail));
    const duplicateUserQuery = query(collection(db, 'pendingUsers'), where('email', '==', duplicateEmail));
    
    const keepUserSnapshot = await getDocs(keepUserQuery);
    const duplicateUserSnapshot = await getDocs(duplicateUserQuery);
    
    if (keepUserSnapshot.empty && duplicateUserSnapshot.empty) {
      console.log(`⚠️  No users found with emails ${keepEmail} or ${duplicateEmail}`);
      return;
    }
    
    let keepUserId = null;
    let duplicateUserId = null;
    
    if (!keepUserSnapshot.empty) {
      keepUserId = keepUserSnapshot.docs[0].id;
      console.log(`✅ Found main profile: ${keepEmail} (ID: ${keepUserId})`);
    }
    
    if (!duplicateUserSnapshot.empty) {
      duplicateUserId = duplicateUserSnapshot.docs[0].id;
      console.log(`✅ Found duplicate profile: ${duplicateEmail} (ID: ${duplicateUserId})`);
    }
    
    // If we have both profiles, merge them
    if (keepUserId && duplicateUserId) {
      await mergeProfileData(keepUserId, duplicateUserId, keepEmail, duplicateEmail, userName);
      await mergeScrapPosts(keepEmail, duplicateEmail, userName);
      await mergeNotifications(keepEmail, duplicateEmail);
      
      // Delete the duplicate user
      await deleteDoc(doc(db, 'pendingUsers', duplicateUserId));
      console.log(`🗑️  Deleted duplicate user: ${duplicateEmail}`);
      
      // Delete duplicate profile if exists
      const duplicateProfileDoc = doc(db, 'profiles', duplicateUserId);
      const duplicateProfile = await getDoc(duplicateProfileDoc);
      if (duplicateProfile.exists()) {
        await deleteDoc(duplicateProfileDoc);
        console.log(`🗑️  Deleted duplicate profile: ${duplicateEmail}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error merging ${userName}:`, error);
  }
}

async function mergeProfileData(keepUserId, duplicateUserId, keepEmail, duplicateEmail, userName) {
  try {
    // Get both profile documents
    const keepProfileDoc = await getDoc(doc(db, 'profiles', keepUserId));
    const duplicateProfileDoc = await getDoc(doc(db, 'profiles', duplicateUserId));
    
    let mergedData = {};
    
    // Start with keep profile data
    if (keepProfileDoc.exists()) {
      mergedData = { ...keepProfileDoc.data() };
      console.log(`📄 Loaded main profile data for ${keepEmail}`);
    }
    
    // Merge in duplicate profile data (don't overwrite existing data)
    if (duplicateProfileDoc.exists()) {
      const duplicateData = duplicateProfileDoc.data();
      
      // Merge logic: keep existing data from main profile, only add missing fields
      Object.keys(duplicateData).forEach(key => {
        if (!mergedData[key] || mergedData[key] === '') {
          mergedData[key] = duplicateData[key];
          console.log(`📝 Merged field '${key}' from duplicate profile`);
        }
      });
    }
    
    // Ensure the merged profile has the correct email and name
    mergedData.email = keepEmail;
    mergedData.name = userName;
    
    // Update the main profile with merged data
    await setDoc(doc(db, 'profiles', keepUserId), mergedData);
    console.log(`💾 Updated merged profile for ${userName}`);
    
  } catch (error) {
    console.error('Error merging profile data:', error);
  }
}

async function mergeScrapPosts(keepEmail, duplicateEmail, userName) {
  try {
    // Find all scrap posts by the duplicate email
    const scrapPostsSnapshot = await getDocs(collection(db, 'scrapPosts'));
    let updatedPosts = 0;
    
    for (const postDoc of scrapPostsSnapshot.docs) {
      const postData = postDoc.data();
      let needsUpdate = false;
      let updatedData = { ...postData };
      
      // Update author email and name in main post
      if (postData.authorEmail === duplicateEmail) {
        updatedData.authorEmail = keepEmail;
        updatedData.author = userName;
        needsUpdate = true;
      }
      
      // Update replies array
      if (postData.replies && Array.isArray(postData.replies)) {
        updatedData.replies = postData.replies.map(reply => {
          if (reply.authorEmail === duplicateEmail) {
            return {
              ...reply,
              authorEmail: keepEmail,
              author: userName
            };
          }
          return reply;
        });
        needsUpdate = true;
      }
      
      // Update likes array
      if (postData.likes && Array.isArray(postData.likes)) {
        const duplicateIndex = postData.likes.indexOf(duplicateEmail);
        if (duplicateIndex !== -1 && !postData.likes.includes(keepEmail)) {
          updatedData.likes[duplicateIndex] = keepEmail;
          needsUpdate = true;
        } else if (duplicateIndex !== -1 && postData.likes.includes(keepEmail)) {
          // Remove duplicate like
          updatedData.likes = postData.likes.filter(email => email !== duplicateEmail);
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await updateDoc(doc(db, 'scrapPosts', postDoc.id), updatedData);
        updatedPosts++;
      }
    }
    
    console.log(`📝 Updated ${updatedPosts} scrap posts for ${userName}`);
    
  } catch (error) {
    console.error('Error merging scrap posts:', error);
  }
}

async function mergeNotifications(keepEmail, duplicateEmail) {
  try {
    // Find all notifications for the duplicate email
    const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    let updatedNotifications = 0;
    
    for (const notificationDoc of notificationsSnapshot.docs) {
      const notificationData = notificationDoc.data();
      let needsUpdate = false;
      let updatedData = { ...notificationData };
      
      // Update recipient email
      if (notificationData.userId === duplicateEmail) {
        updatedData.userId = keepEmail;
        needsUpdate = true;
      }
      
      // Update sender email
      if (notificationData.fromEmail === duplicateEmail) {
        updatedData.fromEmail = keepEmail;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await updateDoc(doc(db, 'notifications', notificationDoc.id), updatedData);
        updatedNotifications++;
      }
    }
    
    console.log(`🔔 Updated ${updatedNotifications} notifications`);
    
  } catch (error) {
    console.error('Error merging notifications:', error);
  }
}

// Run the merge process
if (require.main === module) {
  mergeDuplicateProfiles().catch(console.error);
}

module.exports = { mergeDuplicateProfiles };