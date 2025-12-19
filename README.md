# Guard Backend

A Node.js backend API built with Fastify, PostgreSQL, and Sequelize.

## Features

- 🚀 Fastify web framework
- 🗄️ PostgreSQL database with Sequelize ORM
- 🔐 JWT authentication
- 📝 Swagger/OpenAPI documentation
- 🛡️ Security middleware (Helmet, CORS, Rate Limiting)
- 📦 Package management with pnpm
- 🐳 Docker support

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
# On Windows (PowerShell)
Copy-Item env.example .env

# On Linux/Mac
cp env.example .env
```

3. Update `.env` with your database credentials and other configuration.

4. Setup database:
```bash
pnpm db:setup
```

## Development

Start the unified backend development server:
```bash
pnpm dev
```

The backend will be available at `http://localhost:4000` with:
- **Root**: `http://localhost:4000/` - API info
- **Health Check**: `http://localhost:4000/health`
- **Superadmin API**: `http://localhost:4000/api/v1/superadmin`
- **Guard API**: `http://localhost:4000/api/v1/guard`
- **API Docs**: `http://localhost:4000/docs`

## Scripts

- `pnpm dev` - Start unified backend development server with hot reload
- `pnpm start` - Start unified backend production server
- `pnpm generate:secrets` - Generate secure JWT access and refresh token secrets
- `pnpm db:setup` - Create database, run migrations, and seed data
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Run database seeders

## Project Structure

```
guard_backend/
├── src/
│   ├── superadmin-api/  # Superadmin API (port 4001)
│   │   ├── config/      # Fastify plugins configuration
│   │   ├── core/        # Core middleware and decorators
│   │   ├── database/    # Database connection and models
│   │   ├── modules/     # API routes and modules
│   │   ├── common/      # Shared utilities
│   │   └── server.js    # Superadmin API entry point
│   └── guard-api/       # Guard API (port 4002)
│       ├── config/      # Fastify plugins configuration
│       ├── core/        # Core middleware and decorators
│       ├── database/    # Database connection and models
│       ├── modules/     # API routes and modules
│       ├── common/      # Shared utilities
│       └── server.js    # Guard API entry point
├── database/
│   ├── migrations/      # Sequelize migrations
│   └── seeders/         # Database seeders
├── logs/                # Application logs
├── sequelize.config.js  # Sequelize configuration
└── package.json
```

## Environment Variables

See `.env.example` for all available environment variables.

## License

Private

