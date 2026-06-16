import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { taskId, userId: targetUserId } = req.body;
  if (!taskId || !targetUserId) return res.status(400).json({ error: "taskId and userId required" });
  try {
    const assignment = await prisma.taskAssignment.create({
      data: { taskId, userId: targetUserId },
      include: { task: true, user: { select: { id: true, name: true } } },
    });
    res.status(201).json(assignment);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    res.status(msg.includes("Unique") ? 409 : 400).json({ error: msg.includes("Unique") ? "Already assigned." : msg });
  }
});

router.delete("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "ID required" });
  try {
    await prisma.taskAssignment.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

export default router;
