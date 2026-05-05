# Workspace — Document Editor

A collaborative document editor built with Next.js, Prisma, and TipTap. Supports rich-text editing, file attachments, document sharing with role-based access, and user authentication.

---

## Tech Stack

- **Framework** — Next.js 14 (App Router)
- **Database ORM** — Prisma
- **Editor** — TipTap (StarterKit + Underline extension)
- **Styling** — Tailwind CSS
- **Auth** — bcrypt (manual session via localStorage)
- **Fonts** — Instrument Serif, DM Mono (Google Fonts)

---

## Prerequisites

- Node.js 18+
- A running MySQL database

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-repo-name>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root of the project:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
```

Replace `USER`, `PASSWORD`, `HOST`, `PORT`, and `DATABASE_NAME` with your MySQL credentials.

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

This creates all required tables: `User`, `Document`, `Attachment`, `DocumentAccess`.

### 5. Generate the Prisma client

```bash
npx prisma generate
```

### 6. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── login/             # Login page
├── register/          # Register page
├── documents/
│   └── [id]/          # Document editor page
├── api/
│   ├── login/         # POST — authenticate user
│   ├── register/      # POST — create user
│   ├── users/         # GET — list all users
│   └── documents/
│       ├── route.ts          # GET (list), POST (create)
│       ├── upload/route.ts   # POST — upload file as new document
│       └── [id]/
│           ├── route.ts              # GET, PATCH
│           ├── attachments/route.ts  # GET, POST
│           └── access/route.ts       # GET, POST, PUT
src/
├── components/
│   └── Editor.tsx     # TipTap rich-text editor component
└── lib/
    └── prisma.ts      # Prisma client singleton
```

---

## Features

### Authentication
- Register and login with email and password
- Passwords are hashed with bcrypt
- Session is stored in `localStorage` as a user object

### Documents
- Create documents with a title via a modal
- Auto-save content with a 500ms debounce
- Rich-text editing: **Bold**, *Italic*, Underline, H1/H2/H3, Bullet lists, Numbered lists
- Rename documents inline from the document list
- Character count displayed below the editor

### File Upload
- **Upload a file** (`.txt`, `.md`, `.docx`) from the home page to create a new document
- **Import into editor** — append a `.txt` or `.md` file's content into the current draft via the toolbar
- **Attach files** to a document — stored in the database and listed below the editor

### Sharing & Access Control
- Share documents with other registered users
- Assign roles: **Editor** (can edit) or **Viewer** (read-only)
- Viewers see a notice banner and cannot type in the editor
- Share button is only visible to the document owner
- Documents show an **owner** or **member** badge in the list

---

## Supported File Types

| Feature | Accepted Types |
|---|---|
| Upload as new document | `.txt`, `.md`, `.docx` |
| Import into editor | `.txt`, `.md` |
| Attach to document | Any file type |

---

## Database Schema

```prisma
model User {
  id          String  @id @default(cuid())
  email       String  @unique
  password    String
}

model Document {
  id          String       @id @default(cuid())
  title       String
  content     Json
  ownerId     String
  createdAt   DateTime     @default(now())
  attachments Attachment[]
}

model Attachment {
  id          String   @id @default(cuid())
  documentId  String
  fileName    String
  fileType    String
  content     Bytes?
  createdAt   DateTime @default(now())
  document    Document @relation(fields: [documentId], references: [id])
}

model DocumentAccess {
  id         String @id @default(cuid())
  documentId String
  userId     String
  role       String  // "viewer" | "editor"
}
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Run migrations |
| `npx prisma generate` | Regenerate Prisma client |
