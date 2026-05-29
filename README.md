# c-template

A clean Next.js 15 project template with essential modules: authentication, menu management, user management, roles, activity logs, and a master data example.

## Features

- **Next.js 15** with App Router and TypeScript
- **NextAuth v4** with Credentials provider (JWT strategy)
- **Prisma 6** with PostgreSQL
- **MUI v7 + MUI X DataGrid v8** for all data tables
- **Tailwind CSS v4** with dark mode support
- **shadcn/ui** components (Dialog, Button, Input, Select, Card, Badge, etc.)
- **Socket.IO v4** for real-time menu updates
- **Zustand** for sidebar state persistence
- **next-themes** for light/dark theme toggle

## Modules

- `/dashboard` — Landing page with stats overview
- `/menu` — Menu management (CRUD with role assignment)
- `/user-management/users` — User account management
- `/user-management/roles` — Role management
- `/user-management/log-user` — Activity log viewer
- `/master-data/example` — Master data template (CRUD)

## Getting Started

1. **Clone and install**
   ```bash
   pnpm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
   ```

3. **Set up database**
   ```bash
   pnpm prisma migrate dev --name init
   pnpm prisma db seed
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Login**
   - NIK: `admin`
   - Password: `admin123`

## Build & Deploy

```bash
# Build
pnpm build

# Start production
pnpm start
```

## Docker

```bash
docker build -t c-template .
docker run -p 3000:3000 --env-file .env c-template
```

## Project Structure

```
c-template/
├── app/
│   ├── (app)/               # Protected routes
│   │   ├── dashboard/
│   │   ├── menu/
│   │   ├── user-management/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   └── log-user/
│   │   └── master-data/
│   │       └── example/
│   ├── api/
│   │   └── v1/              # REST API endpoints
│   └── auth/
│       └── signin/
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── datatable/           # MUI DataGrid wrapper
│   ├── layout/              # Sidebar, Navbar, Layout
│   ├── menus/
│   ├── users/
│   ├── roles/
│   ├── userLogs/
│   └── masterExample/
├── lib/
│   ├── auth.config.ts       # NextAuth config
│   ├── auth.ts              # Auth helpers
│   ├── prisma.ts            # Prisma client
│   └── userLogger.ts        # Activity logging
└── prisma/
    ├── schema.prisma
    └── seed.ts
```
