# EventFlow Studio

Interactive full-stack event planner built with Next.js, Prisma, and MongoDB Atlas.

## What It Includes

- Interactive drag-and-drop event floor canvas
- Object inspector for labels, size, rotation, and cost
- Guest assignment flow
- Vendor and budget tracking
- API routes for events, layout persistence, guests, and vendors
- Prisma database schema and seed data
- Vercel deployment config

## Open In VS Code

```powershell
code .
```

## Run Locally

```powershell
copy .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Database

This project now uses MongoDB. Put your MongoDB Atlas connection string in `.env`:

```env
DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/eventflow?retryWrites=true&w=majority"
```

Then apply the Prisma schema and seed demo data:

```powershell
npm run db:push
npm run db:seed
```

## Deploy To Vercel

1. Push this folder to GitHub.
2. Import the repo into Vercel.
3. Add your MongoDB Atlas `DATABASE_URL` in Vercel project environment variables.
4. Deploy.

Recommended production services:

- App hosting: Vercel
- Database: MongoDB Atlas
- File uploads later: Cloudinary
- Email invites later: Resend
- Realtime collaboration later: Socket.io on Railway or Ably/Pusher

## Useful Scripts

```powershell
npm run dev       # local app
npm run build     # production build
npm run db:push   # apply schema
npm run db:seed   # demo data
npm run db:studio # inspect database
```
