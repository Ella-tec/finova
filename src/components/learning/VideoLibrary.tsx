"use client";

import { useMemo, useState } from "react";
import { ExternalLink, PlayCircle, Search, Video } from "lucide-react";
import { JcccAccountingCourse } from "@/components/learning/JcccAccountingCourse";

type LearningVideo = {
  id: string;
  title: string;
  category: string;
  level: "Beginner" | "Intermediate";
  duration: string;
  channel: string;
  description: string;
};

const VIDEOS: LearningVideo[] = [
  {
    id: "VhwZ9t2b3Zk",
    title: "Accounting Basics: A Guide to Almost Everything",
    category: "Accounting Basics",
    level: "Beginner",
    duration: "14 min",
    channel: "Accounting Stuff",
    description: "A visual introduction to the accounting cycle and core bookkeeping concepts.",
  },
  {
    id: "WDz2DbzImrA",
    title: "Debit & Credit Normal Balances",
    category: "Accounting Basics",
    level: "Beginner",
    duration: "—",
    channel: "Ball State University",
    description: "Review normal debit and credit balances for common account types.",
  },
  {
    id: "FJVzMWUAabI",
    title: "T Accounts",
    category: "Bookkeeping",
    level: "Beginner",
    duration: "—",
    channel: "Ball State University",
    description: "See how transactions post to T accounts in the ledger.",
  },
  {
    id: "IEuFvcrlXwc",
    title: "Adjusting Entries",
    category: "Month-End Close",
    level: "Intermediate",
    duration: "—",
    channel: "Ball State University",
    description: "Understand adjustments made before financial statements are prepared.",
  },
  {
    id: "MRqMpYtCFs0",
    title: "Closing Entries",
    category: "Month-End Close",
    level: "Intermediate",
    duration: "—",
    channel: "Ball State University",
    description: "Review the closing process at the end of an accounting period.",
  },
  {
    id: "MF01UfppZng",
    title: "Bank Reconciliation",
    category: "Bank Reconciliation",
    level: "Beginner",
    duration: "—",
    channel: "Ball State University",
    description: "Learn the purpose and basic steps of reconciling bank and book balances.",
  },
  {
    id: "y1_qjoQUdF4",
    title: "Preparation of Basic Financial Statements",
    category: "Financial Statements",
    level: "Beginner",
    duration: "—",
    channel: "Ball State University",
    description: "Follow the preparation of core financial statements from accounting records.",
  },
  {
    id: "zs4Zy6xVhRQ",
    title: "Cost of Goods Sold",
    category: "Inventory & Cost Accounting",
    level: "Beginner",
    duration: "—",
    channel: "Ball State University",
    description: "Understand how inventory costs flow into cost of goods sold.",
  },
  {
    id: "QPXQdt7vLHs",
    title: "Inventory Costing: LIFO",
    category: "Inventory & Cost Accounting",
    level: "Intermediate",
    duration: "—",
    channel: "Ball State University",
    description: "Review the LIFO inventory costing method and its effect on reported costs.",
  },
  {
    id: "d2EXotRArow",
    title: "Allowance for Doubtful Accounts",
    category: "Financial Statements",
    level: "Intermediate",
    duration: "—",
    channel: "Ball State University",
    description: "Explore estimating uncollectible receivables and recording the allowance.",
  },
  {
    id: "3_PfoTzSCQE",
    title: "The Trial Balance Explained",
    category: "Financial Statements",
    level: "Beginner",
    duration: "—",
    channel: "Accounting Stuff",
    description: "Learn how a trial balance helps check ledger balances before reporting.",
  },
  {
    id: "hrSUq4wcd0g",
    title: "The Income Statement for Beginners",
    category: "Financial Statements",
    level: "Beginner",
    duration: "—",
    channel: "Accounting Stuff",
    description: "Understand revenue, expenses, and how profit is calculated.",
  },
];

const CATEGORIES = [
  "All videos",
  "Accounting Basics",
  "Bookkeeping",
  "Bank Reconciliation",
  "Month-End Close",
  "Financial Statements",
  "Inventory & Cost Accounting",
  "Accounting 1 (ACCT 121)",
];

const JCCC_PLAYLIST = "PL259DBFA47F3B4761";

/** Known YouTube video IDs for JCCC Accounting 1 (index order matches playlist). */
const JCCC_VIDEO_IDS = [
  "ZkZ6Q67Q15E", // 1 Introduction to Class
  "IL_egHqaU3s", // 2 Basic Accounting Concepts
  "GhDp9uEKuBk", // 3 Transaction Analysis
  "0ouQKi6Nb94", // 4 Intro to Financial Statements
  "4nPJtzNDQng", // 5 Financial Statements
  "NsJMwtazP-4", // 6 Intro to Debits and Credits
  "G4Ew3Ija9ZI", // 7 Debits and Credits
  "aIn7rnu1xTw", // 8 Journal Entries and the Trial Balance
];

function jcccEmbedSrc(index: number) {
  const videoId = JCCC_VIDEO_IDS[index];
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&list=${JCCC_PLAYLIST}`;
  }
  // Fallback for lessons beyond the mapped IDs: playlist embed with index (1-based)
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${JCCC_PLAYLIST}&index=${index + 1}&rel=0`;
}

