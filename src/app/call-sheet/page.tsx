"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PARTICIPANTS,
  fetchLiveParticipants,
  formatPhone,
  type Participant,
} from "../participants";

const SHOOT = {
  projectTitle: "Beyond the Bell",
  episode: "Creative & Cultural Impact Pillar",
  producer: "The ABLE Foundation",
  dateLong: "Saturday, April 25, 2026",
  shootWindow: "10:00 AM \u2013 1:00 PM ET",
  callTime: "TBD",
  loadIn: "TBD",
  strike: "TBD",
  venueName: "Jael Media Studio",
  venueAddress: "8033 Penn Randall Pl, Ste B, Upper Marlboro, MD 20772",
  backdrop: "26ft x 18ft Cyc Wall",
  runtime: "25\u201330 min final runtime",
};

const CREW = [
  {
    role: "Executive Producer",
    name: "Andra Howard",
    org: "The ABLE Foundation",
    note: "Talent & logistics point person on set",
  },
  {
    role: "Creative Director",
    name: "Jalen Christopher",
    org: "The ABLE Foundation",
    note: "Day-of creative decisions",
  },
  {
    role: "Director of Photography",
    name: "Jacob Eldridge",
    org: "Jael Media",
    note: "Studio secured; cameras & audio",
  },
];

const SCHEDULE = [
  { time: "TBD", block: "Crew load-in & setup", detail: "Lighting, audio check, cameras, cyc wall dressing" },
  { time: "10:00 AM", block: "Participant arrivals & check-in", detail: "Release forms, wardrobe review, green room" },
  { time: "10:15 AM", block: "B-roll & educator intro shots", detail: "Individual headshots and ambient capture" },
  { time: "11:00 AM", block: "Movement-based debate", detail: "Visual energy, unscripted moments" },
  { time: "11:45 AM", block: "Jubilee-style roundtable", detail: "Primary discussion forum" },
  { time: "12:45 PM", block: "Intimate breakout moments", detail: "Deeper personal reflection" },
  { time: "1:00 PM", block: "Wrap", detail: "Participant release" },
  { time: "TBD", block: "Strike & load-out", detail: "Crew only" },
];

const EQUIPMENT = [
  { category: "Cameras", item: "3 cameras", owner: "Jael Media" },
  { category: "Audio", item: "6\u20139 lav mics, mixer/receiver, boom pole, C-stand", owner: "Jael Media" },
  { category: "Lighting", item: "Key, fill, practicals + set flags", owner: "TBD" },
  { category: "Seating", item: "Stools (count per final participant roster)", owner: "Studio" },
  { category: "Backdrop", item: "Cyc Wall + any vintage PSA set dressing", owner: "Studio / TBD" },
  { category: "Paperwork", item: "Release forms, call sheet, wardrobe guidance", owner: "ABLE Foundation" },
  { category: "Hospitality", item: "Water & beverages on set; light refreshments", owner: "ABLE Foundation" },
];

