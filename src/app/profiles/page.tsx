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

// ─── Static Participant Data ─────────────────────────────────────────────────

const PARTICIPANTS: Participant[] = [
  {
    fullName: "Jeremiah L. Thomas",
    preferredName: "",
    title: "6th Grade Language Arts Teacher",
    school: "Anne Arundel County Public Schools",
    years: "4",
    cityState: "Annapolis, Maryland",
    email: "jeremiahlthomas@outlook.com",
    phone: "4435967264",
    bio: "Jeremiah Thomas is a dedicated educator and graduate student in Transformational Educational Leadership at Towson University, where he will be graduating soon. He is committed to fostering inclusive, student-centered learning environments that support both academic success and personal growth. With experience working in diverse and urban school settings, Jeremiah prioritizes building strong relationships with students while maintaining high expectations and a classroom culture rooted in respect, accountability, and open-mindedness.\n\nHis teaching philosophy emphasizes collaboration, critical thinking, and real-world application. He designs engaging, standards-based instruction that encourages students to take ownership of their learning while strengthening their literacy and communication skills. Jeremiah is especially passionate about supporting middle school students during critical developmental years.\n\nJeremiah values God, family, and community, which guide both his personal life and professional practice. Outside the classroom, he is a devoted father who believes in leading by example and giving back to those around him. He strives to model integrity, resilience, and empathy, with the goal of inspiring students to become confident, responsible, and thoughtful individuals.",
    social: "LinkedIn - Jeremiah Thomas · X - @mrthomas0916",
    headshot: "/headshots/jeremiah-thomas.jpg",
  },
  {
    fullName: "Dr. William Blake",
    preferredName: "Dr Blake",
    title: "Author/Educator",
    school: "The Ai School Leader",
    years: "20",
    cityState: "Washington DC",
    email: "willblake05@gmail.com",
    phone: "2026741716",
    bio: "Dr. William L. Blake is an award-winning educator and school leader with over 20 years of experience serving students and communities across Washington, DC and Prince George\u2019s County Public Schools. He currently serves as the Assistant Principal of Bard High School Early College DC, where he leads the 9th Grade Academy, ensuring students are academically successful, connected to school, and prepared for what\u2019s next.\n\nDr. Blake\u2019s teaching and leadership philosophy centers on creating joyful, rigorous, and student-centered learning environments where every student feels seen, heard, and valued. He believes strong relationships, high expectations, and culturally responsive practices are essential to unlocking student potential and driving meaningful outcomes.\n\nThroughout his career as a teacher, principal, and district leader, Dr. Blake has led innovative work in school redesign, social-emotional learning, and early college access. He is also the author of The AI School Leader, a practical guide that helps educators use artificial intelligence to lead with greater efficiency, innovation, and impact while keeping students at the center.",
    social: "IG: @doctor_kool",
    headshot: "/headshots/dr-william-blake.jpg",
  },
  {
    fullName: "Jarrell Pittman",
    preferredName: "Jay",
    title: "PBIS Coordinator / Restorative Practices Teacher",
    school: "KIPP DC: Quest Academy",
    years: "10",
    cityState: "Washington, D.C.",
    email: "jarrellpittman6@gmail.com",
    phone: "2404856659",
    bio: "Jarrell Pittman is an educator and creative entrepreneur from Prince George\u2019s County, MD, dedicated to storytelling across various mediums. With KIPP DC, he has advanced from Grade-Level Chair to a key role on the Student Support team. As the PBIS Coordinator and Restorative Practices Teacher, he shapes school culture, facilitates school-wide programs and events all while centering the teaching of life skills, conflict resolution, and emotional regulation.\n\nOutside the classroom, Jarrell works with arts-based non-profits to develop educational programs for children and adults. He also leads Tha Griotsphere Productions, a company that combines storytelling, teaching, and media to offer audiovisual services, workshops, programs, both virtually and in person. Through Tha Griotsphere, Jarrell collaborates with numerous organizations on both commissioned and in-house projects. He also serves on the board of Rhythm Visions Production Company, a non-profit dedicated to arts equity and social justice.\n\nWhether performing as an emcee or teaching in the classroom, Jarrell\u2019s mission is to inspire others to explore their own stories and embrace their personal journeys.",
    social: "Instagram - @jarrellthagriot · LinkedIn - Jarrell Pittman",
    headshot:
      "https://drive.google.com/file/d/1LiAMl-jN-dNdtSRjq5GdljuN2pNQAr7W/view?usp=drivesdk",
  },
  {
    fullName: "Desmond Williams",
    preferredName: "Desmond",
    title: "Teacher",
    school: "Nylinka School Solutions",
    years: "24",
    cityState: "Washington, DC",
    email: "DWilliams@Nylinka.org",
    phone: "202-258-3349",
    bio: "Desmond Williams was a teacher and principal in the Washington, DC area for over 20 years. He is committed to supporting Black boys and underserved children. He is also the author of The Burning House: Educating Black Boys in Modern America.",
    social: "X @Nylinka · Substack @Nylinka · Instagram @Nylinka",
    headshot: "/headshots/desmond-williams.jpg",
  },
  {
    fullName: "Jacquez Rahdi Jefferson",
    preferredName: "J. Rahdi Jefferson",
    title: "8th Grade Action Civics Instructor",
    school: "E. L. Haynes Public Charter School",
    years: "10",
    cityState: "Washington, DC.",
    email: "jacquezrjefferson@gmail.com",
    phone: "2409972047",
    bio: "J. Rahdi Jefferson brings lived experience, creativity, and deep reflection into everything he does—especially the classroom. Many of his fondest memories and personal growth moments were formed in NW/NE DC and Upper Marlboro, MD, places that continue to influence his storytelling and perspective.\n\nInspired to write at a young age, Mr. Jefferson discovered writing as a powerful form of expression. That passion evolved into authorship during his college years at the University of Maryland Eastern Shore and has since grown into a body of work that spans poetry, children’s literature, and reflective prose. To date, he is a self-published author of five books, each rooted in purpose and perspective.\n\nHis educational impact has reached multiple grade levels and his work with students academically has been multicurricular. Currently he teaches 8th grade Action Civics at E. L. Haynes Middle School in NW, DC. He currently serves and studies as an Athari Fellow of the National Association of Black Male Educators.",
    social: "IG @rahdiboomaye",
    headshot:
      "https://drive.google.com/file/d/1q6JTv19nX2mvAD6PO4Z8QUqLq21dwDfQ/view?usp=drivesdk",
  },
];

