import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";

const router = Router();
const include = { assignments: { include: { user: { select: { id: true, name: true } } } } };

router.get("/", async (_req, res: Response) => {
  try {
    res.json(await prisma.task.findMany({ orderBy: [{ isCompleted: "asc" }, { dueDate: "asc" }], include }));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!req.body.title) return res.status(400).json({ error: "title required" });
  try {
    const task = await prisma.task.create({
      data: { title: String(req.body.title).trim(), description: req.body.description ? String(req.body.description).trim() : null, dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null, department: req.body.department || null, isCompleted: false },
      include,
    });
    res.status(201).json(task);
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
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(data.title       !== undefined && { title: String(data.title).trim() }),
        ...(data.description !== undefined && { description: data.description ? String(data.description).trim() : null }),
        ...(data.dueDate     !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
        ...(data.isCompleted !== undefined && { isCompleted: Boolean(data.isCompleted) }),
        ...(data.department  !== undefined && { department: data.department }),
      },
      include,
    });
    res.json(task);
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
    await prisma.task.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

export default router;
