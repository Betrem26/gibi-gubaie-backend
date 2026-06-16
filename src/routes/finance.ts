import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res: Response) => {
  try {
    const [payments, expenses] = await Promise.all([
      prisma.payment.findMany({ include: { user: { select: { id: true, name: true, universityId: true } } }, orderBy: { createdAt: "desc" } }),
      prisma.expense.findMany({ orderBy: { date: "desc" } }),
    ]);
    res.json({ payments, expenses });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const body = req.body;
  if (!body.type || !["payment", "expense"].includes(body.type))
    return res.status(400).json({ error: 'type must be "payment" or "expense"' });
  try {
    if (body.type === "expense") {
      if (!body.title || !body.amount || !body.date)
        return res.status(400).json({ error: "title, amount, date required" });
      const expense = await prisma.expense.create({
        data: { title: String(body.title).trim(), amount: parseFloat(body.amount), category: body.category || null, description: body.description ? String(body.description).trim() : null, date: new Date(body.date) },
      });
      return res.status(201).json(expense);
    }
    if (!body.userId || !body.month || !body.amount)
      return res.status(400).json({ error: "userId, month, amount required" });
    const payment = await prisma.payment.upsert({
      where: { userId_month: { userId: body.userId, month: body.month } },
      update: { amount: parseFloat(body.amount), isPaid: true, paidAt: new Date(), note: body.note ? String(body.note).trim() : null },
      create: { userId: body.userId, amount: parseFloat(body.amount), month: body.month, isPaid: true, paidAt: new Date(), note: body.note ? String(body.note).trim() : null },
    });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

export default router;
