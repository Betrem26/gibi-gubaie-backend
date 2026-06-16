import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: "asc" },
      include: { attendances: { select: { userId: true, present: true } } },
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const body = req.body;
  if (!body.name || !body.type || !body.eventDate)
    return res.status(400).json({ error: "name, type, eventDate required" });
  try {
    const event = await prisma.event.create({
      data: {
        name: String(body.name).trim(), type: body.type,
        description: body.description ? String(body.description).trim() : null,
        eventDate: new Date(body.eventDate),
        location: body.location ? String(body.location).trim() : null,
        isRecurring: body.isRecurring ?? false,
      },
      include: { attendances: { select: { userId: true, present: true } } },
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

router.patch("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: "ID required" });
  try {
    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(data.name        !== undefined && { name: String(data.name).trim() }),
        ...(data.type        !== undefined && { type: data.type }),
        ...(data.description !== undefined && { description: data.description ? String(data.description).trim() : null }),
        ...(data.eventDate   !== undefined && { eventDate: new Date(data.eventDate) }),
        ...(data.location    !== undefined && { location: data.location ? String(data.location).trim() : null }),
        ...(data.isRecurring !== undefined && { isRecurring: Boolean(data.isRecurring) }),
      },
      include: { attendances: { select: { userId: true, present: true } } },
    });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

router.delete("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "ID required" });
  try {
    await prisma.event.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

export default router;
