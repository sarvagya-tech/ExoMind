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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { GoogleLogo, GoogleAuthDialog } from "@/components/auth/google-auth-dialog";

export default function AboutLandingPage() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("chat");
  const [openFaq, setOpenFaq] = React.useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-mono text-foreground selection:bg-primary/20 selection:text-primary">
      {/* 1. TOP NAVIGATION NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-base sm:text-lg">
                Notebook<span className="text-primary">LM</span>
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                Studio
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
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
              onClick={() => setAuthOpen(true)}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-4 shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 border-b border-border/60">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Grounded in Your Trusted Sources</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Your Personalized AI Research Assistant
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
            Upload PDFs, websites, YouTube lectures, and markdown notes.
            NotebookLM indexes them with verified citations, conversational reasoning,
            and automated learning tools like 3D flashcards and quizzes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              onClick={() => setAuthOpen(true)}
              className="w-full sm:w-auto h-12 px-6 gap-2.5 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md active:scale-98 transition-all"
            >
              <GoogleLogo className="h-4 w-4 bg-white rounded-full p-0.5" />
              <span>Get Started with Google</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/workspace/ws-ai-research")}
              className="w-full sm:w-auto h-12 px-6 gap-2 text-sm font-medium border-border hover:bg-muted"
            >
              <Play className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
              <span>Explore Interactive Demo</span>
            </Button>
          </div>

          {/* Security Assurance */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Private & secure. Your personal notes are never used to train public models.</span>
          </div>
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
                notebooklm.google/workspace/ai-transformer-research
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono">
                GPT-4o & RAG Active
              </span>
            </div>
          </div>

          {/* Mock Interactive Workspace Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 min-h-[380px]">
            {/* Left Column: Sources */}
            <div className="md:col-span-4 rounded-2xl border border-border/70 bg-muted/20 p-3 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="uppercase tracking-wider text-[10px] text-muted-foreground">
                    Grounded Sources (4)
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    ✓ 100% Indexed
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border/80">
                    <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="truncate font-medium text-[11px]">Attention Is All You Need.pdf</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border/80">
                    <Globe className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate font-medium text-[11px]">arxiv.org/abs/2402.rag-study</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border/80">
                    <Video className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="truncate font-medium text-[11px]">State of AI 2025 Keynote</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-dashed border-border text-center text-[11px] text-muted-foreground">
                <Plus className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
                <span>Drop any research PDF or URL</span>
              </div>
            </div>

            {/* Center Column: Grounded Chat */}
            <div className="md:col-span-8 rounded-2xl border border-border/70 bg-card p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-3 text-xs leading-relaxed">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="rounded-2xl bg-muted px-3.5 py-2 text-foreground font-medium max-w-[85%]">
                    How do self-attention mechanisms replace recurrence in transformers?
                  </div>
                </div>

                {/* Assistant Message with Citations */}
                <div className="flex items-start gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-foreground leading-relaxed">
                      Transformers discard recurrence entirely and compute attention across all token pairs simultaneously in parallel.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] text-foreground font-mono">
                        <span className="text-primary font-bold">[1]</span> Attention Is All You Need, p. 4
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] text-foreground font-mono">
                        <span className="text-primary font-bold">[2]</span> RAG vs Long-Context Study
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seamless Unboxed Input Mock */}
              <div className="pt-2 border-t border-border/60 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask any question about your sources..."
                  readOnly
                  className="flex-1 bg-transparent text-xs outline-none text-muted-foreground"
                />
                <Button size="sm" className="h-8 w-8 p-0 rounded-full bg-primary text-primary-foreground">
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES SECTION */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Key Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything You Need for Deep Research
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Built from the ground up to prevent hallucinations and turn complex information into actionable knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Multi-Source Grounding
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ingest academic PDFs, Firecrawl website articles, YouTube transcripts, and raw notes into a unified research workspace.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Verified Footnote Citations
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every sentence in AI answers is backed by direct clickable footnotes linking to the exact excerpt in your source document.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Learning Studio Tools
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Automatically create 3D flip flashcards, interactive quizzes with scorecards, mind map hierarchies, and briefing documents.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Mem0 Long-Term Memory
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The AI remembers your background, study goals, preferred tone, and formatting constraints across all your notebooks.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Live Web Intelligence
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Toggle Tavily real-time web search alongside your private sources to synthesize the latest breaking news and benchmarks.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Multi-Model Selection
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose between GPT-4o, Claude 3.5 Sonnet, and GPT-4o Mini with real-time token streaming and reasoning.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 border-y border-border/60 bg-muted/20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Simple 3-Step Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              How NotebookLM Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 relative">
              <span className="font-mono text-3xl font-extrabold text-primary/40">01</span>
              <h3 className="text-base font-bold text-foreground">Add Your Sources</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload PDFs, paste web URLs, YouTube videos, or research notes. NotebookLM splits and indexes them into semantic vectors.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 relative">
              <span className="font-mono text-3xl font-extrabold text-primary/40">02</span>
              <h3 className="text-base font-bold text-foreground">Ask & Explore</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chat naturally with your documents. The AI searches your specific sources and returns answers with clickable citations.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 relative">
              <span className="font-mono text-3xl font-extrabold text-primary/40">03</span>
              <h3 className="text-base font-bold text-foreground">Generate Study Artifacts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Turn your sources into flashcard decks, quizzes with score tracking, mind maps, and structured study guides with 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHO USES NOTEBOOKLM */}
      <section id="use-cases" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Designed for Knowledge Workers
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Built for Every Kind of Thinker
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h4 className="text-sm font-bold text-foreground">🔬 Researchers</h4>
            <p className="text-xs text-muted-foreground">
              Compare conflicting literature, extract statistical methodologies, and cite verified sources.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h4 className="text-sm font-bold text-foreground">🎓 Students</h4>
            <p className="text-xs text-muted-foreground">
              Master exam textbooks, convert lecture transcripts into flashcards, and test comprehension with quizzes.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h4 className="text-sm font-bold text-foreground">💼 Founders & PMs</h4>
            <p className="text-xs text-muted-foreground">
              Synthesize user feedback interviews, market analysis reports, and investor pitch decks.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h4 className="text-sm font-bold text-foreground">💻 Engineers</h4>
            <p className="text-xs text-muted-foreground">
              Search API documentation, code guidelines, architecture RFCs, and troubleshooting playbooks.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does NotebookLM differ from standard ChatGPT or Claude?",
              a: "Standard LLMs pull information from their general training data and can hallucinate. NotebookLM strictly grounds its reasoning in the specific source documents you provide, generating verified citations for every factual claim.",
            },
            {
              q: "What types of files and sources can I upload?",
              a: "NotebookLM supports PDF documents, live web pages via Firecrawl scraping, YouTube video transcripts, and custom markdown notes.",
            },
            {
              q: "Is my personal research data private?",
              a: "Yes. Your uploaded notes, sources, and conversation history are private to your account and never used to train public machine learning models.",
            },
            {
              q: "How do the Flashcards and Quiz generators work?",
              a: "When you request a Quiz or Flashcards deck, our system parses key definitions, theorems, and concepts directly from your indexed sources and formats them into interactive 3D study tools.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors"
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

      {/* 8. BOTTOM CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-8 border-t border-border bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Ready to Upgrade Your Research?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Join thousands of researchers, students, and professionals thinking deeper with grounded AI.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              onClick={() => setAuthOpen(true)}
              className="h-12 px-8 gap-3 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              <GoogleLogo className="h-4 w-4 bg-white rounded-full p-0.5" />
              <span>Get Started Free with Google</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="py-8 px-4 sm:px-8 border-t border-border text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">NotebookLM Studio</span>
            <span>• Powered by Gemini & GPT-4o</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/workspace/ws-ai-research" className="hover:text-foreground transition-colors">
              Demo Notebook
            </Link>
            <button
              onClick={() => setAuthOpen(true)}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>

      {/* Google Authentication Dialog Modal */}
      <GoogleAuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        redirectUrl="/"
      />
    </div>
  );
}
