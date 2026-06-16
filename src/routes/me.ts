import { Router, Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { CouncilSection } from "../generated/prisma";
import { SECTION_TO_SLUG } from "../lib/council-data";

const router = Router();

// GET /api/me/redirect
router.get("/redirect", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.json({ redirectUrl: "/sign-in" });

  const clerk = await clerkClient();
  const user  = await clerk.users.getUser(userId);
  const meta  = user.publicMetadata as {
    onboardingDone?: boolean;
    councilSection?: CouncilSection;
    councilMemberId?: string;
  } | undefined;

  if (meta?.onboardingDone && meta.councilSection && meta.councilMemberId) {
    const slug = SECTION_TO_SLUG[meta.councilSection];
    return res.json({ redirectUrl: `/council/${slug}/${meta.councilMemberId}` });
  }
  res.json({ redirectUrl: "/onboarding" });
});

export default router;
