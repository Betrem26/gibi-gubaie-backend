import { Router, Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { CouncilSection, CouncilRole } from "../generated/prisma";
import { SECTION_TO_SLUG } from "../lib/council-data";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const body = req.body;
  const required = ["name", "email", "universityId", "section", "batch"];
  for (const f of required) {
    if (!body[f]) return res.status(400).json({ error: `Missing: ${f}` });
  }

  const section = body.section as CouncilSection;
  const role    = (body.role as CouncilRole) ?? "MEMBER";

  try {
    const member = await prisma.councilMember.create({
      data: {
        name: String(body.name).trim(), email: String(body.email).trim().toLowerCase(),
        phone: body.phone ? String(body.phone).trim() : null,
        universityId: String(body.universityId).trim(), section, role,
        subSection: body.subSection ? String(body.subSection).trim() : null,
        batch: String(body.batch).trim(),
        baptismalName: body.baptismalName ? String(body.baptismalName).trim() : null,
        bio: body.bio ? String(body.bio).trim() : null,
      },
    });

    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { councilSection: section, councilMemberId: member.id, councilRole: role, onboardingDone: true },
    });

    const slug = SECTION_TO_SLUG[section];
    res.status(201).json({ memberId: member.id, section, redirectUrl: `/council/${slug}/${member.id}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Onboarding failed";
    res.status(msg.includes("Unique") ? 409 : 400).json({ error: msg.includes("Unique") ? "Email or ID already exists." : msg });
  }
});

export default router;
