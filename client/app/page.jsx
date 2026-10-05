"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  FileText,
  MessageSquare,
  Layers,
  Brain,
  CheckCircle2,
  Globe,
  Video,
  FileCode,
  ShieldCheck,
  Zap,
  HelpCircle,
  BookOpen,
  Plus,
  Play,
  Share2,
  Lock,
  ChevronDown,
  Network,
  RotateCw,
  Check,
  ListChecks,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { GoogleLogo, GoogleAuthDialog } from "@/components/auth/google-auth-dialog";
import { APP_CONFIG } from "@/lib/constants";
import { useAuthUser } from "@/hooks/use-auth";

export default function HomePage() {
  const router = useRouter();
  const { data: authData } = useAuthUser();
  const user = authData?.user;

  const [authOpen, setAuthOpen] = React.useState(false);
  const [studioTab, setStudioTab] = React.useState("summaries");
  const [openFaq, setOpenFaq] = React.useState(null);
  const [flashcardFlipped, setFlashcardFlipped] = React.useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = React.useState(1);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleAuthOrDashboard = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-mono text-foreground selection:bg-primary/20 selection:text-primary">
      {/* 1. TOP NAVIGATION NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label={`${APP_CONFIG.name} Home`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-base sm:text-lg">
                {APP_CONFIG.brandPrefix}<span className="text-primary">{APP_CONFIG.brandSuffix}</span>
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                {APP_CONFIG.badge}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground" aria-label="Main Navigation">
            <a href="#features" className="hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#studio" className="hover:text-foreground transition-colors">
              Learning Studio
            </a>
            <a href="#use-cases" className="hover:text-foreground transition-colors">
              Use Cases
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <ModeToggle />
            {user ? (
              <Button
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-4 shadow-sm"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span>Go to Dashboard</span>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAuthOpen(true)}
                  className="hidden sm:inline-flex gap-2 text-xs font-medium border-border"
                >
                  <GoogleLogo className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleAuthOrDashboard}
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-4 shadow-sm"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 border-b border-border/60">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>TURN YOUR SOURCES INTO UNDERSTANDING</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Your sources. One intelligent workspace.
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
            Bring together PDFs, websites, YouTube videos, and notes. Ask questions, explore ideas, and turn information into knowledge you can use.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={handleAuthOrDashboard}
              className="w-full sm:w-auto h-12 px-6 gap-2.5 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md active:scale-98 transition-all"
            >
              {user ? (
                <>
                  <FolderOpen className="h-4 w-4" />
                  <span>Open Your Dashboard</span>
                </>
              ) : (
                <>
                  <GoogleLogo className="h-4 w-4 bg-white rounded-full p-0.5" />
                  <span>Get Started Free</span>
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/workspace/ws-ai-research")}
              className="w-full sm:w-auto h-12 px-6 gap-2 text-sm font-medium border-border hover:bg-muted"
            >
              <Play className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
              <span>Explore the Demo</span>
            </Button>
          </div>

          {/* Supporting Microcopy */}
          <p className="text-xs text-muted-foreground pt-1">
            From scattered sources to clearer understanding.
          </p>
        </div>

        {/* 3. HERO INTERACTIVE WORKSPACE PREVIEW */}
        <div className="max-w-5xl mx-auto mt-12 sm:mt-16 rounded-3xl border border-border bg-card/80 p-2 sm:p-4 shadow-xl backdrop-blur-md">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/80 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] opacity-70">
                workspace/transformer-architecture-notes
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                ● RAG Context Active
              </span>
            </div>
          </div>

          {/* Mock Interactive Workspace Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 min-h-[380px]">
            {/* Left Column: Sources in Workspace */}
            <div className="md:col-span-4 rounded-2xl border border-border/70 bg-muted/20 p-3 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="uppercase tracking-wider text-[10px] text-muted-foreground">
                    Sources in Workspace (4)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Ready
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border/80">
                    <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="truncate font-medium text-[11px]">Attention Is All You Need.pdf</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border/80">
                    <Globe className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate font-medium text-[11px]">arxiv.org/abs/1706.03762</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border/80">
                    <Video className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="truncate font-medium text-[11px]">Transformer Keynote Breakdown</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border/80">
                    <FileCode className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span className="truncate font-medium text-[11px]">Research Notes on Multi-Head Attention</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-dashed border-border text-center text-[11px] text-muted-foreground">
                <Plus className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
                <span>Upload PDF, web article, YouTube URL, or notes</span>
              </div>
            </div>

            {/* Center Column: Grounded Chat */}
            <div className="md:col-span-8 rounded-2xl border border-border/70 bg-card p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-3 text-xs leading-relaxed">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="rounded-2xl bg-muted px-3.5 py-2 text-foreground font-medium max-w-[85%]">
                    How do self-attention mechanisms compare to recurrence in sequence models?
                  </div>
                </div>

                {/* Assistant Message with Citations */}
                <div className="flex items-start gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-foreground leading-relaxed">
                      Unlike sequential recurrent layers that process tokens one by one, self-attention computes relationship scores across all token pairs in parallel. This allows direct information flow regardless of sequence distance and significantly improves parallelization during training.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] text-foreground font-mono">
                        <span className="text-primary font-bold">[1]</span> Attention Is All You Need — Section 3.2
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] text-foreground font-mono">
                        <span className="text-primary font-bold">[2]</span> Research Notes — Multi-Head Projections
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Mock */}
              <div className="pt-2 border-t border-border/60 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask any question about your sources..."
                  readOnly
                  className="flex-1 bg-transparent text-xs outline-none text-muted-foreground"
                />
                <Button size="sm" className="h-8 w-8 p-0 rounded-full bg-primary text-primary-foreground" aria-label="Send Query">
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CAPABILITIES (FEATURES) SECTION */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything you need to make sense of information.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Bring your research together, explore it with AI, and turn what you learn into something useful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Multi-Source Knowledge */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Bring all your sources together
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Collect PDFs, website content, YouTube transcripts, and notes in one organized workspace.
            </p>
          </div>

          {/* Feature 2: Source-Grounded AI Chat */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Get answers with context
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ask questions about your materials and explore responses grounded in relevant source content.
            </p>
          </div>

          {/* Feature 3: Source Citations */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Trace answers back to their sources
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Follow available source references to inspect the passages that support an answer.
            </p>
          </div>

          {/* Feature 4: AI Summaries */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Understand the key ideas faster
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Turn lengthy source material into concise summaries and structured explanations.
            </p>
          </div>

          {/* Feature 5: Flashcards and Quizzes */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Practice what you&apos;ve learned
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Turn source material into flashcards and quizzes to review concepts and test your understanding.
            </p>
          </div>

          {/* Feature 6: Mind Maps */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Network className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              See how ideas connect
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Organize related concepts into a visual structure that helps you explore a topic.
            </p>
          </div>

          {/* Feature 7: Mem0 Long-Term Memory */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all md:col-span-2 lg:col-span-3">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                <Brain className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  AI that remembers relevant context
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                  Mem0-powered memory can preserve supported user preferences and useful context across interactions, helping the experience feel more personalized over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 border-y border-border/60 bg-muted/20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              HOW IT WORKS
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              From raw sources to real understanding.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 relative">
              <span className="font-mono text-3xl font-extrabold text-primary/40">01</span>
              <h3 className="text-base font-bold text-foreground">Add your sources</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload documents, paste website URLs, add YouTube videos, or bring in your own notes.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 relative">
              <span className="font-mono text-3xl font-extrabold text-primary/40">02</span>
              <h3 className="text-base font-bold text-foreground">Ask and explore</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ask questions about your materials and inspect the relevant context used to generate answers.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 relative">
              <span className="font-mono text-3xl font-extrabold text-primary/40">03</span>
              <h3 className="text-base font-bold text-foreground">Create and revise</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate summaries, flashcards, quizzes, and mind maps from your sources, where supported.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LEARNING STUDIO SECTION */}
      <section id="studio" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            LEARNING STUDIO
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            One library. Multiple ways to learn.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Move beyond reading. Turn your sources into structured summaries, interactive revision tools, and visual explanations.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {[
            { id: "summaries", label: "Summaries", icon: BookOpen },
            { id: "flashcards", label: "Flashcards", icon: Layers },
            { id: "quizzes", label: "Quizzes", icon: HelpCircle },
            { id: "mindmaps", label: "Mind Maps", icon: Network },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = studioTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStudioTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Studio Preview Container */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-lg">
          {studioTab === "summaries" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <h4 className="text-sm font-bold text-foreground">Executive Summary & Key Takeaways</h4>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Generated from 4 sources</span>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                <p className="text-foreground font-semibold">
                  Core Architecture: Transformers & Self-Attention Mechanisms
                </p>
                <ul className="space-y-2 list-disc pl-4">
                  <li>
                    <strong className="text-foreground">Sequential Bottlenecks Removed:</strong> Recurrent state propagation is discarded in favor of scaled dot-product attention computed in parallel.
                  </li>
                  <li>
                    <strong className="text-foreground">Positional Encodings:</strong> Sinusoidal embeddings provide spatial ordering information across tokens without sequential processing.
                  </li>
                  <li>
                    <strong className="text-foreground">Multi-Head Representation:</strong> Allows joint attendance across diverse representation subspaces at different positions simultaneously.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {studioTab === "flashcards" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-500" />
                  <h4 className="text-sm font-bold text-foreground">Interactive Concept Flashcards</h4>
                </div>
                <button
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                  className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline cursor-pointer"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>{flashcardFlipped ? "Show Question" : "Flip for Answer"}</span>
                </button>
              </div>

              <div
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                className="min-h-[160px] flex flex-col justify-center items-center text-center p-6 rounded-2xl border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
              >
                {!flashcardFlipped ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Question</span>
                    <p className="text-sm font-bold text-foreground max-w-md">
                      Why do Transformer architectures utilize Positional Encodings?
                    </p>
                    <p className="text-[11px] text-muted-foreground">Click card to reveal answer</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Answer</span>
                    <p className="text-xs text-foreground max-w-md leading-relaxed">
                      Because self-attention operates across all tokens simultaneously without inherent sequence awareness, positional encodings inject token order into word embeddings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {studioTab === "quizzes" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-foreground">Knowledge Check Quiz</h4>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Question 1 of 3</span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground">
                  Which scaling factor is applied in Scaled Dot-Product Attention to prevent softmax saturation?
                </p>

                <div className="space-y-2">
                  {[
                    { text: "1 / d_k", correct: false },
                    { text: "1 / √d_k", correct: true },
                    { text: "√d_model", correct: false },
                    { text: "log(d_k)", correct: false },
                  ].map((opt, idx) => {
                    const isSelected = selectedQuizOption === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedQuizOption(idx)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-500/80 bg-emerald-500/10 text-foreground font-semibold"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                        }`}
                      >
                        <span>{opt.text}</span>
                        {isSelected && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Explanation:</strong> For large key dimensions (d_k), dot products grow large in magnitude, pushing softmax into regions with small gradients. Dividing by √d_k stabilizes variance.
                </div>
              </div>
            </div>
          )}

          {studioTab === "mindmaps" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-teal-500" />
                  <h4 className="text-sm font-bold text-foreground">Visual Concept Hierarchy</h4>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Concept Structure</span>
              </div>

              <div className="p-4 rounded-2xl border border-border/70 bg-muted/10 space-y-3 font-mono text-xs">
                <div className="inline-block px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
                  🧠 Transformer Architecture
                </div>
                <div className="pl-6 border-l-2 border-primary/30 space-y-3 pt-1">
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">├─ Attention Mechanisms</span>
                    <div className="pl-6 text-muted-foreground space-y-0.5 text-[11px]">
                      <p>├─ Scaled Dot-Product Attention</p>
                      <p>└─ Multi-Head Parallel Projections</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">├─ Sequence Modeling</span>
                    <div className="pl-6 text-muted-foreground space-y-0.5 text-[11px]">
                      <p>├─ Positional Encodings (Sinusoidal)</p>
                      <p>└─ Masked Self-Attention in Decoders</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">└─ Feed-Forward & Residuals</span>
                    <div className="pl-6 text-muted-foreground space-y-0.5 text-[11px]">
                      <p>└─ Layer Normalization & Residual Additions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. USE CASES SECTION */}
      <section id="use-cases" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            USE CASES
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Built for the way you work and learn.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2.5 hover:border-primary/40 transition-all">
            <span className="text-2xl" role="img" aria-label="Researchers">🔬</span>
            <h3 className="text-sm font-bold text-foreground">Researchers</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore papers, compare source material, and organize findings across multiple documents.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2.5 hover:border-primary/40 transition-all">
            <span className="text-2xl" role="img" aria-label="Students">🎓</span>
            <h3 className="text-sm font-bold text-foreground">Students</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Understand course material, summarize lectures, and prepare for exams with source-based revision tools.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2.5 hover:border-primary/40 transition-all">
            <span className="text-2xl" role="img" aria-label="Professionals">💼</span>
            <h3 className="text-sm font-bold text-foreground">Professionals</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Extract useful information from reports, meeting notes, and business documents.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2.5 hover:border-primary/40 transition-all">
            <span className="text-2xl" role="img" aria-label="Developers">💻</span>
            <h3 className="text-sm font-bold text-foreground">Developers</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore technical documentation, API references, and engineering notes through contextual questions.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How is this different from a general-purpose AI chatbot?",
              a: "General-purpose chatbots answer using broad pretraining data and can make unsupported claims. This workspace retrieves passages directly from the documents, articles, and notes you provide, anchoring answers in your specific reference materials.",
            },
            {
              q: "Which sources and file types can I add?",
              a: "You can upload PDF files, scrape public website articles, import YouTube video transcripts, and write or paste Markdown and plain text notes directly into each notebook workspace.",
            },
            {
              q: "How do source-grounded answers and citations work?",
              a: "When you ask a question, the system searches your uploaded source chunks using vector similarity retrieval. The most relevant excerpts are supplied as context to the AI model, which formats responses with references pointing back to the supporting source material.",
            },
            {
              q: "What is Mem0 memory, and how does it personalize the experience?",
              a: "Mem0 provides a dedicated long-term memory layer that stores supported user preferences, background context, and learning goals across sessions. Unlike source document retrieval which searches files within a workspace, Mem0 helps tailor the AI's tone and communication style to your individual preferences.",
            },
            {
              q: "Can I generate summaries, flashcards, quizzes, and mind maps?",
              a: "Yes. The Learning Studio tools allow you to transform the content of your selected workspace sources into structured summaries, interactive flip flashcards, multiple-choice quizzes with explanations, and concept mind maps.",
            },
            {
              q: "How is my information stored and processed?",
              a: "Your accounts and workspace metadata are stored in your PostgreSQL database, document embeddings are indexed in Pinecone vector storage, and file assets are handled securely. Language and embedding models process source excerpts to generate context-grounded responses when you interact with the workspace.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                aria-expanded={openFaq === idx}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    openFaq === idx ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-8 border-t border-border bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Make your sources work for you.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Bring your information together, ask better questions, and build a deeper understanding of what matters to you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={handleAuthOrDashboard}
              className="h-12 px-8 gap-3 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg active:scale-98 transition-all"
            >
              {user ? (
                <>
                  <FolderOpen className="h-4 w-4" />
                  <span>Go to Workspace Dashboard</span>
                </>
              ) : (
                <>
                  <GoogleLogo className="h-4 w-4 bg-white rounded-full p-0.5" />
                  <span>Create Your Workspace</span>
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/workspace/ws-ai-research")}
              className="h-12 px-6 gap-2 text-sm font-medium border-border hover:bg-muted"
            >
              <Play className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
              <span>Explore the Demo</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-8 px-4 sm:px-8 border-t border-border text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{APP_CONFIG.brandPrefix}{APP_CONFIG.brandSuffix} {APP_CONFIG.badge}</span>
            <span>• {APP_CONFIG.tagline}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/workspace/ws-ai-research" className="hover:text-foreground transition-colors">
              Demo Workspace
            </Link>
            <a href="#features" className="hover:text-foreground transition-colors">
              Capabilities
            </a>
            {user ? (
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                My Account
              </Link>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Google Authentication Dialog Modal */}
      <GoogleAuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        redirectUrl="/dashboard"
      />
    </div>
  );
}
