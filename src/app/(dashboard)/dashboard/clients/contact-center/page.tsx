"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Phone,
  Video,
  Mail,
  MessageSquare,
  Paperclip,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Upload,
  Download,
  Eye,
  Search,
  Filter,
  Users,
  Building2,
  Clock,
  Circle,
  Send,
  FileText,
  X,
  Camera,
  Volume2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Channel = "all" | "video" | "call" | "email" | "sms" | "internal";
type Contact = {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  type: "client" | "internal";
  status: "online" | "away" | "offline";
};

type ThreadItem = {
  id: string;
  contactId: string;
  channel: Exclude<Channel, "all">;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
};

type Attachment = {
  id: string;
  name: string;
  size: string;
  type: string;
};

const CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Jordan Lee",
    role: "CFO",
    company: "Acme Corporation",
    email: "jordan.lee@acme.example",
    phone: "+1 (816) 555-0142",
    type: "client",
    status: "online",
  },
  {
    id: "c2",
    name: "Priya Shah",
    role: "Controller",
    company: "Nexus Retail Group",
    email: "priya.shah@nexus.example",
    phone: "+1 (312) 555-0198",
    type: "client",
    status: "away",
  },
  {
    id: "c3",
    name: "Marcus Chen",
    role: "AP Lead",
    company: "Orbit Software LLC",
    email: "marcus.chen@orbit.example",
    phone: "+1 (415) 555-0110",
    type: "client",
    status: "online",
  },
  {
    id: "c4",
    name: "Demo Client User",
    role: "Portal user",
    company: "Acme Corporation",
    email: "client@acme.com",
    phone: "+1 (816) 555-0100",
    type: "client",
    status: "offline",
  },
  {
    id: "i1",
    name: "Sarah Controller",
    role: "CONTROLLER",
    company: "Demo CPA Firm",
    email: "controller@finova.ai",
    phone: "Ext. 204",
    type: "internal",
    status: "online",
  },
  {
    id: "i2",
    name: "James Partner",
    role: "PARTNER",
    company: "Demo CPA Firm",
    email: "partner@finova.ai",
    phone: "Ext. 101",
    type: "internal",
    status: "away",
  },
  {
    id: "i3",
    name: "Demo Accountant",
    role: "STAFF",
    company: "Demo CPA Firm",
    email: "demo@finova.ai",
    phone: "Ext. 312",
    type: "internal",
    status: "online",
  },
];

const THREADS: ThreadItem[] = [
  {
    id: "t1",
    contactId: "c1",
    channel: "email",
    subject: "October close package ready",
    preview: "Please confirm the PBC list and TB final for Acme…",
    time: "10:24 AM",
    unread: true,
  },
  {
    id: "t2",
    contactId: "c2",
    channel: "sms",
    subject: "SMS",
    preview: "Bank statements uploaded to portal — please review.",
    time: "9:51 AM",
  },
  {
    id: "t3",
    contactId: "i1",
    channel: "internal",
    subject: "Review AR aging",
    preview: "Can we walk through 60+ buckets before partner review?",
    time: "Yesterday",
  },
  {
    id: "t4",
    contactId: "c3",
    channel: "video",
    subject: "Video room",
    preview: "Deferred revenue walkthrough scheduled",
    time: "Mon",
  },
  {
    id: "t5",
    contactId: "c4",
    channel: "email",
    subject: "Portal document request",
    preview: "Client replied with payroll summary attachment",
    time: "Mon",
    unread: true,
  },
];

