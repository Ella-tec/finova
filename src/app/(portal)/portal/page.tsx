"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Bell,
  Bot,
  ClipboardList,
  CloudSun,
  FileText,
  Globe2,
  Newspaper,
  Shield,
  Upload,
  Users,
  Clock3,
  AlertTriangle,
} from "lucide-react";

const headlines = [
  { tag: "Markets", title: "U.S. equities steady as rate-cut expectations hold", source: "Bloomberg-style feed" },
  { tag: "Accounting", title: "Month-end close cadence remains a top priority for mid-market firms", source: "Industry note" },
  { tag: "Audit", title: "PBC response speed improves when clients use a shared portal", source: "Practice insight" },
  { tag: "Tax", title: "Estimated payment reminders and extension tracking for calendar filers", source: "Tax update" },
  { tag: "Economy", title: "Treasury yields and inflation prints guide planning conversations", source: "Economic desk" },
];

const zones = [
  { city: "Kansas City", tz: "America/Chicago" },
  { city: "New York", tz: "America/New_York" },
  { city: "London", tz: "Europe/London" },
  { city: "Singapore", tz: "Asia/Singapore" },
];

function useClock(tz: string) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);
}

export default function PortalDashboardPage() {
  const { data: session } = useSession();
  const name = session?.user?.name || "Client";
  const local = useClock("America/Chicago");
  const [temp, setTemp] = useState<string>("—");
  const [wx, setWx] = useState("Loading weather…");
  const [forecast, setForecast] = useState<{ day: string; high: number; low: number }[]>([]);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=39.1&longitude=-94.58&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&timezone=America%2FChicago&forecast_days=7"
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.current?.temperature_2m != null) {
          setTemp(`${Math.round(data.current.temperature_2m)}°F`);
          setWx("Kansas City · live forecast");
        }
        if (data?.daily?.time) {
          const days = data.daily.time.map((d: string, i: number) => ({
            day: new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }),
            high: Math.round(data.daily.temperature_2m_max[i]),
            low: Math.round(data.daily.temperature_2m_min[i]),
          }));
          setForecast(days);
        }
      })
      .catch(() => {
        setWx("Weather unavailable");
        setTemp("—");
      });
  }, []);

  const actions = useMemo(
    () => [
      { href: "/portal/documents", label: "Upload document", icon: Upload },
      { href: "/portal/requests", label: "View requests", icon: ClipboardList },
      { href: "/portal/contact", label: "Contact professional", icon: Users },
      { href: "/portal/ai", label: "Ask AI", icon: Bot },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <header className="relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/images/sanitizer/finova-hero-1.jpg"
          >
            <source src="/videos/client-workspace-hero.mp4" type="video/mp4" />
            <source
              src="https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4"
              type="video/mp4"
            />
          </video>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/25"
          />
        </div>

        <div className="relative z-10 flex min-h-[220px] flex-col justify-end gap-3 p-6 sm:min-h-[280px] sm:p-8 lg:min-h-[320px]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200/90">
            Client workspace
          </p>
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome, {name}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
            Your firm collaboration home — documents, requests, secure scanning, and support in one place.
            Staff accounting tools stay on the firm side of Finova.
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Link
              href="/portal/documents"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
            >
              <Upload className="h-4 w-4" /> Upload documents
            </Link>
            <Link
              href="/portal/requests"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              <ClipboardList className="h-4 w-4" /> View requests
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open requests", value: "Review due items", href: "/portal/requests", icon: ClipboardList },
          { label: "Documents", value: "Upload & download", href: "/portal/documents", icon: FileText },
          { label: "Security", value: "Scan before share", href: "/portal/security", icon: Shield },
          { label: "Notifications", value: "Firm activity", href: "/portal/requests", icon: Bell },
        ].map((card) => (
          <Link key={card.label} href={card.href} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#07649d]/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <card.icon className="h-5 w-5 text-[#07649d]" />
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 font-semibold text-slate-900">{card.value}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[#1d2d5c]" />
            <h2 className="font-semibold text-slate-900">Market & accounting headlines</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {headlines.map((h) => (
              <li key={h.title} className="flex gap-3 py-3">
                <span className="mt-0.5 h-fit rounded-full bg-[#e7f0f5] px-2 py-0.5 text-[10px] font-bold uppercase text-[#07649d]">
                  {h.tag}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{h.title}</p>
                  <p className="text-xs text-slate-500">{h.source}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-[#07649d]" />
              <h2 className="font-semibold text-slate-900">Weather</h2>
            </div>
            <p className="text-3xl font-bold text-[#1d2d5c]">{temp}</p>
            <p className="text-xs text-slate-500">{wx}</p>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px]">
              {forecast.map((d) => (
                <div key={d.day} className="rounded-lg bg-[#f4f7fb] px-1 py-2">
                  <div className="font-semibold text-slate-700">{d.day}</div>
                  <div className="text-slate-900">{d.high}°</div>
                  <div className="text-slate-400">{d.low}°</div>
                </div>
              ))}
            </div>
            <p className="mt-2 flex items-center gap-1 text-[11px] text-amber-800">
              <AlertTriangle className="h-3 w-3" /> Check local alerts before travel to meetings.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-[#07649d]" />
              <h2 className="font-semibold text-slate-900">World clock</h2>
            </div>
            <p className="mb-3 flex items-center gap-2 text-sm text-slate-600">
              <Clock3 className="h-4 w-4" /> Local (Chicago): <strong className="text-slate-900">{local}</strong>
            </p>
            <ul className="space-y-2 text-sm">
              {zones.map((z) => (
                <ZoneRow key={z.city} city={z.city} tz={z.tz} />
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="inline-flex items-center justify-between rounded-xl bg-[#1d2d5c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#162447]"
            >
              <span className="inline-flex items-center gap-2">
                <a.icon className="h-4 w-4" />
                {a.label}
              </span>
              <ArrowRight className="h-4 w-4 opacity-80" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ZoneRow({ city, tz }: { city: string; tz: string }) {
  const t = useClock(tz);
  return (
    <li className="flex items-center justify-between rounded-lg bg-[#f4f7fb] px-3 py-2">
      <span className="text-slate-700">{city}</span>
      <span className="font-semibold text-slate-900">{t}</span>
    </li>
  );
}
