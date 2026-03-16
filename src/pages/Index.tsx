import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import ResolutionTracker from "@/components/ResolutionTracker";
import AuthScreen from "@/components/AuthScreen";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Listen for auth state changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setChecking(false);
    });

    // Then get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "hsl(222 25% 7%)" }}
      >
        <div className="font-mono text-[13px]" style={{ color: "hsl(215 16% 37%)" }}>
          …
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  return <ResolutionTracker user={user} />;
}
