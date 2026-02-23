# Efficiency Platform

A Next.js-based efficiency platform for managing pipelines and workflows.

## Tech Stack

- **Framework**: Next.js 15.1.7
- **Runtime**: React 19
- **Database**: Prisma ORM with SQLite
- **Language**: TypeScript
- **Validation**: Zod

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── api/         # API routes
│   └── page.tsx     # Main page
├── lib/
│   ├── db/          # Database configuration
│   ├── services/    # Business logic services
│   ├── types/       # TypeScript type definitions
│   ├── utils/       # Utility functions
│   └── validators/  # Zod validation schemas
prisma/
├── schema.prisma    # Database schema
└── seed.ts          # Database seeding
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rfeng1016/EfficiencyPlatform.git
cd EfficiencyPlatform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed the database

## API Endpoints

### Pipelines

- `GET /api/pipelines` - List all pipelines
- `POST /api/pipelines` - Create a new pipeline
- `GET /api/pipelines/[id]` - Get pipeline by ID
- `PUT /api/pipelines/[id]` - Update pipeline
- `DELETE /api/pipelines/[id]` - Delete pipeline

## License

Private
