const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function listAllUsers() {
  console.log('📋 Listing all users in the database...\n');
  
  try {
    // Get all pending users
    const pendingUsersSnapshot = await getDocs(collection(db, 'pendingUsers'));
    console.log('👥 Pending Users:');
    
    const users = [];
    
    pendingUsersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        name: userData.name || 'No name',
        collection: 'pendingUsers'
      });
    });
    
    // Get all profiles
    const profilesSnapshot = await getDocs(collection(db, 'profiles'));
    console.log('\n👤 Profile Users:');
    
    profilesSnapshot.forEach((doc) => {
      const profileData = doc.data();
      users.push({
        id: doc.id,
        email: profileData.email || 'No email',
        name: profileData.name || 'No name',
        collection: 'profiles'
      });
    });
    
    // Sort by email to identify duplicates
    users.sort((a, b) => a.email.localeCompare(b.email));
    
    console.log('\n📊 All Users (sorted by email):');
    console.log('=====================================');
    
    let currentEmail = '';
    let duplicateGroups = [];
    let currentGroup = [];
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} | ${user.name} | ${user.collection} | ID: ${user.id}`);
      
      if (user.email === currentEmail) {
        if (currentGroup.length === 1) {
          // First duplicate found, add the previous user to the group
          duplicateGroups.push(currentGroup);
        }
        currentGroup.push(user);
      } else {
        currentEmail = user.email;
        if (currentGroup.length > 1) {
          duplicateGroups[duplicateGroups.length - 1] = currentGroup;
        }
        currentGroup = [user];
      }
    });
    
    // Check for potential duplicates based on similar names
    console.log('\n🔍 Potential Duplicates Analysis:');
    console.log('===================================');
    
    const emailGroups = {};
    users.forEach(user => {
      const email = user.email.toLowerCase();
      if (!emailGroups[email]) {
        emailGroups[email] = [];
      }
      emailGroups[email].push(user);
    });
    
    // Look for patterns
    const riazUsers = users.filter(u => 
      u.email.toLowerCase().includes('riaz') || 
      u.name.toLowerCase().includes('riaz') ||
      u.name.toLowerCase().includes('riyaz')
    );
    
    const rahimUsers = users.filter(u => 
      u.email.toLowerCase().includes('raimu') || 
      u.email.toLowerCase().includes('rahim') ||
      u.name.toLowerCase().includes('rahim')
    );
    
    if (riazUsers.length > 0) {
      console.log('\n🔍 Riaz/Riyaz related users:');
      riazUsers.forEach(user => {
        console.log(`   • ${user.email} | ${user.name} | ${user.collection}`);
      });
    }
    
    if (rahimUsers.length > 0) {
      console.log('\n🔍 Rahim/Raimu related users:');
      rahimUsers.forEach(user => {
        console.log(`   • ${user.email} | ${user.name} | ${user.collection}`);
      });
    }
    
    // Check scrap posts for additional email patterns
    console.log('\n📝 Checking scrap posts for user emails...');
    const scrapPostsSnapshot = await getDocs(collection(db, 'scrapPosts'));
    const scrapEmails = new Set();
    
    scrapPostsSnapshot.forEach((doc) => {
      const postData = doc.data();
      if (postData.authorEmail) {
        scrapEmails.add(postData.authorEmail);
      }
      if (postData.replies) {
        postData.replies.forEach(reply => {
          if (reply.authorEmail) {
            scrapEmails.add(reply.authorEmail);
          }
        });
      }
    });
    
    console.log('\n📧 Unique emails found in scrap posts:');
    Array.from(scrapEmails).sort().forEach((email, index) => {
      console.log(`${index + 1}. ${email}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  }
}

// Run the analysis
listAllUsers().catch(console.error);