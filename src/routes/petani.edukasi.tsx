import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { useSession } from "@/hooks/use-session";
import edukasiTopics, {
  type EduTopic,
  type EduStep,
  type EduTip,
  type EduLink,
} from "@/lib/edukasi";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Video,
  ExternalLink,
  Sparkles,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/petani/edukasi")({
  component: EdukasiPage,
});

function EdukasiPage() {
  const session = useSession();
  const [selectedTopic, setSelectedTopic] = useState<EduTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (!session) {
    return (
      <MobileShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-5xl">
            🌱
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Masuk untuk melihat edukasi</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Silakan masuk sebagai petani untuk mengakses materi pertanian terpercaya.
          </p>
          <Link
            to="/masuk"
            className="mt-6 rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            Masuk Sekarang
          </Link>
        </div>
      </MobileShell>
    );
  }

  if (session.role !== "farmer") {
    return (
      <MobileShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-5xl">
            🔒
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Akses Terbatas</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Fitur edukasi hanya untuk petani terdaftar yang telah disetujui.
          </p>
          <Link
            to="/"
            className="mt-6 rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </MobileShell>
    );
  }

  const filteredTopics = edukasiTopics.filter((t) => {
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q);
  });

  if (selectedTopic) {
    return <EdukasiDetailView topic={selectedTopic} onBack={() => setSelectedTopic(null)} />;
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-gradient-to-b from-primary-soft/30 to-background">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-primary px-4 pt-4 pb-5 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Pusat Edukasi</h1>
              <p className="text-sm opacity-85">Tingkatkan hasil panen dengan panduan praktis</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60" />
            <input
              type="text"
              placeholder="Cari topik edukasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/20 backdrop-blur pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-primary-foreground/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
          </div>
        </header>

        {/* Stats row */}
        <div className="flex gap-2 px-4 -mt-3 mb-2">
          <div className="flex items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm border">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span>{edukasiTopics.length} Topik</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm border">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Baca 5-10 menit</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm border">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>Gratis</span>
          </div>
        </div>

        {/* Topics list */}
        <div className="p-4 space-y-4">
          {filteredTopics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl mb-3">
                🔍
              </div>
              <p className="text-muted-foreground font-medium">
                Topik "{searchQuery}" tidak ditemukan
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Tampilkan semua topik
              </button>
            </div>
          ) : (
            filteredTopics.map((topic, idx) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                index={idx}
                onClick={() => setSelectedTopic(topic)}
              />
            ))
          )}
        </div>
      </div>
    </MobileShell>
  );
}

