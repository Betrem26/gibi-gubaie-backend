import { Router, Request, Response } from "express";
import { clerkClient } from "@clerk/express";
import { prisma } from "../lib/prisma";

const router = Router();

// ── POST /auth/register ───────────────────────────────────────────────────────
// Creates a Clerk user account + CouncilMember record in one step.
// Returns an access token (Clerk session JWT) on success.
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
    });

    // 2. Create CouncilMember in DB
    const member = await prisma.councilMember.create({
      data: {
        name:        name.trim(),
        email:       email.trim().toLowerCase(),
        phone:       phone ? String(phone).trim() : null,
        universityId:String(universityId).trim(),
        section,
        role:        role ?? "MEMBER",
        batch:       String(batch).trim(),
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

    // 4. Create a Clerk session token
    const sessionList = await clerkClient.sessions.getSessionList({ userId: clerkUser.id });
    // Sessions are created by the frontend SDK; return user info + instructions
    return res.status(201).json({
      message:    "Account created successfully. Use POST /auth/login to get your access token.",
      userId:     clerkUser.id,
      memberId:   member.id,
      email:      clerkUser.emailAddresses[0]?.emailAddress,
      section,
      role:       role ?? "MEMBER",
      redirectUrl:`/council/${slugFor(section)}/${member.id}`,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    const isDuplicate = msg.toLowerCase().includes("already") || msg.toLowerCase().includes("taken") || msg.includes("Unique");
    return res.status(isDuplicate ? 409 : 400).json({ error: isDuplicate ? "Email already registered." : msg });
  }
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
// Verifies credentials via Clerk and returns a short-lived session JWT.
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    // Verify via Clerk Backend API
    const response = await fetch("https://api.clerk.com/v1/sign_ins", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        identifier: email.trim().toLowerCase(),
        password,
        strategy:   "password",
      }),
    });

    const data = await response.json() as {
      client?: { sessions?: { id: string; last_active_token?: { jwt: string } }[] };
      errors?: { message: string; long_message?: string }[];
      id?: string;
    };

    if (!response.ok || data.errors?.length) {
      const errMsg = data.errors?.[0]?.long_message ?? data.errors?.[0]?.message ?? "Invalid credentials";
      return res.status(401).json({ error: errMsg });
    }

    // Get session token from response
    const session  = data.client?.sessions?.[0];
    const jwt      = session?.last_active_token?.jwt;
    const sessionId= session?.id;

    // Look up the council member from DB
    const emailLower = email.trim().toLowerCase();
    const member = await prisma.councilMember.findFirst({ where: { email: emailLower } });

    return res.status(200).json({
      access_token:  jwt ?? null,
      session_id:    sessionId ?? null,
      token_type:    "Bearer",
      message:       jwt ? "Login successful" : "Login successful — use the Clerk frontend SDK to obtain a session token for Swagger authorization.",
      user: {
        email:       emailLower,
        memberId:    member?.id ?? null,
        section:     member?.section ?? null,
        role:        member?.role ?? null,
        name:        member?.name ?? null,
        isActive:    member?.isActive ?? null,
      },
    });

  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Login failed" });
  }
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
// Returns the council profile of the authenticated user.
// Requires Authorization: Bearer <token>
router.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header required: Bearer <token>" });
  }

  try {
    const token = authHeader.split(" ")[1];
    // Verify the JWT with Clerk
    const verifyRes = await fetch("https://api.clerk.com/v1/tokens/verify", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      body: JSON.stringify({ token }),
    });
    const verified = await verifyRes.json() as { sub?: string; errors?: { message: string }[] };

    if (!verifyRes.ok || !verified.sub) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const clerkUser = await clerkClient.users.getUser(verified.sub);
    const meta      = clerkUser.publicMetadata as {
      councilSection?: string; councilMemberId?: string; councilRole?: string; onboardingDone?: boolean;
    };

    const member = meta.councilMemberId
      ? await prisma.councilMember.findUnique({ where: { id: meta.councilMemberId } })
      : null;

    return res.json({
      clerkId:    clerkUser.id,
      email:      clerkUser.emailAddresses[0]?.emailAddress,
      section:    meta.councilSection,
      role:       meta.councilRole,
      memberId:   meta.councilMemberId,
      onboarded:  meta.onboardingDone ?? false,
      profile:    member,
    });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Failed" });
  }
});

// helper
function slugFor(section: string): string {
  const map: Record<string, string> = {
    MAIN_OFFICE: "main-office", EDUCATION: "education", CHOIR: "choir",
    FINANCE: "finance", PUBLIC_RELATIONS: "public-relations", RESEARCH: "research",
    CHARITY: "charity", BATCH_COORDINATION: "batch-coordination",
  };
  return map[section] ?? section.toLowerCase().replace(/_/g, "-");
}

export default router;
