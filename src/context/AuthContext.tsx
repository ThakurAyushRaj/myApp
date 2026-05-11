import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const WEB_CLIENT_ID = "355405822526-jbh4eqkgn90pgvp00mo95f25p09h4f7j.apps.googleusercontent.com";

// Configure once at module level
GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  scopes: ["https://www.googleapis.com/auth/calendar"],
  offlineAccess: true,
});

interface AuthContextType {
  googleToken: string | null;
  userName: string | null;
  userImage: string | null;
  isGoogleConnected: boolean;
  setGoogleToken: (token: string | null) => Promise<void>;
  setUserName: (name: string | null) => void;
  setUserImage: (url: string | null) => void;
  logout: () => Promise<void>;
  refreshGoogleToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple in-memory storage
let tokenStore: string | null = null;
let nameStore: string | null = null;
let imageStore: string | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [googleToken, setTokenState] = useState<string | null>(tokenStore);
  const [userName, setUserNameState] = useState<string | null>(nameStore);
  const [userImage, setUserImageState] = useState<string | null>(imageStore);

  const setUserName = (name: string | null) => {
    console.log('AuthProvider: setting user name to', name);
    nameStore = name;
    setUserNameState(name);
  };

  const setUserImage = (url: string | null) => {
    console.log('AuthProvider: setting user image');
    imageStore = url;
    setUserImageState(url);
  };

  const setGoogleToken = async (token: string | null) => {
    console.log('AuthProvider: setting google token');
    tokenStore = token;
    setTokenState(token);
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('AuthProvider: Checking for previous sign-in...');
        const userInfo = await GoogleSignin.signInSilently();
        const userObj = userInfo?.data?.user || userInfo?.user;
        
        if (userObj) {
          console.log('AuthProvider: Silent sign-in success for', userObj.name);
          setUserName(userObj.givenName || userObj.name || "User");
          setUserImage(userObj.photo || null);
          
          const tokens = await GoogleSignin.getTokens();
          if (tokens && tokens.accessToken) {
            setGoogleToken(tokens.accessToken);
          }
        } else {
          console.log('AuthProvider: Silent sign-in returned no user info');
        }
      } catch (error) {
        console.log('AuthProvider: Silent sign-in attempt failed (normal if not logged in):', error);
      }
    };

    checkUser();
  }, []);

  const refreshGoogleToken = async () => {
    try {
      console.log('AuthProvider: Refreshing google token...');
      const userInfo = await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      if (tokens && tokens.accessToken) {
        setGoogleToken(tokens.accessToken);
        return tokens.accessToken;
      }
      return null;
    } catch (error) {
      console.error('AuthProvider: Token refresh failed:', error);
      return null;
    }
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
      console.log('AuthProvider: Signed out from Google');
    } catch (e) {
      console.log('AuthProvider: Error during Google sign out', e);
    }
    tokenStore = null;
    nameStore = null;
    imageStore = null;
    setTokenState(null);
    setUserNameState(null);
    setUserImageState(null);
  };

  const isGoogleConnected = !!googleToken;

  return (
    <AuthContext.Provider value={{ googleToken, userName, userImage, isGoogleConnected, setGoogleToken, setUserName, setUserImage, logout, refreshGoogleToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
