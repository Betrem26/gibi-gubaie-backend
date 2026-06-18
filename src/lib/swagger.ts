// OpenAPI 3.0 specification for the Gibi Gubaie API
export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Gibi Gubaie API",
    description: "Ethiopian Orthodox Tewahedo University Student Association — Backend API",
    version: "1.0.0",
  },
  servers: [
    { url: "/", description: "Current server" },
  ],
  tags: [
    { name: "Health",           description: "Server health check" },
    { name: "Members",          description: "Association member management" },
    { name: "Council",          description: "Campus council member management" },
    { name: "Attendance",       description: "Event attendance tracking" },
    { name: "Finance",          description: "Payments and expenses" },
    { name: "Events",           description: "Church and association events" },
    { name: "Tasks",            description: "Task management" },
    { name: "Task Assignments", description: "Assign tasks to members" },
    { name: "Prayer Requests",  description: "Member prayer / intercession requests" },
    { name: "Announcements",    description: "Announcement board" },
    { name: "Onboarding",       description: "New council member onboarding" },
    { name: "Me",               description: "Current user helpers" },
  ],
  components: {
    securitySchemes: {
      ClerkAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Clerk session token — obtain from the Clerk dashboard or frontend SDK",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
      Success: {
        type: "object",
        properties: { success: { type: "boolean", example: true } },
      },
      Department: {
        type: "string",
        enum: ["EDUCATION","CHOIR","FINANCE","PUBLIC_RELATIONS","RESEARCH","CHARITY","SUNDAY_SCHOOL","MAHIBER"],
      },
      GibiRole: {
        type: "string",
        enum: ["ADMIN","DEPARTMENT_HEAD","SECRETARY","TREASURER","MEMBER"],
      },
      CouncilSection: {
        type: "string",
        enum: ["MAIN_OFFICE","EDUCATION","CHOIR","FINANCE","PUBLIC_RELATIONS","RESEARCH","CHARITY","BATCH_COORDINATION"],
      },
      CouncilRole: {
        type: "string",
        enum: ["SECTION_HEAD","DEPUTY_HEAD","SECRETARY","TREASURER","COORDINATOR","MEMBER"],
      },
      EventType: {
        type: "string",
        enum: ["KIDASE","TIMKAT","MESKEL","ENKUTATASH","FASIKA","GENA","TSOME_FILSETA","TSOME_NEBIYAT","WEEKLY_MEETING","PRAYER_SESSION","BIBLE_STUDY","COMMUNITY_SERVICE","SPECIAL_EVENT"],
      },
      Member: {
        type: "object",
        properties: {
          id:             { type: "string" },
          clerkId:        { type: "string" },
          name:           { type: "string" },
          email:          { type: "string", format: "email" },
          phone:          { type: "string", nullable: true },
          universityId:   { type: "string" },
          department:     { $ref: "#/components/schemas/Department" },
          batch:          { type: "string" },
          role:           { $ref: "#/components/schemas/GibiRole" },
          isActive:       { type: "boolean" },
          baptismalName:  { type: "string", nullable: true },
          kebele:         { type: "string", nullable: true },
          createdAt:      { type: "string", format: "date-time" },
          updatedAt:      { type: "string", format: "date-time" },
        },
      },
      CouncilMember: {
        type: "object",
        properties: {
          id:            { type: "string" },
          name:          { type: "string" },
          email:         { type: "string", format: "email" },
          phone:         { type: "string", nullable: true },
          universityId:  { type: "string" },
          section:       { $ref: "#/components/schemas/CouncilSection" },
          subSection:    { type: "string", nullable: true },
          role:          { $ref: "#/components/schemas/CouncilRole" },
          batch:         { type: "string" },
          baptismalName: { type: "string", nullable: true },
          bio:           { type: "string", nullable: true },
          photoUrl:      { type: "string", nullable: true },
          isActive:      { type: "boolean" },
          joinedAt:      { type: "string", format: "date-time" },
          createdAt:     { type: "string", format: "date-time" },
          updatedAt:     { type: "string", format: "date-time" },
        },
      },
      Payment: {
        type: "object",
        properties: {
          id:        { type: "string" },
          userId:    { type: "string" },
          amount:    { type: "number" },
          month:     { type: "string", example: "2025-01" },
          isPaid:    { type: "boolean" },
          paidAt:    { type: "string", format: "date-time", nullable: true },
          note:      { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Expense: {
        type: "object",
        properties: {
          id:          { type: "string" },
          title:       { type: "string" },
          amount:      { type: "number" },
          category:    { $ref: "#/components/schemas/Department", nullable: true },
          description: { type: "string", nullable: true },
          date:        { type: "string", format: "date-time" },
          createdAt:   { type: "string", format: "date-time" },
        },
      },
      Event: {
        type: "object",
        properties: {
          id:          { type: "string" },
          name:        { type: "string" },
          type:        { $ref: "#/components/schemas/EventType" },
          description: { type: "string", nullable: true },
          eventDate:   { type: "string", format: "date-time" },
          location:    { type: "string", nullable: true },
          isRecurring: { type: "boolean" },
          createdAt:   { type: "string", format: "date-time" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id:          { type: "string" },
          title:       { type: "string" },
          description: { type: "string", nullable: true },
          dueDate:     { type: "string", format: "date-time", nullable: true },
          isCompleted: { type: "boolean" },
          department:  { $ref: "#/components/schemas/Department", nullable: true },
          createdAt:   { type: "string", format: "date-time" },
        },
      },
      PrayerRequest: {
        type: "object",
        properties: {
          id:          { type: "string" },
          userId:      { type: "string" },
          title:       { type: "string" },
          description: { type: "string" },
          isAnonymous: { type: "boolean" },
          isResolved:  { type: "boolean" },
          createdAt:   { type: "string", format: "date-time" },
        },
      },
      Announcement: {
        type: "object",
        properties: {
          id:          { type: "string" },
          title:       { type: "string" },
          body:        { type: "string" },
          isPinned:    { type: "boolean" },
          publishedAt: { type: "string", format: "date-time" },
          expiresAt:   { type: "string", format: "date-time", nullable: true },
          createdAt:   { type: "string", format: "date-time" },
        },
      },
    }, // end schemas
  }, // end components
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: { description: "Server is up", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "ok" } } } } } },
        },
      },
    },

    // ── Members ───────────────────────────────────────────────────────────────
    "/api/members": {
      get: {
        tags: ["Members"],
        summary: "List all members",
        responses: {
          200: { description: "Array of members", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Member" } } } } },
          500: { description: "Server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Members"],
        summary: "Create a new member",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name","email","universityId","department","batch"],
                properties: {
                  name:         { type: "string" },
                  email:        { type: "string", format: "email" },
                  phone:        { type: "string" },
                  universityId: { type: "string" },
                  department:   { $ref: "#/components/schemas/Department" },
                  batch:        { type: "string" },
                  role:         { $ref: "#/components/schemas/GibiRole" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Member created", content: { "application/json": { schema: { $ref: "#/components/schemas/Member" } } } },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          409: { description: "Email or ID already exists" },
        },
      },
      patch: {
        tags: ["Members"],
        summary: "Update a member (pass id in body)",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id"],
                properties: {
                  id:           { type: "string" },
                  name:         { type: "string" },
                  email:        { type: "string" },
                  phone:        { type: "string" },
                  universityId: { type: "string" },
                  department:   { $ref: "#/components/schemas/Department" },
                  batch:        { type: "string" },
                  role:         { $ref: "#/components/schemas/GibiRole" },
                  isActive:     { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated member", content: { "application/json": { schema: { $ref: "#/components/schemas/Member" } } } },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
        },
      },
    },
    // ── Council ───────────────────────────────────────────────────────────────
    "/api/council": {
      get: {
        tags: ["Council"],
        summary: "List council members (optionally filter by section)",
        parameters: [{ in: "query", name: "section", schema: { $ref: "#/components/schemas/CouncilSection" }, description: "Filter by council section" }],
        responses: {
          200: { description: "Array of council members", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/CouncilMember" } } } } },
          500: { description: "Server error" },
        },
      },
      post: {
        tags: ["Council"],
        summary: "Add a council member",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name","email","universityId","section","batch"],
                properties: {
                  name:         { type: "string" },
                  email:        { type: "string", format: "email" },
                  phone:        { type: "string" },
                  universityId: { type: "string" },
                  section:      { $ref: "#/components/schemas/CouncilSection" },
                  subSection:   { type: "string" },
                  role:         { $ref: "#/components/schemas/CouncilRole" },
                  batch:        { type: "string" },
                  baptismalName:{ type: "string" },
                  bio:          { type: "string" },
                  photoUrl:     { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Council member created", content: { "application/json": { schema: { $ref: "#/components/schemas/CouncilMember" } } } },
          401: { description: "Unauthorized" },
          403: { description: "Permission denied" },
          409: { description: "Email or ID already exists" },
        },
      },
      patch: {
        tags: ["Council"],
        summary: "Update a council member (pass id in body)",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id"],
                properties: {
                  id: { type: "string" },
                  name: { type: "string" }, email: { type: "string" }, phone: { type: "string" },
                  universityId: { type: "string" }, section: { $ref: "#/components/schemas/CouncilSection" },
                  subSection: { type: "string" }, role: { $ref: "#/components/schemas/CouncilRole" },
                  batch: { type: "string" }, isActive: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated council member", content: { "application/json": { schema: { $ref: "#/components/schemas/CouncilMember" } } } },
          401: { description: "Unauthorized" }, 403: { description: "Permission denied" },
        },
      },
      delete: {
        tags: ["Council"],
        summary: "Delete a council member",
        security: [{ ClerkAuth: [] }],
        parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
          401: { description: "Unauthorized" }, 403: { description: "Permission denied" }, 404: { description: "Not found" },
        },
      },
    },
    "/api/council/{id}": {
      get: {
        tags: ["Council"],
        summary: "Get a single council member by ID",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Council member", content: { "application/json": { schema: { $ref: "#/components/schemas/CouncilMember" } } } },
          404: { description: "Not found" },
        },
      },
    },
    // ── Attendance ────────────────────────────────────────────────────────────
    "/api/attendance": {
      get: {
        tags: ["Attendance"],
        summary: "Get attendance for a specific event",
        parameters: [
          { in: "query", name: "eventName", required: true, schema: { type: "string" }, example: "Weekly Meeting" },
          { in: "query", name: "eventDate", required: true, schema: { type: "string", format: "date" }, example: "2025-06-18" },
        ],
        responses: {
          200: { description: "Present member IDs", content: { "application/json": { schema: { type: "object", properties: { presentIds: { type: "array", items: { type: "string" } } } } } } },
          400: { description: "Missing query params" },
        },
      },
      post: {
        tags: ["Attendance"],
        summary: "Save attendance for an event (upserts all members)",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["eventName","eventDate","allIds"],
                properties: {
                  eventName:  { type: "string" },
                  eventDate:  { type: "string", format: "date" },
                  presentIds: { type: "array", items: { type: "string" }, description: "IDs of present members" },
                  allIds:     { type: "array", items: { type: "string" }, description: "All member IDs for this event" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Saved", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, saved: { type: "number" } } } } } },
          400: { description: "Validation error" }, 401: { description: "Unauthorized" },
        },
      },
    },

    // ── Finance ───────────────────────────────────────────────────────────────
    "/api/finance": {
      get: {
        tags: ["Finance"],
        summary: "Get all payments and expenses",
        responses: {
          200: {
            description: "Payments and expenses",
            content: { "application/json": { schema: { type: "object", properties: {
              payments: { type: "array", items: { $ref: "#/components/schemas/Payment" } },
              expenses: { type: "array", items: { $ref: "#/components/schemas/Expense" } },
            } } } },
          },
        },
      },
      post: {
        tags: ["Finance"],
        summary: "Record a payment or expense",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["type"],
                properties: {
                  type:        { type: "string", enum: ["payment","expense"] },
                  userId:      { type: "string", description: "Required for payment" },
                  month:       { type: "string", description: "Required for payment — format YYYY-MM" },
                  amount:      { type: "number" },
                  note:        { type: "string" },
                  title:       { type: "string", description: "Required for expense" },
                  date:        { type: "string", format: "date", description: "Required for expense" },
                  category:    { $ref: "#/components/schemas/Department" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Created" },
          400: { description: "Validation error" }, 401: { description: "Unauthorized" },
        },
      },
    },
    // ── Events ────────────────────────────────────────────────────────────────
    "/api/events": {
      get: {
        tags: ["Events"], summary: "List all events",
        responses: { 200: { description: "Array of events", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Event" } } } } } },
      },
      post: {
        tags: ["Events"], summary: "Create an event", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","type","eventDate"], properties: {
          name: { type: "string" }, type: { $ref: "#/components/schemas/EventType" },
          description: { type: "string" }, eventDate: { type: "string", format: "date-time" },
          location: { type: "string" }, isRecurring: { type: "boolean" },
        } } } } },
        responses: { 201: { description: "Created" }, 400: { description: "Validation error" }, 401: { description: "Unauthorized" } },
      },
      patch: {
        tags: ["Events"], summary: "Update an event (pass id in body)", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
          id: { type: "string" }, name: { type: "string" }, type: { $ref: "#/components/schemas/EventType" },
          description: { type: "string" }, eventDate: { type: "string", format: "date-time" },
          location: { type: "string" }, isRecurring: { type: "boolean" },
        } } } } },
        responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
      },
      delete: {
        tags: ["Events"], summary: "Delete an event", security: [{ ClerkAuth: [] }],
        parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" }, 401: { description: "Unauthorized" } },
      },
    },

    // ── Tasks ─────────────────────────────────────────────────────────────────
    "/api/tasks": {
      get: {
        tags: ["Tasks"], summary: "List all tasks with assignments",
        responses: { 200: { description: "Array of tasks", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Task" } } } } } },
      },
      post: {
        tags: ["Tasks"], summary: "Create a task", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title"], properties: {
          title: { type: "string" }, description: { type: "string" },
          dueDate: { type: "string", format: "date-time" }, department: { $ref: "#/components/schemas/Department" },
        } } } } },
        responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } },
      },
      patch: {
        tags: ["Tasks"], summary: "Update a task (pass id in body)", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
          id: { type: "string" }, title: { type: "string" }, description: { type: "string" },
          dueDate: { type: "string", format: "date-time" }, isCompleted: { type: "boolean" }, department: { $ref: "#/components/schemas/Department" },
        } } } } },
        responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
      },
      delete: {
        tags: ["Tasks"], summary: "Delete a task", security: [{ ClerkAuth: [] }],
        parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" }, 401: { description: "Unauthorized" } },
      },
    },

    // ── Task Assignments ──────────────────────────────────────────────────────
    "/api/task-assignments": {
      post: {
        tags: ["Task Assignments"], summary: "Assign a task to a member", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["taskId","userId"], properties: {
          taskId: { type: "string" }, userId: { type: "string" },
        } } } } },
        responses: { 201: { description: "Assigned" }, 401: { description: "Unauthorized" }, 409: { description: "Already assigned" } },
      },
      delete: {
        tags: ["Task Assignments"], summary: "Remove a task assignment", security: [{ ClerkAuth: [] }],
        parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" }, description: "TaskAssignment ID" }],
        responses: { 200: { description: "Removed" }, 401: { description: "Unauthorized" } },
      },
    },

    // ── Prayer Requests ───────────────────────────────────────────────────────
    "/api/prayer-requests": {
      get: {
        tags: ["Prayer Requests"], summary: "List all prayer requests",
        responses: { 200: { description: "Array of prayer requests", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/PrayerRequest" } } } } } },
      },
      post: {
        tags: ["Prayer Requests"], summary: "Submit a prayer request", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title","description"], properties: {
          title: { type: "string" }, description: { type: "string" }, isAnonymous: { type: "boolean", default: false },
        } } } } },
        responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" }, 404: { description: "User not found" } },
      },
      patch: {
        tags: ["Prayer Requests"], summary: "Update a prayer request (pass id in body)", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
          id: { type: "string" }, title: { type: "string" }, description: { type: "string" }, isResolved: { type: "boolean" },
        } } } } },
        responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
      },
      delete: {
        tags: ["Prayer Requests"], summary: "Delete a prayer request", security: [{ ClerkAuth: [] }],
        parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" }, 401: { description: "Unauthorized" } },
      },
    },

    // ── Announcements ─────────────────────────────────────────────────────────
    "/api/announcements": {
      get: {
        tags: ["Announcements"], summary: "List active (non-expired) announcements",
        responses: { 200: { description: "Array of announcements", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Announcement" } } } } } },
      },
      post: {
        tags: ["Announcements"], summary: "Create an announcement", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title","body"], properties: {
          title:     { type: "string" },
          body:      { type: "string" },
          isPinned:  { type: "boolean", default: false },
          expiresAt: { type: "string", format: "date-time", nullable: true },
          sendSMS:   { type: "boolean", default: false, description: "Broadcast to all active members via SMS" },
        } } } } },
        responses: { 201: { description: "Created", content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/Announcement" }, { type: "object", properties: { smsStatus: { type: "object", properties: { sent: { type: "number" }, failed: { type: "number" }, total: { type: "number" } } } } }] } } } }, 401: { description: "Unauthorized" } },
      },
      patch: {
        tags: ["Announcements"], summary: "Update an announcement (pass id in body)", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["id"], properties: {
          id: { type: "string" }, title: { type: "string" }, body: { type: "string" }, isPinned: { type: "boolean" }, expiresAt: { type: "string", format: "date-time", nullable: true },
        } } } } },
        responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" } },
      },
      delete: {
        tags: ["Announcements"], summary: "Delete an announcement", security: [{ ClerkAuth: [] }],
        parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" }, 401: { description: "Unauthorized" } },
      },
    },

    // ── Onboarding ────────────────────────────────────────────────────────────
    "/api/onboarding": {
      post: {
        tags: ["Onboarding"], summary: "Complete onboarding — create council profile for the signed-in user", security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","email","universityId","section","batch"], properties: {
          name:          { type: "string" },
          email:         { type: "string", format: "email" },
          phone:         { type: "string" },
          universityId:  { type: "string" },
          section:       { $ref: "#/components/schemas/CouncilSection" },
          subSection:    { type: "string" },
          role:          { $ref: "#/components/schemas/CouncilRole" },
          batch:         { type: "string" },
          baptismalName: { type: "string" },
          bio:           { type: "string" },
        } } } } },
        responses: {
          201: { description: "Onboarded successfully", content: { "application/json": { schema: { type: "object", properties: { memberId: { type: "string" }, section: { $ref: "#/components/schemas/CouncilSection" }, redirectUrl: { type: "string" } } } } } },
          401: { description: "Unauthorized" }, 409: { description: "Email or ID already exists" },
        },
      },
    },

    // ── Me ────────────────────────────────────────────────────────────────────
    "/api/me/redirect": {
      get: {
        tags: ["Me"], summary: "Get redirect URL for the signed-in user based on their council profile",
        security: [{ ClerkAuth: [] }],
        responses: {
          200: { description: "Redirect URL", content: { "application/json": { schema: { type: "object", properties: { redirectUrl: { type: "string", example: "/council/education/clxxx..." } } } } } },
        },
      },
    },
  }, // end paths
}; // end swaggerSpec
