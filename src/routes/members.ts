import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res: Response) => {
  try {
    const members = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { attendances: true, payments: true } } },
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

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
        clerkId: `manual_${Date.now()}`,
        name: String(body.name).trim(), email: String(body.email).trim().toLowerCase(),
        phone: body.phone ? String(body.phone).trim() : null,
        universityId: String(body.universityId).trim(),
        department: body.department, batch: String(body.batch).trim(),
        role: body.role ?? "MEMBER",
      },
    });
    res.status(201).json(member);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    res.status(msg.includes("Unique") ? 409 : 400).json({ error: msg.includes("Unique") ? "Email or ID already exists." : msg });
  }
});

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
        ...(data.isActive     !== undefined && { isActive: Boolean(data.isActive) }),
      },
    });
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

export default router;
