import React, { createContext, useContext, useEffect, useState } from 'react';
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoadingUser: boolean;
  isSigningUp: boolean;
  isSigningIn: boolean;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string, fromSignup?: boolean) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const user = await account.get();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (isSigningUp) return "Please wait, signing up...";
    setIsSigningUp(true);
    try {
      await account.create(ID.unique(), email, password);
      await signIn(email, password, true); // allow signIn even if isSigningIn is true
      return null;
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof Error) {
        if (error.message.includes("429")) {
          return "Too many requests. Please wait and try again.";
        }
        return error.message;
      }
      return "An error occurred during signup";
    } finally {
      setIsSigningUp(false);
    }
  };

  const signIn = async (email: string, password: string, fromSignup: boolean = false) => {
    if (isSigningIn && !fromSignup) return "Please wait, signing in...";
    setIsSigningIn(true);
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setUser(user);
      return null;
    } catch (error) {
      console.error("Signin error:", error);
      if (error instanceof Error) {
        if (error.message.includes("429")) {
          return "Too many requests. Please wait and try again.";
        }
        return error.message;
      }
      return "An error occurred during signin";
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    if (!user) {
    console.log("User already signed out.");
    return;
  }
    try {
      await account.deleteSession("current");
      setUser(null);

    } catch (error) {
      console.log("Error during signout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingUser,
        isSigningUp,
        isSigningIn,
        signUp,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
