import { mainOfficeSpec } from "./sections/main-office";
import { authSpec }       from "./sections/auth";
import { buildSectionSpec } from "./sections/section-factory";

// ── Build the 7 section specs using the factory ───────────────────────────────

export const educationSpec = buildSectionSpec({
  key: "EDUCATION", slug: "education",
  label: "Education", amharic: "ትምህርት ክፍል",
  description: "Manages academic programs, Bible study sessions, teacher assignments, course follow-up, and educational literature.",
  subSections: ["ትምሕርታዊ ስነ ጽሑፍ", "አባላት", "አብነት", "መምህራን ምደባ", "ኮርስ ክትትል", "ኦዲት"],
  canWrite: "SECTION_HEAD / DEPUTY_HEAD of EDUCATION, or MAIN_OFFICE / RESEARCH.",
});

export const choirSpec = buildSectionSpec({
  key: "CHOIR", slug: "choir",
  label: "Choir & Fine Arts", amharic: "ዘማሪ እና ኪነ ጥበብ ክፍል",
  description: "Oversees liturgical music (Zema), fine arts, visual arts, training programs, sacred instruments, and planning.",
  subSections: ["መዝሙር", "ኪነ-ጥበብ", "ሥነ-ሥዕል", "አባላት እንክብካቤ", "ኦዲት", "ስልጠና ዘርፍ", "ጥናት", "ዜማ እና ንዋዬ ቅዱሳት", "እቅድ"],
  canWrite: "SECTION_HEAD / DEPUTY_HEAD of CHOIR, or MAIN_OFFICE / RESEARCH.",
});

export const financeSpec = buildSectionSpec({
  key: "FINANCE", slug: "finance",
  label: "Development (Finance)", amharic: "ልማት ክፍል",
  description: "Handles revenue collection, property management, media/camera, print & publication, project design, and liturgical bread (Dabo).",
  subSections: ["ሰብሳቢ", "ምክትል", "ፅሐፌ", "ንብረት", "ዳቦ", "ኦዲት", "አባላት", "ካሜራ", "ሕትመት", "ገቢ አሰባሰብ", "ፕሮጀክት ቀረፃ", "ልዩ ልዩ", "ዕቅድ"],
  canWrite: "SECTION_HEAD / DEPUTY_HEAD of FINANCE, or MAIN_OFFICE / RESEARCH.",
});

export const publicRelationsSpec = buildSectionSpec({
  key: "PUBLIC_RELATIONS", slug: "public-relations",
  label: "Public Relations", amharic: "ህዝብ ግንኙነት ክፍል",
  description: "Manages communications, community outreach, public engagement, and association visibility.",
  subSections: [],
  canWrite: "SECTION_HEAD / DEPUTY_HEAD of PUBLIC_RELATIONS, or MAIN_OFFICE / RESEARCH.",
});

export const researchSpec = buildSectionSpec({
  key: "RESEARCH", slug: "research",
  label: "Member Care (Research)", amharic: "አባላት እንክብካቤ ክፍል",
  description: "Handles member registration, department assignments, welfare tracking, and member care. Also has elevated write access to all other sections.",
  subSections: [],
  canWrite: "RESEARCH has **elevated permissions** — can write to all sections in addition to its own.",
});

export const charitySpec = buildSectionSpec({
  key: "CHARITY", slug: "charity",
  label: "Charity (Mitswa)", amharic: "ምጽዋት ክፍል",
  description: "Coordinates charitable activities, community service projects, and outreach to those in need (Mitswa — ምጽዋት).",
  subSections: [],
  canWrite: "SECTION_HEAD / DEPUTY_HEAD of CHARITY, or MAIN_OFFICE / RESEARCH.",
});

export const batchCoordSpec = buildSectionSpec({
  key: "BATCH_COORDINATION", slug: "batch-coordination",
  label: "Batch & Coordination", amharic: "ባች እና ማስተባበሪያ ክፍል",
  description: "Manages announcements & promotions, program preparation, travel logistics (Cup & Travel), committees, member affairs, and education affairs.",
  subSections: ["ማስታወቂያ እና ቅስቀሳ", "መርሐ ግብር ዝግጅት", "ፅዋ እና ጉዞ", "ኮሚቴ", "አባላት ጉዳይ", "ትምህርት ጉዳይ", "እቅድ", "ኦዲት"],
  canWrite: "SECTION_HEAD / DEPUTY_HEAD of BATCH_COORDINATION, or MAIN_OFFICE / RESEARCH.",
});

// ── Export the full registry ──────────────────────────────────────────────────

export const sectionSpecs: Record<string, object> = {
  "auth":              authSpec,
  "main-office":       mainOfficeSpec,
  "education":         educationSpec,
  "choir":             choirSpec,
  "finance":           financeSpec,
  "public-relations":  publicRelationsSpec,
  "research":          researchSpec,
  "charity":           charitySpec,
  "batch-coordination":batchCoordSpec,
};

// ── Hub page metadata ─────────────────────────────────────────────────────────

export const hubSections = [
  { slug: "auth",               label: "Authentication",         amharic: "መግቢያ / ፈቃድ",              color: "#0f172a", endpoints: "Session · Onboarding · Token guide" },
  { slug: "main-office",        label: "Main Office",            amharic: "ዋና ጽ/ቤት",                color: "#1e40af", endpoints: "All endpoints — full access" },
  { slug: "education",          label: "Education",              amharic: "ትምህርት ክፍል",              color: "#0ea5e9", endpoints: "Council · Tasks · Events · Announcements · Prayer" },
  { slug: "choir",              label: "Choir & Fine Arts",      amharic: "ዘማሪ እና ኪነ ጥበብ ክፍል",    color: "#a855f7", endpoints: "Council · Tasks · Events · Announcements · Prayer" },
  { slug: "finance",            label: "Development",            amharic: "ልማት ክፍል",               color: "#10b981", endpoints: "Council · Tasks · Events · Announcements · Prayer" },
  { slug: "public-relations",   label: "Public Relations",       amharic: "ህዝብ ግንኙነት ክፍል",        color: "#f59e0b", endpoints: "Council · Tasks · Events · Announcements · Prayer" },
  { slug: "research",           label: "Member Care",            amharic: "አባላት እንክብካቤ ክፍል",      color: "#ef4444", endpoints: "Council · Tasks · Events · Announcements · Prayer" },
  { slug: "charity",            label: "Charity (Mitswa)",       amharic: "ምጽዋት ክፍል",              color: "#ec4899", endpoints: "Council · Tasks · Events · Announcements · Prayer" },
  { slug: "batch-coordination", label: "Batch & Coordination",   amharic: "ባች እና ማስተባበሪያ ክፍል",   color: "#6366f1", endpoints: "Council · Tasks · Events · Announcements · Prayer" },
];
