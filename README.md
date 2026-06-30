# drops

AI-powered personal learning companion. Sends curated daily lessons through browser push notifications.

Built with Next.js, Turso (SQLite), and Google Gemini with Search Grounding. Generated daily via GitHub Actions cron.

```bash
bun install
bun run db:migrate
bun run dev
```

| Script | Description |
|--------|-------------|
| `dev` | Start dev server |
| `build` | Build for production |
| `test` | Run tests |
| `check` | Lint + typecheck + test |
| `db:studio` | Open Drizzle Studio |
