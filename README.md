# DownForAI — Real-Time AI Service Status Monitor

A production-ready Next.js 15 application that monitors the status of 60+ AI services in real-time.

## ✨ Features

- **Real-time Monitoring**: Live status monitoring for 60+ AI services
- **Service Categories**: Browse services by category (LLM, Image, Video, Audio, Dev Tools, Infrastructure, Search, Productivity)
- **Uptime Tracking**: 48-hour historical data with latency charts
- **Incident Management**: Real-time incident timeline and tracking
- **Community Reporting**: User-reported issues with rate limiting
- **SEO Optimized**: Sitemap, robots.txt, metadata, JSON-LD structured data
- **Dark Mode**: Professional dark-themed UI
- **Mobile Responsive**: Fully responsive design for all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17+ and npm
- PostgreSQL database (or Neon PostgreSQL)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd downforai

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Update .env.local with your database URL
# DATABASE_URL and DIRECT_URL should point to your PostgreSQL database
```

### Database Setup

```bash
# Create Prisma migrations
npx prisma migrate dev --name init

# Push schema to database
npx prisma db push

# Seed database with 60 services and historical data
npm run seed

# Or run via Prisma directly
npx prisma db seed
```

### Running Locally

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Homepage
│   ├── [serviceSlug]/page.tsx        # Service detail page
│   ├── category/[category]/page.tsx  # Category page
│   ├── incidents/page.tsx            # Incidents timeline
│   ├── report/page.tsx               # Report form
│   ├── api/
│   │   ├── services/route.ts
│   │   ├── services/[slug]/route.ts
│   │   ├── report/route.ts
│   │   └── cron/
│   │       ├── check-status/route.ts
│   │       └── aggregate-reports/route.ts
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                           # Base UI components
│   ├── status/                       # Status display components
│   ├── layout/                       # Layout components
│   └── home/                         # Homepage components
├── lib/
│   ├── db.ts                         # Prisma client
│   ├── utils.ts                      # Utility functions
│   ├── badges.ts                     # Badge helpers
│   └── seo.ts                        # SEO utilities
└── types/
    └── index.ts                      # TypeScript types

prisma/
├── schema.prisma                     # Database schema
└── seed.ts                           # Seed data
```

## 🔌 API Endpoints

### Public Endpoints

- `GET /api/services` - Get all services with current status
- `GET /api/services/[slug]` - Get detailed service information
- `POST /api/report` - Submit a community report

### Protected Cron Endpoints

- `POST /api/cron/check-status` - Check service status (runs every 5 minutes)
- `POST /api/cron/aggregate-reports` - Aggregate community reports (runs every 10 minutes)

Both cron endpoints require `Authorization: Bearer {CRON_SECRET}` header.

## 🌐 Environment Variables

See `.env.example` for all available options:

```env
DATABASE_URL=postgresql://...        # Database connection
DIRECT_URL=postgresql://...          # Direct database connection (for Prisma migrations)
CRON_SECRET=your-secret-key          # Secret for cron endpoints
NEXT_PUBLIC_SITE_URL=https://...     # Site URL for SEO
NEXT_PUBLIC_SITE_NAME=DownForAI      # Site name
```

## 📊 Monitoring Strategy

### Data Handling

**Development/Preview Mode:**
- Simulates realistic service statuses (95% operational, 3% degraded, 2% outage)
- Generates realistic latency metrics
- Creates incidents on status transitions
- Perfect for testing and development

**Production Mode:**
- Only inserts UNKNOWN status if no observations exist or last observation > 6 hours
- Prevents database pollution with stale data
- Relies on integrated monitoring (status page sync, HTTP checks)
- Community reports trigger incident creation

### Rate Limiting

**Community Reports:**
- Max 1 report per service per IP every 15 minutes
- Max 5 reports total per IP every 15 minutes
- Uses SHA256 hashed IP for privacy

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Automatic deployments from git enabled
```

The project includes `vercel.json` with cron configuration.

### Self-Hosted

```bash
# Build
npm run build

# Start
npm start
```

## 🔐 Security

- Rate limiting prevents spam reports
- IP addresses are hashed (not stored in plain text)
- No user authentication required
- API endpoints protected with CRON_SECRET
- Type-safe with TypeScript strict mode

## 📈 Performance

- **ISR (Incremental Static Regeneration)**: 
  - Services: 60 second revalidation
  - Categories: 120 second revalidation
  - Dynamic content updates without rebuilds

- **Database Optimization**:
  - Indexed queries for fast lookups
  - Efficient observation storage (25K+ records)
  - Lazy loading of incident data

## 🧪 Testing

```bash
# Run development server with test data
npm run dev

# The seed includes:
# - 60 services across 8 categories
# - 48 hours of observation data (192 observations per surface)
# - 10 realistic resolved incidents
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please ensure all code follows the strict TypeScript guidelines.

## 📞 Support

For issues or questions, open a GitHub issue or contact the team.
