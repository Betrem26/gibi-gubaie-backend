/**
 * council-data.ts — pure data, no React imports, safe to import anywhere.
 */
import { CouncilSection, CouncilRole } from "../generated/prisma/client";

// ── Serializable section metadata (no icon) ───────────────────────────────────

export interface SectionData {
  key:         CouncilSection;
  label:       string;
  amharic:     string;
  description: string;
  href:        string;
  color:       string;
  textColor:   string;
  bgColor:     string;
  borderColor: string;
}

export const SECTION_DATA: Record<CouncilSection, SectionData> = {
  MAIN_OFFICE: {
    key:         "MAIN_OFFICE",
    label:       "Main Office",
    amharic:     "ዋና ጽ/ቤት",
    description: "Central administration overseeing all 7 council sections",
    href:        "/council/main-office",
    color:       "bg-blue-600",
    textColor:   "text-blue-700",
    bgColor:     "bg-blue-50",
    borderColor: "border-blue-200",
  },
  EDUCATION: {
    key:         "EDUCATION",
    label:       "Education",
    amharic:     "ትምህርት ክፍል",
    description: "Academic programs, Bible study, teacher assignment & course follow-up",
    href:        "/council/education",
    color:       "bg-sky-500",
    textColor:   "text-sky-700",
    bgColor:     "bg-sky-50",
    borderColor: "border-sky-200",
  },
  CHOIR: {
    key:         "CHOIR",
    label:       "Choir & Fine Arts",
    amharic:     "ዘማሪ እና ኪነ ጥበብ ክፍል",
    description: "Liturgical music, fine arts, visual arts, training & planning",
    href:        "/council/choir",
    color:       "bg-purple-500",
    textColor:   "text-purple-700",
    bgColor:     "bg-purple-50",
    borderColor: "border-purple-200",
  },
  FINANCE: {
    key:         "FINANCE",
    label:       "Development",
    amharic:     "ልማት ክፍል",
    description: "Revenue collection, property, media, project design & publications",
    href:        "/council/finance",
    color:       "bg-emerald-500",
    textColor:   "text-emerald-700",
    bgColor:     "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  PUBLIC_RELATIONS: {
    key:         "PUBLIC_RELATIONS",
    label:       "Public Relations",
    amharic:     "ህዝብ ግንኙነት ክፍል",
    description: "Communications, outreach & community engagement",
    href:        "/council/public-relations",
    color:       "bg-amber-500",
    textColor:   "text-amber-700",
    bgColor:     "bg-amber-50",
    borderColor: "border-amber-200",
  },
  RESEARCH: {
    key:         "RESEARCH",
    label:       "አባላት እንክብካቤ",
    amharic:     "አባላት እንክብካቤ ክፍል",
    description: "Member registration, department assignments & member welfare",
    href:        "/council/research",
    color:       "bg-rose-500",
    textColor:   "text-rose-700",
    bgColor:     "bg-rose-50",
    borderColor: "border-rose-200",
  },
  CHARITY: {
    key:         "CHARITY",
    label:       "Charity (Mitswa)",
    amharic:     "ምጽዋት ክፍል",
    description: "Charitable activities & community service",
    href:        "/council/charity",
    color:       "bg-pink-500",
    textColor:   "text-pink-700",
    bgColor:     "bg-pink-50",
    borderColor: "border-pink-200",
  },
  BATCH_COORDINATION: {
    key:         "BATCH_COORDINATION",
    label:       "Batch & Coordination",
    amharic:     "ባች እና ማስተባበሪያ ክፍል",
    description: "Announcements, program preparation, travel, committees & member affairs",
    href:        "/council/batch-coordination",
    color:       "bg-indigo-500",
    textColor:   "text-indigo-700",
    bgColor:     "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
};

export const ALL_SECTION_DATA = Object.values(SECTION_DATA);

// ── Role metadata ─────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<CouncilRole, string> = {
  SECTION_HEAD: "Section Head",
  DEPUTY_HEAD:  "Deputy Head",
  SECRETARY:    "Secretary",
  TREASURER:    "Treasurer",
  COORDINATOR:  "Coordinator",
  MEMBER:       "Member",
};

export const ROLE_STYLES: Record<CouncilRole, string> = {
  SECTION_HEAD: "bg-blue-100 text-blue-700 border-blue-200",
  DEPUTY_HEAD:  "bg-violet-100 text-violet-700 border-violet-200",
  SECRETARY:    "bg-sky-100 text-sky-700 border-sky-200",
  TREASURER:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  COORDINATOR:  "bg-amber-100 text-amber-700 border-amber-200",
  MEMBER:       "bg-slate-100 text-slate-600 border-slate-200",
};

// ── URL slug ↔ CouncilSection mapping ─────────────────────────────────────────

export const SLUG_TO_SECTION: Record<string, CouncilSection> = {
  "main-office":         "MAIN_OFFICE",
  "education":           "EDUCATION",
  "choir":               "CHOIR",
  "finance":             "FINANCE",
  "public-relations":    "PUBLIC_RELATIONS",
  "research":            "RESEARCH",
  "charity":             "CHARITY",
  "batch-coordination":  "BATCH_COORDINATION",
};

