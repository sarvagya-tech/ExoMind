"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Lock, ArrowRight } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { GoogleLogo, GoogleAuthDialog } from "@/components/auth/google-auth-dialog";

export function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: authData, isLoading } = useAuthUser();
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);

  // If on public pages like / or /about, skip guard
  const isPublicPage = pathname === "/" || pathname === "/about";

  const isAuthenticated = !!(authData && authData.user);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPage) {
      // Prompt sign in modal
      setAuthDialogOpen(true);
    }
  }, [isLoading, isAuthenticated, isPublicPage]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background font-mono p-4">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center animate-in fade-in duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground tracking-tight">
              Exo<span className="text-primary">Mind</span> AI
            </p>
            <p className="text-xs text-muted-foreground">
              Verifying authenticated session...
            </p>
          </div>
          <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
            <div className="w-full h-full bg-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Block access and show gate)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background font-mono p-4 selection:bg-primary/20">
        <div className="max-w-md w-full rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Lock className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Authentication Required
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You must be signed in with a Google account to access private notebooks, grounded sources, and research canvas.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={() => setAuthDialogOpen(true)}
              className="w-full h-11 gap-2.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              <GoogleLogo className="h-4 w-4 bg-white rounded-full p-0.5" />
              <span>Sign In with Google</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full h-10 text-xs font-medium border-border hover:bg-muted"
            >
              <span>Explore Features & About</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground/70">
            ExoMind ensures your research notes and data are strictly private to your account.
          </p>
        </div>

        <GoogleAuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          redirectUrl={pathname && pathname !== "/" ? pathname : "/dashboard"}
        />
      </div>
    );
  }

  // 3. Authenticated - render full app
  return <>{children}</>;
}
