"use client";

import * as React from "react";
import {
  FileText,
  Globe,
  Video,
  FileCode,
  Upload,
  Link as LinkIcon,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useUploadPdf,
  useImportWebsite,
  useImportYoutube,
  useCreateTextSource,
} from "@/hooks/use-sources";

export function AddSourceDialog({ workspaceId, open, onOpenChange }) {
  const [activeTab, setActiveTab] = React.useState("pdf");

  // PDF state
  const [pdfFile, setPdfFile] = React.useState(null);
  const [pdfTitle, setPdfTitle] = React.useState("");
  const fileInputRef = React.useRef(null);

  // Web state
  const [webUrl, setWebUrl] = React.useState("");
  const [webTitle, setWebTitle] = React.useState("");

  // YouTube state
  const [ytUrl, setYtUrl] = React.useState("");
  const [ytTitle, setYtTitle] = React.useState("");

  // Text state
  const [textTitle, setTextTitle] = React.useState("");
  const [textContent, setTextContent] = React.useState("");
  const [textType, setTextType] = React.useState("TEXT");

  const uploadPdf = useUploadPdf(workspaceId);
  const importWebsite = useImportWebsite(workspaceId);
  const importYoutube = useImportYoutube(workspaceId);
  const createTextSource = useCreateTextSource(workspaceId);

  const isPending =
    uploadPdf.isPending ||
    importWebsite.isPending ||
    importYoutube.isPending ||
    createTextSource.isPending;

  const handlePdfSubmit = (e) => {
    e.preventDefault();
    if (!pdfFile) return;
    uploadPdf.mutate(
      { file: pdfFile, title: pdfTitle.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
          setPdfFile(null);
          setPdfTitle("");
        },
      }
    );
  };

  const handleWebSubmit = (e) => {
    e.preventDefault();
    if (!webUrl.trim()) return;
    importWebsite.mutate(
      { url: webUrl.trim(), title: webTitle.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
          setWebUrl("");
          setWebTitle("");
        },
      }
    );
  };

  const handleYtSubmit = (e) => {
    e.preventDefault();
    if (!ytUrl.trim()) return;
    importYoutube.mutate(
      { url: ytUrl.trim(), title: ytTitle.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
          setYtUrl("");
          setYtTitle("");
        },
      }
    );
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textContent.trim()) return;
    createTextSource.mutate(
      {
        title: textTitle.trim() || "Pasted Note",
        content: textContent.trim(),
        type: textType,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setTextTitle("");
          setTextContent("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Sources to Notebook</DialogTitle>
          <DialogDescription>
            Ground your AI responses and learning tools in trusted source documents.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-4 w-full h-11">
            <TabsTrigger value="pdf" className="gap-1.5 text-xs sm:text-sm">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>PDF</span>
            </TabsTrigger>
            <TabsTrigger value="web" className="gap-1.5 text-xs sm:text-sm">
              <Globe className="h-4 w-4 text-emerald-500" />
              <span>Website</span>
            </TabsTrigger>
            <TabsTrigger value="youtube" className="gap-1.5 text-xs sm:text-sm">
              <Video className="h-4 w-4 text-red-500" />
              <span>YouTube</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-1.5 text-xs sm:text-sm">
              <FileCode className="h-4 w-4 text-purple-500" />
              <span>Text / Note</span>
            </TabsTrigger>
          </TabsList>

          {/* PDF UPLOAD */}
          <TabsContent value="pdf">
            <form onSubmit={handlePdfSubmit} className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  pdfFile
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-border hover:border-blue-500/50 hover:bg-muted/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPdfFile(file);
                      if (!pdfTitle) setPdfTitle(file.name.replace(/\.pdf$/i, ""));
                    }
                  }}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                {pdfFile ? (
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-500" /> {pdfFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Click to upload or drag & drop PDF document
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports research papers, books, notes up to 50MB
                    </p>
                  </div>
                )}
              </div>

              {pdfFile && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Custom Title (Optional)
                  </label>
                  <Input
                    placeholder="Enter document title"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                  />
                </div>
              )}

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={!pdfFile || isPending}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isPending ? "Uploading & Indexing..." : "Upload & Process PDF"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* WEBSITE CRAWLER */}
          <TabsContent value="web">
            <form onSubmit={handleWebSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Web Page URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://example.com/article-or-documentation"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    className="pl-9"
                    required
                    type="url"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Custom Title (Optional)
                </label>
                <Input
                  placeholder="e.g. Official Documentation"
                  value={webTitle}
                  onChange={(e) => setWebTitle(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={!webUrl.trim() || isPending}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isPending ? "Scraping via Firecrawl..." : "Scrape & Index Website"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* YOUTUBE TRANSCRIPT */}
          <TabsContent value="youtube">
            <form onSubmit={handleYtSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  YouTube Video URL
                </label>
                <div className="relative">
                  <Video className="absolute left-3 top-2.5 h-4 w-4 text-red-500" />
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Custom Title (Optional)
                </label>
                <Input
                  placeholder="e.g. Tech Keynote 2025"
                  value={ytTitle}
                  onChange={(e) => setYtTitle(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={!ytUrl.trim() || isPending}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isPending ? "Extracting Transcript..." : "Fetch & Index Transcript"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* TEXT / MARKDOWN NOTE */}
          <TabsContent value="text">
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="flex gap-2 items-center">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Note Title
                  </label>
                  <Input
                    placeholder="e.g. Meeting Notes & Architecture Decisions"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Format</label>
                  <div className="flex rounded-lg bg-muted p-0.5 border border-border">
                    <button
                      type="button"
                      onClick={() => setTextType("TEXT")}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                        textType === "TEXT"
                          ? "bg-card text-foreground shadow-2xs font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextType("MARKDOWN")}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                        textType === "MARKDOWN"
                          ? "bg-card text-foreground shadow-2xs font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      Markdown
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Content
                </label>
                <Textarea
                  placeholder="Paste or write your notes, summary, or raw text here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="min-h-[140px] text-xs sm:text-sm font-mono"
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={!textContent.trim() || isPending}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isPending ? "Indexing Note..." : "Add Note to Sources"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
