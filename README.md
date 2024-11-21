# **AbangBakso 🍜**

[![Build, Test, and Deploy](https://github.com/Stradivary/bakso-app/actions/workflows/build.yml/badge.svg)](https://github.com/Stradivary/bakso-app/actions/workflows/build.yml)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Stradivary_bakso-app&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Stradivary_bakso-app)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Stradivary_bakso-app&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Stradivary_bakso-app)

A real-time location-based app connecting Bakso sellers and customers in Indonesia. Discover Bakso sellers nearby, or help sellers find potential customers in their vicinity — all in one app.

---

## Documentation

Visit [docs-abangbakso.ahmadmuzaki.dev](https://docs-abangbakso.ahmadmuzaki.dev) to see the full documentation
---

## **Setup and Deployment 🐳**

### Development
1. Clone the repository and install dependencies.
2. Run the app locally with `npm run dev`.
3. The app is served at [localhost:5173](http://localhost:5173).

### Production
1. Deploy the frontend to your VPS or preferred hosting platform.
   ```bash
   npm run build
   rsync -avz dist/ your-vps:/var/www/html
   ```
2. Configure Nginx (or another reverse proxy) to serve the `dist/` folder.

3. Backend services (database and API) are managed via **Supabase Cloud**. Ensure your environment variables point to the live instance.

## **Testing 🧪**

Run frontend tests:
```bash
cd src
npm run test
```

Run database tests:
```bash
docker compose exec supabase-db psql -U postgres -f tests/run.sql
```

---

## **Acknowledgments 👏**

- [Supabase](https://supabase.io)
- [Mantine UI](https://mantine.dev)
- [Leaflet.js](https://leafletjs.com)

---

## **License 📄**

Licensed under [MIT](LICENSE).  
