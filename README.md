# drops

A quiet, personal learning companion. Each day, a concise AI-generated lesson arrives via push notification — sourced, curated to your interests, and designed to be read in minutes.

Built with [Next.js](https://nextjs.org), [Turso](https://turso.tech) (libSQL), [OpenRouter](https://openrouter.ai), [Clerk](https://clerk.com), and [Drizzle ORM](https://orm.drizzle.team). Lessons are generated daily via a GitHub Actions cron job.

## Getting started

```bash
bun install
cp .env.example .env   # fill in your keys
bun run db:migrate
bun run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start dev server |
| `build` | Build for production |
| `start` | Start production server |
| `test` | Run tests |
| `check` | Lint + typecheck + test |
| `lint` | Run ESLint |
| `typecheck` | Run TypeScript check |
| `db:generate` | Generate Drizzle migrations |
| `db:migrate` | Apply migrations |
| `db:studio` | Open Drizzle Studio |

## Environment

See `.env.example` for all required variables. The app needs:

- **Clerk** — Authentication (publishable + secret keys)
- **Turso** — Remote libSQL database (URL + auth token)
- **OpenRouter** — AI lesson generation (API key)
- **Exa** — Web search for topic preview resources (API key)
- **Web Push VAPID** — Browser push notifications (public + private keys)
- **CRON_SECRET** — Protects the daily generation endpoint

## Architecture

- `src/ai/` — Lesson generation engine, schema, scoring, subtopics, web search
- `src/database/` — Drizzle ORM schema, migrations, repositories, Turso client
- `src/app/` — Next.js App Router pages, API routes, layouts
- `src/components/` — UI components (shadcn/ui, React Bits, Aceternity UI)
- `src/lib/` — Shared utilities, API helpers, push notifications
