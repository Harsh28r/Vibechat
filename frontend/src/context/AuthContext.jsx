import { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          avatar: firebaseUser.photoURL
        };
        
        setUser(userData);
        
        // Store Firebase ID token for backend authentication
        try {
          const idToken = await firebaseUser.getIdToken();
          localStorage.setItem('firebaseToken', idToken);
        } catch (error) {
          console.error('Error getting Firebase token:', error);
        }
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('firebaseToken');
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription
  }, []);

  // Email/Password Signup
  const signup = async (userData) => {
    try {
      const { username, email, password } = userData;
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with username
      await firebaseUpdateProfile(result.user, {
        displayName: username
      });
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: error.message || 'Signup failed' 
      };
    }
  };

  // Email/Password Login
  const login = async (credentials) => {
    try {
      const { email, password } = credentials;
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        message: error.message || 'Google login failed' 
      };
    }
  };

  // Facebook Login
  const loginWithFacebook = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      return { success: true };
    } catch (error) {
      console.error('Facebook login error:', error);
      return { 
        success: false, 
        message: error.message || 'Facebook login failed' 
      };
    }
  };

  // Guest Login (keep for backward compatibility)
  const loginAsGuest = () => {
    // Set a guest user
    setUser({
      uid: 'guest-' + Date.now(),
      username: 'Guest',
      displayName: 'Guest User',
      isGuest: true
    });
    return { success: true };
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: profileData.displayName || profileData.username,
          photoURL: profileData.avatar
        });
        
        // Update local user state
        setUser(prev => ({
          ...prev,
          ...profileData
        }));
        
        return { success: true };
      }
      return { success: false, message: 'No user logged in' };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.message || 'Update failed'
      };
    }
  };

  const value = {
    user,
    token: user?.uid, // Use Firebase UID as token
    loading,
    signup,
    login,
    loginWithGoogle,
    loginWithFacebook,
    loginAsGuest,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
