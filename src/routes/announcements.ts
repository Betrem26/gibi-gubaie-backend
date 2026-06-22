import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { smsService, SMSService, SMSResult } from "../lib/sms-service";

const router = Router();

// GET /api/announcements
router.get("/", async (_req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to fetch" });
  }
});

// POST /api/announcements
router.post("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const body = req.body;
    if (!body.title || !body.body)
      return res.status(400).json({ error: "Title and body are required" });

    const announcement = await prisma.announcement.create({
      data: {
        title:    String(body.title).trim(),
        body:     String(body.body).trim(),
        isPinned: body.isPinned ?? false,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    let smsStatus = { sent: 0, failed: 0, total: 0 };
    if (body.sendSMS) {
      try { smsStatus = await sendAnnouncementSMS(announcement.title, announcement.body); }
      catch { /* SMS failure doesn't block */ }
    }

    res.status(201).json({ ...announcement, smsStatus });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to create" });
  }
});

// PATCH /api/announcements
router.patch("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { id, ...data } = req.body;
    if (!id) return res.status(400).json({ error: "ID required" });

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(data.title     !== undefined && { title:     String(data.title).trim() }),
        ...(data.body      !== undefined && { body:      String(data.body).trim() }),
        ...(data.isPinned  !== undefined && { isPinned:  Boolean(data.isPinned) }),
        ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }),
      },
    });
    res.json(announcement);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed to update" });
  }
});

// DELETE /api/announcements?id=...
router.delete("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: "ID required" });
    await prisma.announcement.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed to delete" });
  }
});

async function sendAnnouncementSMS(title: string, body: string) {
  const members = await prisma.user.findMany({
    where: { isActive: true, phone: { not: null } },
    select: { phone: true },
  });
  const phones = members.map((m: { phone: string | null }) => m.phone).filter((p: string | null): p is string => p !== null);
  if (!phones.length) return { sent: 0, failed: 0, total: 0 };
  const msg     = SMSService.formatAnnouncementSMS(title, body);
  const results = await smsService.sendBulkSMS(phones, msg, "announcement");
  return { sent: results.filter((r: SMSResult) => r.success).length, failed: results.filter((r: SMSResult) => !r.success).length, total: phones.length };
}

export default router;