export function VideoLibrary({ courseTitle }: { courseTitle?: string }) {
  const [activeVideo, setActiveVideo] = useState(VIDEOS[0]);
  const [activeJcccIndex, setActiveJcccIndex] = useState<number | null>(null);
  const [category, setCategory] = useState("All videos");
  const [search, setSearch] = useState("");

  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase();
    return VIDEOS.filter((video) => {
      const matchesCategory =
        category !== "Accounting 1 (ACCT 121)" &&
        (category === "All videos" || video.category === category);
      const matchesSearch =
        !term ||
        [video.title, video.category, video.channel, video.description]
          .join(" ")
          .toLowerCase()
          .includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const chooseCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    if (nextCategory === "Accounting 1 (ACCT 121)") {
      setActiveJcccIndex(0);
      return;
    }
    const nextVideo = VIDEOS.find(
      (video) => nextCategory === "All videos" || video.category === nextCategory
    );
    if (nextVideo) setActiveVideo(nextVideo);
    setActiveJcccIndex(null);
  };

  const playerKey =
    activeJcccIndex !== null ? `jccc-${activeJcccIndex}` : `video-${activeVideo.id}`;
  const playerSrc =
    activeJcccIndex !== null
      ? jcccEmbedSrc(activeJcccIndex)
      : `https://www.youtube-nocookie.com/embed/${activeVideo.id}?rel=0`;
  const playerTitle =
    activeJcccIndex !== null
      ? `Accounting 1 Program ${activeJcccIndex + 1}`
      : activeVideo.title;

  return (
    <section className="space-y-5" aria-labelledby="finova-video-library">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-isaca-medium">
            Watch & learn
          </p>
          <h2
            id="finova-video-library"
            className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900"
          >
            <Video className="h-6 w-6 text-isaca-medium" />
            Free accounting video library
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            {courseTitle
              ? `Video lessons and practical examples to support ${courseTitle}.`
              : "Watch free tutorials from established accounting educators without leaving Finova."}
          </p>
        </div>
        <a
          href="https://www.youtube.com/@AccountingStuff"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-isaca-medium hover:underline"
        >
          Visit channel <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Accounting video categories">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => chooseCategory(item)}
            aria-pressed={category === item}
            className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
              category === item
                ? "border-isaca-medium bg-isaca-medium text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-isaca-medium hover:text-isaca-medium"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.85fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
          <div className="aspect-video w-full">
            <iframe
              key={playerKey}
              className="h-full w-full"
              src={playerSrc}
              title={playerTitle}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="space-y-2 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {activeJcccIndex !== null ? (
                <span className="rounded-full bg-isaca-light px-2.5 py-1 font-semibold text-isaca-dark">
                  JCCC · Accounting 1
                </span>
              ) : (
                <>
                  <span className="rounded-full bg-isaca-light px-2.5 py-1 font-semibold text-isaca-dark">
                    {activeVideo.category}
                  </span>
                  <span>{activeVideo.level}</span>
                  <span>•</span>
                  <span>{activeVideo.duration}</span>
                </>
              )}
            </div>
            <h3 className="font-semibold text-slate-900">
              {activeJcccIndex !== null
                ? `Accounting 1 · Lesson ${activeJcccIndex + 1} of 39`
                : activeVideo.title}
            </h3>
            <p className="text-sm text-slate-600">
              {activeJcccIndex !== null
                ? "Recorded Fall 2011 by Johnson County Community College. Select a lesson from the course list below."
                : activeVideo.description}
            </p>
            <p className="text-xs text-slate-500">
              Video by {activeJcccIndex !== null ? "JCCCvideo" : activeVideo.channel}. Playback is
              provided by the original YouTube publisher.
            </p>
            <a
              href={
                activeJcccIndex !== null
                  ? JCCC_VIDEO_IDS[activeJcccIndex]
                    ? `https://www.youtube.com/watch?v=${JCCC_VIDEO_IDS[activeJcccIndex]}&list=${JCCC_PLAYLIST}`
                    : `https://www.youtube.com/playlist?list=${JCCC_PLAYLIST}`
                  : `https://www.youtube.com/watch?v=${activeVideo.id}`
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-isaca-medium hover:underline"
            >
              Open original video <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search video topics..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-isaca-medium focus:ring-2 focus:ring-isaca-medium/15"
            />
          </label>

          {category !== "Accounting 1 (ACCT 121)" && (
            <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
              {filteredVideos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => {
                    setActiveVideo(video);
                    setActiveJcccIndex(null);
                  }}
                  aria-pressed={activeVideo.id === video.id && activeJcccIndex === null}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                    activeVideo.id === video.id && activeJcccIndex === null
                      ? "border-isaca-medium bg-isaca-light/60 ring-1 ring-isaca-medium/20"
                      : "border-slate-200 bg-white hover:border-isaca-medium/50 hover:bg-slate-50"
                  }`}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-isaca-light text-isaca-medium">
                    <PlayCircle className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{video.title}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {video.channel} · {video.duration}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">{video.category}</span>
                  </span>
                </button>
              ))}
              {filteredVideos.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                  No videos match that search. Try another accounting topic.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {category === "Accounting 1 (ACCT 121)" && (
        <JcccAccountingCourse
          selected={activeJcccIndex}
          onSelect={(index) => setActiveJcccIndex(index)}
        />
      )}

      <p className="text-xs leading-5 text-slate-500">
        Videos are hosted by their original publishers on YouTube. Availability, advertising,
        captions, and playback are controlled by YouTube and each publisher.
      </p>
    </section>
  );
}
