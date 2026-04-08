"use client";

import { useState, useEffect, useCallback } from "react";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzM9ngzOZNjdLQpNBPOs9Cgb8hJ7SxpE9SmTz7DIOF632sJa1k26vSd1c4Dg3qu7XnV/exec";

interface Participant {
  fullName: string;
  preferredName: string;
  title: string;
  school: string;
  years: string;
  cityState: string;
  email: string;
  phone: string;
  bio: string;
  social: string;
  headshot: string;
}

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Participant[] };

export default function ProfilesPage() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  const fetchProfiles = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data: Participant[] = Array.isArray(json)
        ? json
        : json.data ?? [];
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to load profiles",
      });
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return (
    <>
      {/* Header */}
      <header className="pb-8 pt-16 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-azure">
          The ABLE Foundation Presents
        </p>
        <h1 className="mb-3 font-serif text-5xl font-bold text-black md:text-6xl">
          Beyond the Bell
        </h1>
        <p className="text-lg text-zinc-600">Participant Profiles</p>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-16">
        {state.status === "loading" && <LoadingSkeleton />}
        {state.status === "error" && (
          <ErrorState message={state.message} onRetry={fetchProfiles} />
        )}
        {state.status === "success" && state.data.length === 0 && (
          <EmptyState />
        )}
        {state.status === "success" && state.data.length > 0 && (
          <>
            <div className="no-print mb-8 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                {state.data.length} participant
                {state.data.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => window.print()}
                className="rounded-lg bg-azure px-4 py-2 text-sm font-medium text-white transition hover:bg-azure-dark"
              >
                Print Profiles
              </button>
            </div>
            <div className="space-y-8">
              {state.data.map((p, i) => (
                <ProfileCard key={i} participant={p} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="no-print pb-8 text-center text-sm text-zinc-400">
        &copy; 2026 The ABLE Foundation &middot; All rights reserved
      </footer>
    </>
  );
}

// ─── Profile Card ────────────────────────────────────────────────────────────

function ProfileCard({ participant }: { participant: Participant }) {
  const {
    fullName,
    preferredName,
    title,
    school,
    years,
    cityState,
    email,
    phone,
    bio,
    social,
    headshot,
  } = participant;

  const displayName = preferredName || fullName;
  const showAlternateName =
    preferredName && preferredName !== fullName ? fullName : null;
  const headshotSrc = getHeadshotSrc(headshot);
  const initials = getInitials(displayName);

  return (
    <article className="profile-card overflow-hidden rounded-lg bg-white shadow-sm">
      {/* Top section: headshot + identity */}
      <div className="flex flex-col items-center gap-6 p-8 md:flex-row md:items-start">
        {/* Headshot */}
        {headshotSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headshotSrc}
            alt={`${displayName} headshot`}
            className="h-40 w-40 shrink-0 rounded-lg object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const next = target.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-azure/10 font-serif text-4xl font-bold text-azure ${
            headshotSrc ? "hidden" : "flex"
          }`}
        >
          {initials}
        </div>

        {/* Identity */}
        <div className="text-center md:text-left">
          <h2 className="font-serif text-2xl font-semibold text-black">
            {displayName}
          </h2>
          {showAlternateName && (
            <p className="mt-0.5 text-sm text-zinc-400">
              ({showAlternateName})
            </p>
          )}
          {title && (
            <p className="mt-2 text-base font-medium text-zinc-700">
              {title}
            </p>
          )}
          {school && <p className="text-sm text-zinc-500">{school}</p>}
          <p className="mt-1 text-sm text-zinc-400">
            {[cityState, years ? `${years} years in education` : ""]
              .filter(Boolean)
              .join(" \u00B7 ")}
          </p>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div className="border-t border-zinc-100 px-8 py-6">
          <p className="text-base leading-relaxed text-zinc-700">{bio}</p>
        </div>
      )}

      {/* Contact row */}
      {(email || phone || social) && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-zinc-100 px-8 py-4 text-sm text-zinc-500">
          {email && (
            <span className="flex items-center gap-1.5">
              <MailIcon />
              {email}
            </span>
          )}
          {phone && (
            <span className="flex items-center gap-1.5">
              <PhoneIcon />
              {phone}
            </span>
          )}
          {social && (
            <span className="flex items-center gap-1.5">
              <LinkIcon />
              {social}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

// ─── States ──────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg bg-white shadow-sm"
        >
          <div className="flex flex-col items-center gap-6 p-8 md:flex-row md:items-start">
            <div className="h-40 w-40 shrink-0 animate-pulse rounded-lg bg-zinc-200" />
            <div className="w-full space-y-3">
              <div className="mx-auto h-6 w-48 animate-pulse rounded bg-zinc-200 md:mx-0" />
              <div className="mx-auto h-4 w-36 animate-pulse rounded bg-zinc-100 md:mx-0" />
              <div className="mx-auto h-4 w-52 animate-pulse rounded bg-zinc-100 md:mx-0" />
              <div className="mx-auto h-3 w-40 animate-pulse rounded bg-zinc-100 md:mx-0" />
            </div>
          </div>
          <div className="border-t border-zinc-100 px-8 py-6">
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl text-error">
        !
      </div>
      <h2 className="mb-2 font-serif text-2xl font-semibold text-black">
        Unable to Load Profiles
      </h2>
      <p className="mb-2 text-sm text-zinc-500">{message}</p>
      <p className="mb-6 text-xs text-zinc-400">
        Make sure the Google Apps Script has a <code>doGet()</code> function
        deployed to serve participant data.
      </p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-azure px-5 py-2.5 text-sm font-medium text-white transition hover:bg-azure-dark"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-20 text-center">
      <h2 className="mb-2 font-serif text-2xl font-semibold text-black">
        No Profiles Yet
      </h2>
      <p className="text-sm text-zinc-500">
        Participant profiles will appear here once submissions have been
        received.
      </p>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getHeadshotSrc(headshot: string): string | null {
  if (!headshot) return null;
  if (headshot.startsWith("http")) return headshot;
  if (headshot.startsWith("data:")) return headshot;
  if (headshot.length > 100) return `data:image/jpeg;base64,${headshot}`;
  return null;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
