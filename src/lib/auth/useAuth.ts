/**
 * Auth binding for the Supabase session.
 *
 * Keeps a single source of truth for "is someone signed in" and exposes the
 * current user's email for UI affordances.
 */
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: sessionData }) => {
      setSession(sessionData.session);
      setIsLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return {
    session,
    isAuthenticated: session !== null,
    isLoading,
    userEmail: session?.user.email ?? null,
  };
}
