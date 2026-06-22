import { Router, Request, Response } from "express";
import { clerkClient, verifyToken } from "@clerk/express";
import { prisma } from "../lib/prisma";

const router = Router();

// ── POST /auth/register ───────────────────────────────────────────────────────
router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password, phone, universityId, section, batch, role } = req.body;

  if (!name || !email || !password || !universityId || !section || !batch) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "email", "password", "universityId", "section", "batch"],
    });
  }

  try {
    // 1. Create Clerk user
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email.trim().toLowerCase()],
      password,
      firstName: name.trim().split(" ")[0],
      lastName:  name.trim().split(" ").slice(1).join(" ") || undefined,
      ...(phone ? { phoneNumber: [String(phone).trim()] } : {}),
    });

    // 2. Create CouncilMember in DB
    const member = await prisma.councilMember.create({
      data: {
        name:         name.trim(),
        email:        email.trim().toLowerCase(),
        phone:        phone ? String(phone).trim() : null,
        universityId: String(universityId).trim(),
        section,
        role:         role ?? "MEMBER",
        batch:        String(batch).trim(),
      },
    });

    // 3. Write council metadata to Clerk
    await clerkClient.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        councilSection:  section,
        councilMemberId: member.id,
        councilRole:     role ?? "MEMBER",
        onboardingDone:  true,
      },
    });

    return res.status(201).json({
      message:    "Account created successfully. Use POST /auth/login to get your access token.",
      userId:     clerkUser.id,
      memberId:   member.id,
      email:      clerkUser.emailAddresses[0]?.emailAddress,
      section,
      role:       role ?? "MEMBER",
      redirectUrl: `/council/${slugFor(section)}/${member.id}`,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    const isDuplicate =
      msg.toLowerCase().includes("already") ||
      msg.toLowerCase().includes("taken") ||
      msg.includes("Unique");
    return res
      .status(isDuplicate ? 409 : 400)
      .json({ error: isDuplicate ? "Email already registered." : msg });
  }
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
// Accepts email OR phone + password.
// Returns a sign-in token (access_token) that can be used as a Bearer token
// for all subsequent API calls.
router.post("/login", async (req: Request, res: Response) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    return res.status(400).json({
      error: "email (or phone) and password are required",
    });
  }

  try {
    // ── 1. Find Clerk user by email OR phone ──────────────────────────────────
    let clerkUser: Awaited<ReturnType<typeof clerkClient.users.getUserList>>["data"][0] | null = null;

    if (email) {
      const { data } = await clerkClient.users.getUserList({
        emailAddress: [email.trim().toLowerCase()],
        limit: 1,
      });
      clerkUser = data[0] ?? null;
    } else if (phone) {
      const { data } = await clerkClient.users.getUserList({
        phoneNumber: [String(phone).trim()],
        limit: 1,
      });
      clerkUser = data[0] ?? null;
    }

    if (!clerkUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ── 2. Verify password ────────────────────────────────────────────────────
    let passwordValid = false;
    try {
      const result = await clerkClient.users.verifyPassword({
        userId:   clerkUser.id,
        password,
      });
      passwordValid = result.verified;
    } catch {
      passwordValid = false;
    }

    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ── 3. Issue sign-in token ────────────────────────────────────────────────
    // This token acts as the access_token for API access.
    // Frontend SDK usage: signIn.create({ strategy: "ticket", ticket: access_token })
    const tokenRes = await clerkClient.signInTokens.createSignInToken({
      userId:           clerkUser.id,
      expiresInSeconds: 60 * 60 * 24, // 24 hours
    });

    // ── 4. Look up council member profile ─────────────────────────────────────
    const emailLower = (email ?? clerkUser.emailAddresses[0]?.emailAddress ?? "").trim().toLowerCase();
    const member     = await prisma.councilMember.findFirst({
      where: emailLower ? { email: emailLower } : undefined,
    });

    return res.status(200).json({
      access_token: tokenRes.token,
      token_type:   "Bearer",
      expires_in:   86400,
      user: {
        clerkId:  clerkUser.id,
        email:    clerkUser.emailAddresses[0]?.emailAddress ?? null,
        phone:    clerkUser.phoneNumbers[0]?.phoneNumber    ?? null,
        name:     member?.name ?? ([clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null),
        memberId: member?.id       ?? null,
        section:  member?.section  ?? null,
        role:     member?.role     ?? null,
        isActive: member?.isActive ?? null,
      },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Login failed";
    return res.status(500).json({ error: msg });
  }
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
// Requires: Authorization: Bearer <access_token from /auth/login>
router.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header required: Bearer <access_token>" });
  }

  try {
    const token = authHeader.split(" ")[1];

    // Verify the JWT using Clerk's verifyToken helper
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!payload?.sub) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const clerkUser = await clerkClient.users.getUser(payload.sub);
    const meta      = clerkUser.publicMetadata as {
      councilSection?:  string;
      councilMemberId?: string;
      councilRole?:     string;
      onboardingDone?:  boolean;
    };

    const member = meta.councilMemberId
      ? await prisma.councilMember.findUnique({ where: { id: meta.councilMemberId } })
      : null;

    return res.json({
      clerkId:   clerkUser.id,
      email:     clerkUser.emailAddresses[0]?.emailAddress ?? null,
      phone:     clerkUser.phoneNumbers[0]?.phoneNumber    ?? null,
      section:   meta.councilSection  ?? null,
      role:      meta.councilRole     ?? null,
      memberId:  meta.councilMemberId ?? null,
      onboarded: meta.onboardingDone  ?? false,
      profile:   member,
    });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

// ── helper ────────────────────────────────────────────────────────────────────
function slugFor(section: string): string {
  const map: Record<string, string> = {
    MAIN_OFFICE: "main-office", EDUCATION: "education", CHOIR: "choir",
    FINANCE: "finance", PUBLIC_RELATIONS: "public-relations", RESEARCH: "research",
    CHARITY: "charity", BATCH_COORDINATION: "batch-coordination",
  };
  return map[section] ?? section.toLowerCase().replace(/_/g, "-");
}

export default router;
