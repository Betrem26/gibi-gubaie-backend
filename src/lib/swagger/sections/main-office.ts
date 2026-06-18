import { securitySchemes, commonSchemas, server } from "../shared";

export const mainOfficeSpec = {
  openapi: "3.0.3",
  info: {
    title: "Main Office API — ዋና ጽ/ቤት",
    description: `## Gibi Gubaie · Main Office Service\n\nCentral administration that **oversees all 8 council sections**. This API exposes the full management surface: members, council, finance, events, attendance, tasks, announcements, and prayer requests.\n\n### Permissions\nMain Office has **unrestricted write access** to all sections.\n\n### Authentication\nAll write endpoints require a Clerk JWT from a user whose \`publicMetadata.councilSection = "MAIN_OFFICE"\`.`,
    version: "1.0.0",
    contact: { name: "Gibi Gubaie", url: "https://gibi-gubaie-backend.onrender.com/api-docs" },
  },
  servers: server,
  tags: [
    { name: "Members",        description: "Manage all association members" },
    { name: "Council",        description: "Manage all 8 council sections" },
    { name: "Finance",        description: "Payments and expenses" },
    { name: "Events",         description: "Church & association events" },
    { name: "Attendance",     description: "Event attendance tracking" },
    { name: "Tasks",          description: "Task board and assignments" },
    { name: "Announcements",  description: "Pinned announcements + SMS broadcast" },
    { name: "Prayer Requests",description: "Member intercession board" },
    { name: "System",         description: "Health check" },
  ],
  components: { securitySchemes, schemas: commonSchemas },
  paths: {
    "/health": {
      get: {
        tags: ["System"], summary: "Health check", operationId: "health",
        responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "ok" } } } } } } },
      },
    },
    "/api/members": {
      get: {
        tags: ["Members"], summary: "List all association members", operationId: "listMembers",
        responses: { 200: { description: "Array of members", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Member" } } } } } },
      },
      post: {
        tags: ["Members"], summary: "Register a new member", operationId: "createMember",
        security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","email","universityId","department","batch"], properties: {
          name: { type: "string" }, email: { type: "string", format: "email" }, phone: { type: "string" },
          universityId: { type: "string" }, department: { $ref: "#/components/schemas/Department" },
          batch: { type: "string" }, role: { $ref: "#/components/schemas/GibiRole" },
        } } } } },
        responses: { 201: { description: "Member created", content: { "application/json": { schema: { $ref: "#/components/schemas/Member" } } } }, 401: { description: "Unauthorized" }, 409: { description: "Duplicate email or ID" } },
      },
      patch: {
        tags: ["Members"], summary: "Update a member (id in body)", operationId: "updateMember",
        security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
          id: { type: "string" }, name: { type: "string" }, email: { type: "string" },
          phone: { type: "string", nullable: true }, universityId: { type: "string" },
          department: { $ref: "#/components/schemas/Department" }, batch: { type: "string" },
          role: { $ref: "#/components/schemas/GibiRole" }, isActive: { type: "boolean" },
        } } } } },
        responses: { 200: { description: "Updated member", content: { "application/json": { schema: { $ref: "#/components/schemas/Member" } } } }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/council": {
      get: {
        tags: ["Council"], summary: "List council members — optionally filter by section", operationId: "listCouncil",
        parameters: [{ in: "query", name: "section", schema: { $ref: "#/components/schemas/CouncilSection" } }],
        responses: { 200: { description: "Array of council members", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/CouncilMember" } } } } } },
      },
      post: {
        tags: ["Council"], summary: "Add a council member to any section", operationId: "createCouncilMember",
        security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","email","universityId","section","batch"], properties: {
          name: { type: "string" }, email: { type: "string", format: "email" }, phone: { type: "string" },
          universityId: { type: "string" }, section: { $ref: "#/components/schemas/CouncilSection" },
          subSection: { type: "string" }, role: { $ref: "#/components/schemas/CouncilRole" },
          batch: { type: "string" }, baptismalName: { type: "string" }, bio: { type: "string" }, photoUrl: { type: "string" },
        } } } } },
        responses: { 201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/CouncilMember" } } } }, 401: { description: "Unauthorized" }, 409: { description: "Duplicate" } },
      },
      patch: {
        tags: ["Council"], summary: "Update any council member", operationId: "updateCouncilMember",
        security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
          id: { type: "string" }, name: { type: "string" }, email: { type: "string" }, phone: { type: "string", nullable: true },
          universityId: { type: "string" }, section: { $ref: "#/components/schemas/CouncilSection" },
          subSection: { type: "string", nullable: true }, role: { $ref: "#/components/schemas/CouncilRole" },
          batch: { type: "string" }, isActive: { type: "boolean" },
        } } } } },
        responses: { 200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/CouncilMember" } } } }, 403: { description: "Permission denied" } },
      },
      delete: {
        tags: ["Council"], summary: "Delete a council member", operationId: "deleteCouncilMember",
        security: [{ ClerkAuth: [] }],
        parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } }, 403: { description: "Permission denied" } },
      },
    },
    "/api/council/{id}": {
      get: {
        tags: ["Council"], summary: "Get council member by ID", operationId: "getCouncilMember",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Found", content: { "application/json": { schema: { $ref: "#/components/schemas/CouncilMember" } } } }, 404: { description: "Not found" } },
      },
    },
    "/api/finance": {
      get: {
        tags: ["Finance"], summary: "Get all payments and expenses", operationId: "getFinance",
        responses: { 200: { description: "Finance summary", content: { "application/json": { schema: { type: "object", properties: {
          payments: { type: "array", items: { $ref: "#/components/schemas/Payment" } },
          expenses: { type: "array", items: { $ref: "#/components/schemas/Expense" } },
        } } } } } },
      },
      post: {
        tags: ["Finance"], summary: "Record a payment or expense", operationId: "createFinanceRecord",
        security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["type"], properties: {
          type: { type: "string", enum: ["payment","expense"] },
          userId: { type: "string", description: "Required for payment" },
          month: { type: "string", example: "2025-01", description: "Required for payment" },
          amount: { type: "number" }, note: { type: "string" },
          title: { type: "string", description: "Required for expense" },
          date: { type: "string", format: "date", description: "Required for expense" },
          category: { $ref: "#/components/schemas/Department" }, description: { type: "string" },
        } } } } },
        responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/events": {
      get: { tags: ["Events"], summary: "List all events", operationId: "listEvents", responses: { 200: { description: "Array of events", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Event" } } } } } } },
      post: {
        tags: ["Events"], summary: "Create an event", operationId: "createEvent", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","type","eventDate"], properties: {
          name: { type: "string" }, type: { $ref: "#/components/schemas/EventType" },
          description: { type: "string" }, eventDate: { type: "string", format: "date-time" },
          location: { type: "string" }, isRecurring: { type: "boolean" },
        } } } } },
        responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } },
      },
      patch: {
        tags: ["Events"], summary: "Update an event (id in body)", operationId: "updateEvent", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
          id: { type: "string" }, name: { type: "string" }, type: { $ref: "#/components/schemas/EventType" },
          description: { type: "string" }, eventDate: { type: "string", format: "date-time" },
          location: { type: "string" }, isRecurring: { type: "boolean" },
        } } } } },
        responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
      },
      delete: { tags: ["Events"], summary: "Delete an event", operationId: "deleteEvent", security: [{ ClerkAuth: [] }], parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" }, 401: { description: "Unauthorized" } } },
    },
    "/api/attendance": {
      get: {
        tags: ["Attendance"], summary: "Get attendance for an event", operationId: "getAttendance",
        parameters: [
          { in: "query", name: "eventName", required: true, schema: { type: "string" } },
          { in: "query", name: "eventDate", required: true, schema: { type: "string", format: "date" } },
        ],
        responses: { 200: { description: "Present member IDs", content: { "application/json": { schema: { type: "object", properties: { presentIds: { type: "array", items: { type: "string" } } } } } } } },
      },
      post: {
        tags: ["Attendance"], summary: "Save event attendance", operationId: "saveAttendance", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["eventName","eventDate","allIds"], properties: {
          eventName: { type: "string" }, eventDate: { type: "string", format: "date" },
          presentIds: { type: "array", items: { type: "string" } },
          allIds: { type: "array", items: { type: "string" } },
        } } } } },
        responses: { 200: { description: "Saved" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/tasks": {
      get: { tags: ["Tasks"], summary: "List all tasks with assignments", operationId: "listTasks", responses: { 200: { description: "Array of tasks", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Task" } } } } } } },
      post: {
        tags: ["Tasks"], summary: "Create a task", operationId: "createTask", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title"], properties: {
          title: { type: "string" }, description: { type: "string" },
          dueDate: { type: "string", format: "date-time" }, department: { $ref: "#/components/schemas/Department" },
        } } } } },
        responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } },
      },
      patch: {
        tags: ["Tasks"], summary: "Update a task (id in body)", operationId: "updateTask", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
          id: { type: "string" }, title: { type: "string" }, description: { type: "string" },
          dueDate: { type: "string", format: "date-time" }, isCompleted: { type: "boolean" },
          department: { $ref: "#/components/schemas/Department" },
        } } } } },
        responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
      },
      delete: { tags: ["Tasks"], summary: "Delete a task", operationId: "deleteTask", security: [{ ClerkAuth: [] }], parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } },
    },
    "/api/task-assignments": {
      post: {
        tags: ["Tasks"], summary: "Assign a task to a member", operationId: "createAssignment", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["taskId","userId"], properties: { taskId: { type: "string" }, userId: { type: "string" } } } } } },
        responses: { 201: { description: "Assigned" }, 409: { description: "Already assigned" } },
      },
      delete: { tags: ["Tasks"], summary: "Remove a task assignment", operationId: "deleteAssignment", security: [{ ClerkAuth: [] }], parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Removed" } } },
    },
    "/api/announcements": {
      get: { tags: ["Announcements"], summary: "List active announcements", operationId: "listAnnouncements", responses: { 200: { description: "Array of announcements", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Announcement" } } } } } } },
      post: {
        tags: ["Announcements"], summary: "Create an announcement (optionally broadcast via SMS)", operationId: "createAnnouncement", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title","body"], properties: {
          title: { type: "string" }, body: { type: "string" }, isPinned: { type: "boolean" },
          expiresAt: { type: "string", format: "date-time", nullable: true },
          sendSMS: { type: "boolean", description: "Broadcast to all active members via SMS" },
        } } } } },
        responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } },
      },
      patch: {
        tags: ["Announcements"], summary: "Update an announcement (id in body)", operationId: "updateAnnouncement", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
          id: { type: "string" }, title: { type: "string" }, body: { type: "string" },
          isPinned: { type: "boolean" }, expiresAt: { type: "string", format: "date-time", nullable: true },
        } } } } },
        responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
      },
      delete: { tags: ["Announcements"], summary: "Delete an announcement", operationId: "deleteAnnouncement", security: [{ ClerkAuth: [] }], parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } },
    },
    "/api/prayer-requests": {
      get: { tags: ["Prayer Requests"], summary: "List all prayer requests", operationId: "listPrayer", responses: { 200: { description: "Array of requests", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/PrayerRequest" } } } } } } },
      post: {
        tags: ["Prayer Requests"], summary: "Submit a prayer request", operationId: "createPrayer", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title","description"], properties: { title: { type: "string" }, description: { type: "string" }, isAnonymous: { type: "boolean" } } } } } },
        responses: { 201: { description: "Submitted" }, 401: { description: "Unauthorized" } },
      },
      patch: {
        tags: ["Prayer Requests"], summary: "Update / resolve a prayer request (id in body)", operationId: "updatePrayer", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: { id: { type: "string" }, title: { type: "string" }, description: { type: "string" }, isResolved: { type: "boolean" } } } } } },
        responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
      },
      delete: { tags: ["Prayer Requests"], summary: "Delete a prayer request", operationId: "deletePrayer", security: [{ ClerkAuth: [] }], parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } },
    },
  },
};
