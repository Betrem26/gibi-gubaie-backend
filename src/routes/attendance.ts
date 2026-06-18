import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";

const router = Router();

// GET /api/attendance?eventName=...&eventDate=...
router.get("/", async (req: Request, res: Response) => {
  try {
    const { eventName, eventDate } = req.query as { eventName?: string; eventDate?: string };
    if (!eventName || !eventDate)
      return res.status(400).json({ error: "eventName and eventDate required" });

    const records = await prisma.attendance.findMany({
      where: { eventName, eventDate: new Date(eventDate) },
      select: { userId: true, present: true },
    });
    res.json({ presentIds: records.filter((r: { userId: string; present: boolean }) => r.present).map((r: { userId: string; present: boolean }) => r.userId) });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

// POST /api/attendance
router.post("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { eventName, eventDate, presentIds, allIds } = req.body;
    if (!eventName || !eventDate || !Array.isArray(allIds))
      return res.status(400).json({ error: "eventName, eventDate, allIds required" });

    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) return res.status(400).json({ error: "Invalid date" });

    const presentSet = new Set<string>(Array.isArray(presentIds) ? presentIds : []);
    const records = (allIds as string[]).map((id) => ({
      userId: id, eventName, eventDate: parsedDate, present: presentSet.has(id),
    }));

    await prisma.$transaction(
      records.map((r) => prisma.attendance.upsert({
        where: { userId_eventDate_eventName: { userId: r.userId, eventDate: r.eventDate, eventName: r.eventName } },
        update: { present: r.present },
        create: r,
      }))
    );
    res.json({ success: true, saved: records.length });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

export default router;
