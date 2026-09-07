import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";

interface AccountSectionProps {
  /** Called after a navigation action, so the drawer can close itself. */
  onNavigate?: () => void;
}

export function AccountSection({ onNavigate }: AccountSectionProps) {
  const { isAuthenticated, isLoading, userEmail } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Could not sign out. Please try again.");
      return;
    }
    toast.success("Signed out");
    onNavigate?.();
    navigate({ to: "/signin", replace: true });
  }

  if (isLoading) return null;

  return (
    <div className="border-t border-border p-3">
      {isAuthenticated ? (
        <div className="space-y-2">
          <p className="truncate px-3 text-xs text-muted-foreground">{userEmail}</p>
          <Button variant="outline" className="w-full justify-start gap-3" onClick={handleSignOut}>
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start gap-3">
            <Link to="/signin" onClick={onNavigate}>
              <LogIn className="size-4" aria-hidden="true" />
              Sign in
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start gap-3">
            <Link to="/signup" onClick={onNavigate}>
              <UserPlus className="size-4" aria-hidden="true" />
              Create account
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
