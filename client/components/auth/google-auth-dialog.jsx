"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/hooks/use-auth";
import { authApi } from "@/lib/api-client";

// Google multi-colored G logo
export function GoogleLogo({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function GoogleAuthDialog({ open, onOpenChange, redirectUrl = "/" }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authApi.signInWithGoogle(redirectUrl);
    } catch (err) {
      console.error("Google Auth error:", err);
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    setLoading(true);
    const mockUser = {
      id: "user-1",
      name: "Alex Vance",
      email: "alex.vance@example.com",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "notebookllm_user",
        JSON.stringify({ user: mockUser, session: { id: "sess-1" } })
      );
    }

    queryClient.setQueryData(authKeys.session, {
      user: mockUser,
      session: { id: "sess-1" },
    });

    setSuccess(true);
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
      router.push(redirectUrl);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 font-mono">
        <DialogHeader className="text-center sm:text-left space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold text-base tracking-tight">
              Notebook<span className="text-primary font-bold">LM</span>
            </span>
          </div>

          <DialogTitle className="text-xl font-bold pt-2">
            Sign in with Google
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sign in to access your research notebooks, grounded sources, and personalized AI memory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Main Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-xs font-semibold text-foreground shadow-xs hover:border-primary/50 hover:bg-muted/40 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {success ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Check className="h-5 w-5" />
                <span>Signed In Successfully</span>
              </div>
            ) : loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </div>
            ) : (
              <>
                <GoogleLogo className="h-5 w-5 shrink-0" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* User Account Quick Pick */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-3 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
              Select Google Account
            </p>

            <button
              onClick={handleDemoSignIn}
              disabled={loading}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-card hover:border hover:border-primary/30 transition-all text-left cursor-pointer group"
            >
              <Avatar className="w-8 h-8 border border-border">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  A
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  Alex Vance
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  alex.vance@example.com
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Privacy & Grounding Notice */}
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground/80 px-1 pt-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-tight">
              NotebookLM never uses your private source notes or documents to train foundational AI models.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