// ─── Column header mapping (sheet headers → interface keys) ──────────────────

const COLUMN_MAP: Record<string, keyof Participant> = {
  "Full Name": "fullName",
  "Preferred Name": "preferredName",
  "Professional Title": "title",
  "School / Organization": "school",
  "Years in Education": "years",
  "City & State": "cityState",
  Email: "email",
  Phone: "phone",
  "Professional Bio": "bio",
  "Headshot Link": "headshot",
  "Social Media": "social",
};

function normalizeRow(row: Record<string, string>): Participant {
  const p: Record<string, string> = {
    fullName: "",
    preferredName: "",
    title: "",
    school: "",
    years: "",
    cityState: "",
    email: "",
    phone: "",
    bio: "",
    social: "",
    headshot: "",
  };
  for (const [key, value] of Object.entries(row)) {
    const mapped = COLUMN_MAP[key];
    if (mapped) {
      p[mapped] = String(value ?? "");
    } else if (key in p) {
      p[key] = String(value ?? "");
    }
  }
  return p as unknown as Participant;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProfilesPage() {
  const [participants, setParticipants] = useState<Participant[]>(PARTICIPANTS);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : json.data ?? [];
      if (rows.length > 0) {
        const fetched = rows.map(normalizeRow);
        // Merge local headshots for participants whose API headshot is empty
        const localHeadshots = new Map(
          PARTICIPANTS.filter((p) => p.headshot.startsWith("/")).map((p) => [p.fullName, p.headshot]),
        );
        for (const p of fetched) {
          if (!p.headshot && localHeadshots.has(p.fullName)) {
            p.headshot = localHeadshots.get(p.fullName)!;
          }
        }
        setParticipants(fetched);
      }
    } catch {
      // API unavailable — keep static data
    } finally {
      setLoading(false);
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
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="no-print mb-8 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                {participants.length} participant
                {participants.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => window.print()}
                className="rounded-lg bg-azure px-4 py-2 text-sm font-medium text-white transition hover:bg-azure-dark"
              >
                Print Profiles
              </button>
            </div>
            <div className="space-y-8">
              {participants.map((p, i) => (
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
            referrerPolicy="no-referrer"
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
          {bio.split("\n").map((paragraph, i) =>
            paragraph.trim() ? (
              <p
                key={i}
                className="mb-3 text-base leading-relaxed text-zinc-700 last:mb-0"
              >
                {paragraph}
              </p>
            ) : null,
          )}
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

// ─── Loading Skeleton ────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getHeadshotSrc(headshot: string): string | null {
  if (!headshot) return null;

  // Convert Google Drive share URLs to direct image URLs
  const driveMatch = headshot.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  );
  if (driveMatch) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  if (headshot.startsWith("/")) return headshot;
  if (headshot.startsWith("http")) return headshot;
  if (headshot.startsWith("data:")) return headshot;
  if (headshot.length > 100) return `data:image/jpeg;base64,${headshot}`;
  return null;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0)
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
