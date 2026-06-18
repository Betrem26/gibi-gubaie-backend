import { securitySchemes, commonSchemas, server } from "../shared";

export const authSpec = {
  openapi: "3.0.3",
  info: {
    title: "Auth API — Authentication & Authorization",
    description: `## Gibi Gubaie · Authentication Service

This project uses **[Clerk](https://clerk.com)** for all authentication. There is no custom login or register endpoint in this backend — Clerk manages user sessions externally.

---

## How to Authenticate

### Step 1 — Sign in via the frontend
Visit the frontend at **https://gibi-gubaie-frontend.onrender.com/sign-in** and sign in with your account.

### Step 2 — Get your JWT token
After signing in, open the browser **DevTools Console** and run:
\`\`\`js
const token = await window.Clerk.session.getToken();
console.log(token);
\`\`\`
Copy the printed token.

### Step 3 — Authorize in Swagger
Click the **Authorize 🔓** button at the top of any API doc page, paste the token, and click **Authorize**. All protected endpoints will now include the \`Authorization: Bearer <token>\` header automatically.

---

## Token Lifetime
Clerk JWTs expire after **60 seconds** by default (short-lived for security). If you get 401 errors, refresh the token by running \`getToken()\` again in the console.

---

## Authorization Model

| Clerk \`publicMetadata\` field | Description |
|---|---|
| \`councilSection\` | Which of the 8 sections this user belongs to |
| \`councilMemberId\` | The \`CouncilMember.id\` in your database |
| \`councilRole\` | Their role: SECTION_HEAD, DEPUTY_HEAD, etc. |
| \`onboardingDone\` | \`true\` once they have completed onboarding |

### Section-scoped write permissions

| Who | Can write to |
|---|---|
| \`MAIN_OFFICE\` | All 8 sections |
| \`RESEARCH\` | All 8 sections |
| \`SECTION_HEAD\` or \`DEPUTY_HEAD\` | Their own section only |
| All other roles | Read-only |

---

## Onboarding Flow

A new user who signs in for the first time has no \`councilSection\` in their metadata. The frontend redirects them to \`/onboarding\` where they submit their details. That calls:

\`\`\`
POST /api/onboarding
\`\`\`

Which creates a \`CouncilMember\` record and writes the metadata to Clerk, completing the setup.`,
    version: "1.0.0",
    contact: { name: "Gibi Gubaie API Hub", url: "https://gibi-gubaie-backend.onrender.com/api-docs" },
  },
  servers: server,
  tags: [
    { name: "Session",    description: "Current user session helpers" },
    { name: "Onboarding", description: "First-time council member setup" },
  ],
  components: { securitySchemes, schemas: commonSchemas },
  paths: {
    "/api/me/redirect": {
      get: {
        tags: ["Session"],
        summary: "Get redirect URL for the current signed-in user",
        description: `Reads Clerk \`publicMetadata\` for the authenticated user and returns the correct redirect URL:\n\n- \`onboardingDone = true\` → \`/council/{section-slug}/{memberId}\`\n- Not onboarded yet → \`/onboarding\`\n- Not signed in → \`/sign-in\``,
        operationId: "getMeRedirect",
        security: [{ ClerkAuth: [] }],
        responses: {
          200: {
            description: "Redirect URL resolved",
            content: { "application/json": { schema: { type: "object", properties: {
              redirectUrl: { type: "string", example: "/council/education/clx1abc123" },
            } } } },
          },
        },
      },
    },
    "/api/onboarding": {
      post: {
        tags: ["Onboarding"],
        summary: "Complete first-time onboarding",
        description: `Creates a \`CouncilMember\` record for the authenticated user and writes the following to Clerk \`publicMetadata\`:\n\n\`\`\`json\n{\n  "councilSection": "EDUCATION",\n  "councilMemberId": "clx1abc123",\n  "councilRole": "MEMBER",\n  "onboardingDone": true\n}\n\`\`\`\n\nReturns a redirect URL to the member's section page.`,
        operationId: "completeOnboarding",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "universityId", "section", "batch"],
                properties: {
                  name:          { type: "string", example: "Betrem Hailu" },
                  email:         { type: "string", format: "email", example: "betrem@aau.edu.et" },
                  phone:         { type: "string", example: "+251911234567" },
                  universityId:  { type: "string", example: "UGR/1234/15" },
                  section:       { $ref: "#/components/schemas/CouncilSection" },
                  subSection:    { type: "string", example: "አባላት" },
                  role:          { $ref: "#/components/schemas/CouncilRole" },
                  batch:         { type: "string", example: "2022" },
                  baptismalName: { type: "string", example: "Mikael" },
                  bio:           { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Onboarding complete",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    memberId:    { type: "string", example: "clx1abc123" },
                    section:     { $ref: "#/components/schemas/CouncilSection" },
                    redirectUrl: { type: "string", example: "/council/education/clx1abc123" },
                  },
                },
              },
            },
          },
          400: { description: "Missing required fields" },
          401: { description: "Unauthorized — sign in first" },
          409: { description: "Email or university ID already registered" },
        },
      },
    },
  },
};
