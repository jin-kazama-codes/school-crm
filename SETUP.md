# School CRM Next.js - Unified Architecture

Single, unified Next.js 15+ (App Router) multi-tenant School CRM application deployed on Vercel with Supabase (PostgreSQL) and Supabase Storage.

## Tech Stack
- **Framework**: Next.js 15+ (App Router, TypeScript)
- **Database**: Supabase PostgreSQL via Prisma ORM
- **Storage**: Supabase Storage (replaces AWS S3 & local filesystem)
- **UI Components**: MUI v4/v5 mixed, Emotion, Formik/Yup
- **State Management**: Redux + Thunk
- **Authentication**: JWT token-based auth (`X-Access-Token` & AES-256-CBC encrypted multi-tenant `School` header)
- **Email**: Nodemailer with Handlebars templates
- **Rate Limiting**: In-memory sliding window rate limiter (5000 req/min per IP)

---

## Project Structure

```
school-crm-next/
├── app/
│   ├── api/v1/          # Next.js Route Handlers (28 API domains)
│   ├── login/           # Login page
│   ├── reset-password/  # Password reset page
│   ├── globals.css      # App-wide global styles
│   ├── layout.tsx       # Root HTML & Redux provider layout
│   ├── page.tsx         # App entry point (loads ClientApp)
│   └── providers.tsx    # Client-side Redux store provider
├── components/          # MUI UI components, Topbar, Sidebar, forms, tables
├── apis/                # Frontend API client methods & Axios config
├── redux/               # Redux actions, reducers, and store
├── lib/
│   ├── prisma.ts        # Prisma Client singleton
│   ├── supabase.ts      # Supabase Client instances (Anon & Service Role)
│   ├── utility.ts       # Auth, encryption (AES-256-CBC), pagination helpers
│   ├── apiHelpers.ts    # Next.js Route Handler auth guard & rate limiter
│   ├── crudHelpers.ts   # Reusable generic CRUD route utilities
│   └── email.ts         # Nodemailer Handlebars email service
├── prisma/
│   └── schema.prisma    # Complete database schema matching 26+ tables
├── views/               # Handlebars email templates
├── prisma.config.ts     # Prisma 7 connection configuration
├── next.config.ts       # Next.js configuration (Supabase image domains, CORS)
└── vercel.json          # Vercel build configuration
```

---

## Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# Supabase PostgreSQL Connection Strings
DATABASE_URL="postgresql://postgres.cipxkmrseiiwvskeneok:I6N2VwXNbEhTA7H5@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.cipxkmrseiiwvskeneok:I6N2VwXNbEhTA7H5@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://cipxkmrseiiwvskeneok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=school-crm

# JWT & AES-256 Encryption Keys
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=86400
SALT=16
ALGORITHM=aes-256-cbc
STRING_SALT=your_string_salt

# SMTP Configuration
SMTP_USER=nfhusain.fana@gmail.com
SMTP_PASS=your_gmail_app_password

# Application Settings
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_LOGOUT_TIMER=1800000
```

---

## Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Run Database Migration (Push schema to Supabase)**:
   ```bash
   npx prisma db push
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Vercel

1. Push code to GitHub/GitLab repository.
2. Import project into Vercel Dashboard.
3. Configure environment variables in Vercel settings (match `.env.local`).
4. Ensure build command is: `npx prisma generate && next build`.
5. Deploy!
