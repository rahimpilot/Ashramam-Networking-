const { initializeApp } = require('firebase/app');
const { getFirestore, doc, deleteDoc } = require('firebase/firestore');

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

async function removeDuplicatePendingUsers() {
  console.log('🧹 Cleaning up duplicate pending users...\n');
  
  try {
    // Remove duplicate pending user entries (keep the ones that have profiles)
    
    // For Rahim Hamza - remove the duplicate without profile
    console.log('👤 Cleaning up Rahim Hamza duplicates...');
    const rahimDuplicateId = 'VC3zNuodIVchq6oTvxzIkl5vI8C2'; // This one doesn't have a profile
    await deleteDoc(doc(db, 'pendingUsers', rahimDuplicateId));
    console.log('✅ Removed duplicate Rahim Hamza pending user (ID: VC3zNuodIVchq6oTvxzIkl5vI8C2)');
    
    // For Riaz - remove the duplicate without profile
    console.log('\n👤 Cleaning up Riaz duplicates...');
    const riazDuplicateId = '0yXf2op0tAUM7A9UkYDYRievTC03'; // This one doesn't have a profile
    await deleteDoc(doc(db, 'pendingUsers', riazDuplicateId));
    console.log('✅ Removed duplicate Riaz pending user (ID: 0yXf2op0tAUM7A9UkYDYRievTC03)');
    
    console.log('\n🎉 Cleanup completed successfully!');
    console.log('\n📋 Remaining users should now be:');
    console.log('• raimu456@gmail.com - Rahim Hamza (ID: IRKJT4NNZlRhMlC27fr9QyeZ9rt2)');
    console.log('• riaz986@gmail.com - Riyaz Ummer (ID: Tql4nx8mLUS8KxgCVBlyenSgkHg2)');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
if (require.main === module) {
  removeDuplicatePendingUsers().catch(console.error);
}

module.exports = { removeDuplicatePendingUsers };