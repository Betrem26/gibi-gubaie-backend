import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";

const router = Router();

// ── GET /api/members ──────────────────────────────────────────────────────────
// Returns CouncilMember records shaped to match the MemberWithStats interface
// the frontend expects.  The User model is for the general association roster;
// CouncilMember is for campus council staff.  Both are surfaced here so the
// Members page is populated as soon as council members are registered.
router.get("/", async (_req, res: Response) => {
  try {
    // Prefer User records (general roster); fall back to CouncilMembers when
    // the User table is empty (i.e. everyone registered via /auth/register).
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { attendances: true, payments: true } } },
    }).catch(() => [] as never[]);

    if (users.length > 0) {
      return res.json(users);
    }

    // No User rows — surface CouncilMembers instead, shaped to MemberWithStats
    const councilMembers = await prisma.councilMember.findMany({
      orderBy: { createdAt: "desc" },
    });

    const shaped = councilMembers.map((m) => ({
      id:            m.id,
      clerkId:       null,
      name:          m.name,
      email:         m.email,
      phone:         m.phone,
      universityId:  m.universityId,
      // Map CouncilSection → Department (best-effort)
      department:    sectionToDepartment(m.section),
      batch:         m.batch,
      role:          "MEMBER" as const,
      spiritualTitle:"NONE"   as const,
      isActive:      m.isActive,
      baptismalName: m.baptismalName,
      kebele:        null,
      createdAt:     m.createdAt,
      updatedAt:     m.updatedAt,
      _count:        { attendances: 0, payments: 0 },
    }));

    res.json(shaped);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/members] Error:", msg);
    res.status(500).json({ error: msg });
  }
});

// ── POST /api/members ─────────────────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const body = req.body;
  const required = ["name", "email", "universityId", "department", "batch"];
  for (const f of required) {
    if (!body[f]) return res.status(400).json({ error: `Missing: ${f}` });
  }

  try {
    const member = await prisma.user.create({
      data: {
        clerkId:      `manual_${Date.now()}`,
        name:         String(body.name).trim(),
        email:        String(body.email).trim().toLowerCase(),
        phone:        body.phone ? String(body.phone).trim() : null,
        universityId: String(body.universityId).trim(),
        department:   body.department,
        batch:        String(body.batch).trim(),
        role:         body.role ?? "MEMBER",
      },
    });
    res.status(201).json(member);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/members] Error:", msg);
    if (msg.includes("Unique") || msg.includes("unique")) {
      return res.status(409).json({ error: "Email or University ID already exists." });
    }
    res.status(500).json({ error: msg });
  }
});

// ── PATCH /api/members ────────────────────────────────────────────────────────
router.patch("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: "ID required" });

  try {
    const member = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name         && { name: String(data.name).trim() }),
        ...(data.email        && { email: String(data.email).trim().toLowerCase() }),
        ...(data.phone        !== undefined && { phone: data.phone ? String(data.phone).trim() : null }),
        ...(data.universityId && { universityId: String(data.universityId).trim() }),
        ...(data.department   && { department: data.department }),
        ...(data.batch        && { batch: String(data.batch).trim() }),
        ...(data.role         && { role: data.role }),
        ...(data.isActive     !== undefined && {
          isActive: data.isActive === "false" || data.isActive === false ? false : Boolean(data.isActive),
        }),
      },
    });
    res.json(member);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PATCH /api/members] Error:", msg);
    res.status(400).json({ error: msg });
  }
});

// ── helper: map CouncilSection to the closest Department enum value ───────────
function sectionToDepartment(section: string): string {
  const map: Record<string, string> = {
    MAIN_OFFICE:        "EDUCATION",
    EDUCATION:          "EDUCATION",
    CHOIR:              "CHOIR",
    FINANCE:            "FINANCE",
    PUBLIC_RELATIONS:   "PUBLIC_RELATIONS",
    RESEARCH:           "RESEARCH",
    CHARITY:            "CHARITY",
    BATCH_COORDINATION: "EDUCATION",
  };
  return map[section] ?? "EDUCATION";
}

export default router;
