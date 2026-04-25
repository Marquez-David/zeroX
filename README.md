# zeroX

Personal finance app to manage bank transactions, categorize operations, and track Bitcoin wallets.

**Stack**: Flask + PostgreSQL + Redis | React Native + Expo | FastMCP

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) >= 18
- [Expo Go](https://expo.dev/go) on your phone (optional, for mobile testing)

## Setup

```bash
git clone https://github.com/Marquez-David/zeroX.git
cd zeroX
```

### 1. API

Create the environment file:

```bash
cp api/.env.example api/.env
# Fill in your database, Redis, and JWT credentials
```

Required variables in `api/.env`:

```env
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_NAME=
REDIS_PASSWORD=
JWT_SECRET_KEY=
PEPPER=
ENCRYPTION_KEY=
ALLOWED_ORIGINS=
```

Start the API and Redis:

```bash
cd api
docker compose up -d --build
docker compose run --rm api flask db upgrade
```

API runs on `http://localhost:5000`.

### 2. Mobile

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go, or use `npm run android` / `npm run ios` for emulators.

### 3. MCP Server (optional)

For AI integration with Claude Desktop:

```bash
cd mcp
pip install -r requirements.txt
python mcp_server.py
```

## License

[MIT](LICENSE) &copy; 2025 David Márquez Mínguez
