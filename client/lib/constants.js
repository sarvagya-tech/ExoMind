export const APP_CONFIG = {
  name: "ExoMind",
  brandPrefix: "Exo",
  brandSuffix: "Mind",
  badge: "AI",
  tagline: "Turn your sources into understanding",
  headline: "Turn your sources into understanding.",
  subheadline: "Bring together PDFs, websites, YouTube videos, and notes. Ask questions, explore ideas, and turn information into knowledge you can use.",
  microcopy: "From scattered sources to clearer understanding.",
};

export const AI_MODELS = [
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    description: "Ultra-fast multimodal reasoning grounded in sources",
    badge: "Default",
  },
  {
    id: "gemini-pro-latest",
    name: "Gemini Pro",
    description: "Deep analytical reasoning and complex synthesis",
    badge: "Google",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Fast, intelligent and cost-effective",
    badge: "OpenAI",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Most capable model for deep reasoning",
    badge: "Pro",
  },
];

export const WORKSPACE_ICONS = [
  "📓", "📚", "🔬", "💻", "🧠", "💼", "🎓", "🚀", "⚡", "💡",
  "📊", "📁", "🌍", "🎨", "🏥", "⚖️", "🎵", "🛠️", "📈", "✨"
];

export const ARTIFACT_DEFINITIONS = [
  {
    type: "SUMMARY",
    title: "Executive Summary",
    description: "Comprehensive synthesized overview of all selected sources.",
    icon: "FileText",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    type: "TAKEAWAYS",
    title: "Key Takeaways",
    description: "Actionable highlights, core learnings, and main conclusions.",
    icon: "ListChecks",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    type: "FLASHCARDS",
    title: "Study Flashcards",
    description: "Interactive 3D flip cards to test recall and master core concepts.",
    icon: "Layers",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    type: "QUIZ",
    title: "Interactive Quiz",
    description: "Multiple-choice challenge with instant score calculation and explanations.",
    icon: "HelpCircle",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    type: "MINDMAP",
    title: "Mind Map",
    description: "Visual structured concept tree showing topics and relationships.",
    icon: "Network",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    type: "REPORT",
    title: "Research Report",
    description: "In-depth structured study report with markdown formatting and citations.",
    icon: "BookOpen",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
];

export const PROMPT_STARTERS = [
  "Summarize the key arguments across my sources",
  "What are the major pros and cons mentioned?",
  "Create a comprehensive study guide",
  "Compare and contrast the main perspectives",
  "Explain the most complex concepts simply",
  "Draft an executive briefing for stakeholders",
];
