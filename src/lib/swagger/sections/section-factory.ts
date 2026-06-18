import { securitySchemes, commonSchemas, server } from "../shared";

interface SectionMeta {
  key:        string;   // e.g. "EDUCATION"
  slug:       string;   // e.g. "education"
  label:      string;   // English name
  amharic:    string;   // Amharic name
  description:string;   // section mandate
  subSections:string[]; // sub-unit names
  canWrite:   string;   // permission note
}

export function buildSectionSpec(meta: SectionMeta) {
  return {
    openapi: "3.0.3",
    info: {
      title: `${meta.label} API — ${meta.amharic}`,
      description: `## Gibi Gubaie · ${meta.label} Service (${meta.amharic})\n\n${meta.description}\n\n### Sub-sections\n${meta.subSections.map(s => `- ${s}`).join("\n") || "_No sub-sections defined_"}\n\n### Permissions\n${meta.canWrite}\n\n### Authentication\nAll write endpoints require a Clerk JWT. Pass it as \`Authorization: Bearer <token>\`.`,
      version: "1.0.0",
      contact: { name: "Gibi Gubaie API Hub", url: "https://gibi-gubaie-backend.onrender.com/api-docs" },
    },
    servers: server,
    tags: [
      { name: "Council Members", description: `${meta.label} section members` },
      { name: "Tasks",           description: `Tasks assigned to ${meta.label}` },
      { name: "Announcements",   description: "Association announcements" },
      { name: "Prayer Requests", description: "Member prayer & intercession board" },
      { name: "Events",          description: "Events & attendance" },
    ],
    components: { securitySchemes, schemas: commonSchemas },
    paths: {
      // ── Council Members ─────────────────────────────────────────────────────
      "/api/council": {
        get: {
          tags: ["Council Members"],
          summary: `List ${meta.label} section members`,
          description: `Returns all council members in the **${meta.key}** section. You can also omit the query param to get all sections.`,
          operationId: `list${meta.key}Members`,
          parameters: [{
            in: "query", name: "section",
            schema: { type: "string", enum: [meta.key], default: meta.key },
            description: `Filter by section — defaults to ${meta.key}`,
          }],
          responses: {
            200: { description: "Council members", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/CouncilMember" } } } } },
          },
        },
        post: {
          tags: ["Council Members"],
          summary: `Add a member to ${meta.label}`,
          description: `Creates a new council member in **${meta.key}**. Requires SECTION_HEAD, DEPUTY_HEAD of this section, MAIN_OFFICE, or RESEARCH.`,
          operationId: `create${meta.key}Member`,
          security: [{ ClerkAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", required: ["name","email","universityId","section","batch"], properties: {
              name: { type: "string", example: "Betrem Hailu" },
              email: { type: "string", format: "email" },
              phone: { type: "string" },
              universityId: { type: "string", example: "UGR/1234/15" },
              section: { type: "string", enum: [meta.key], default: meta.key },
              subSection: { type: "string", enum: meta.subSections, description: "Sub-unit within the section" },
              role: { $ref: "#/components/schemas/CouncilRole" },
              batch: { type: "string", example: "2022" },
              baptismalName: { type: "string" },
              bio: { type: "string" },
              photoUrl: { type: "string", format: "uri" },
            } } } },
          },
          responses: {
            201: { description: "Member created", content: { "application/json": { schema: { $ref: "#/components/schemas/CouncilMember" } } } },
            401: { description: "Unauthorized" },
            403: { description: "Permission denied — caller lacks write access to this section" },
            409: { description: "Email or university ID already exists" },
          },
        },
        patch: {
          tags: ["Council Members"],
          summary: "Update a council member (id in body)",
          operationId: `update${meta.key}Member`,
          security: [{ ClerkAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
              id: { type: "string" },
              name: { type: "string" }, email: { type: "string" }, phone: { type: "string", nullable: true },
              universityId: { type: "string" },
              subSection: { type: "string", enum: meta.subSections, nullable: true },
              role: { $ref: "#/components/schemas/CouncilRole" },
              batch: { type: "string" }, isActive: { type: "boolean" },
              baptismalName: { type: "string", nullable: true }, bio: { type: "string", nullable: true },
              photoUrl: { type: "string", nullable: true },
            } } } },
          },
          responses: {
            200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/CouncilMember" } } } },
            401: { description: "Unauthorized" },
            403: { description: "Permission denied" },
          },
        },
        delete: {
          tags: ["Council Members"],
          summary: "Remove a council member",
          operationId: `delete${meta.key}Member`,
          security: [{ ClerkAuth: [] }],
          parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" }, description: "Council member ID to delete" }],
          responses: {
            200: { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
            401: { description: "Unauthorized" },
            403: { description: "Permission denied" },
          },
        },
      },
      "/api/council/{id}": {
        get: {
          tags: ["Council Members"],
          summary: "Get council member by ID",
          operationId: `get${meta.key}Member`,
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Found", content: { "application/json": { schema: { $ref: "#/components/schemas/CouncilMember" } } } },
            404: { description: "Not found" },
          },
        },
      },

      // ── Tasks ────────────────────────────────────────────────────────────────
      "/api/tasks": {
        get: {
          tags: ["Tasks"],
          summary: `List tasks for ${meta.label}`,
          description: "Returns all tasks. Filter by department on the client side using the `department` field.",
          operationId: `list${meta.key}Tasks`,
          responses: { 200: { description: "Array of tasks", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Task" } } } } } },
        },
        post: {
          tags: ["Tasks"], summary: "Create a task", operationId: `create${meta.key}Task`, security: [{ ClerkAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title"], properties: {
            title: { type: "string" }, description: { type: "string" },
            dueDate: { type: "string", format: "date-time" },
            department: { type: "string", enum: [meta.key], default: meta.key },
          } } } } },
          responses: { 201: { description: "Task created", content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } }, 401: { description: "Unauthorized" } },
        },
        patch: {
          tags: ["Tasks"], summary: "Update a task (id in body)", operationId: `update${meta.key}Task`, security: [{ ClerkAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
            id: { type: "string" }, title: { type: "string" }, description: { type: "string" },
            dueDate: { type: "string", format: "date-time" }, isCompleted: { type: "boolean" },
          } } } } },
          responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
        },
        delete: {
          tags: ["Tasks"], summary: "Delete a task", operationId: `delete${meta.key}Task`, security: [{ ClerkAuth: [] }],
          parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" }, 401: { description: "Unauthorized" } },
        },
      },
      "/api/task-assignments": {
        post: {
          tags: ["Tasks"], summary: "Assign a task to a member", operationId: `assign${meta.key}Task`, security: [{ ClerkAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["taskId","userId"], properties: { taskId: { type: "string" }, userId: { type: "string" } } } } } },
          responses: { 201: { description: "Assigned" }, 409: { description: "Already assigned" } },
        },
        delete: {
          tags: ["Tasks"], summary: "Remove a task assignment", operationId: `unassign${meta.key}Task`, security: [{ ClerkAuth: [] }],
          parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" }, description: "TaskAssignment ID" }],
          responses: { 200: { description: "Removed" } },
        },
      },

      // ── Announcements ────────────────────────────────────────────────────────
      "/api/announcements": {
        get: {
          tags: ["Announcements"], summary: "List active announcements", operationId: `list${meta.key}Announcements`,
          responses: { 200: { description: "Announcements", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Announcement" } } } } } },
        },
        post: {
          tags: ["Announcements"], summary: "Publish an announcement", operationId: `create${meta.key}Announcement`, security: [{ ClerkAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title","body"], properties: {
            title: { type: "string" }, body: { type: "string" }, isPinned: { type: "boolean" },
            expiresAt: { type: "string", format: "date-time", nullable: true },
            sendSMS: { type: "boolean", description: "Send SMS to all active members" },
          } } } } },
          responses: { 201: { description: "Published" }, 401: { description: "Unauthorized" } },
        },
        patch: {
          tags: ["Announcements"], summary: "Edit an announcement (id in body)", operationId: `update${meta.key}Announcement`, security: [{ ClerkAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
            id: { type: "string" }, title: { type: "string" }, body: { type: "string" },
            isPinned: { type: "boolean" }, expiresAt: { type: "string", format: "date-time", nullable: true },
          } } } } },
          responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
        },
        delete: {
          tags: ["Announcements"], summary: "Delete an announcement", operationId: `delete${meta.key}Announcement`, security: [{ ClerkAuth: [] }],
          parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" } },
        },
      },

      // ── Prayer Requests ──────────────────────────────────────────────────────
      "/api/prayer-requests": {
        get: {
          tags: ["Prayer Requests"], summary: "List prayer requests", operationId: `list${meta.key}Prayer`,
          responses: { 200: { description: "Prayer requests", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/PrayerRequest" } } } } } },
        },
        post: {
          tags: ["Prayer Requests"], summary: "Submit a prayer request", operationId: `create${meta.key}Prayer`, security: [{ ClerkAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title","description"], properties: {
            title: { type: "string" }, description: { type: "string" }, isAnonymous: { type: "boolean", default: false },
          } } } } },
          responses: { 201: { description: "Submitted" }, 401: { description: "Unauthorized" } },
        },
        patch: {
          tags: ["Prayer Requests"], summary: "Update / resolve a request (id in body)", operationId: `update${meta.key}Prayer`, security: [{ ClerkAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
            id: { type: "string" }, title: { type: "string" }, description: { type: "string" }, isResolved: { type: "boolean" },
          } } } } },
          responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
        },
        delete: {
          tags: ["Prayer Requests"], summary: "Delete a prayer request", operationId: `delete${meta.key}Prayer`, security: [{ ClerkAuth: [] }],
          parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" } },
        },
      },

      // ── Events ───────────────────────────────────────────────────────────────
      "/api/events": {
        get: {
          tags: ["Events"], summary: "List all events", operationId: `list${meta.key}Events`,
          responses: { 200: { description: "Events", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Event" } } } } } },
        },
      },
      "/api/attendance": {
        get: {
          tags: ["Events"], summary: "Get attendance for an event", operationId: `get${meta.key}Attendance`,
          parameters: [
            { in: "query", name: "eventName", required: true, schema: { type: "string" } },
            { in: "query", name: "eventDate", required: true, schema: { type: "string", format: "date" } },
          ],
          responses: { 200: { description: "Present member IDs", content: { "application/json": { schema: { type: "object", properties: { presentIds: { type: "array", items: { type: "string" } } } } } } } },
        },
        post: {
          tags: ["Events"], summary: "Save attendance", operationId: `save${meta.key}Attendance`, security: [{ ClerkAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["eventName","eventDate","allIds"], properties: {
            eventName: { type: "string" }, eventDate: { type: "string", format: "date" },
            presentIds: { type: "array", items: { type: "string" } },
            allIds: { type: "array", items: { type: "string" } },
          } } } } },
          responses: { 200: { description: "Saved" }, 401: { description: "Unauthorized" } },
        },
      },
    },
  };
}