export default function ContactCenterPage() {
  const [channel, setChannel] = useState<Channel>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(CONTACTS[0].id);
  const [composer, setComposer] = useState("");
  const [messages, setMessages] = useState<
    { id: string; from: "me" | "them"; text: string; time: string }[]
  >([
    {
      id: "m1",
      from: "them",
      text: "Hi — we uploaded the bank statements to the portal.",
      time: "10:12 AM",
    },
    {
      id: "m2",
      from: "me",
      text: "Received. We will sanitize and review against the TB.",
      time: "10:15 AM",
    },
  ]);
  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: "a1", name: "ACME_Bank_Statement_Oct.pdf", size: "1.2 MB", type: "PDF" },
    { id: "a2", name: "PBC_List_FY2026.csv", size: "48 KB", type: "CSV" },
  ]);
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [recording, setRecording] = useState(false);
  const [filterBlur, setFilterBlur] = useState(false);
  const [filterWarm, setFilterWarm] = useState(false);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const selected = CONTACTS.find((c) => c.id === selectedId) || CONTACTS[0];

  const filteredContacts = useMemo(() => {
    return CONTACTS.filter((c) => {
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      if (!matchQ) return false;
      if (channel === "internal") return c.type === "internal";
      if (channel === "email" || channel === "sms" || channel === "video" || channel === "call")
        return true;
      return true;
    });
  }, [query, channel]);

  const filteredThreads = useMemo(() => {
    return THREADS.filter((t) => {
      if (channel !== "all" && t.channel !== channel) return false;
      if (query) {
        const c = CONTACTS.find((x) => x.id === t.contactId);
        const blob = `${t.subject} ${t.preview} ${c?.name} ${c?.company}`.toLowerCase();
        if (!blob.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [channel, query]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startVideo = async () => {
    setInCall(true);
    setToast(`Starting video session with ${selected.name}…`);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setToast("Camera/mic blocked — demo call UI is still available without live video.");
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setInCall(false);
    setRecording(false);
    setMuted(false);
    setCamOff(false);
    setToast("Call ended. Summary saved to contact history (demo).");
  };

  const sendMessage = () => {
    const text = composer.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      {
        id: String(Date.now()),
        from: "me",
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setComposer("");
    setToast("Message queued for delivery (demo).");
  };

  const onUpload = (file?: File) => {
    if (!file) return;
    setAttachments((a) => [
      {
        id: String(Date.now()),
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        type: file.name.split(".").pop()?.toUpperCase() || "FILE",
      },
      ...a,
    ]);
    setToast(`Attached ${file.name}`);
  };

  const statusColor = (s: Contact["status"]) =>
    s === "online" ? "bg-emerald-500" : s === "away" ? "bg-amber-400" : "bg-slate-300";

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07649d]">Clients</p>
          <h1 className="mt-1 text-2xl font-bold text-[#1d2d5c]">Contact Center</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Client and internal communication — video, voice, email, SMS, attachments, and call
            recording controls in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/clients"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            All clients
          </Link>
          <Link
            href="/portal"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Client portal
          </Link>
          <button
            type="button"
            onClick={startVideo}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1d2d5c] px-3 py-2 text-sm font-semibold text-white hover:bg-[#162447]"
          >
            <Video className="h-4 w-4" /> Start video
          </button>
        </div>
      </header>

      {toast && (
        <div className="rounded-xl border border-[#c5dceb] bg-[#e7f0f5] px-4 py-2.5 text-sm text-[#07649d]">
          {toast}
        </div>
      )}

      {/* Channel filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "All"],
            ["video", "Video"],
            ["call", "Voice"],
            ["email", "Email"],
            ["sms", "SMS"],
            ["internal", "Internal"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setChannel(id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
              channel === id
                ? "bg-[#07649d] text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            )}
          >
            {label}
          </button>
        ))}
        <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter contacts, subjects…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#07649d] focus:outline-none focus:ring-2 focus:ring-[#00a4e4]/25"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr_300px]">
        {/* Contacts */}
        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Users className="h-4 w-4 text-[#07649d]" />
            <h2 className="text-sm font-semibold text-[#1d2d5c]">Directory</h2>
            <span className="ml-auto text-xs text-slate-400">{filteredContacts.length}</span>
          </div>
          <ul className="max-h-[520px] overflow-y-auto p-2">
            {filteredContacts.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition",
                    selectedId === c.id ? "bg-[#e7f0f5]" : "hover:bg-slate-50"
                  )}
                >
                  <span className="relative mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#1d2d5c] text-xs font-bold text-white">
                    {c.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white",
                        statusColor(c.status)
                      )}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#1d2d5c]">
                      {c.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {c.company} · {c.role}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main conversation / call */}
        <section className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="font-semibold text-[#1d2d5c]">{selected.name}</p>
              <p className="text-xs text-slate-500">
                {selected.company} · {selected.email} · {selected.phone}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={startVideo}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#07649d] px-2.5 py-1.5 text-xs font-semibold text-white"
              >
                <Video className="h-3.5 w-3.5" /> Video
              </button>
              <button
                type="button"
                onClick={() => {
                  setInCall(true);
                  setToast(`Voice call started with ${selected.name} (demo).`);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </button>
              <button
                type="button"
                onClick={() => setToast(`Email composer focused for ${selected.email}`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </button>
              <button
                type="button"
                onClick={() => setToast(`SMS thread opened for ${selected.phone}`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"
              >
                <MessageSquare className="h-3.5 w-3.5" /> SMS
              </button>
            </div>
          </div>

          {inCall && (
            <div className="relative border-b border-slate-100 bg-[#0b1528] p-4 text-white">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2">
                  <Circle className={cn("h-2.5 w-2.5 fill-current", recording ? "text-red-400" : "text-emerald-400")} />
                  {recording ? "Recording…" : "Live session"} · {selected.name}
                </span>
                <span className="text-white/60">Filters: blur {filterBlur ? "on" : "off"} · warm {filterWarm ? "on" : "off"}</span>
              </div>
              <div
                className={cn(
                  "relative aspect-video overflow-hidden rounded-xl bg-slate-900",
                  filterBlur && "backdrop-blur-sm",
                  filterWarm && "sepia-[.25]"
                )}
              >
                <video
                  ref={videoRef}
                  muted={muted}
                  playsInline
                  className={cn("h-full w-full object-cover", camOff && "opacity-0")}
                />
                {camOff && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                    Camera off
                  </div>
                )}
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                  <button type="button" onClick={() => setMuted((v) => !v)} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Mute">
                    {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => setCamOff((v) => !v)} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Camera">
                    {camOff ? <VideoOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => setRecording((v) => !v)} className={cn("rounded-full p-2", recording ? "bg-red-500" : "bg-white/15 hover:bg-white/25")} aria-label="Record">
                    <Circle className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setFilterBlur((v) => !v)} className="rounded-full bg-white/15 p-2 text-[10px] font-bold hover:bg-white/25">
                    BLUR
                  </button>
                  <button type="button" onClick={() => setFilterWarm((v) => !v)} className="rounded-full bg-white/15 p-2 text-[10px] font-bold hover:bg-white/25">
                    WARM
                  </button>
                  <button type="button" onClick={endCall} className="rounded-full bg-red-600 p-2 hover:bg-red-500" aria-label="End call">
                    <PhoneOff className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8fbfd] px-4 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                  m.from === "me"
                    ? "ml-auto rounded-br-md bg-[#07649d] text-white"
                    : "rounded-bl-md border border-slate-100 bg-white text-slate-800"
                )}
              >
                <p>{m.text}</p>
                <p className={cn("mt-1 text-[10px]", m.from === "me" ? "text-white/70" : "text-slate-400")}>
                  {m.time}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"
              >
                <Paperclip className="h-3.5 w-3.5" /> Attach
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  onUpload(e.target.files?.[0]);
                  e.currentTarget.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => setToast("Email draft opened with firm signature (demo).")}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"
              >
                <Mail className="h-3.5 w-3.5" /> Email draft
              </button>
              <button
                type="button"
                onClick={() => setToast("SMS template loaded (demo).")}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"
              >
                <MessageSquare className="h-3.5 w-3.5" /> SMS template
              </button>
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <input
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="Type a message, note, or email body…"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#07649d] focus:outline-none focus:ring-2 focus:ring-[#00a4e4]/25"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1d2d5c] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Send className="h-4 w-4" /> Send
              </button>
            </form>
          </div>
        </section>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#07649d]" />
              <h3 className="text-sm font-semibold text-[#1d2d5c]">Activity feed</h3>
            </div>
            <ul className="space-y-2">
              {filteredThreads.map((t) => {
                const c = CONTACTS.find((x) => x.id === t.contactId);
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(t.contactId)}
                      className="w-full rounded-xl border border-slate-100 px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-[#07649d]">
                          {t.channel}
                        </span>
                        <span className="text-[10px] text-slate-400">{t.time}</span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-[#1d2d5c]">{c?.name}</p>
                      <p className="truncate text-xs text-slate-500">{t.preview}</p>
                      {t.unread && (
                        <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          Unread
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-[#07649d]" />
                <h3 className="text-sm font-semibold text-[#1d2d5c]">Attachments</h3>
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs font-semibold text-[#07649d]"
              >
                Upload
              </button>
            </div>
            <ul className="space-y-2">
              {attachments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <FileText className="h-4 w-4 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1d2d5c]">{a.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {a.type} · {a.size}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToast(`Viewing ${a.name} (demo viewer)`)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50"
                    aria-label="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToast(`Download started for ${a.name}`)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50"
                    aria-label="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#c5dceb] bg-[#e7f0f5] p-4 text-sm text-[#1d2d5c]">
            <div className="mb-1 flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-[#07649d]" />
              Firm tip
            </div>
            Use Contact Center for PBC follow-ups, close questions, and internal huddles. Files shared
            here should still pass File Sanitizer before AI analysis.
          </div>
        </aside>
      </div>
    </div>
  );
}
