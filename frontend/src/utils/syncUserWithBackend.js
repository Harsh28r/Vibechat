// Sync Firebase user with MongoDB backend
import axios from 'axios';

const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const syncUserWithBackend = async (firebaseUser) => {
  if (!firebaseUser) return null;

  try {
    // Get Firebase ID token
    const idToken = await firebaseUser.getIdToken();

    // Send user data to backend
    const response = await axios.post(
      `${API_URL}/api/auth/firebase-sync`,
      {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        provider: firebaseUser.providerData[0]?.providerId || 'firebase'
      },
      {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error syncing user with backend:', error);
    return null;
  }
};

export default syncUserWithBackend;



