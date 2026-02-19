# Bulgarian Embassy Cairo - Consular MVP

Next.js 14 + TypeScript + Tailwind + Prisma MVP skeleton for public bookings and staff/admin operations.

## Quick start

1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client and run migrations:
   ```bash
   npm run migrate
   npm run seed
   ```
4. Run app:
   ```bash
   npm run dev
   ```

Production entrypoint listens on `PORT` via `npm start`.
