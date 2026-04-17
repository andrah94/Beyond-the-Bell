export interface Participant {
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

export const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzM9ngzOZNjdLQpNBPOs9Cgb8hJ7SxpE9SmTz7DIOF632sJa1k26vSd1c4Dg3qu7XnV/exec";

export const PARTICIPANTS: Participant[] = [
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
    social: "LinkedIn - Jeremiah Thomas \u00B7 X - @mrthomas0916",
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
    social: "Instagram - @jarrellthagriot \u00B7 LinkedIn - Jarrell Pittman",
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
    social: "X @Nylinka \u00B7 Substack @Nylinka \u00B7 Instagram @Nylinka",
    headshot: "/headshots/desmond-williams.jpg",
  },
];

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

export function normalizeRow(row: Record<string, string>): Participant {
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

export async function fetchLiveParticipants(): Promise<Participant[] | null> {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rows = Array.isArray(json) ? json : (json.data ?? []);
    if (rows.length === 0) return null;
    const fetched = rows.map(normalizeRow);
    const localHeadshots = new Map(
      PARTICIPANTS.filter((p) => p.headshot.startsWith("/")).map((p) => [
        p.fullName,
        p.headshot,
      ]),
    );
    for (const p of fetched) {
      if (!p.headshot && localHeadshots.has(p.fullName)) {
        p.headshot = localHeadshots.get(p.fullName)!;
      }
    }
    return fetched;
  } catch {
    return null;
  }
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
