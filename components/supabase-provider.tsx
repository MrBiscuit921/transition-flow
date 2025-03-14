"use client";

import type React from "react";

import {createContext, useContext, useState, useEffect} from "react";
import type {Session, User} from "@supabase/auth-helpers-nextjs";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

interface SupabaseContextType {
  supabase: any;
  session: Session | null;
  user: User | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export function SupabaseProvider({children}: SupabaseProviderProps) {
  const [supabase] = useState(() => createClientComponentClient());
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Update the getInitialSession function to use getUser for authentication verification
    async function getInitialSession() {
      // Get session data
      const {
        data: {session},
      } = await supabase.auth.getSession();

      setSession(session);

      // Get authenticated user data directly from Auth server
      if (session) {
        const {
          data: {user: authenticatedUser},
        } = await supabase.auth.getUser();
        setUser(authenticatedUser);
      }

      // Set up auth state change listener
      const {
        data: {subscription},
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);

        if (session) {
          // Always verify user with Auth server on state change
          const {
            data: {user: authenticatedUser},
          } = await supabase.auth.getUser();
          setUser(authenticatedUser);
        } else {
          setUser(null);
        }
      });

      // Clean up subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }

    getInitialSession();
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{supabase, session, user}}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
