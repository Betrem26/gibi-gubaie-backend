import { Router, Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { CouncilSection } from "../generated/prisma";

const router = Router();

// GET /api/council?section=...
router.get("/", async (req: Request, res: Response) => {
  try {
    const raw = req.query.section;
    const section: CouncilSection | undefined =
      typeof raw === "string" ? (raw as CouncilSection) : undefined;
    const members = await prisma.councilMember.findMany({
      where: section ? { section } : undefined,
      orderBy: [{ section: "asc" }, { role: "asc" }, { name: "asc" }],
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

// GET /api/council/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const member = await prisma.councilMember.findUnique({ where: { id: req.params.id } });
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

async function getCallerMeta(userId: string) {
  const user     = await clerkClient.users.getUser(userId);
  const meta     = user.publicMetadata as { councilSection?: string; councilRole?: string } | undefined;
  return { section: meta?.councilSection ?? null, role: meta?.councilRole ?? "MEMBER" };
}

// POST /api/council
router.post("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const caller = await getCallerMeta(userId);
  const body   = req.body;
  const required = ["name", "email", "universityId", "section", "batch"];
  for (const f of required) {
    if (!body[f]) return res.status(400).json({ error: `Missing: ${f}` });
  }

  const allowed = caller.section === "MAIN_OFFICE" || caller.section === "RESEARCH" ||
    ((caller.role === "SECTION_HEAD" || caller.role === "DEPUTY_HEAD") && caller.section === body.section);
  if (!allowed) return res.status(403).json({ error: "Permission denied" });

  try {
    const member = await prisma.councilMember.create({
      data: {
        name: String(body.name).trim(), email: String(body.email).trim().toLowerCase(),
        phone: body.phone ? String(body.phone).trim() : null,
        universityId: String(body.universityId).trim(), section: body.section,
        subSection: body.subSection ? String(body.subSection).trim() : null,
        role: body.role ?? "MEMBER", batch: String(body.batch).trim(),
        baptismalName: body.baptismalName ? String(body.baptismalName).trim() : null,
        bio: body.bio ? String(body.bio).trim() : null,
        photoUrl: body.photoUrl ? String(body.photoUrl).trim() : null,
      },
    });
    res.status(201).json(member);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    res.status(msg.includes("Unique") ? 409 : 400).json({ error: msg.includes("Unique") ? "Email or ID already exists." : msg });
  }
});

// PATCH /api/council
router.patch("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const caller   = await getCallerMeta(userId);
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: "ID required" });

  const existing = await prisma.councilMember.findUnique({ where: { id }, select: { section: true } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const allowed = caller.section === "MAIN_OFFICE" || caller.section === "RESEARCH" ||
    ((caller.role === "SECTION_HEAD" || caller.role === "DEPUTY_HEAD") && caller.section === existing.section);
  if (!allowed) return res.status(403).json({ error: "Permission denied" });

  try {
    const member = await prisma.councilMember.update({
      where: { id },
      data: {
        ...(data.name          && { name: String(data.name).trim() }),
        ...(data.email         && { email: String(data.email).trim().toLowerCase() }),
        ...(data.phone         !== undefined && { phone: data.phone ? String(data.phone).trim() : null }),
        ...(data.universityId  && { universityId: String(data.universityId).trim() }),
        ...(data.section       && { section: data.section }),
        ...(data.subSection    !== undefined && { subSection: data.subSection ? String(data.subSection).trim() : null }),
        ...(data.role          && { role: data.role }),
        ...(data.batch         && { batch: String(data.batch).trim() }),
        ...(data.baptismalName !== undefined && { baptismalName: data.baptismalName ? String(data.baptismalName).trim() : null }),
        ...(data.bio           !== undefined && { bio: data.bio ? String(data.bio).trim() : null }),
        ...(data.photoUrl      !== undefined && { photoUrl: data.photoUrl ? String(data.photoUrl).trim() : null }),
        ...(data.isActive      !== undefined && { isActive: data.isActive === "true" || data.isActive === true }),
      },
    });
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

// DELETE /api/council?id=...
router.delete("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const caller = await getCallerMeta(userId);
  const id     = req.query.id as string;
  if (!id) return res.status(400).json({ error: "ID required" });

  const existing = await prisma.councilMember.findUnique({ where: { id }, select: { section: true } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const allowed = caller.section === "MAIN_OFFICE" || caller.section === "RESEARCH" ||
    ((caller.role === "SECTION_HEAD" || caller.role === "DEPUTY_HEAD") && caller.section === existing.section);
  if (!allowed) return res.status(403).json({ error: "Permission denied" });

  try {
    await prisma.councilMember.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

export default router;