export const SECTION_TO_SLUG: Record<CouncilSection, string> = {
  MAIN_OFFICE:          "main-office",
  EDUCATION:            "education",
  CHOIR:                "choir",
  FINANCE:              "finance",
  PUBLIC_RELATIONS:     "public-relations",
  RESEARCH:             "research",
  CHARITY:              "charity",
  BATCH_COORDINATION:   "batch-coordination",
};

// ── Sub-sections per council section ─────────────────────────────────────────

export interface SubSectionDef {
  key:     string;
  label:   string;   // Amharic
  labelEn: string;   // English
}

export const SECTION_SUB_SECTIONS: Partial<Record<CouncilSection, SubSectionDef[]>> = {

  // ── Education ──────────────────────────────────────────────────────────────
  EDUCATION: [
    { key: "ትምሕርታዊ_ስነ_ጽሑፍ", label: "ትምሕርታዊ ስነ ጽሑፍ", labelEn: "Educational Literature" },
    { key: "አባላት",             label: "አባላት",             labelEn: "Members" },
    { key: "አብነት",             label: "አብነት",             labelEn: "Model / Example" },
    { key: "መምህራን_ምደባ",       label: "መምህራን ምደባ",       labelEn: "Teacher Assignment" },
    { key: "ኮርስ_ክትትል",        label: "ኮርስ ክትትል",        labelEn: "Course Follow-up" },
    { key: "ኦዲት",              label: "ኦዲት",              labelEn: "Audit" },
  ],

  // ── Choir & Fine Arts ──────────────────────────────────────────────────────
  CHOIR: [
    { key: "መዝሙር",             label: "መዝሙር",             labelEn: "Hymn" },
    { key: "ኪነ_ጥበብ",           label: "ኪነ-ጥበብ",           labelEn: "Fine Arts" },
    { key: "ሥነ_ሥዕል",           label: "ሥነ-ሥዕል",           labelEn: "Visual Arts" },
    { key: "አባላት_እንክብካቤ",      label: "አባላት እንክብካቤ",      labelEn: "Member Care" },
    { key: "ኦዲት",              label: "ኦዲት",              labelEn: "Audit" },
    { key: "ስልጠና_ዘርፍ",         label: "ስልጠና ዘርፍ",         labelEn: "Training" },
    { key: "ጥናት",              label: "ጥናት",              labelEn: "Research / Study" },
    { key: "ዜማ_እና_ንዋዬ_ቅዱሳት",  label: "ዜማ እና ንዋዬ ቅዱሳት",  labelEn: "Melody & Sacred Instruments" },
    { key: "እቅድ",              label: "እቅድ",              labelEn: "Planning" },
  ],

  // ── Development (Finance) ──────────────────────────────────────────────────
  FINANCE: [
    { key: "ሰብሳቢ",             label: "ሰብሳቢ",             labelEn: "Chairperson" },
    { key: "ምክትል",             label: "ምክትል",             labelEn: "Deputy" },
    { key: "ፅሐፌ",              label: "ፅሐፌ",              labelEn: "Secretary" },
    { key: "ንብረት",             label: "ንብረት",             labelEn: "Property" },
    { key: "ዳቦ",               label: "ዳቦ",               labelEn: "Bread (Liturgical)" },
    { key: "ኦዲት",              label: "ኦዲት",              labelEn: "Audit" },
    { key: "አባላት",             label: "አባላት",             labelEn: "Members" },
    { key: "ካሜራ",              label: "ካሜራ",              labelEn: "Camera / Media" },
    { key: "ሕትመት",             label: "ሕትመት",             labelEn: "Print / Publication" },
    { key: "ገቢ_አሰባሰብ",         label: "ገቢ አሰባሰብ",         labelEn: "Revenue Collection" },
    { key: "ፕሮጀክት_ቀረፃ",        label: "ፕሮጀክት ቀረፃ",        labelEn: "Project Design" },
    { key: "ልዩ_ልዩ",            label: "ልዩ ልዩ",            labelEn: "Miscellaneous" },
    { key: "ዕቅድ",              label: "ዕቅድ",              labelEn: "Planning" },
  ],

  // ── Batch & Coordination ───────────────────────────────────────────────────
  BATCH_COORDINATION: [
    { key: "ማስታወቂያ_እና_ቅስቀሳ",  label: "ማስታወቂያ እና ቅስቀሳ",  labelEn: "Announcement & Promotion" },
    { key: "መርሐ_ግብር_ዝግጅት",    label: "መርሐ ግብር ዝግጅት",    labelEn: "Program Preparation" },
    { key: "ፅዋ_እና_ጉዞ",         label: "ፅዋ እና ጉዞ",         labelEn: "Cup & Travel" },
    { key: "ኮሚቴ",              label: "ኮሚቴ",              labelEn: "Committee" },
    { key: "አባላት_ጉዳይ",         label: "አባላት ጉዳይ",         labelEn: "Member Affairs" },
    { key: "ትምህርት_ጉዳይ",        label: "ትምህርት ጉዳይ",        labelEn: "Education Affairs" },
    { key: "እቅድ",              label: "እቅድ",              labelEn: "Planning" },
    { key: "ኦዲት",              label: "ኦዲት",              labelEn: "Audit" },
  ],

  // MAIN_OFFICE, PUBLIC_RELATIONS, RESEARCH, CHARITY — no sub-sections
};
