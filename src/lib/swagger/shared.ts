// ── Shared OpenAPI building blocks ────────────────────────────────────────────

export const securitySchemes = {
  ClerkAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Clerk session JWT — obtain via `useAuth().getToken()` in the frontend.",
  },
};

export const commonSchemas = {
  Error:   { type: "object", properties: { error: { type: "string", example: "Something went wrong" } } },
  Success: { type: "object", properties: { success: { type: "boolean", example: true } } },

  CouncilSection: {
    type: "string",
    enum: ["MAIN_OFFICE","EDUCATION","CHOIR","FINANCE","PUBLIC_RELATIONS","RESEARCH","CHARITY","BATCH_COORDINATION"],
  },
  CouncilRole: {
    type: "string",
    enum: ["SECTION_HEAD","DEPUTY_HEAD","SECRETARY","TREASURER","COORDINATOR","MEMBER"],
  },
  Department: {
    type: "string",
    enum: ["EDUCATION","CHOIR","FINANCE","PUBLIC_RELATIONS","RESEARCH","CHARITY","SUNDAY_SCHOOL","MAHIBER"],
  },
  GibiRole: {
    type: "string",
    enum: ["ADMIN","DEPARTMENT_HEAD","SECRETARY","TREASURER","MEMBER"],
  },
  SpiritualTitle: {
    type: "string",
    enum: ["DEACON","SUBDEACON","READER","ZEMARI","NONE"],
  },
  EventType: {
    type: "string",
    enum: ["KIDASE","TIMKAT","MESKEL","ENKUTATASH","FASIKA","GENA","TSOME_FILSETA","TSOME_NEBIYAT","WEEKLY_MEETING","PRAYER_SESSION","BIBLE_STUDY","COMMUNITY_SERVICE","SPECIAL_EVENT"],
  },

  CouncilMember: {
    type: "object",
    properties: {
      id:            { type: "string", example: "clx1abc123" },
      name:          { type: "string", example: "Betrem Hailu" },
      email:         { type: "string", format: "email", example: "betrem@aau.edu.et" },
      phone:         { type: "string", nullable: true },
      universityId:  { type: "string", example: "UGR/1234/15" },
      section:       { $ref: "#/components/schemas/CouncilSection" },
      subSection:    { type: "string", nullable: true },
      role:          { $ref: "#/components/schemas/CouncilRole" },
      batch:         { type: "string", example: "2022" },
      baptismalName: { type: "string", nullable: true },
      bio:           { type: "string", nullable: true },
      photoUrl:      { type: "string", nullable: true },
      isActive:      { type: "boolean" },
      joinedAt:      { type: "string", format: "date-time" },
      createdAt:     { type: "string", format: "date-time" },
      updatedAt:     { type: "string", format: "date-time" },
    },
  },

  Member: {
    type: "object",
    properties: {
      id:            { type: "string" },
      name:          { type: "string" },
      email:         { type: "string", format: "email" },
      phone:         { type: "string", nullable: true },
      universityId:  { type: "string" },
      department:    { $ref: "#/components/schemas/Department" },
      batch:         { type: "string" },
      role:          { $ref: "#/components/schemas/GibiRole" },
      isActive:      { type: "boolean" },
      baptismalName: { type: "string", nullable: true },
      createdAt:     { type: "string", format: "date-time" },
      updatedAt:     { type: "string", format: "date-time" },
    },
  },

  Payment: {
    type: "object",
    properties: {
      id: { type: "string" }, userId: { type: "string" },
      amount: { type: "number" }, month: { type: "string", example: "2025-01" },
      isPaid: { type: "boolean" }, paidAt: { type: "string", format: "date-time", nullable: true },
      note: { type: "string", nullable: true }, createdAt: { type: "string", format: "date-time" },
    },
  },

  Expense: {
    type: "object",
    properties: {
      id: { type: "string" }, title: { type: "string" }, amount: { type: "number" },
      category: { $ref: "#/components/schemas/Department" },
      description: { type: "string", nullable: true },
      date: { type: "string", format: "date-time" }, createdAt: { type: "string", format: "date-time" },
    },
  },

  Event: {
    type: "object",
    properties: {
      id: { type: "string" }, name: { type: "string" },
      type: { $ref: "#/components/schemas/EventType" },
      description: { type: "string", nullable: true },
      eventDate: { type: "string", format: "date-time" },
      location: { type: "string", nullable: true },
      isRecurring: { type: "boolean" }, createdAt: { type: "string", format: "date-time" },
    },
  },

  Task: {
    type: "object",
    properties: {
      id: { type: "string" }, title: { type: "string" },
      description: { type: "string", nullable: true },
      dueDate: { type: "string", format: "date-time", nullable: true },
      isCompleted: { type: "boolean" },
      department: { $ref: "#/components/schemas/Department" },
      createdAt: { type: "string", format: "date-time" },
    },
  },

  PrayerRequest: {
    type: "object",
    properties: {
      id: { type: "string" }, userId: { type: "string" },
      title: { type: "string" }, description: { type: "string" },
      isAnonymous: { type: "boolean" }, isResolved: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
    },
  },

  Announcement: {
    type: "object",
    properties: {
      id: { type: "string" }, title: { type: "string" }, body: { type: "string" },
      isPinned: { type: "boolean" }, publishedAt: { type: "string", format: "date-time" },
      expiresAt: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
    },
  },
};

export const server = [{ url: "/", description: "Gibi Gubaie Backend (https://gibi-gubaie-backend.onrender.com)" }];
