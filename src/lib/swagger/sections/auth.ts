import { securitySchemes, commonSchemas, server } from "../shared";

export const authSpec = {
  openapi: "3.0.3",
  info: {
    title: "Auth API — Authentication & Session",
    description: `## Gibi Gubaie · Authentication Service

This API uses **[Clerk](https://clerk.com)** for identity management.
All protected endpoints require a \`Bearer\` token obtained from \`POST /auth/login\`.

---

## Quick Start — Authorize Swagger

1. Call **\`POST /auth/login\`** below with your email (or phone) + password.
2. Copy the **\`access_token\`** value from the response.
3. Click **Authorize 🔓** at the top of the page.
4. Paste the token and click **Authorize**.

All subsequent requests in this session will automatically include \`Authorization: Bearer <token>\`.

> **Token lifetime:** 24 hours. Re-login to refresh.

---

## Supported Login Methods

| Identifier | Field | Example |
|---|---|---|
| Email | \`email\` | \`betrem26@gmail.com\` |
| Phone | \`phone\` | \`+251911234567\` |

You must provide exactly **one** of \`email\` or \`phone\`, plus \`password\`.

---

## Authorization Model

| \`publicMetadata\` field | Description |
|---|---|
| \`councilSection\` | One of the 8 council sections |
| \`councilMemberId\` | The \`CouncilMember.id\` in the database |
| \`councilRole\` | \`SECTION_HEAD\`, \`DEPUTY_HEAD\`, \`MEMBER\`, etc. |
| \`onboardingDone\` | \`true\` after onboarding is complete |

### Write permissions per role

| Role | Scope |
|---|---|
| \`MAIN_OFFICE\` member | All 8 sections |
| \`RESEARCH\` member | All 8 sections |
| \`SECTION_HEAD\` / \`DEPUTY_HEAD\` | Own section only |
| All other roles | Read-only |

---

## Onboarding Flow

A newly registered user has no \`councilSection\` in their metadata.
The frontend detects this via \`GET /api/me/redirect\` and navigates them to \`/onboarding\`.
Submitting the onboarding form calls \`POST /api/onboarding\`, which creates a \`CouncilMember\`
record and writes the metadata to Clerk — completing the setup.`,
    version: "1.0.0",
    contact: {
      name: "Gibi Gubaie API Hub",
      url:  "https://gibi-gubaie-backend.onrender.com/api-docs",
    },
  },
  servers: server,
  tags: [
    { name: "Auth",       description: "Register, login, and retrieve access tokens" },
    { name: "Session",    description: "Current user session and redirect helpers" },
    { name: "Onboarding", description: "First-time council member profile setup" },
  ],
  components: { securitySchemes, schemas: commonSchemas },
  paths: {

    // ── POST /auth/register ─────────────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new council member account",
        description: `Creates a Clerk user account and a \`CouncilMember\` record in one step.
Returns the new member ID and a redirect URL.
After registering, call **\`POST /auth/login\`** to obtain an access token.`,
        operationId: "authRegister",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "universityId", "section", "batch"],
                properties: {
                  name:         { type: "string",  example: "Betrem Hailu" },
                  email:        { type: "string",  format: "email",    example: "betrem26@gmail.com" },
                  password:     { type: "string",  format: "password", example: "BetreMariam21", minLength: 8 },
                  phone:        { type: "string",  example: "+251911234567", description: "Optional. E.164 format recommended." },
                  universityId: { type: "string",  example: "UGR/1234/15" },
                  section:      { $ref: "#/components/schemas/CouncilSection" },
                  batch:        { type: "string",  example: "2022" },
                  role:         { $ref: "#/components/schemas/CouncilRole" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Account created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message:    { type: "string", example: "Account created successfully. Use POST /auth/login to get your access token." },
                    userId:     { type: "string", example: "user_2abc123XYZ" },
                    memberId:   { type: "string", example: "clx1abc123" },
                    email:      { type: "string", example: "betrem26@gmail.com" },
                    section:    { $ref: "#/components/schemas/CouncilSection" },
                    role:       { $ref: "#/components/schemas/CouncilRole" },
                    redirectUrl:{ type: "string", example: "/council/education/clx1abc123" },
                  },
                },
              },
            },
          },
          400: { description: "Missing or invalid required fields" },
          409: { description: "Email address is already registered" },
        },
      },
    },

    // ── POST /auth/login ────────────────────────────────────────────────────
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get access token",
        description: `Authenticates with **email or phone** + **password** and returns a \`Bearer\` token.

**How to use the token in Swagger:**
1. Execute this endpoint to receive the \`access_token\`.
2. Click **Authorize 🔓** at the top of the page.
3. Paste the token value into the **Bearer** field and click **Authorize**.

> All secured endpoints will now send \`Authorization: Bearer <access_token>\` automatically.

**Token lifetime:** 24 hours (\`expires_in: 86400\` seconds).`,
        operationId: "authLogin",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "betrem26@gmail.com",
                    description: "Use **email** or **phone** — at least one is required.",
                  },
                  phone: {
                    type: "string",
                    example: "+251911234567",
                    description: "Use **email** or **phone** — at least one is required.",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "BetreMariam21",
                  },
                },
              },
              examples: {
                "Login with email": {
                  value: { email: "betrem26@gmail.com", password: "BetreMariam21" },
                },
                "Login with phone": {
                  value: { phone: "+251911234567", password: "BetreMariam21" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful — copy `access_token` and click **Authorize 🔓**",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    access_token: {
                      type: "string",
                      description: "Bearer token — paste this into the Authorize 🔓 dialog.",
                      example: "sit_2abc123...",
                    },
                    token_type: { type: "string", example: "Bearer" },
                    expires_in: { type: "integer", example: 86400, description: "Token lifetime in seconds (24 hours)." },
                    user: {
                      type: "object",
                      properties: {
                        clerkId:  { type: "string",  example: "user_2abc123XYZ" },
                        email:    { type: "string",  example: "betrem26@gmail.com", nullable: true },
                        phone:    { type: "string",  example: "+251911234567",      nullable: true },
                        name:     { type: "string",  example: "Betrem Hailu",      nullable: true },
                        memberId: { type: "string",  example: "clx1abc123",        nullable: true },
                        section:  { $ref: "#/components/schemas/CouncilSection" },
                        role:     { $ref: "#/components/schemas/CouncilRole" },
                        isActive: { type: "boolean", example: true, nullable: true },
                      },
                    },
                  },
                },
                example: {
                  access_token: "sit_2XqRk9mN...",
                  token_type:   "Bearer",
                  expires_in:   86400,
                  user: {
                    clerkId:  "user_2abc123XYZ",
                    email:    "betrem26@gmail.com",
                    phone:    "+251911234567",
                    name:     "Betrem Hailu",
                    memberId: "clx1abc123",
                    section:  "EDUCATION",
                    role:     "MEMBER",
                    isActive: true,
                  },
                },
              },
            },
          },
          400: {
            description: "Missing credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "email (or phone) and password are required" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "Invalid credentials" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    // ── GET /auth/me ────────────────────────────────────────────────────────
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get my council profile",
        description: "Returns the authenticated user's Clerk identity and their linked `CouncilMember` profile. Requires a valid `Bearer` token from `POST /auth/login`.",
        operationId: "authMe",
        security: [{ ClerkAuth: [] }],
        responses: {
          200: {
            description: "Authenticated user profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    clerkId:   { type: "string",  example: "user_2abc123XYZ" },
                    email:     { type: "string",  example: "betrem26@gmail.com", nullable: true },
                    phone:     { type: "string",  example: "+251911234567",      nullable: true },
                    section:   { $ref: "#/components/schemas/CouncilSection" },
                    role:      { $ref: "#/components/schemas/CouncilRole" },
                    memberId:  { type: "string",  example: "clx1abc123",        nullable: true },
                    onboarded: { type: "boolean", example: true },
                    profile:   { $ref: "#/components/schemas/CouncilMember" },
                  },
                },
              },
            },
          },
          401: {
            description: "Missing or invalid Bearer token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "Authorization header required: Bearer <access_token>" },
              },
            },
          },
        },
      },
    },

    // ── GET /api/me/redirect ────────────────────────────────────────────────
    "/api/me/redirect": {
      get: {
        tags: ["Session"],
        summary: "Resolve post-login redirect URL",
        description: `Reads Clerk \`publicMetadata\` for the authenticated user and returns the appropriate redirect URL:

| Condition | Redirect URL |
|---|---|
| Onboarding complete | \`/council/{section-slug}/{memberId}\` |
| Onboarding pending | \`/onboarding\` |
| Not signed in | \`/sign-in\` |`,
        operationId: "getMeRedirect",
        security: [{ ClerkAuth: [] }],
        responses: {
          200: {
            description: "Redirect URL resolved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    redirectUrl: { type: "string", example: "/council/education/clx1abc123" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── POST /api/onboarding ────────────────────────────────────────────────
    "/api/onboarding": {
      post: {
        tags: ["Onboarding"],
        summary: "Complete first-time onboarding",
        description: `Creates a \`CouncilMember\` record for the authenticated Clerk user and writes the following to their \`publicMetadata\`:

\`\`\`json
{
  "councilSection":  "EDUCATION",
  "councilMemberId": "clx1abc123",
  "councilRole":     "MEMBER",
  "onboardingDone":  true
}
\`\`\`

Returns a redirect URL to the member's section page.
This endpoint is called **once** per user after initial sign-up.`,
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
                  name:          { type: "string",  example: "Betrem Hailu" },
                  email:         { type: "string",  format: "email", example: "betrem26@gmail.com" },
                  phone:         { type: "string",  example: "+251911234567" },
                  universityId:  { type: "string",  example: "UGR/1234/15" },
                  section:       { $ref: "#/components/schemas/CouncilSection" },
                  subSection:    { type: "string",  example: "አባላት" },
                  role:          { $ref: "#/components/schemas/CouncilRole" },
                  batch:         { type: "string",  example: "2022" },
                  baptismalName: { type: "string",  example: "Mikael" },
                  bio:           { type: "string",  example: "Deacon and choir member since 2020." },
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
