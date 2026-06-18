import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { swaggerSpec } from "./lib/swagger";

import announcementsRouter from "./routes/announcements";
import attendanceRouter    from "./routes/attendance";
import councilRouter       from "./routes/council";
import eventsRouter        from "./routes/events";
import financeRouter       from "./routes/finance";
import membersRouter       from "./routes/members";
import onboardingRouter    from "./routes/onboarding";
import prayerRouter        from "./routes/prayer-requests";
import tasksRouter         from "./routes/tasks";
import taskAssignmentsRouter from "./routes/task-assignments";
import meRouter            from "./routes/me";

const app  = express();
const PORT = process.env.PORT ?? 4000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(clerkMiddleware());

// ── API Docs (CDN-hosted Swagger UI — no extra npm package needed) ────────────
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

app.get("/api-docs", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gibi Gubaie API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; }
    .swagger-ui .topbar { background-color: #1e40af; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: "/api-docs.json",
        dom_id: "#swagger-ui",
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        deepLinking: true,
      });
    };
  </script>
</body>
</html>`);
});

// ── Routes ────────────────────────────────────────────────────────────────────
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

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`✅ Gibi Gubaie API running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});

export default app;
