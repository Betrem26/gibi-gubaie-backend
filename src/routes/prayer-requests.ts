import { Router, Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res: Response) => {
  try {
    const requests = await prisma.prayerRequest.findMany({
      orderBy: [{ isResolved: "asc" }, { createdAt: "desc" }],
      include: { user: { select: { id: true, name: true, department: true } } },
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const body = req.body;
  if (!body.title || !body.description)
    return res.status(400).json({ error: "title and description required" });

  try {
    // Try to find the User record linked to this Clerk user
    let user = await prisma.user.findFirst({ where: { clerkId: userId } });

    // Fallback: if the user completed onboarding as a CouncilMember (no User row),
    // auto-create a minimal User record so they can submit prayer requests.
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email     = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      const name      = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || email;

      // Check if a User with this email already exists (created manually via /api/members)
      user = await prisma.user.findFirst({ where: { email } });

      if (!user) {
        return res.status(404).json({
          error: "No member profile found. Please complete onboarding or contact an administrator.",
        });
      }
    }

    const request = await prisma.prayerRequest.create({
      data: {
        userId:      user.id,
        title:       String(body.title).trim(),
        description: String(body.description).trim(),
        isAnonymous: body.isAnonymous ?? false,
        isResolved:  false,
      },
      include: { user: { select: { id: true, name: true, department: true } } },
    });
    res.status(201).json(request);
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
    const request = await prisma.prayerRequest.update({
      where: { id },
      data: {
        ...(data.title       !== undefined && { title:       String(data.title).trim() }),
        ...(data.description !== undefined && { description: String(data.description).trim() }),
        ...(data.isResolved  !== undefined && { isResolved:  Boolean(data.isResolved) }),
      },
      include: { user: { select: { id: true, name: true, department: true } } },
    });
    res.json(request);
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
    await prisma.prayerRequest.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

export default router;
