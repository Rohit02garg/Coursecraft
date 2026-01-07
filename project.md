# CourseCraft - Project Plan

## 1. Overview
**CourseCraft** is a Learning Management System (LMS) where instructors can publish courses and students can enroll and track their progress. This project focuses on relational data modeling, content protection (middleware), and complex UI state.

## 2. Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + ShadCN UI
- **Database:** MongoDB (via Mongoose or Prisma)
- **Auth:** NextAuth.js (v5)
- **Validation:** Zod
- **Forms:** React Hook Form

## 3. Core Features
### A. Authentication
- User Sign Up/Login (Email + Password or Social)
- Role-based redirection (Instructor vs. Student)

### B. Instructor Dashboard (The CMS)
- **Create Course:** Set title, description, price, cover image.
- **Curriculum Editor:**
  - Add Chapters (e.g., "Introduction")
  - Add Lessons within Chapters
  - Drag-and-drop reordering (Bonus)
- **Publish Toggle:** Draft/Published states.

### C. Student Experience
- **Browse:** Public-facing page listing all courses.
- **Enroll:** Simple "Enroll" button (can mock payment later).
- **Learn:** Video player view with a sidebar of lessons.
- **Progress:** "Mark as Complete" button functionality.

## 4. Data Model (Schema Design)

### User
```json
{
  "id": "ObjectId",
  "email": "string",
  "role": "USER | ADMIN",
  "enrolledCourses": ["CourseId"]
}
```

### Course
```json
{
  "id": "ObjectId",
  "userId": "ObjectId (Instructor)",
  "title": "string",
  "description": "string",
  "imageUrl": "string",
  "price": "number",
  "isPublished": "boolean",
  "chapters": ["ChapterId"]
}
```

### Chapter
```json
{
  "id": "ObjectId",
  "courseId": "ObjectId",
  "title": "string",
  "position": "number",
  "isPublished": "boolean",
  "lessons": ["LessonId"]
}
```

### UserProgress
```json
{
  "id": "ObjectId",
  "userId": "ObjectId",
  "lessonId": "ObjectId",
  "isCompleted": "boolean"
}
```

## 5. Development Phases

### Phase 1: Foundation
- [ ] Initialize Next.js project
- [ ] Setup ShadCN UI
- [ ] Configure MongoDB connection
- [ ] Setup NextAuth (Login/Register pages)

### Phase 2: Instructor Mode (The "Hard" Part)
- [ ] Create "New Course" Form (Zod validation)
- [ ] Build the Chapter List UI
- [ ] Implement Chapter creation API

### Phase 3: Public Views
- [ ] Course Cards Grid
- [ ] Course Details Page

### Phase 4: Learning Logic
- [ ] Student Dashboard
- [ ] Video Player Page
- [ ] Progress tracking logic

## 6. Next Steps
1. Initialize the project.
2. Setup the folder structure.
3. Install dependencies (`zod`, `mongoose`, `next-auth`, `shadcn-ui`).
