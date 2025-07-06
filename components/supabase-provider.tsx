"use client";

import type React from "react";
import {createContext, useContext, useState, useEffect} from "react";
import type {Session, User} from "@supabase/auth-helpers-nextjs";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

interface SupabaseContextType {
  supabase: any;
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

interface SupabaseProviderProps {
  children: React.ReactNode;
  initialSession?: Session | null;
}

export function SupabaseProvider({
  children,
  initialSession,
}: SupabaseProviderProps) {
  const [supabase] = useState(() => createClientComponentClient());
  const [session, setSession] = useState<Session | null>(
    initialSession || null
  );
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [loading, setLoading] = useState(!initialSession);

  useEffect(() => {
    const getInitialSession = async () => {
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        setLoading(false);
        return;
      }

      try {
        const {
          data: {session: currentSession},
        } = await supabase.auth.getSession();

        setSession(currentSession);
        setUser(currentSession?.user || null);
      } catch (error) {
        console.error("Error getting session:", error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, initialSession]);

  return (
    <SupabaseContext.Provider value={{supabase, session, user, loading}}>
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
