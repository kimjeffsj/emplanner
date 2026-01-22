# Smart Schedule Viewer

A static web app for family business employees to easily check their work schedules on mobile and desktop.

> Uses Google Sheets as a CMS - when the manager updates the sheet, changes are automatically reflected on the web (ISR).

## Features

- **Real-time Schedule Sync**: Google Sheets update → reflected on web within 1 minute (ISR)
- **Personal Schedule View**: Select employee from dropdown to see individual schedule
- **Multi-location Support**: Tab switching between No.3 and Westminster locations
- **Senior-friendly UI**: 18px+ fonts, 44px+ touch targets, high-contrast colors
- **PWA Support**: Add to home screen like a native app
- **Today Highlight**: Current date cell is visually emphasized

## Screenshots

| Weekly Grid View                       | Personal Schedule                         |
| -------------------------------------- | ----------------------------------------- |
| ![Grid View](docs/screenshot-grid.png) | ![Personal](docs/screenshot-personal.png) |

> Screenshots will be added to `docs/` folder

## Tech Stack

| Category    | Technology                   |
| ----------- | ---------------------------- |
| Framework   | Next.js 16 (App Router)      |
| Language    | TypeScript                   |
| Styling     | Tailwind CSS v4 + shadcn/ui  |
| Data Source | Google Sheets API            |
| Database    | Vercel Postgres (Prisma)     |
| Rendering   | ISR (60s revalidate)         |
| PWA         | @ducanh2912/next-pwa         |
| Testing     | Jest + React Testing Library |
| Hosting     | Vercel                       |

## Local Development Setup

### Prerequisites

- Node.js 18.17 or higher
- npm or pnpm
- Google Cloud Platform account (for Sheets API)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chicko-schedule.git
cd chicko-schedule
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Google Sheets API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id

# Vercel Postgres (optional for local development)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Cron Job Security (required for production)
CRON_SECRET=your-random-secret
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable                       | Description                                     | Required   |
| ------------------------------ | ----------------------------------------------- | ---------- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | GCP Service Account email                       | Yes        |
| `GOOGLE_PRIVATE_KEY`           | private_key value from Service Account JSON key | Yes        |
| `GOOGLE_SHEET_ID`              | Document ID from Google Sheets URL              | Yes        |
| `POSTGRES_URL`                 | Vercel Postgres connection URL                  | Production |
| `POSTGRES_PRISMA_URL`          | Prisma Postgres URL (connection pooling)        | Production |
| `CRON_SECRET`                  | Secret key for Cron Job API security            | Production |

### Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. APIs & Services → Enable APIs → Enable "Google Sheets API"
4. IAM & Admin → Service Accounts → Create new Service Account
5. Create key (JSON format) → Download
6. In Google Sheets, invite Service Account email as **Editor**

## Google Sheets Structure

### Sheet 1: `Employees` (Employee List)

| A (Name) |
| -------- |
| John     |
| Jane     |
| Alice    |
| ...      |

### Sheet 2 & 3: `No3_Schedule`, `Westminster_Schedule`

```
     A          B          C          D          ...
1  [Location] Sunday     Monday     Tuesday     ...
2             2025-01-04 2025-01-05 2025-01-06  ...
3    *                   Bob        Charlie       ...
4
5   11:00     John      Charlie          Jane(until 17:00)
6             Alice   John
7
8   15:30     Bob       Alice        John(from 17:30)
```

| Notation            | Meaning                   |
| ------------------- | ------------------------- |
| `*` (Row 3)         | All day (full-time shift) |
| `11:00`             | Morning shift             |
| `15:30`             | Afternoon shift           |
| `Name(until HH:MM)` | Work until specified time |
| `Name(from HH:MM)`  | Work from specified time  |

## Project Structure

```
chicko-schedule/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main page (Server Component)
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles + Tailwind
│   └── manifest.ts        # PWA manifest
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ScheduleViewer.tsx # Main viewer (Client Component)
│   ├── WeeklyGrid.tsx    # Weekly grid view
│   ├── PersonalSchedule.tsx # Personal schedule view
│   └── ...
├── lib/                   # Utility functions
│   ├── google-sheets.ts  # Google Sheets API
│   └── schedule-parser.ts # Data parsing
├── types/                 # TypeScript type definitions
├── __tests__/            # Jest tests
├── public/icons/         # PWA icons
└── prisma/               # Prisma schema
```

## Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Run production server
npm start

# Run tests
npm test

# Run tests (watch mode)
npm run test:watch

# Test coverage report
npm run test:coverage

# Lint
npm run lint

# Format code
npm run format
```

## Deployment

### Vercel Deployment (Recommended)

1. Connect GitHub repository to [Vercel](https://vercel.com)
2. Set environment variables:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`
   - Vercel Postgres variables are auto-configured when linked
3. Click Deploy

### Post-deployment Checklist

- [ ] Main page loads correctly
- [ ] Employee dropdown works
- [ ] Tab switching works
- [ ] Google Sheets update → reflected within 1 minute
- [ ] PWA installation available

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- schedule-parser

# Generate coverage report
npm run test:coverage
```

Currently **131 tests** passing (as of 2026-01-16)

## License

Private - For family business use only

## Contributors

- Jeff Kim (@jeffseongjunkim)