export default function CallSheetPage() {
  const [participants, setParticipants] = useState<Participant[]>(PARTICIPANTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const live = await fetchLiveParticipants();
    if (live) setParticipants(live);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SHOOT.venueAddress,
  )}`;

  return (
    <>
      <header className="pb-6 pt-12 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-azure">
          {SHOOT.producer} Presents
        </p>
        <h1 className="mb-1 font-serif text-5xl font-bold text-black md:text-6xl">
          {SHOOT.projectTitle}
        </h1>
        <p className="text-base text-zinc-600">Call Sheet \u00B7 {SHOOT.episode}</p>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-12">
        <div className="no-print mb-6 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {loading
              ? "Loading roster\u2026"
              : `${participants.length} participant${participants.length !== 1 ? "s" : ""} on roster`}
          </p>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-azure px-4 py-2 text-sm font-medium text-white transition hover:bg-azure-dark"
          >
            Print Call Sheet
          </button>
        </div>

        {/* Shoot summary */}
        <section className="call-section mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            <InfoRow label="Shoot Date" value={SHOOT.dateLong} />
            <InfoRow label="Shoot Window" value={SHOOT.shootWindow} />
            <InfoRow label="Call Time" value={SHOOT.callTime} highlight />
            <InfoRow label="Load-In" value={SHOOT.loadIn} highlight />
            <InfoRow label="Strike" value={SHOOT.strike} highlight />
            <InfoRow label="Target Runtime" value={SHOOT.runtime} />
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Location
              </p>
              <p className="mt-1 font-medium text-black">{SHOOT.venueName}</p>
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-azure hover:underline"
              >
                {SHOOT.venueAddress}
              </a>
              <p className="mt-1 text-sm text-zinc-500">
                Backdrop: {SHOOT.backdrop}
              </p>
            </div>
          </div>
        </section>

        {/* Key crew */}
        <section className="call-section mb-6 rounded-lg bg-white p-6 shadow-sm">
          <SectionHeading>Key Crew & Day-Of Contacts</SectionHeading>
          <div className="divide-y divide-zinc-100">
            {CREW.map((c) => (
              <div
                key={c.name}
                className="grid grid-cols-1 gap-1 py-3 md:grid-cols-[11rem_1fr] md:items-baseline md:gap-4"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  {c.role}
                </p>
                <div>
                  <p className="font-medium text-black">{c.name}</p>
                  <p className="text-sm text-zinc-500">{c.org}</p>
                  {c.note && (
                    <p className="mt-0.5 text-xs text-zinc-400">{c.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Schedule */}
        <section className="call-section mb-6 rounded-lg bg-white p-6 shadow-sm">
          <SectionHeading>Schedule</SectionHeading>
          <div className="divide-y divide-zinc-100">
            {SCHEDULE.map((s, i) => (
              <div
                key={i}
                className="grid grid-cols-[5.5rem_1fr] gap-4 py-3"
              >
                <p className="font-mono text-sm font-semibold text-azure">
                  {s.time}
                </p>
                <div>
                  <p className="font-medium text-black">{s.block}</p>
                  <p className="text-sm text-zinc-500">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Talent roster */}
        <section className="call-section mb-6 rounded-lg bg-white p-6 shadow-sm">
          <SectionHeading>
            Talent Roster
            <span className="ml-2 text-sm font-normal text-zinc-400">
              ({participants.length} of 6\u20139)
            </span>
          </SectionHeading>
          {loading ? (
            <p className="py-4 text-sm text-zinc-400">Loading\u2026</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs uppercase tracking-widest text-zinc-400">
                    <th className="py-2 pr-3 font-semibold">#</th>
                    <th className="py-2 pr-3 font-semibold">Name</th>
                    <th className="py-2 pr-3 font-semibold">Role / School</th>
                    <th className="py-2 pr-3 font-semibold">Location</th>
                    <th className="py-2 pr-3 font-semibold">Phone</th>
                    <th className="py-2 font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, i) => (
                    <tr
                      key={p.email || i}
                      className="border-b border-zinc-100 align-top last:border-b-0"
                    >
                      <td className="py-3 pr-3 text-zinc-400">{i + 1}</td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-black">
                          {p.preferredName || p.fullName}
                        </p>
                        {p.preferredName &&
                          p.preferredName !== p.fullName && (
                            <p className="text-xs text-zinc-400">
                              ({p.fullName})
                            </p>
                          )}
                      </td>
                      <td className="py-3 pr-3 text-zinc-600">
                        <p>{p.title}</p>
                        <p className="text-xs text-zinc-400">{p.school}</p>
                      </td>
                      <td className="py-3 pr-3 text-zinc-600">{p.cityState}</td>
                      <td className="py-3 pr-3 font-mono text-xs text-zinc-700">
                        {formatPhone(p.phone)}
                      </td>
                      <td className="break-all py-3 text-xs text-zinc-700">
                        {p.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-xs text-zinc-400">
            Wardrobe guidance, release forms, and arrival details to be shared
            with each participant in advance.
          </p>
        </section>

        {/* Equipment & ownership */}
        <section className="call-section mb-6 rounded-lg bg-white p-6 shadow-sm">
          <SectionHeading>Equipment & Ownership</SectionHeading>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-widest text-zinc-400">
                  <th className="py-2 pr-3 font-semibold">Category</th>
                  <th className="py-2 pr-3 font-semibold">Item</th>
                  <th className="py-2 font-semibold">Owner</th>
                </tr>
              </thead>
              <tbody>
                {EQUIPMENT.map((e, i) => (
                  <tr
                    key={i}
                    className="border-b border-zinc-100 align-top last:border-b-0"
                  >
                    <td className="py-2 pr-3 font-medium text-black">
                      {e.category}
                    </td>
                    <td className="py-2 pr-3 text-zinc-600">{e.item}</td>
                    <td
                      className={`py-2 ${e.owner === "TBD" ? "font-semibold text-error" : "text-zinc-600"}`}
                    >
                      {e.owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Open items */}
        <section className="call-section mb-6 rounded-lg border border-dashed border-azure/40 bg-azure/5 p-6">
          <SectionHeading>Open Items</SectionHeading>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-zinc-700">
            <li>Lock final participant count (target 6\u20139) so studio can stage stool count</li>
            <li>Confirm call time and load-in window with Jael Media</li>
            <li>Confirm strike window needed after 1:00 PM wrap</li>
            <li>Confirm ownership for lighting package and set flags</li>
            <li>Schedule pre-shoot walkthrough or tech scout, if needed</li>
            <li>Send location, call time, wardrobe, and release form to all confirmed educators</li>
          </ul>
        </section>

        <p className="no-print text-center text-xs text-zinc-400">
          This call sheet is a living document. Print once finalized.
        </p>
      </main>

      <footer className="no-print pb-8 text-center text-sm text-zinc-400">
        &copy; 2026 The ABLE Foundation &middot; Beyond the Bell Production
      </footer>
    </>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 font-serif text-xl font-semibold text-black">
      {children}
    </h2>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <p
        className={`mt-1 font-medium ${
          highlight && value === "TBD" ? "text-error" : "text-black"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
