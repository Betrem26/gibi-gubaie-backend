import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { sectionSpecs, hubSections } from "./lib/swagger/index";

import announcementsRouter   from "./routes/announcements";
import attendanceRouter      from "./routes/attendance";
import authRouter            from "./routes/auth";
import councilRouter         from "./routes/council";
import eventsRouter          from "./routes/events";
import financeRouter         from "./routes/finance";
import membersRouter         from "./routes/members";
import onboardingRouter      from "./routes/onboarding";
import prayerRouter          from "./routes/prayer-requests";
import tasksRouter           from "./routes/tasks";
import taskAssignmentsRouter from "./routes/task-assignments";
import meRouter              from "./routes/me";

const app  = express();
const PORT = process.env.PORT ?? 4000;

// ── Base middleware ───────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000", credentials: true }));
app.use(express.json());

// ── Swagger docs — all registered BEFORE clerkMiddleware ─────────────────────

app.get("/", (_req, res) => res.redirect("/api-docs"));

// Hub landing page
app.get("/api-docs", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  const cards = hubSections.map(s => `
    <a href="/api-docs/${s.slug}" class="card" style="--accent:${s.color}">
      <div class="card-header">
        <span class="badge" style="background:${s.color}">${s.label}</span>
      </div>
      <div class="card-amharic">${s.amharic}</div>
      <div class="card-endpoints">${s.endpoints}</div>
      <div class="card-link">View API Docs →</div>
    </a>`).join("");

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Gibi Gubaie API Hub</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;min-height:100vh}
    .topbar{background:#1e40af;color:#fff;padding:18px 32px;display:flex;align-items:center;gap:16px}
    .topbar h1{font-size:1.3rem;font-weight:700;letter-spacing:-.5px}
    .topbar span{font-size:.85rem;opacity:.75}
    .hero{padding:40px 32px 20px;max-width:1100px;margin:0 auto}
    .hero h2{font-size:1.6rem;font-weight:700;color:#1e40af}
    .hero p{margin-top:8px;color:#475569;font-size:.95rem}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;padding:24px 32px 48px;max-width:1100px;margin:0 auto}
    .card{display:block;text-decoration:none;background:#fff;border-radius:12px;border:1.5px solid #e2e8f0;padding:24px;transition:all .2s;box-shadow:0 1px 3px rgba(0,0,0,.06)}
    .card:hover{border-color:var(--accent);box-shadow:0 4px 16px rgba(0,0,0,.1);transform:translateY(-2px)}
    .badge{color:#fff;font-size:.75rem;font-weight:600;padding:4px 10px;border-radius:999px;display:inline-block}
    .card-amharic{margin-top:12px;font-size:1.05rem;font-weight:600;color:#1e293b}
    .card-endpoints{margin-top:6px;font-size:.8rem;color:#64748b}
    .card-link{margin-top:16px;font-size:.85rem;font-weight:600;color:var(--accent)}
    .footer{text-align:center;padding:24px;font-size:.8rem;color:#94a3b8;border-top:1px solid #e2e8f0}
  </style>
</head>
<body>
  <div class="topbar">
    <div style="width:36px;height:36px;background:rgba(255,255,255,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1rem">GG</div>
    <div>
      <h1>Gibi Gubaie API Hub</h1>
      <span>Ethiopian Orthodox Tewahedo University Student Association</span>
    </div>
  </div>
  <div class="hero">
    <h2>API Documentation</h2>
    <p>Select a council section below to explore its dedicated API reference. Each section has its own endpoints, schemas, and permission model.</p>
  </div>
  <div class="grid">${cards}</div>
  <div class="footer">Gibi Gubaie Backend v1.0.0 · <a href="/health" style="color:#64748b">Health</a></div>
</body>
</html>`);
});

// Per-section JSON specs + Swagger UI
Object.entries(sectionSpecs).forEach(([slug, spec]) => {
  app.get(`/api-docs/${slug}.json`, (_req, res) => res.json(spec));

  app.get(`/api-docs/${slug}`, (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Gibi Gubaie · ${slug} API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>
  <style>
    body{margin:0}
    .swagger-ui .topbar{background:#1e40af}
    .back-link{position:fixed;top:12px;left:12px;z-index:9999;background:#1e40af;color:#fff;text-decoration:none;font-size:.8rem;font-weight:600;padding:6px 14px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.2)}
    .back-link:hover{background:#1d4ed8}
  </style>
</head>
<body>
  <a href="/api-docs" class="back-link">&#8592; API Hub</a>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => SwaggerUIBundle({
      url: "/api-docs/${slug}.json",
      dom_id: "#swagger-ui",
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: "BaseLayout",
      persistAuthorization: true,
      deepLinking: true,
      defaultModelsExpandDepth: 1,
      displayRequestDuration: true,
      filter: true,
    });
  </script>
</body>
</html>`);
  });
});

// ── Auth routes — public, before clerkMiddleware ──────────────────────────────
app.use("/auth", authRouter);

// ── Clerk middleware — validates token if present, never blocks ───────────────
// Individual routes call getAuth(req) and return 401 themselves.
app.use(clerkMiddleware());

app.use("/api/announcements",    announcementsRouter);
app.use("/api/attendance",       attendanceRouter);
app.use("/api/council",          councilRouter);
app.use("/api/events",           eventsRouter);
app.use("/api/finance",          financeRouter);
app.use("/api/members",          membersRouter);
app.use("/api/onboarding",       onboardingRouter);
app.use("/api/prayer-requests",  prayerRouter);
app.use("/api/tasks",            tasksRouter);
app.use("/api/task-assignments", taskAssignmentsRouter);
app.use("/api/me",               meRouter);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "gibi-gubaie-backend" }));

// ── Global error handler — prevents unhandled crashes returning empty 500s ────
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("[Unhandled error]", msg);
  res.status(500).json({ error: msg });
});

app.listen(PORT, () => {
  console.log(`✅ Gibi Gubaie API running on port ${PORT}`);
  console.log(`📚 API Hub: http://localhost:${PORT}/api-docs`);
});

export default app;
