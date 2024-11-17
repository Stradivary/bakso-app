# BaksoApp 🍜

BaksoApp is a real-time location-based application connecting Bakso sellers with customers in Indonesia. The app allows customers to find nearby Bakso sellers and enables sellers to see potential customers in their vicinity.

## Project Structure 📁

```
bakso-app/
├── src/
└── README.md
```

## Features ✨

- **Real-time Location Tracking**: Live updates of sellers' and customers' locations
- **Interactive Map Interface**: Built with Leaflet.js and OpenStreetMap
- **Role-based Access**: Separate interfaces for customers and Bakso sellers
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **PWA Support**: Install and use as a native-like app
- **Offline Capability**: Basic functionality works without internet
- **Self-hosted Backend**: Complete control over your Supabase instance

## Tech Stack 🛠️

- **Frontend**:
  - React.js with TypeScript
  - Mantine UI for components
  - Leaflet.js for maps
  - React Router for navigation
  - PWA features with Service Workers
  - Vite for build tooling

- **Backend**:
  - Self-hosted Supabase
  - PostgreSQL with PostGIS extension
  - Real-time subscriptions via WebSocket
  - GoTrue for authentication
  - PostgREST for REST API
  - Storage API for file uploads

- **DevOps**:
  - Docker & Docker Compose
  - Nginx for reverse proxy
  - Let's Encrypt for SSL

## Prerequisites 📋

- Docker & Docker Compose
- Git
- Make (optional, for using Makefile commands)

## Getting Started 🚀

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bakso-app.git
   cd bakso-app
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

3. **Start the application**
   ```bash
   # Start all services
   docker compose up -d

   # Or use make command if available
   make up
   ```

   The following services will be available:
   - Frontend: http://localhost:5173
   - Supabase Studio: http://localhost:8000
   - PostgREST API: http://localhost:3000
   - GoTrue Auth API: http://localhost:9999

4. **Initialize the database**
   ```bash
   # Apply migrations
   docker compose exec supabase-db psql -U postgres -f /docker-entrypoint-initdb.d/init.sql

   # Or use make command
   make init-db
   ```

## Development 💻

### Frontend Development

```bash
# Start only the backend services
docker compose up -d supabase-db supabase-api supabase-auth

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Development

```bash
# Modify Supabase configurations in backend/config/

# Rebuild and restart Supabase services
docker compose up -d --build supabase-db supabase-api supabase-auth
```

## Database Setup 💾

The PostGIS extension and initial schema are automatically set up through Docker. You can find the database initialization scripts in:
```
backend/
├── migrations/
│   └── init.sql    # Initial schema with PostGIS setup
└── seed/
    └── seed.sql    # Sample data for development
```

Initial schema creation:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(60) NOT NULL,
  role VARCHAR(20) NOT NULL,
  location GEOGRAPHY(Point, 4326),
  is_active BOOLEAN DEFAULT true,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX users_location_idx ON users USING GIST (location);
```

## Docker Commands 🐳

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Rebuild specific service
docker compose up -d --build <service-name>

# Reset everything (including volumes)
docker compose down -v
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing 🧪

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests (from project root)
docker compose exec supabase-db psql -U postgres -d postgres -f /app/tests/run.sql
```

## Production Deployment 🌐

1. **Configure production environment**
   ```bash
   cp .env.example .env.prod
   # Edit .env.prod with production values
   ```

2. **Build production images**
   ```bash
   docker compose -f docker-compose.prod.yml build
   ```

3. **Deploy**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

## Security Considerations 🔒

- All services are containerized for isolation
- SSL/TLS encryption in production
- User location data is protected by Row Level Security
- Authentication handled by GoTrue
- Regular security updates for all containers

## Performance Optimization 🚀

- PostGIS spatial indexes for efficient geo-queries
- React optimization techniques implemented
- PWA features for better mobile performance
- Efficient state management using React Context
- Docker layer optimization

## License 📄

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments 👏

- [Supabase](https://supabase.io/) - Backend as a Service
- [Mantine](https://mantine.dev/) - React components library
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) - Map data
- [Docker](https://www.docker.com/) - Containerization