function TopicCard({
  topic,
  index,
  onClick,
}: {
  topic: EduTopic;
  index: number;
  onClick: () => void;
}) {
  const difficultyColor: Record<string, string> = {
    pemula: "bg-emerald-100 text-emerald-700 border-emerald-200",
    menengah: "bg-amber-100 text-amber-700 border-amber-200",
    mahir: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const difficultyLabel: Record<string, string> = {
    pemula: "\u{1F331} Pemula",
    menengah: "\u{1F4CA} Menengah",
    mahir: "\u{1F3C6} Mahir",
  };

  const topicColor = topic.color;
  const topicDifficulty = topic.difficulty;

  return (
    <button
      onClick={onClick}
      className="w-full text-left group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="rounded-2xl bg-card shadow-sm border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 active:scale-[0.99]">
        {/* Color bar */}
        <div className={`h-2 bg-gradient-to-r ${topicColor}`} />

        <div className="p-4 space-y-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${topicColor} text-white text-lg shadow-sm`}
              >
                {topic.emoji}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {topic.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${difficultyColor[topicDifficulty]}`}
                  >
                    {difficultyLabel[topicDifficulty]}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {topic.readTime}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 group-hover:bg-primary-soft transition-colors">
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {topic.summary}
          </p>

          {/* Highlights preview */}
          <div className="flex flex-wrap gap-1.5">
            {topic.highlights.slice(0, 2).map((h, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-lg bg-primary-soft/50 px-2 py-1 text-[11px] text-primary/80"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{h.replace(/^.{1,3}/, "")}</span>
              </span>
            ))}
            {topic.highlights.length > 2 && (
              <span className="inline-flex items-center rounded-lg bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                +{topic.highlights.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* Detail View */

function EdukasiDetailView({ topic, onBack }: { topic: EduTopic; onBack: () => void }) {
  const [expandedSteps, setExpandedSteps] = useState(true);
  const [expandedTips, setExpandedTips] = useState(true);
  const [expandedLinks, setExpandedLinks] = useState(true);

  const difficultyLabel: Record<string, string> = {
    pemula: "\u{1F331} Pemula",
    menengah: "\u{1F4CA} Menengah",
    mahir: "\u{1F3C6} Mahir",
  };

  const topicColor = topic.color;

  return (
    <MobileShell>
      <div className="min-h-screen bg-gradient-to-b from-primary-soft/20 to-background pb-8">
        {/* Sticky header */}
        <header className="sticky top-0 z-20 bg-primary/95 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3 px-4 py-3 text-primary-foreground">
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 active:scale-90 transition-all"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold truncate">{topic.title}</h1>
            </div>
          </div>
        </header>

        {/* Hero section */}
        <div className={`bg-gradient-to-br ${topicColor} px-5 pt-6 pb-8 text-white`}>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-3xl shadow-inner">
              {topic.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold mb-1">{topic.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm opacity-90">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                  {difficultyLabel[topic.difficulty]}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {topic.readTime}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed opacity-95">{topic.summary}</p>
        </div>

        {/* Content */}
        <div className="px-4 -mt-2 space-y-3">
          {/* Highlights */}
          <div className="rounded-2xl bg-card p-4 shadow-sm border border-border/40">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Poin Penting
            </h3>
            <ul className="space-y-2">
              {topic.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 shrink-0">{h.slice(0, 2)}</span>
                  <span>{h.slice(3)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <CollapsibleSection
            title="Langkah-langkah"
            icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
            count={topic.steps.length}
            expanded={expandedSteps}
            onToggle={() => setExpandedSteps(!expandedSteps)}
          >
            <div className="space-y-3">
              {topic.steps.map((step, i) => (
                <StepCard key={i} step={step} index={i} total={topic.steps.length} />
              ))}
            </div>
          </CollapsibleSection>

          {/* Tips */}
          <CollapsibleSection
            title="Tips & Trik"
            icon={<Lightbulb className="h-4 w-4 text-amber-500" />}
            count={topic.tips.length}
            expanded={expandedTips}
            onToggle={() => setExpandedTips(!expandedTips)}
          >
            <div className="space-y-2">
              {topic.tips.map((tip, i) => (
                <TipCard key={i} tip={tip} />
              ))}
            </div>
          </CollapsibleSection>

          {/* Links */}
          <CollapsibleSection
            title="Sumber Belajar"
            icon={<Video className="h-4 w-4 text-rose-500" />}
            count={topic.links.length}
            expanded={expandedLinks}
            onToggle={() => setExpandedLinks(!expandedLinks)}
          >
            <div className="space-y-2">
              {topic.links.map((link, i) => (
                <LinkCard key={i} link={link} />
              ))}
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </MobileShell>
  );
}

function CollapsibleSection({
  title,
  icon,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card shadow-sm border border-border/40 overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">{icon}</div>
          <div className="text-left">
            <span className="font-semibold text-sm">{title}</span>
            <span className="ml-1.5 text-xs text-muted-foreground">({count})</span>
          </div>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function StepCard({ step, index, total }: { step: EduStep; index: number; total: number }) {
  return (
    <div className="relative flex gap-3">
      {/* Step number connector */}
      <div className="flex flex-col items-center">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-bold text-primary-foreground shadow-sm">
          {index + 1}
        </div>
        {index < total - 1 && (
          <div className="mt-1 w-0.5 flex-1 rounded-full bg-gradient-to-b from-primary/30 to-transparent" />
        )}
      </div>

      <div className="flex-1 pb-4">
        <h4 className="text-sm font-semibold text-foreground mb-1">{step.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}

function TipCard({ tip }: { tip: EduTip }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 p-3">
      <span className="text-lg shrink-0 mt-0.5">{tip.icon}</span>
      <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{tip.text}</p>
    </div>
  );
}

function LinkCard({ link }: { link: EduLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl bg-muted/50 hover:bg-muted border border-border/40 p-3 transition-all hover:shadow-sm active:scale-[0.99] group"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <ExternalLink className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {link.label}
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
    </a>
  );
}

export default EdukasiPage;
