# Migration Scripts

## Development Commands
```bash
# Generate new migration from schema changes
pnpm db:generate

# Run migrations 
pnpm db:migrate

# Launch database studio
pnpm db:studio
```

## CI/CD Integration
Migrations are automatically run in CI before tests via `pnpm db:migrate --silent`

