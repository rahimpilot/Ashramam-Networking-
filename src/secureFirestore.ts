import { auth, db, validateUserAccess, sanitizeUserInput, checkRateLimit } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Secure Firestore operations with built-in security checks

export interface SecureDocumentData {
  id?: string;
  authorId: string;
  createdAt: any;
  updatedAt: any;
  [key: string]: any;
}

export class SecureFirestoreService {
  
  // Create document with security validation
  static async createDocument(
    collectionName: string, 
    data: Omit<SecureDocumentData, 'id' | 'createdAt' | 'updatedAt'>,
    customId?: string
  ): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    // Rate limiting check
    if (!checkRateLimit(user.uid, 30)) { // 30 requests per minute for writes
      console.error('Rate limit exceeded');
      return null;
    }

    // Validate user can create this document
    if (!validateUserAccess(data.authorId, user.uid)) {
      console.error('User not authorized to create this document');
      return null;
    }

    try {
      const secureData: SecureDocumentData = {
        ...data,
        authorId: user.uid, // Always use authenticated user's ID
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Sanitize string fields
      Object.keys(secureData).forEach(key => {
        if (typeof secureData[key] === 'string') {
          secureData[key] = sanitizeUserInput(secureData[key]);
        }
      });

      let docRef;
      if (customId) {
        docRef = doc(db, collectionName, customId);
        await setDoc(docRef, secureData);
        return customId;
      } else {
        docRef = await addDoc(collection(db, collectionName), secureData);
        return docRef.id;
      }
    } catch (error) {
      console.error('Error creating document:', error);
      return null;
    }
  }

  // Read document with security validation
  static async getDocument(collectionName: string, documentId: string): Promise<SecureDocumentData | null> {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as SecureDocumentData;
        return data;
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  // Update document with security validation
  static async updateDocument(
    collectionName: string, 
    documentId: string, 
    updates: Partial<SecureDocumentData>
  ): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    // Rate limiting check
    if (!checkRateLimit(user.uid, 20)) { // 20 updates per minute
      console.error('Rate limit exceeded');
      return false;
    }

    try {
      // First check if user owns the document
      const existingDoc = await this.getDocument(collectionName, documentId);
      if (!existingDoc || !validateUserAccess(existingDoc.authorId, user.uid)) {
        console.error('User not authorized to update this document');
        return false;
      }

      // Sanitize string fields in updates
      const sanitizedUpdates = { ...updates };
      Object.keys(sanitizedUpdates).forEach(key => {
        if (typeof sanitizedUpdates[key] === 'string') {
          sanitizedUpdates[key] = sanitizeUserInput(sanitizedUpdates[key]);
        }
      });

      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  }

  // Delete document with security validation
  static async deleteDocument(collectionName: string, documentId: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    try {
      // First check if user owns the document
      const existingDoc = await this.getDocument(collectionName, documentId);
      if (!existingDoc || !validateUserAccess(existingDoc.authorId, user.uid)) {
        console.error('User not authorized to delete this document');
        return false;
      }

      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  // Query documents with security validation
  static async queryDocuments(
    collectionName: string,
    field: string,
    operator: any,
    value: any
  ): Promise<SecureDocumentData[]> {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return [];
    }

    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      
      const documents: SecureDocumentData[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as SecureDocumentData);
      });
      
      return documents;
    } catch (error) {
      console.error('Error querying documents:', error);
      return [];
    }
  }
}

export default SecureFirestoreService;