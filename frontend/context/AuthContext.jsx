'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isConfigured: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  authModalOpen: false,
  setAuthModalOpen: () => {},
  authMode: 'login',
  setAuthMode: () => {},
  extensionModalOpen: false,
  setExtensionModalOpen: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      // Check if local demo user is saved in localStorage
      try {
        const localUser = localStorage.getItem('tracex_demo_user');
        if (localUser) {
          const parsed = JSON.parse(localUser);
          setUser(parsed);
          setSession({ user: parsed });
        }
      } catch (e) {
        // ignore
      }
      setLoading(false);
      return;
    }

    // Supabase session listener
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (err) {
        console.warn('Supabase getSession error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [configured]);

  // Sign in with email and password
  const signIn = async (email, password) => {
    if (!configured) {
      // Demo / offline mode sign in
      const mockUser = {
        id: 'demo-user-123',
        email: email.trim(),
        user_metadata: { name: email.split('@')[0] },
        created_at: new Date().toISOString(),
        isDemo: true,
      };
      setUser(mockUser);
      setSession({ user: mockUser });
      try {
        localStorage.setItem('tracex_demo_user', JSON.stringify(mockUser));
      } catch (e) {}
      setAuthModalOpen(false);
      return { data: { user: mockUser, session: { user: mockUser } }, error: null };
    }

    const result = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!result.error) {
      setAuthModalOpen(false);
    }
    return result;
  };

  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    if (!configured) {
      const mockUser = {
        id: 'demo-user-' + Date.now(),
        email: email.trim(),
        user_metadata: { name: metadata.name || email.split('@')[0], ...metadata },
        created_at: new Date().toISOString(),
        isDemo: true,
      };
      setUser(mockUser);
      setSession({ user: mockUser });
      try {
        localStorage.setItem('tracex_demo_user', JSON.stringify(mockUser));
      } catch (e) {}
      setAuthModalOpen(false);
      return { data: { user: mockUser, session: { user: mockUser } }, error: null };
    }

    const result = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: metadata,
      },
    });

    if (!result.error) {
      setAuthModalOpen(false);
    }
    return result;
  };

  // Sign out
  const signOut = async () => {
    if (!configured) {
      setUser(null);
      setSession(null);
      try {
        localStorage.removeItem('tracex_demo_user');
      } catch (e) {}
      return { error: null };
    }

    const result = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        extensionModalOpen,
        setExtensionModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
